import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { confirmarImportacao } from "@/application/importacao/confirmar";
import { corrigirLinha } from "@/application/importacao/corrigir-linha";
import { decidirDuplicado } from "@/application/importacao/decidir-duplicado";
import { desfazerImportacao } from "@/application/importacao/desfazer";
import { iniciarImportacao } from "@/application/importacao/iniciar";
import {
  type DepsDeImportacao,
  MSG_FUNCIONARIOS,
} from "@/application/importacao/ports";
import { validarArquivo } from "@/application/importacao/validar-arquivo";
import { normalizarCodigo } from "@/domain/estrutura/unidade";
import { criarAuditoriaFake } from "@/tests/fakes/auditoria";
import { criarImportacaoRepoFake } from "@/tests/fakes/importacao-repo";

const AGORA = new Date("2026-11-05T12:00:00Z");
const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const gestor = ctx("empreendimento_gestor");

let fake: ReturnType<typeof criarImportacaoRepoFake>;
let trilha: ReturnType<typeof criarAuditoriaFake>;
let deps: DepsDeImportacao;

beforeEach(() => {
  fake = criarImportacaoRepoFake({
    codigosDeUnidade: new Set(["B304"].map(normalizarCodigo)),
  });
  trilha = criarAuditoriaFake();
  deps = { repo: fake.repo, auditoria: trilha.auditoria, agora: () => AGORA };
});

const tabelaDeUnidades = (linhas: string[][]) => ({
  cabecalhos: ["Tipo", "Bloco/Torre/Quadra", "Número"],
  linhas,
});

async function lote(linhas: string[][]) {
  const r = await iniciarImportacao(deps, gestor, {
    cadastro: "unidades",
    arquivoNome: "unidades.csv",
    tabela: tabelaDeUnidades(linhas),
  });
  if (!r.ok) throw new Error(r.mensagem);
  return r.data.loteId;
}

describe("validarArquivo", () => {
  it("recusa mais de 5 MB e tipo fora de csv/xlsx antes de ler", () => {
    expect(
      validarArquivo({
        nome: "a.csv",
        tipo: "text/csv",
        bytes: 6 * 1024 * 1024,
      }),
    ).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
    });
    expect(
      validarArquivo({ nome: "a.pdf", tipo: "application/pdf", bytes: 1000 }),
    ).toMatchObject({
      ok: false,
    });
  });

  it("aceita csv e xlsx e devolve o formato", () => {
    expect(
      validarArquivo({ nome: "a.csv", tipo: "text/csv", bytes: 1000 }),
    ).toEqual({
      ok: true,
      data: "csv",
    });
    expect(
      validarArquivo({
        nome: "a.xlsx",
        tipo: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        bytes: 1000,
      }),
    ).toEqual({ ok: true, data: "xlsx" });
  });

  it("csv com tipo genérico do navegador passa pela extensão", () => {
    expect(
      validarArquivo({
        nome: "unidades.csv",
        tipo: "application/vnd.ms-excel",
        bytes: 10,
      }),
    ).toEqual({ ok: true, data: "csv" });
  });
});

