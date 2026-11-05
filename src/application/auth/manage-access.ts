import {
  authorizeInvite,
  authorizeScopeChange,
  authorizeScopeRevocation,
  authorizeUserDeactivation,
  type AccessActor,
  type ManagedScope,
} from "@/application/auth/access-management";
import {
  type Auditoria,
  type EntradaAuditoria,
  mascararEmail,
} from "@/application/auditoria/ports";
import {
  loadAccessActor,
  loadTargetScopes,
  persistScopeGrant,
  persistScopeRevocation,
  persistUserDeactivation,
} from "@/infrastructure/auth/access-management-repository";
import { auditoriaRepo } from "@/infrastructure/auditoria/auditoria-repo";
import { sendInviteByEmail } from "@/infrastructure/auth/invite-service";
import { revokeUserSessions } from "@/infrastructure/auth/session-revocation";
import { log } from "@/infrastructure/observability/logger";

export type ManageAccessDeps = { auditoria: Auditoria };
const depsPadrao: ManageAccessDeps = { auditoria: auditoriaRepo };

/**
 * Registra depois da operação que deu certo. Falha de auditoria não desfaz a
 * operação (ela já foi feita), mas fica no log como erro para alguém agir.
 */
async function registrarTrilha(
  deps: ManageAccessDeps,
  context: {
    actorUserId: string;
    actorOrgId: string;
    actorEmpreendimentoId: string;
  },
  entrada: EntradaAuditoria,
): Promise<void> {
  try {
    await deps.auditoria.registrar(
      {
        orgId: context.actorOrgId,
        empreendimentoId: context.actorEmpreendimentoId,
        usuarioId: context.actorUserId,
      },
      entrada,
    );
  } catch {
    log("error", {
      msg: `falha_auditoria:${entrada.acao}`,
      org_id: context.actorOrgId,
    });
  }
}

export type ManageAccessErrorCode =
  | "UNAUTHORIZED"
  | "OUTSIDE_SCOPE"
  | "ROLE_ESCALATION"
  | "INVALID_SCOPE"
  | "UNAVAILABLE"
  | "INVITE_FAILED"
  | "DUPLICATE";

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

export async function inviteUser(
  input: {
    actorUserId: string;
    email: string;
    initialScope: ManagedScope;
  },
  deps: ManageAccessDeps = depsPadrao,
): Promise<ManageAccessResult> {
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

  const sent = await sendInviteByEmail({
    actorUserId: resolved.context.actorUserId,
    actorOrgId: resolved.context.actorOrgId,
    actorEmpreendimentoId: resolved.context.actorEmpreendimentoId,
    email: input.email,
    scope: input.initialScope,
  });

  if (!sent.ok) {
    return { ok: false, code: sent.code as ManageAccessErrorCode };
  }
  await registrarTrilha(deps, resolved.context, {
    acao: "USUARIO_CONVIDADO",
    alvoTipo: "usuario",
    depois: {
      email: mascararEmail(input.email),
      papel: input.initialScope.roleCode,
      empreendimento_id: input.initialScope.empreendimentoId,
    },
    origem: "web",
  });
  return { ok: true };
}

export async function changeScope(
  input: {
    actorUserId: string;
    targetUserId: string;
    requestedScope: ManagedScope;
  },
  deps: ManageAccessDeps = depsPadrao,
): Promise<ManageAccessResult> {
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

  if (!persisted.ok) {
    return { ok: false, code: persisted.code as ManageAccessErrorCode };
  }
  await registrarTrilha(deps, resolved.context, {
    acao: "ESCOPO_CONCEDIDO",
    alvoTipo: "usuario",
    alvoId: input.targetUserId,
    depois: {
      papel: input.requestedScope.roleCode,
      empreendimento_id: input.requestedScope.empreendimentoId,
    },
    origem: "web",
  });
  return { ok: true };
}

export async function revokeScope(
  input: {
    actorUserId: string;
    scopeId: string;
    existingScope: ManagedScope;
  },
  deps: ManageAccessDeps = depsPadrao,
): Promise<ManageAccessResult> {
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

  if (!persisted.ok) {
    return { ok: false, code: persisted.code as ManageAccessErrorCode };
  }
  await registrarTrilha(deps, resolved.context, {
    acao: "ESCOPO_REVOGADO",
    alvoTipo: "escopo",
    alvoId: input.scopeId,
    antes: {
      papel: input.existingScope.roleCode,
      empreendimento_id: input.existingScope.empreendimentoId,
    },
    origem: "web",
  });
  return { ok: true };
}

export async function deactivateUser(
  input: {
    actorUserId: string;
    targetUserId: string;
  },
  deps: ManageAccessDeps = depsPadrao,
): Promise<ManageAccessResult> {
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

  await registrarTrilha(deps, resolved.context, {
    acao: "USUARIO_DESATIVADO",
    alvoTipo: "usuario",
    alvoId: input.targetUserId,
    origem: "web",
  });

  try {
    await revokeUserSessions(input.targetUserId);
  } catch {
    return { ok: false, code: "UNAVAILABLE" };
  }

  return { ok: true };
}
