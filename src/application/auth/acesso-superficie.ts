import {
  type AuthenticatedSession,
  canWriteWithStatus,
  hasTenantContext,
} from "@/application/auth/session-context";
import { resolveSurfaceRedirect } from "@/application/auth/user-scope";

export type Superficie = "ops" | "web" | "saas";

/**
 * Papéis aceitos em cada superfície (route group).
 * ops = portaria, web = gestão, saas = plataforma interna.
 */
export const PAPEIS_POR_SUPERFICIE: Record<Superficie, readonly string[]> = {
  ops: ["recepcionista", "empreendimento_gestor", "org_admin"],
  web: ["empreendimento_gestor", "org_admin", "auditor"],
  saas: ["platform_super_admin"],
};

export type DecisaoDeAcesso = { ok: true } | { ok: false; redirectTo: string };

/** Decide no servidor se a sessão pode abrir a superfície. Puro, sem framework. */
export function decidirAcesso(
  session: AuthenticatedSession | null,
  superficie: Superficie,
): DecisaoDeAcesso {
  if (!session) return { ok: false, redirectTo: "/entrar" };
  if (!canWriteWithStatus(session.claims.user_status)) {
    return { ok: false, redirectTo: "/sem-acesso" };
  }

  const papel = session.claims.papel_codigo;
  if (!papel || !hasTenantContext(session.claims)) {
    return { ok: false, redirectTo: "/contexto" };
  }

  if (!PAPEIS_POR_SUPERFICIE[superficie].includes(papel)) {
    // Papel válido em outra superfície: leva para a casa dele, sem beco sem saída.
    return { ok: false, redirectTo: resolveSurfaceRedirect(papel) };
  }

  return { ok: true };
}
