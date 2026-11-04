"use server";

import {
  findUserScope,
  resolveSurfaceRedirect,
  type SelectContextResult,
} from "@/application/auth/user-scope";
import { selectContextSchema } from "@/application/auth/select-context-schema";
import {
  canWriteWithStatus,
  hasTenantContext,
} from "@/application/auth/session-context";
import {
  defineActiveContext,
  listAccessibleScopes,
} from "@/infrastructure/auth/user-scopes";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server";

export async function selectContextAction(
  input: unknown,
): Promise<SelectContextResult> {
  const session = await getAuthenticatedSession();
  if (!session || !canWriteWithStatus(session.claims.user_status)) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const parsed = selectContextSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "INVALID_SCOPE" };
  }

  const scopes = await listAccessibleScopes(session.userId);
  const selected = findUserScope(
    scopes,
    parsed.data.orgId,
    parsed.data.empreendimentoId,
  );

  if (!selected) {
    return { ok: false, code: "INVALID_SCOPE" };
  }

  const persisted = await defineActiveContext(
    session.userId,
    selected.orgId,
    selected.empreendimentoId,
  );

  if (!persisted.ok) {
    return { ok: false, code: "INVALID_SCOPE" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.refreshSession();

  if (error) {
    return { ok: false, code: "SESSION_REFRESH_FAILED" };
  }

  return {
    ok: true,
    redirectTo: resolveSurfaceRedirect(persisted.papelCodigo),
  };
}

export async function resolveContextLanding(): Promise<
  | { kind: "redirect"; href: string }
  | { kind: "select"; scopes: Awaited<ReturnType<typeof listAccessibleScopes>> }
  | { kind: "auto"; scopes: Awaited<ReturnType<typeof listAccessibleScopes>> }
  | { kind: "unauthorized"; href: string }
  | { kind: "no-access"; href: string }
> {
  const session = await getAuthenticatedSession();

  if (!session) {
    return { kind: "unauthorized", href: "/entrar" };
  }

  if (!canWriteWithStatus(session.claims.user_status)) {
    return { kind: "no-access", href: "/sem-acesso" };
  }

  if (hasTenantContext(session.claims) && session.claims.papel_codigo) {
    return {
      kind: "redirect",
      href: resolveSurfaceRedirect(session.claims.papel_codigo),
    };
  }

  const scopes = await listAccessibleScopes(session.userId);

  if (scopes.length === 0) {
    return { kind: "no-access", href: "/sem-acesso" };
  }

  if (scopes.length === 1) {
    // A escolha automática grava contexto e renova o cookie da sessão.
    // Página (Server Component) não pode gravar cookie: isso roda em /contexto/auto.
    return { kind: "auto", scopes };
  }

  return { kind: "select", scopes };
}
