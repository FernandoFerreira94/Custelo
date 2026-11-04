import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPendingInviteForSession: vi.fn(),
}));

vi.mock("@/infrastructure/auth/invite-service", () => ({
  getPendingInviteForSession: mocks.getPendingInviteForSession,
}));

import EntrarPage from "@/app/(auth)/entrar/page";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getPendingInviteForSession.mockResolvedValue({
    ok: false,
    code: "UNAUTHORIZED",
  });
});

describe("EntrarPage", () => {
  it("abre a definicao de senha apos callback de recovery", async () => {
    const element = await EntrarPage({
      searchParams: Promise.resolve({ view: "senha" }),
    });

    expect(element.props.initialView).toBe("senha");
  });

  it("abre o aceite quando existe sessao de convite", async () => {
    mocks.getPendingInviteForSession.mockResolvedValue({
      ok: true,
      metadata: {
        inviter: "Admin",
        role: "Recepcionista",
        properties: "Colinas",
      },
    });

    const element = await EntrarPage({
      searchParams: Promise.resolve({ view: "convite" }),
    });

    expect(element.props.initialView).toBe("convite");
    expect(element.props.initialInvite).toEqual({
      inviter: "Admin",
      role: "Recepcionista",
      properties: "Colinas",
    });
  });

  it("mostra erro seguro para callback invalido", async () => {
    const element = await EntrarPage({
      searchParams: Promise.resolve({ auth_error: "invalid_link" }),
    });

    expect(element.props.initialError).toBe(
      "Link inválido ou expirado. Solicite um novo link.",
    );
  });
});
