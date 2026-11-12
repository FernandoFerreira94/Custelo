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

  it.each([
    [{ link: "usado" }, "Este link já foi usado. Peça um novo para entrar."],
    [
      { link: "vencido" },
      "Este link venceu. Peça um novo; ele vale por 1 hora.",
    ],
    [{ link: "invalido" }, "Não conseguimos abrir este link. Peça um novo."],
    [
      { auth_error: "invalid_link" },
      "Não conseguimos abrir este link. Peça um novo.",
    ],
  ])("mostra a mensagem do link %j", async (params, mensagem) => {
    const element = await EntrarPage({
      searchParams: Promise.resolve(params),
    });

    expect(element.props.initialError).toBe(mensagem);
  });
});
