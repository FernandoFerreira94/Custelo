import { describe, expect, it } from "vitest";

import { setPasswordSchema } from "@/components/auth/set-password-schema";

describe("setPasswordSchema", () => {
  it("aceita senha e confirmacao iguais", () => {
    const parsed = setPasswordSchema.safeParse({
      password: "1234567890",
      confirmPassword: "1234567890",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejeita confirmacao diferente", () => {
    const parsed = setPasswordSchema.safeParse({
      password: "1234567890",
      confirmPassword: "0987654321",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("As senhas não coincidem.");
    }
  });
});
