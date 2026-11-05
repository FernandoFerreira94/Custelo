import type { CusteloAccessClaims } from "@/application/auth/session-context";
import { getDatabaseUrl } from "@/db/client";
import { getClient } from "@/infrastructure/db/tenant-db";

type ClaimsRow = {
  claims: CusteloAccessClaims;
};

/**
 * Resolve claims customizados para o Auth Hook via funcao SECURITY DEFINER.
 * Nao usa service_role em request de usuario — so no webhook do hook.
 */
export async function resolveAuthClaimsForUser(
  userId: string,
): Promise<CusteloAccessClaims> {
  const url = getDatabaseUrl();
  if (!url) {
    return { user_status: "missing" };
  }

  const sql = getClient();
  // A função exige o usuário da sessão (GUC); aqui o alvo é o próprio usuário do token.
  const rows = await sql.begin(async (tx) => {
    await tx`select set_config('app.current_user_id', ${userId}, true)`;
    return tx<ClaimsRow[]>`
      select app.resolve_auth_claims(${userId}::uuid) as claims
    `;
  });
  return rows[0]?.claims ?? { user_status: "missing" };
}

export function mergeHookClaims(
  existing: Record<string, unknown>,
  custom: CusteloAccessClaims,
): Record<string, unknown> {
  return {
    ...existing,
    ...custom,
  };
}
