import postgres from "postgres";

import type { UserScope } from "@/application/auth/user-scope";
import { getDatabaseUrl } from "@/db/client";

type RawScope = {
  org_id: string;
  org_nome: string;
  empreendimento_id: string;
  empreendimento_nome: string | null;
  is_org_scope: boolean;
  papel_codigo: string;
  papel_nome: string;
};

type ListScopesRow = {
  scopes: RawScope[];
};

type DefineContextRow = {
  result: { ok: true; papel_codigo: string } | { ok: false; code: string };
};

function mapScope(row: RawScope): UserScope {
  return {
    orgId: row.org_id,
    orgNome: row.org_nome,
    empreendimentoId: row.empreendimento_id,
    empreendimentoNome: row.empreendimento_nome,
    isOrgScope: row.is_org_scope,
    papelCodigo: row.papel_codigo,
    papelNome: row.papel_nome,
  };
}

/** Lista escopos via funcao SECURITY DEFINER — nao depende de tenant no JWT. */
export async function listAccessibleScopes(
  userId: string,
): Promise<UserScope[]> {
  const url = getDatabaseUrl();
  if (!url) {
    return [];
  }

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const rows = await sql<ListScopesRow[]>`
      select app.list_escopos_acessiveis(${userId}::uuid) as scopes
    `;
    const raw = rows[0]?.scopes ?? [];
    return raw.map(mapScope);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

export async function defineActiveContext(
  userId: string,
  orgId: string,
  empreendimentoId: string,
): Promise<
  { ok: true; papelCodigo: string } | { ok: false; code: "INVALID_SCOPE" }
> {
  const url = getDatabaseUrl();
  if (!url) {
    return { ok: false, code: "INVALID_SCOPE" };
  }

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const rows = await sql<DefineContextRow[]>`
      select app.definir_contexto_ativo(
        ${userId}::uuid,
        ${orgId}::uuid,
        ${empreendimentoId}::uuid
      ) as result
    `;
    const result = rows[0]?.result;

    if (!result?.ok) {
      return { ok: false, code: "INVALID_SCOPE" };
    }

    return { ok: true, papelCodigo: result.papel_codigo };
  } finally {
    await sql.end({ timeout: 2 });
  }
}
