import { describe, expect, it } from "vitest";

import { newPasswordSchema } from "@/components/auth/password-policy";

describe("newPasswordSchema", () => {
  it("aceita senha com 10 caracteres", () => {
    expect(newPasswordSchema.safeParse("1234567890").success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const parsed = newPasswordSchema.safeParse("curta");
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Mínimo 10 caracteres.");
    }
  });
});
