import { describe, expect, it } from "vitest";

import {
  canWriteWithStatus,
  hasTenantContext,
} from "@/application/auth/session-context";
import { mergeHookClaims } from "@/infrastructure/auth/resolve-auth-claims";

describe("session-context", () => {
  it("permite escrita apenas com status ativo", () => {
    expect(canWriteWithStatus("ativo")).toBe(true);
    expect(canWriteWithStatus("desativado")).toBe(false);
    expect(canWriteWithStatus("convite_pendente")).toBe(false);
    expect(canWriteWithStatus("missing")).toBe(false);
  });

  it("exige org e empreendimento para contexto de tenant", () => {
    expect(
      hasTenantContext({
        org_id: "00000000-0000-0000-0000-000000000010",
        empreendimento_id: "00000000-0000-0000-0000-000000000011",
      }),
    ).toBe(true);
    expect(
      hasTenantContext({
        org_id: "00000000-0000-0000-0000-000000000010",
      }),
    ).toBe(false);
  });
});

describe("mergeHookClaims", () => {
  it("mescla claims customizados sem apagar claims existentes", () => {
    expect(
      mergeHookClaims(
        { sub: "user-1", role: "authenticated" },
        {
          user_status: "ativo",
          org_id: "00000000-0000-0000-0000-000000000010",
        },
      ),
    ).toEqual({
      sub: "user-1",
      role: "authenticated",
      user_status: "ativo",
      org_id: "00000000-0000-0000-0000-000000000010",
    });
  });
});
