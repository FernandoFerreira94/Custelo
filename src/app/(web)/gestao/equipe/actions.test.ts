import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  contextoDaSessao: vi.fn(),
  inviteUser: vi.fn(),
}));

vi.mock("@/infrastructure/auth/contexto", () => ({
  contextoDaSessao: mocks.contextoDaSessao,
}));
vi.mock("@/application/auth/manage-access", () => ({
  inviteUser: mocks.inviteUser,
}));

import { convidarAction } from "@/app/(web)/gestao/equipe/actions";
import { MSG } from "@/lib/mensagens";

const contexto = (papel: string) => ({
  ok: true,
  data: {
    orgId: "o1",
    empreendimentoId: "e1",
    usuarioId: "u1",
    papel,
    escopoDeOrg: false,
  },
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.contextoDaSessao.mockResolvedValue(contexto("empreendimento_gestor"));
  mocks.inviteUser.mockResolvedValue({ ok: true });
});

describe("convidarAction", () => {
  it("recepcionista convida: SEM_PERMISSAO, sem chamar o caso de uso", async () => {
    mocks.contextoDaSessao.mockResolvedValue(contexto("recepcionista"));

    await expect(
      convidarAction({ email: "a@x.com", papel: "recepcionista" }),
    ).resolves.toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(mocks.inviteUser).not.toHaveBeenCalled();
  });

  it("e-mail inválido: ENTRADA_INVALIDA com a mensagem do campo", async () => {
    await expect(
      convidarAction({ email: "isso-nao-e-email", papel: "recepcionista" }),
    ).resolves.toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { email: "Informe um e-mail válido." },
    });
    expect(mocks.inviteUser).not.toHaveBeenCalled();
  });

  it("gestor convida recepcionista no próprio empreendimento", async () => {
    await expect(
      convidarAction({ email: "ana@x.com", papel: "recepcionista" }),
    ).resolves.toEqual({
      ok: true,
      data: { email: "a***@x.com" },
      mensagem: "Convite enviado para a***@x.com. O link vale por 24 horas.",
    });
    expect(mocks.inviteUser).toHaveBeenCalledWith({
      actorUserId: "u1",
      email: "ana@x.com",
      initialScope: {
        orgId: "o1",
        empreendimentoId: "e1",
        isOrgScope: false,
        roleCode: "recepcionista",
      },
    });
  });

  it("não aceita papel de administrador vindo do cliente", async () => {
    await expect(
      convidarAction({ email: "ana@x.com", papel: "org_admin" }),
    ).resolves.toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
    expect(mocks.inviteUser).not.toHaveBeenCalled();
  });

  it("e-mail que já tem acesso: DUPLICADO", async () => {
    mocks.inviteUser.mockResolvedValue({ ok: false, code: "DUPLICATE" });

    await expect(
      convidarAction({ email: "ana@x.com", papel: "auditor" }),
    ).resolves.toEqual({
      ok: false,
      codigo: "DUPLICADO",
      mensagem: "Esta pessoa já tem acesso a este empreendimento.",
    });
  });

  it("Supabase fora: INDISPONIVEL com MSG.instavel", async () => {
    mocks.inviteUser.mockResolvedValue({ ok: false, code: "UNAVAILABLE" });

    await expect(
      convidarAction({ email: "ana@x.com", papel: "auditor" }),
    ).resolves.toEqual({
      ok: false,
      codigo: "INDISPONIVEL",
      mensagem: MSG.instavel,
    });
  });
});
