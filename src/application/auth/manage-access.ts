import {
  authorizeInvite,
  authorizeScopeChange,
  authorizeScopeRevocation,
  authorizeUserDeactivation,
  type AccessActor,
  type ManagedScope,
} from "@/application/auth/access-management";
import {
  loadAccessActor,
  loadTargetScopes,
  persistInviteRegistration,
  persistScopeGrant,
  persistScopeRevocation,
  persistUserDeactivation,
} from "@/infrastructure/auth/access-management-repository";
import { revokeUserSessions } from "@/infrastructure/auth/session-revocation";
import {
  createSupabaseAdminClient,
  isSupabaseAdminConfigured,
} from "@/infrastructure/auth/supabase-admin";

export type ManageAccessErrorCode =
  | "UNAUTHORIZED"
  | "OUTSIDE_SCOPE"
  | "ROLE_ESCALATION"
  | "INVALID_SCOPE"
  | "UNAVAILABLE"
  | "INVITE_FAILED";

export type ManageAccessResult =
  { ok: true } | { ok: false; code: ManageAccessErrorCode };

function actorContext(actor: AccessActor): {
  actorUserId: string;
  actorOrgId: string;
  actorEmpreendimentoId: string;
} | null {
  const primary = actor.scopes[0];
  if (!primary) {
    return null;
  }

  return {
    actorUserId: actor.userId,
    actorOrgId: primary.orgId,
    actorEmpreendimentoId: primary.isOrgScope
      ? "00000000-0000-0000-0000-000000000001"
      : primary.empreendimentoId,
  };
}

async function requireActor(userId: string): Promise<
  | {
      ok: true;
      actor: AccessActor;
      context: NonNullable<ReturnType<typeof actorContext>>;
    }
  | { ok: false; code: "UNAUTHORIZED" }
> {
  const actor = await loadAccessActor(userId);
  if (!actor) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const context = actorContext(actor);
  if (!context) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  return { ok: true, actor, context };
}

export async function inviteUser(input: {
  actorUserId: string;
  email: string;
  initialScope: ManagedScope;
}): Promise<ManageAccessResult> {
  const resolved = await requireActor(input.actorUserId);
  if (!resolved.ok) {
    return resolved;
  }

  const decision = authorizeInvite(resolved.actor, input.initialScope);
  if (!decision.ok) {
    return decision;
  }

  if (
    input.initialScope.roleCode === "platform_super_admin" ||
    input.initialScope.roleCode === "org_admin"
  ) {
    return { ok: false, code: "ROLE_ESCALATION" };
  }

  if (!isSupabaseAdminConfigured()) {
    return { ok: false, code: "UNAVAILABLE" };
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/entrar`,
    },
  );

  if (error || !data.user) {
    return { ok: false, code: "INVITE_FAILED" };
  }

  const persisted = await persistInviteRegistration(
    resolved.context.actorUserId,
    resolved.context.actorOrgId,
    resolved.context.actorEmpreendimentoId,
    data.user.id,
    input.email,
    input.initialScope,
  );

  if (!persisted.ok) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, code: persisted.code as ManageAccessErrorCode };
  }

  return { ok: true };
}

export async function changeScope(input: {
  actorUserId: string;
  targetUserId: string;
  requestedScope: ManagedScope;
}): Promise<ManageAccessResult> {
  const resolved = await requireActor(input.actorUserId);
  if (!resolved.ok) {
    return resolved;
  }

  const decision = authorizeScopeChange(resolved.actor, input.requestedScope);
  if (!decision.ok) {
    return decision;
  }

  const persisted = await persistScopeGrant(
    resolved.context.actorUserId,
    resolved.context.actorOrgId,
    resolved.context.actorEmpreendimentoId,
    input.targetUserId,
    input.requestedScope,
  );

  return persisted.ok
    ? { ok: true }
    : { ok: false, code: persisted.code as ManageAccessErrorCode };
}

export async function revokeScope(input: {
  actorUserId: string;
  scopeId: string;
  existingScope: ManagedScope;
}): Promise<ManageAccessResult> {
  const resolved = await requireActor(input.actorUserId);
  if (!resolved.ok) {
    return resolved;
  }

  const decision = authorizeScopeRevocation(
    resolved.actor,
    input.existingScope,
  );
  if (!decision.ok) {
    return decision;
  }

  const persisted = await persistScopeRevocation(
    resolved.context.actorUserId,
    resolved.context.actorOrgId,
    resolved.context.actorEmpreendimentoId,
    input.scopeId,
  );

  return persisted.ok
    ? { ok: true }
    : { ok: false, code: persisted.code as ManageAccessErrorCode };
}

export async function deactivateUser(input: {
  actorUserId: string;
  targetUserId: string;
}): Promise<ManageAccessResult> {
  const resolved = await requireActor(input.actorUserId);
  if (!resolved.ok) {
    return resolved;
  }

  const targetScopes = await loadTargetScopes(input.targetUserId);
  const decision = authorizeUserDeactivation(resolved.actor, targetScopes);
  if (!decision.ok) {
    return decision;
  }

  const persisted = await persistUserDeactivation(
    resolved.context.actorUserId,
    resolved.context.actorOrgId,
    resolved.context.actorEmpreendimentoId,
    input.targetUserId,
  );

  if (!persisted.ok) {
    return { ok: false, code: persisted.code as ManageAccessErrorCode };
  }

  try {
    await revokeUserSessions(input.targetUserId);
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }

  return { ok: true };
}
