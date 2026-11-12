import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  contextoDaSessao: vi.fn(),
  deactivateUser: vi.fn(),
}));

vi.mock("@/infrastructure/auth/contexto", () => ({
  contextoDaSessao: mocks.contextoDaSessao,
}));
vi.mock("@/application/auth/manage-access", () => ({
  deactivateUser: mocks.deactivateUser,
}));

import { desativarAction } from "@/app/(web)/gestao/equipe/desativar";
import { MSG } from "@/lib/mensagens";

const ALVO = "11111111-1111-4111-8111-111111111111";
const contexto = (papel: string) => ({
  ok: true,
  data: {
    orgId: "o1",
    empreendimentoId: "e1",
    usuarioId: "22222222-2222-4222-8222-222222222222",
    papel,
    escopoDeOrg: false,
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.contextoDaSessao.mockResolvedValue(contexto("empreendimento_gestor"));
  mocks.deactivateUser.mockResolvedValue({ ok: true });
});

describe("desativarAction", () => {
  it("recepcionista não desativa: SEM_PERMISSAO, sem chamar o caso de uso", async () => {
    mocks.contextoDaSessao.mockResolvedValue(contexto("recepcionista"));

    await expect(
      desativarAction({ usuarioId: ALVO, motivo: "saiu da empresa" }),
    ).resolves.toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(mocks.deactivateUser).not.toHaveBeenCalled();
  });

  it("exige o motivo", async () => {
    await expect(
      desativarAction({ usuarioId: ALVO, motivo: " " }),
    ).resolves.toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { motivo: "Conte o motivo, em poucas palavras." },
    });
    expect(mocks.deactivateUser).not.toHaveBeenCalled();
  });

  it("não deixa desativar a si mesmo", async () => {
    await expect(
      desativarAction({
        usuarioId: "22222222-2222-4222-8222-222222222222",
        motivo: "teste",
      }),
    ).resolves.toMatchObject({ ok: false, codigo: "CONFLITO" });
    expect(mocks.deactivateUser).not.toHaveBeenCalled();
  });

  it("desativa e manda o motivo para a trilha", async () => {
    await expect(
      desativarAction({ usuarioId: ALVO, motivo: "saiu da empresa" }),
    ).resolves.toMatchObject({ ok: true });
    expect(mocks.deactivateUser).toHaveBeenCalledWith({
      actorUserId: "22222222-2222-4222-8222-222222222222",
      targetUserId: ALVO,
      motivo: "saiu da empresa",
    });
  });

  it("falha do serviço vira INDISPONIVEL", async () => {
    mocks.deactivateUser.mockResolvedValue({ ok: false, code: "UNAVAILABLE" });

    await expect(
      desativarAction({ usuarioId: ALVO, motivo: "saiu da empresa" }),
    ).resolves.toEqual({
      ok: false,
      codigo: "INDISPONIVEL",
      mensagem: MSG.instavel,
    });
  });
});