describe("iniciarImportacao", () => {
  it("cria o lote com a situação de cada linha e NÃO toca nos cadastros", async () => {
    const r = await iniciarImportacao(deps, gestor, {
      cadastro: "unidades",
      arquivoNome: "unidades.csv",
      tabela: tabelaDeUnidades([
        ["Apartamento", "C", "101"],
        ["Apartamento", "C", "102"],
        ["Garagem", "C", "103"],
        ["Apartamento", "B", "304"],
      ]),
    });

    expect(r).toMatchObject({
      ok: true,
      mensagem:
        "4 linhas lidas: 2 prontas, 1 com erro, 1 duplicada. Nada foi gravado ainda.",
      data: { prontas: 2, avisos: 0, erros: 1, duplicadas: 1 },
    });
    expect(fake.estado.cadastrosTocados).toBe(0);
    expect(fake.estado.lotes[0]).toMatchObject({ status: "conferindo" });
    expect(fake.estado.linhas.map((l) => l.situacao)).toEqual([
      "ok",
      "ok",
      "erro",
      "duplicado",
    ]);
  });

  it("coluna obrigatória faltando falha antes de criar qualquer coisa", async () => {
    const r = await iniciarImportacao(deps, gestor, {
      cadastro: "unidades",
      arquivoNome: "x.csv",
      tabela: { cabecalhos: ["Tipo"], linhas: [["Casa"]] },
    });

    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
    expect(fake.estado.lotes).toHaveLength(0);
  });

  it("recepcionista não importa: SEM_PERMISSAO", async () => {
    const r = await iniciarImportacao(deps, ctx("recepcionista"), {
      cadastro: "unidades",
      arquivoNome: "x.csv",
      tabela: tabelaDeUnidades([["Casa", "", "1"]]),
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("avisa das colunas que a planilha tem a mais", async () => {
    const r = await iniciarImportacao(deps, gestor, {
      cadastro: "unidades",
      arquivoNome: "x.csv",
      tabela: {
        cabecalhos: ["Tipo", "Número", "Cor da porta"],
        linhas: [["Casa", "1", "azul"]],
      },
    });
    expect(r).toMatchObject({
      ok: true,
      data: { colunasIgnoradas: ["Cor da porta"] },
    });
  });

  it("funcionários ainda não: mensagem clara", async () => {
    const r = await iniciarImportacao(deps, gestor, {
      cadastro: "funcionarios",
      arquivoNome: "f.csv",
      tabela: {
        cabecalhos: ["Nome completo", "E-mail", "Papel"],
        linhas: [["A", "a@x.com", "Gestor"]],
      },
    });
    expect(r).toEqual({
      ok: false,
      codigo: "INDISPONIVEL",
      mensagem: MSG_FUNCIONARIOS,
    });
  });
});

describe("corrigirLinha", () => {
  it("revalida só aquela linha e devolve a situação nova", async () => {
    const loteId = await lote([
      ["Garagem", "C", "103"],
      ["Apartamento", "C", "104"],
    ]);
    const [erro] = await fake.repo.listarLinhas(gestor, loteId);

    const r = await corrigirLinha(deps, gestor, {
      loteId,
      linhaId: erro!.id,
      dados: { Tipo: "Apartamento", "Bloco/Torre/Quadra": "C", Número: "103" },
    });

    expect(r).toMatchObject({
      ok: true,
      data: { situacao: "ok", problemas: [] },
    });
    const linhas = await fake.repo.listarLinhas(gestor, loteId);
    expect(linhas[0]).toMatchObject({
      situacao: "ok",
      dados: { codigo: "C-103" },
    });
    expect(linhas[1]?.situacao).toBe("ok");
  });

  it("corrigir para um código que já está em outra linha do arquivo continua erro", async () => {
    const loteId = await lote([
      ["Garagem", "C", "103"],
      ["Apartamento", "C", "104"],
    ]);
    const [erro] = await fake.repo.listarLinhas(gestor, loteId);

    const r = await corrigirLinha(deps, gestor, {
      loteId,
      linhaId: erro!.id,
      dados: { Tipo: "Apartamento", "Bloco/Torre/Quadra": "C", Número: "104" },
    });

    expect(r).toMatchObject({ ok: true, data: { situacao: "erro" } });
  });

  it("lote já confirmado não aceita correção", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);
    await confirmarImportacao(deps, gestor, { loteId, confirmou: true });
    const [linha] = await fake.repo.listarLinhas(gestor, loteId);

    const r = await corrigirLinha(deps, gestor, {
      loteId,
      linhaId: linha!.id,
      dados: {},
    });

    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });
});

describe("decidirDuplicado", () => {
  it("atualizar ou ignorar por linha; só vale para linha duplicada", async () => {
    const loteId = await lote([
      ["Apartamento", "B", "304"],
      ["Apartamento", "C", "101"],
    ]);
    const [dup, boa] = await fake.repo.listarLinhas(gestor, loteId);

    const r = await decidirDuplicado(deps, gestor, {
      loteId,
      linhaId: dup!.id,
      decisao: "atualizar",
    });
    const invalida = await decidirDuplicado(deps, gestor, {
      loteId,
      linhaId: boa!.id,
      decisao: "atualizar",
    });

    expect(r).toMatchObject({ ok: true });
    expect((await fake.repo.listarLinhas(gestor, loteId))[0]?.decisao).toBe(
      "atualizar",
    );
    expect(invalida).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });
});

describe("confirmarImportacao", () => {
  it("exige a confirmação de responsabilidade e não grava sem ela", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);

    const r = await confirmarImportacao(deps, gestor, {
      loteId,
      confirmou: false,
    });

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: {
        confirmou:
          "Confirme que você tem autorização para cadastrar estes dados.",
      },
    });
    expect(fake.estado.gravacoes).toBe(0);
  });

  it("grava só ok, aviso e duplicado com decisão; erro nunca entra; duplicado sem decisão não entra", async () => {
    const loteId = await lote([
      ["Apartamento", "C", "101"], // ok
      ["Garagem", "C", "103"], // erro
      ["Apartamento", "B", "304"], // duplicado sem decisão
    ]);

    const r = await confirmarImportacao(deps, gestor, {
      loteId,
      confirmou: true,
    });

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.cadastrosTocados).toBe(1);
    expect(trilha.entradas.at(-1)).toMatchObject({
      acao: "IMPORTACAO_CONFIRMADA",
      depois: { cadastro: "unidades", criados: 1 },
    });
  });

  it("duplicado com decisão entra; ignorar fica de fora", async () => {
    const loteId = await lote([
      ["Apartamento", "B", "304"],
      ["Apartamento", "C", "101"],
    ]);
    const [dup] = await fake.repo.listarLinhas(gestor, loteId);
    await decidirDuplicado(deps, gestor, {
      loteId,
      linhaId: dup!.id,
      decisao: "atualizar",
    });

    await confirmarImportacao(deps, gestor, { loteId, confirmou: true });

    expect(fake.estado.cadastrosTocados).toBe(2);
  });

  it("a auditoria não leva dados pessoais, só cadastro e contagens", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);
    await confirmarImportacao(deps, gestor, { loteId, confirmou: true });

    const texto = JSON.stringify(trilha.entradas.at(-1));
    expect(texto).not.toContain("C-101");
  });

  it("duas vezes (duplo clique): a 2ª devolve o resultado, sem gravar de novo", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);

    const a = await confirmarImportacao(deps, gestor, {
      loteId,
      confirmou: true,
    });
    const b = await confirmarImportacao(deps, gestor, {
      loteId,
      confirmou: true,
    });

    expect(a).toMatchObject({ ok: true });
    expect(b).toMatchObject({
      ok: true,
      mensagem: "Este lote já foi importado.",
    });
    expect(fake.estado.gravacoes).toBe(1);
  });

  it("lote cancelado ou desfeito não confirma", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);
    fake.estado.lotes[0]!.status = "cancelada";

    const r = await confirmarImportacao(deps, gestor, {
      loteId,
      confirmou: true,
    });

    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("lote inexistente: NAO_ENCONTRADO", async () => {
    const r = await confirmarImportacao(deps, gestor, {
      loteId: "nada",
      confirmou: true,
    });
    expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
  });
});

