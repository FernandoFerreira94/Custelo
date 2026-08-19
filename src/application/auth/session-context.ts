/** Claims customizados injetados pelo Auth Hook (ADR-005). */
export type CusteloAccessClaims = {
  user_status?: "ativo" | "desativado" | "convite_pendente" | "missing";
  org_id?: string;
  empreendimento_id?: string;
  papel_codigo?: string;
};

/** Contexto de sessao resolvido no servidor — tenant nunca vem do cliente. */
export type AuthenticatedSession = {
  userId: string;
  email: string;
  claims: CusteloAccessClaims;
};

export function canWriteWithStatus(
  status: CusteloAccessClaims["user_status"],
): boolean {
  return status === "ativo";
}

export function hasTenantContext(claims: CusteloAccessClaims): boolean {
  return Boolean(claims.org_id && claims.empreendimento_id);
}
