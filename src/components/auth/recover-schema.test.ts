import { describe, expect, it } from "vitest";

import { recoverSchema } from "@/components/auth/recover-schema";

describe("recoverSchema", () => {
  it("aceita e-mail preenchido", () => {
    const parsed = recoverSchema.safeParse({
      email: "condominio@condominio.com.br",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejeita e-mail vazio", () => {
    const parsed = recoverSchema.safeParse({ email: "" });
    expect(parsed.success).toBe(false);
  });
});
