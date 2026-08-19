import {
  type AuthenticatedSession,
  canWriteWithStatus,
} from "@/application/auth/session-context";
import { decodeJwtPayload, readCusteloClaims } from "@/infrastructure/auth/jwt";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const payload = session?.access_token
    ? decodeJwtPayload(session.access_token)
    : {};

  return {
    userId: user.id,
    email: user.email,
    claims: readCusteloClaims(payload),
  };
}

export async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session = await getAuthenticatedSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireWritableSession(): Promise<AuthenticatedSession> {
  const session = await requireAuthenticatedSession();
  if (!canWriteWithStatus(session.claims.user_status)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
