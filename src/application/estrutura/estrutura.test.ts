import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { criarArea } from "@/application/estrutura/criar-area";
import { criarUnidade } from "@/application/estrutura/criar-unidade";
import {
  desativarArea,
  desativarUnidade,
} from "@/application/estrutura/desativar";
import { editarArea } from "@/application/estrutura/editar-area";
import { editarUnidade } from "@/application/estrutura/editar-unidade";
import { gerarUnidades } from "@/application/estrutura/gerar-unidades";
import {
  MSG_ESTRUTURA,
  type DepsDeEstrutura,
} from "@/application/estrutura/ports";
import { criarAuditoriaFake } from "@/tests/fakes/auditoria";
import { criarEstruturaRepoFake } from "@/tests/fakes/estrutura-repo";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const gestor = ctx("empreendimento_gestor");

let fake: ReturnType<typeof criarEstruturaRepoFake>;
let trilha: ReturnType<typeof criarAuditoriaFake>;
let deps: DepsDeEstrutura;

beforeEach(() => {
  fake = criarEstruturaRepoFake();
  trilha = criarAuditoriaFake();
  deps = { repo: fake.repo, auditoria: trilha.auditoria };
});

describe("criarUnidade", () => {
  it("recepcionista não cria: SEM_PERMISSAO", async () => {
    const r = await criarUnidade(deps, ctx("recepcionista"), {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(fake.estado.unidades).toHaveLength(0);
  });

  it("gestor cria B-304 com apelidos normalizados e registra a auditoria", async () => {
    const r = await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
      apelidos: ["BL B AP 304", "b304", " "],
    });

    expect(r).toMatchObject({ ok: true, data: { codigo: "B-304" } });
    expect(fake.estado.unidades[0]).toMatchObject({
      codigo: "B-304",
      apelidos: ["BL B AP 304"],
    });
    expect(trilha.entradas.map((e) => e.acao)).toEqual(["UNIDADE_CRIADA"]);
  });

  it("código que já existe (normalizado): DUPLICADO", async () => {
    await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });

    const r = await criarUnidade(deps, gestor, {
      bloco: "b",
      numero: "304",
      tipo: "apartamento",
    });

    expect(r).toEqual({
      ok: false,
      codigo: "DUPLICADO",
      mensagem: "Já existe a unidade b-304. Abra ela para editar.",
    });
  });

  it("área comum que avisa responsável sem escolher quem: ENTRADA_INVALIDA", async () => {
    const r = await criarUnidade(deps, gestor, {
      numero: "Salão",
      tipo: "area_comum",
      avisarResponsavel: true,
    });

    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { responsavel: MSG_ESTRUTURA.responsavel },
    });
  });

  it("tira o acento do código para bater com o normalizado do banco", async () => {
    const r = await criarUnidade(deps, gestor, {
      bloco: "Térreo",
      numero: "1",
      tipo: "apartamento",
    });

    expect(r).toMatchObject({ ok: true, data: { codigo: "Terreo-1" } });
  });
});

describe("gerarUnidades", () => {
  it("3×9×8 por andar: 3 blocos + 27 andares + 216 unidades numa transação", async () => {
    const r = await gerarUnidades(deps, gestor, {
      blocos: 3,
      andares: 9,
      porAndar: 8,
      numeracao: "andar",
    });

    expect(r).toMatchObject({
      ok: true,
      mensagem: "216 unidades criadas em 3 blocos.",
    });
    expect(fake.estado.lotes).toHaveLength(1);
    expect(trilha.entradas.map((e) => e.acao)).toEqual(["UNIDADES_GERADAS"]);
  });

  it("5 códigos já existem: não cria nada e lista os conflitos", async () => {
    for (const n of ["101", "102", "103", "104", "105"]) {
      await criarUnidade(deps, gestor, {
        bloco: "A",
        numero: n,
        tipo: "apartamento",
      });
    }

    const r = await gerarUnidades(deps, gestor, {
      blocos: ["A"],
      andares: 1,
      porAndar: 8,
      numeracao: "andar",
    });

    expect(r).toMatchObject({
      ok: false,
      codigo: "CONFLITO",
      mensagem:
        "Já existem: A-101, A-102, A-103, A-104, A-105. Ajuste e gere de novo.",
    });
    expect(fake.estado.lotes).toHaveLength(0);
  });

  it("recepcionista não gera: SEM_PERMISSAO", async () => {
    const r = await gerarUnidades(deps, ctx("recepcionista"), {
      blocos: 1,
      andares: 1,
      porAndar: 1,
      numeracao: "andar",
    });
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});

describe("editarUnidade", () => {
  it("trocar o código para um já usado: DUPLICADO", async () => {
    await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });
    const outra = await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "305",
      tipo: "apartamento",
    });
    if (!outra.ok) throw new Error(outra.mensagem);

    const r = await editarUnidade(deps, gestor, outra.data.id, {
      codigo: "B 304",
    });

    expect(r).toMatchObject({ ok: false, codigo: "DUPLICADO" });
  });

  it("manter o próprio código não conta como duplicado", async () => {
    const criada = await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });
    if (!criada.ok) throw new Error(criada.mensagem);

    const r = await editarUnidade(deps, gestor, criada.data.id, {
      codigo: "B-304",
      nome: "Cobertura",
    });

    expect(r).toMatchObject({ ok: true });
    expect(trilha.entradas.at(-1)?.acao).toBe("UNIDADE_EDITADA");
  });
});

describe("áreas", () => {
  it("criarArea registra a auditoria", async () => {
    const r = await criarArea(deps, gestor, { nome: "Bloco A" });
    expect(r).toMatchObject({ ok: true });
    expect(trilha.entradas.map((e) => e.acao)).toEqual(["AREA_CRIADA"]);
  });

  it("editarArea cujo novo pai cria ciclo: CONFLITO com a mensagem de ciclo", async () => {
    fake.estado.cicloAoAtualizarArea = true;

    const r = await editarArea(deps, gestor, "a1", { parentId: "a2" });

    expect(r).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem: MSG_ESTRUTURA.ciclo,
    });
  });
});

describe("desativar", () => {
  it("área com unidades ativas: CONFLITO com a contagem", async () => {
    fake.estado.unidadesAtivasNaArea.set("a1", 72);

    const r = await desativarArea(deps, gestor, "a1");

    expect(r).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem:
        "Esta área tem 72 unidades ativas. Mova ou desative as unidades antes.",
    });
  });

  it("área vazia desativa e registra", async () => {
    const r = await desativarArea(deps, gestor, "a1");
    expect(r).toMatchObject({ ok: true });
    expect(trilha.entradas.map((e) => e.acao)).toEqual(["AREA_DESATIVADA"]);
  });

  it("unidade com vínculo ativo: CONFLITO pedindo para encerrar os vínculos", async () => {
    const criada = await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });
    if (!criada.ok) throw new Error(criada.mensagem);
    fake.estado.vinculosAtivosNaUnidade.set(criada.data.id, 2);

    const r = await desativarUnidade(deps, gestor, criada.data.id);

    expect(r).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem: "Encerre os vínculos de B-304 antes de desativar.",
    });
  });

  it("unidade sem vínculo desativa", async () => {
    const criada = await criarUnidade(deps, gestor, {
      bloco: "B",
      numero: "304",
      tipo: "apartamento",
    });
    if (!criada.ok) throw new Error(criada.mensagem);

    const r = await desativarUnidade(deps, gestor, criada.data.id);

    expect(r).toMatchObject({ ok: true });
    expect(fake.estado.atualizacoesDeUnidade.at(-1)).toMatchObject({
      patch: { ativo: false },
    });
  });
});
