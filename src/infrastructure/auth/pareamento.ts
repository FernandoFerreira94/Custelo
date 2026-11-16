import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

import type postgres from "postgres";

import type { Contexto } from "@/application/auth/contexto";
import type {
  CodigoCriado,
  LocalDoAparelho,
  PareamentoRepo,
  RespostaDoPareamento,
  Segredos,
} from "@/application/pareamento/ports";
import { withAppRls } from "@/db/session";
import { codigoPg } from "@/infrastructure/db/erros-pg";
import { getClient } from "@/infrastructure/db/tenant-db";
import { env } from "@/lib/env";

/** Cookie do aparelho pareado: httpOnly, nunca lido por JavaScript da página. */
export const COOKIE_DO_APARELHO = {
  nome: "pz-aparelho",
  opcoes: {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  },
};

export function criarSegredos(chave = env.PAREAMENTO_SEGREDO): Segredos {
  return {
    novoToken: () => randomBytes(32).toString("base64url"),
    sha256: (texto) => createHash("sha256").update(texto).digest("hex"),
    chaveDeOrigem: (ip) => {
      if (!chave) throw new Error("PAREAMENTO_SEGREDO ausente");
      return createHmac("sha256", chave).update(ip).digest("hex");
    },
    sortear: (limite) => randomInt(limite),
  };
}

/** Antes do login: role do app, sem usuário nem tenant (as funções são SECURITY DEFINER). */
async function semLogin<T>(
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return getClient().begin(async (tx) => {
    await tx.unsafe("set local role custelo_app");
    return fn(tx);
  }) as Promise<T>;
}

const tenant = (ctx: Contexto) => ({
  orgId: ctx.orgId,
  empreendimentoId: ctx.empreendimentoId,
  userId: ctx.usuarioId,
});

type Bruta = {
  ok: boolean;
  code?: "NAO_ENCONTRADO" | "MUITAS_TENTATIVAS";
  local_nome?: string;
  org_id?: string;
  empreendimento_id?: string;
};

export const pareamentoRepo: PareamentoRepo = {
  parear: (codigo, chaveDeOrigem, tokenSha256) =>
    semLogin(async (tx) => {
      const [linha] = await tx<{ r: Bruta }[]>`
        select app.parear_aparelho(${codigo}, ${chaveDeOrigem}, ${tokenSha256}) as r
      `;
      const r = linha!.r;
      return (
        r.ok
          ? { ok: true, localNome: r.local_nome ?? "" }
          : { ok: false, code: r.code ?? "NAO_ENCONTRADO" }
      ) satisfies RespostaDoPareamento;
    }),
  localDoAparelho: (tokenSha256) =>
    semLogin(async (tx) => {
      const [linha] = await tx<{ r: Bruta }[]>`
        select app.local_do_aparelho(${tokenSha256}) as r
      `;
      const r = linha!.r;
      return r.ok && r.org_id && r.empreendimento_id
        ? ({
            orgId: r.org_id,
            empreendimentoId: r.empreendimento_id,
            localNome: r.local_nome ?? "",
          } satisfies LocalDoAparelho)
        : null;
    }),
  criarCodigo: async (ctx, codigo, expiraEm) => {
    try {
      return await withAppRls(getClient(), tenant(ctx), async (tx) => {
        const [linha] = await tx<
          { r: { id: string; codigo: string; expira_em: string } }[]
        >`
          select app.criar_codigo_local(${codigo}, ${expiraEm.toISOString()}::timestamptz) as r
        `;
        const r = linha!.r;
        return {
          id: r.id,
          codigo: r.codigo,
          expiraEm: r.expira_em,
        } satisfies CodigoCriado;
      });
    } catch (erro) {
      if (codigoPg(erro) === "23505") return null; // código sorteado já existe
      throw erro;
    }
  },
  revogarCodigo: (ctx, id) =>
    withAppRls(getClient(), tenant(ctx), async (tx) => {
      await tx`select app.revogar_codigo_local(${id}::uuid)`;
    }),
};
