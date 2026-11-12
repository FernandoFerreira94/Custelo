import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  contextoDaSessao: vi.fn(),
  iniciarImportacao: vi.fn(),
}));

vi.mock("@/infrastructure/auth/contexto", () => ({
  contextoDaSessao: mocks.contextoDaSessao,
}));
vi.mock("@/application/importacao/iniciar", () => ({
  iniciarImportacao: mocks.iniciarImportacao,
}));
vi.mock("@/infrastructure/importacao/importacao-repo", () => ({
  importacaoRepo: {},
}));
vi.mock("@/infrastructure/auditoria/auditoria-repo", () => ({
  auditoriaRepo: {},
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

import { enviarPlanilhaAction } from "@/app/(web)/gestao/importar/[cadastro]/actions";
import { falha } from "@/lib/resultado";

const ctx = {
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel: "empreendimento_gestor",
  escopoDeOrg: false,
};

function formulario(
  nome: string,
  tipo: string,
  conteudo: string,
  cadastro = "unidades",
) {
  const f = new FormData();
  f.set("cadastro", cadastro);
  f.set("arquivo", new File([conteudo], nome, { type: tipo }));
  return f;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.contextoDaSessao.mockResolvedValue({ ok: true, data: ctx });
  mocks.iniciarImportacao.mockResolvedValue({
    ok: true,
    data: { loteId: "l1" },
  });
});

describe("enviarPlanilhaAction", () => {
  it("sem sessão devolve a falha de sessão e não lê nada", async () => {
    mocks.contextoDaSessao.mockResolvedValue(
      falha("SEM_SESSAO", "Sua sessão terminou."),
    );

    const r = await enviarPlanilhaAction(
      formulario("a.csv", "text/csv", "Tipo;Número\nCasa;1"),
    );

    expect(r).toMatchObject({ ok: false, codigo: "SEM_SESSAO" });
    expect(mocks.iniciarImportacao).not.toHaveBeenCalled();
  });

  it("cadastro inválido e arquivo ausente voltam como entrada inválida", async () => {
    expect(
      await enviarPlanilhaAction(
        formulario("a.csv", "text/csv", "x", "carros"),
      ),
    ).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });

    const semArquivo = new FormData();
    semArquivo.set("cadastro", "unidades");
    expect(await enviarPlanilhaAction(semArquivo)).toMatchObject({
      ok: false,
      campos: { arquivo: "Escolha o arquivo da planilha." },
    });
  });

  it("tipo fora de csv e xlsx é recusado antes de ler o conteúdo", async () => {
    const r = await enviarPlanilhaAction(
      formulario("a.pdf", "application/pdf", "%PDF"),
    );

    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
    expect(mocks.iniciarImportacao).not.toHaveBeenCalled();
  });

  it("arquivo acima de 5 MB é recusado antes de ler", async () => {
    const grande = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "a.csv", {
      type: "text/csv",
    });
    const f = new FormData();
    f.set("cadastro", "unidades");
    f.set("arquivo", grande);

    const r = await enviarPlanilhaAction(f);

    expect(r).toMatchObject({
      ok: false,
      mensagem: "O arquivo passa de 5 MB. Divida a planilha em partes.",
    });
    expect(mocks.iniciarImportacao).not.toHaveBeenCalled();
  });

  it("CSV válido chega ao caso de uso já como tabela de texto", async () => {
    const r = await enviarPlanilhaAction(
      formulario("unidades.csv", "text/csv", "Tipo;Número\nCasa;01\n"),
    );

    expect(r).toMatchObject({ ok: true });
    expect(mocks.iniciarImportacao).toHaveBeenCalledWith(
      expect.anything(),
      ctx,
      {
        cadastro: "unidades",
        arquivoNome: "unidades.csv",
        tabela: { cabecalhos: ["Tipo", "Número"], linhas: [["Casa", "01"]] },
      },
    );
  });

  it("falha inesperada vira mensagem, não exceção", async () => {
    mocks.iniciarImportacao.mockRejectedValue(new Error("conexão caiu"));

    const r = await enviarPlanilhaAction(
      formulario("a.csv", "text/csv", "Tipo;Número\nCasa;1"),
    );

    expect(r).toMatchObject({ ok: false, codigo: "INDISPONIVEL" });
  });
});
