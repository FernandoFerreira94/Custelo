/** Escopo acessivel listado para AUTH-005 — espelha app.list_escopos_acessiveis. */
export type UserScope = {
  orgId: string;
  orgNome: string;
  empreendimentoId: string;
  empreendimentoNome: string | null;
  isOrgScope: boolean;
  papelCodigo: string;
  papelNome: string;
};

export type SelectContextResult =
  | { ok: true; redirectTo: string }
  | { ok: false; code: "INVALID_SCOPE" | "UNAUTHORIZED" };

/** Rota inicial por papel apos contexto selecionado. */
export function resolveSurfaceRedirect(papelCodigo: string): string {
  switch (papelCodigo) {
    case "recepcionista":
      return "/receber";
    case "platform_super_admin":
      return "/plataforma";
    case "org_admin":
    case "empreendimento_gestor":
    case "auditor":
      return "/gestao";
    default:
      return "/gestao";
  }
}

export function findUserScope(
  scopes: UserScope[],
  orgId: string,
  empreendimentoId: string,
): UserScope | undefined {
  return scopes.find(
    (scope) =>
      scope.orgId === orgId && scope.empreendimentoId === empreendimentoId,
  );
}

export function labelForScope(scope: UserScope): string {
  if (scope.isOrgScope) {
    return `${scope.orgNome} — organização inteira`;
  }

  return scope.empreendimentoNome
    ? `${scope.orgNome} · ${scope.empreendimentoNome}`
    : scope.orgNome;
}
