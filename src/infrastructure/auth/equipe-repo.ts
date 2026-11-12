import "server-only";

import { and, asc, eq } from "drizzle-orm";

import type { Contexto } from "@/application/auth/contexto";
import type { PapelCodigo } from "@/application/permissoes";
import { escoposUsuario, papeis, usuarios } from "@/db/schema";
import { withTenantDb } from "@/infrastructure/db/tenant-db";

export type MembroEquipe = {
  usuarioId: string;
  nome: string;
  email: string;
  papel: PapelCodigo;
  status: "ativo" | "desativado" | "convite_pendente";
};

/** Quem tem escopo ativo neste empreendimento. A RLS já limita à organização. */
export async function listarEquipe(ctx: Contexto): Promise<MembroEquipe[]> {
  const linhas = await withTenantDb(
    {
      orgId: ctx.orgId,
      empreendimentoId: ctx.empreendimentoId,
      userId: ctx.usuarioId,
    },
    (db) =>
      db
        .select({
          usuarioId: usuarios.id,
          nome: usuarios.nome,
          email: usuarios.email,
          papel: papeis.codigo,
          status: usuarios.status,
        })
        .from(escoposUsuario)
        .innerJoin(usuarios, eq(usuarios.id, escoposUsuario.usuarioId))
        .innerJoin(papeis, eq(papeis.id, escoposUsuario.papelId))
        .where(
          and(
            eq(escoposUsuario.empreendimentoId, ctx.empreendimentoId),
            eq(escoposUsuario.ativo, true),
          ),
        )
        .orderBy(asc(usuarios.nome)),
  );
  return linhas as MembroEquipe[];
}