describe("desfazerImportacao", () => {
  async function confirmado(agora = AGORA) {
    const loteId = await lote([["Apartamento", "C", "101"]]);
    await confirmarImportacao({ ...deps, agora: () => agora }, gestor, {
      loteId,
      confirmou: true,
    });
    return loteId;
  }

  it("dentro de 24 h inativa o que o lote criou e audita IMPORTACAO_DESFEITA", async () => {
    const loteId = await confirmado(new Date("2026-11-05T01:00:00Z"));

    const r = await desfazerImportacao(deps, gestor, { loteId });

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.lotes[0]?.status).toBe("desfeita");
    expect(trilha.entradas.at(-1)?.acao).toBe("IMPORTACAO_DESFEITA");
  });

  it("depois de 24 h não desfaz", async () => {
    const loteId = await confirmado(new Date("2026-11-03T00:00:00Z"));

    const r = await desfazerImportacao(deps, gestor, { loteId });

    expect(r).toMatchObject({
      ok: false,
      codigo: "CONFLITO",
      mensagem: "Já passaram 24 horas: este lote não pode mais ser desfeito.",
    });
    expect(fake.estado.desfeitos).toBe(0);
  });

  it("lote que não foi confirmado não tem o que desfazer", async () => {
    const loteId = await lote([["Apartamento", "C", "101"]]);
    const r = await desfazerImportacao(deps, gestor, { loteId });
    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("recepcionista: SEM_PERMISSAO", async () => {
    const r = await desfazerImportacao(deps, ctx("recepcionista"), {
      loteId: "x",
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});
