import postgres from "postgres";

import type { CusteloAccessClaims } from "@/application/auth/session-context";
import { getDatabaseUrl } from "@/db/client";

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

  const sql = postgres(url, { prepare: false, max: 1 });

  try {
    const rows = await sql<ClaimsRow[]>`
      select app.resolve_auth_claims(${userId}::uuid) as claims
    `;
    return rows[0]?.claims ?? { user_status: "missing" };
  } finally {
    await sql.end({ timeout: 2 });
  }
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
