import { randomBytes, randomUUID } from "node:crypto";

import type postgres from "postgres";
import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

// IP.3 — pareamento por codigo curto. Antes do login o servidor so devolve o nome
// do local cujo codigo o aparelho ja tem; nunca lista locais nem usuarios.

const GESTOR_A = "cccccccc-cccc-4ccc-8ccc-cccccccccc04"; // seed_access_management_fixtures
const gestorA = { ...FIXTURE_ORG_A, userId: GESTOR_A };

const VALIDO = "ABC234";
const VENCIDO = "XYZ789";
const REVOGADO = "QWE345";
const PARA_REVOGAR = "RTY456";

const novoToken = () => randomBytes(32).toString("hex");
const origemDeTeste = () => `teste-${randomUUID()}`;

/** Conexão do app antes do login: role custelo_app, sem usuário nem tenant. */
function semLogin<T>(
  sql: ReturnType<typeof postgres>,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return sql.begin(async (tx) => {
    await tx.unsafe("set local role custelo_app");
    return fn(tx);
  }) as Promise<T>;
}

type Resposta = { ok: boolean; code?: string; local_nome?: string };

describe("IP.3 — pareamento do aparelho por código do local", () => {
  const sql = setupRlsSuite(async (db) => {
    await seedTenantPair(db);
    await db`select app.seed_access_management_fixtures()`;
    await db`delete from tentativas_pareamento where chave like 'codigo:%' or chave like 'origem:teste-%'`;
    const codigos: [string, string, string][] = [
      [VALIDO, "now() - interval '1 hour'", "now() + interval '1 day'"],
      [VENCIDO, "now() - interval '2 days'", "now() - interval '1 day'"],
      [REVOGADO, "now() - interval '1 hour'", "now() + interval '1 day'"],
      [PARA_REVOGAR, "now() - interval '1 hour'", "now() + interval '1 day'"],
    ];
    for (const [codigo, criado, expira] of codigos) {
      await db.unsafe(
        `insert into locais_codigo (org_id, empreendimento_id, codigo, criado_em, expira_em, revogado_em)
         values ($1, $2, $3, ${criado}, ${expira}, ${codigo === REVOGADO ? "now()" : "null"})
         on conflict (codigo) do update set
           criado_em = excluded.criado_em, expira_em = excluded.expira_em,
           revogado_em = excluded.revogado_em, revogado_por = null`,
        [FIXTURE_ORG_A.orgId, FIXTURE_ORG_A.empreendimentoId, codigo],
      );
    }
  });

  const parear = (
    codigo: string,
    origem = origemDeTeste(),
    token = novoToken(),
  ) =>
    semLogin(sql, async (tx) => {
      const [linha] = await tx<{ r: Resposta }[]>`
        select app.parear_aparelho(${codigo}, ${origem}, ${token}) as r
      `;
      return linha!.r;
    });

  it("código válido pareia e devolve só o nome do local", async () => {
    const [{ nome }] = await sql<{ nome: string }[]>`
      select nome from empreendimentos where id = ${FIXTURE_ORG_A.empreendimentoId}
    `;
    const r = await parear(VALIDO.toLowerCase());
    expect(r).toEqual({ ok: true, local_nome: nome });
  });

  it("inexistente, vencido e revogado têm a mesma resposta", async () => {
    const respostas = await Promise.all(
      ["ZZZ222", VENCIDO, REVOGADO].map((c) => parear(c)),
    );
    for (const r of respostas) {
      expect(r).toEqual({ ok: false, code: "NAO_ENCONTRADO" });
    }
  });

  it("limita tentativas por origem", async () => {
    const origem = origemDeTeste();
    const respostas: Resposta[] = [];
    for (let i = 0; i < 11; i++) respostas.push(await parear("ZZZ333", origem));
    expect(respostas[9]).toEqual({ ok: false, code: "NAO_ENCONTRADO" });
    expect(respostas[10]).toEqual({ ok: false, code: "MUITAS_TENTATIVAS" });
  });

  it("antes do login nada é listado: códigos, aparelhos e contadores", async () => {
    const codigos = await semLogin(
      sql,
      (tx) => tx`select id from locais_codigo`,
    );
    const aparelhos = await semLogin(
      sql,
      (tx) => tx`select id from aparelhos_pareados`,
    );
    expect(codigos).toHaveLength(0);
    expect(aparelhos).toHaveLength(0);
    await expect(
      semLogin(sql, (tx) => tx`select chave from tentativas_pareamento`),
    ).rejects.toThrow(/permission denied/);
  });

  it("aparelho pareado lembra o local pelo token; token desconhecido não acha nada", async () => {
    const token = novoToken();
    await parear(VALIDO, origemDeTeste(), token);
    const [lembrado] = await semLogin(
      sql,
      (tx) =>
        tx<{ r: Resposta & { empreendimento_id?: string } }[]>`
        select app.local_do_aparelho(${token}) as r
      `,
    );
    const [estranho] = await semLogin(
      sql,
      (tx) =>
        tx<
          { r: Resposta }[]
        >`select app.local_do_aparelho(${novoToken()}) as r`,
    );
    expect(lembrado?.r).toMatchObject({
      ok: true,
      empreendimento_id: FIXTURE_ORG_A.empreendimentoId,
    });
    expect(estranho?.r).toEqual({ ok: false, code: "NAO_ENCONTRADO" });
  });

  it("recepcionista não gera código: SEM_PERMISSAO", async () => {
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`select app.criar_codigo_local('MNP234', now() + interval '1 day')`,
      ),
    ).rejects.toThrow(/SEM_PERMISSAO/);
  });

  it("gestor gera código no próprio local; o outro condomínio não vê", async () => {
    const codigo = `G${randomBytes(3).toString("hex").toUpperCase()}`
      .replace(/[01IO]/g, "7")
      .slice(0, 6);
    const criado = await withRls(sql, gestorA, async (tx) => {
      await tx`select app.criar_codigo_local(${codigo}, now() + interval '30 days')`;
      return tx`select id from locais_codigo where codigo = ${codigo}`;
    });
    const visto = await withRls(
      sql,
      FIXTURE_ORG_B,
      (tx) => tx`select id from locais_codigo where codigo = ${codigo}`,
    );
    expect(criado).toHaveLength(1);
    expect(visto).toHaveLength(0);
  });

  it("código revogado deixa de parear", async () => {
    await withRls(sql, gestorA, async (tx) => {
      const [{ id }] = await tx<{ id: string }[]>`
        select id from locais_codigo where codigo = ${PARA_REVOGAR}
      `;
      await tx`select app.revogar_codigo_local(${id}::uuid)`;
    });
    expect(await parear(PARA_REVOGAR)).toEqual({
      ok: false,
      code: "NAO_ENCONTRADO",
    });
  });
});
