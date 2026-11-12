import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const mocks = vi.hoisted(() => ({
  contextoDaSessao: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/infrastructure/auth/contexto", () => ({
  contextoDaSessao: mocks.contextoDaSessao,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { MSG } from "@/lib/mensagens";
import { falha, sucesso } from "@/lib/resultado";

const ctx = {
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel: "empreendimento_gestor",
  escopoDeOrg: false,
};
const esquema = z.object({ nome: z.string().min(1, "Informe o nome.") });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.contextoDaSessao.mockResolvedValue({ ok: true, data: ctx });
});

describe("executarAcao", () => {
  it("sem sessão: devolve SEM_SESSAO e não chama o caso de uso", async () => {
    mocks.contextoDaSessao.mockResolvedValue(
      falha("SEM_SESSAO", MSG.sessaoExpirada),
    );
    const executar = vi.fn();

    const r = await executarAcao(
      esquema,
      { nome: "x" },
      {
        revalidar: ["/gestao"],
        executar,
      },
    );

    expect(r).toMatchObject({ ok: false, codigo: "SEM_SESSAO" });
    expect(executar).not.toHaveBeenCalled();
  });

  it("Zod inválido: ENTRADA_INVALIDA com os campos", async () => {
    const executar = vi.fn();

    const r = await executarAcao(
      esquema,
      { nome: "" },
      {
        revalidar: [],
        executar,
      },
    );

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { nome: "Informe o nome." },
    });
    expect(executar).not.toHaveBeenCalled();
  });

  it("caso de uso ok: revalida as listas", async () => {
    const r = await executarAcao(
      esquema,
      { nome: "Bloco A" },
      {
        revalidar: ["/gestao/estrutura", "/gestao/unidades"],
        executar: async (_c, d) => sucesso(d.nome),
      },
    );

    expect(r).toEqual({ ok: true, data: "Bloco A" });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/gestao/estrutura");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/gestao/unidades");
  });

  it("falha do caso de uso não revalida", async () => {
    await executarAcao(
      esquema,
      { nome: "x" },
      {
        revalidar: ["/gestao"],
        executar: async () => falha("CONFLITO", "Já existe."),
      },
    );

    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("exceção do repo: INDISPONIVEL com o texto do catálogo", async () => {
    const r = await executarAcao(
      esquema,
      { nome: "x" },
      {
        revalidar: [],
        executar: async () => {
          throw new Error("conexão caiu");
        },
      },
    );

    expect(r).toEqual({
      ok: false,
      codigo: "INDISPONIVEL",
      mensagem: MSG.inesperado,
    });
  });

  it("erro do Postgres vira a falha de cadastro (23505 → DUPLICADO)", async () => {
    const r = await executarAcao(
      esquema,
      { nome: "x" },
      {
        revalidar: [],
        executar: async () => {
          throw { code: "23505" };
        },
      },
    );

    expect(r).toMatchObject({ ok: false, codigo: "DUPLICADO" });
  });
});
