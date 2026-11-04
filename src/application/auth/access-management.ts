export type RoleCode =
  | "platform_super_admin"
  | "org_admin"
  | "empreendimento_gestor"
  | "recepcionista"
  | "auditor";

export type ManagedScope = {
  orgId: string;
  empreendimentoId: string;
  isOrgScope: boolean;
  roleCode: RoleCode;
};

export type AccessActor = {
  userId: string;
  status: "ativo" | "desativado" | "convite_pendente" | "missing";
  scopes: ManagedScope[];
};

export type AuthorizationResult =
  | { ok: true }
  | { ok: false; code: "UNAUTHORIZED" | "OUTSIDE_SCOPE" | "ROLE_ESCALATION" };

const ELEVATED_ROLES: RoleCode[] = ["org_admin", "platform_super_admin"];

export function authorizeScopeManagement(
  actor: AccessActor,
  requestedScope: ManagedScope,
): AuthorizationResult {
  if (actor.status !== "ativo") {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  const hasOrgAdminScope = actor.scopes.some(
    (scope) =>
      scope.roleCode === "org_admin" && scope.orgId === requestedScope.orgId,
  );

  if (hasOrgAdminScope) {
    return requestedScope.roleCode === "platform_super_admin"
      ? { ok: false, code: "ROLE_ESCALATION" }
      : { ok: true };
  }

  const hasGestorScope = actor.scopes.some(
    (scope) =>
      scope.roleCode === "empreendimento_gestor" &&
      !scope.isOrgScope &&
      scope.orgId === requestedScope.orgId &&
      scope.empreendimentoId === requestedScope.empreendimentoId,
  );

  if (!hasGestorScope) {
    const hasManagementRole = actor.scopes.some(
      (scope) =>
        scope.roleCode === "org_admin" ||
        scope.roleCode === "empreendimento_gestor",
    );

    return hasManagementRole
      ? { ok: false, code: "OUTSIDE_SCOPE" }
      : { ok: false, code: "UNAUTHORIZED" };
  }

  if (requestedScope.isOrgScope) {
    return { ok: false, code: "OUTSIDE_SCOPE" };
  }

  if (ELEVATED_ROLES.includes(requestedScope.roleCode)) {
    return { ok: false, code: "ROLE_ESCALATION" };
  }

  return { ok: true };
}

export function authorizeInvite(
  actor: AccessActor,
  initialScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, initialScope);
}

export function authorizeScopeChange(
  actor: AccessActor,
  requestedScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, requestedScope);
}

export function authorizeScopeRevocation(
  actor: AccessActor,
  existingScope: ManagedScope,
): AuthorizationResult {
  return authorizeScopeManagement(actor, existingScope);
}

export function authorizeUserDeactivation(
  actor: AccessActor,
  targetScopes: ManagedScope[],
): AuthorizationResult {
  if (targetScopes.length === 0) {
    return { ok: false, code: "OUTSIDE_SCOPE" };
  }

  for (const scope of targetScopes) {
    const result = authorizeScopeManagement(actor, scope);
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
