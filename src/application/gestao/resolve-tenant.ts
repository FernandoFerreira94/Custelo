import type { AuthenticatedSession } from "@/application/auth/session-context";
import {
  ORG_SCOPE_SENTINEL,
  type TenantContext,
} from "@/db/session";

export type GestaoErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE";

export type GestaoResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: GestaoErrorCode };

export function tenantContextFromSession(
  session: AuthenticatedSession,
): TenantContext | null {
  const orgId = session.claims.org_id;
  const empreendimentoId = session.claims.empreendimento_id;
  if (!orgId || !empreendimentoId) {
    return null;
  }

  return {
    orgId,
    empreendimentoId,
    userId: session.userId,
  };
}

export function resolveEmpreendimentoId(
  context: TenantContext,
  requestedEmpreendimentoId?: string,
): string | null {
  if (context.empreendimentoId !== ORG_SCOPE_SENTINEL) {
    return context.empreendimentoId;
  }

  return requestedEmpreendimentoId ?? null;
}
