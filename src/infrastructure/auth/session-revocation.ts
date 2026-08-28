import "server-only";

import { createSupabaseAdminClient } from "@/infrastructure/auth/supabase-admin";

/** Revoga refresh tokens e encerra sessoes abertas (ADR-005). */
export async function revokeUserSessions(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.signOut(userId, "global");

  if (error) {
    throw new Error("SESSION_REVOKE_FAILED");
  }
}
