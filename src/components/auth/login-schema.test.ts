import { describe, expect, it } from "vitest";

import { loginSchema } from "@/components/auth/login-schema";

describe("loginSchema", () => {
  it("aceita e-mail e senha preenchidos", () => {
    const parsed = loginSchema.safeParse({
      email: "carla.souza@vilaverde.com.br",
      password: "uma-senha",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejeita e-mail vazio", () => {
    const parsed = loginSchema.safeParse({ email: "", password: "uma-senha" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe o e-mail.");
    }
  });

  it("rejeita e-mail invalido", () => {
    const parsed = loginSchema.safeParse({
      email: "nao-e-email",
      password: "uma-senha",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe um e-mail válido.");
    }
  });

  it("rejeita senha vazia", () => {
    const parsed = loginSchema.safeParse({
      email: "carla.souza@vilaverde.com.br",
      password: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe a senha.");
    }
  });
});
