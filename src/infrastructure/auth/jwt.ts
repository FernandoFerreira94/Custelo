import type { CusteloAccessClaims } from "@/application/auth/session-context";

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  if (!payload) {
    return {};
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as Record<
    string,
    unknown
  >;
}

export function readCusteloClaims(
  payload: Record<string, unknown>,
): CusteloAccessClaims {
  return {
    user_status: payload.user_status as CusteloAccessClaims["user_status"],
    org_id: typeof payload.org_id === "string" ? payload.org_id : undefined,
    empreendimento_id:
      typeof payload.empreendimento_id === "string"
        ? payload.empreendimento_id
        : undefined,
    papel_codigo:
      typeof payload.papel_codigo === "string"
        ? payload.papel_codigo
        : undefined,
  };
}
