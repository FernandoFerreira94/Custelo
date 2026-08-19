import { describe, expect, it } from "vitest";

import { acceptInviteSchema } from "@/components/auth/accept-invite-schema";

describe("acceptInviteSchema", () => {
  it("aceita nome e senha validos", () => {
    const parsed = acceptInviteSchema.safeParse({
      fullName: "Carla Souza",
      password: "1234567890",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const parsed = acceptInviteSchema.safeParse({
      fullName: "",
      password: "1234567890",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Informe o nome completo.");
    }
  });
});
