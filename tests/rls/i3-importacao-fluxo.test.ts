import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { confirmarImportacao } from "@/application/importacao/confirmar";
import { decidirDuplicado } from "@/application/importacao/decidir-duplicado";
import { desfazerImportacao } from "@/application/importacao/desfazer";
import { iniciarImportacao } from "@/application/importacao/iniciar";
import type { DepsDeImportacao } from "@/application/importacao/ports";
import type { Cadastro } from "@/domain/importacao/colunas";
import { importacaoRepo } from "@/infrastructure/importacao/importacao-repo";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";
import { criarAuditoriaFake } from "@/tests/fakes/auditoria";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
} from "./helpers";

import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

const ctxDe = (f: typeof FIXTURE_ORG_A): Contexto => ({
  orgId: f.orgId,
  empreendimentoId: f.empreendimentoId,
  usuarioId: f.userId,
  papel: "empreendimento_gestor",
  escopoDeOrg: false,
});
const ctxA = ctxDe(FIXTURE_ORG_A);
const ctxB = ctxDe(FIXTURE_ORG_B);

const trilha = criarAuditoriaFake();
const deps: DepsDeImportacao = {
  repo: importacaoRepo,
  auditoria: trilha.auditoria,
  agora: () => new Date(),
};

async function enviar(
  ctx: Contexto,
  cadastro: Cadastro,
  cabecalhos: string[],
  linhas: string[][],
) {
  const r = await iniciarImportacao(deps, ctx, {
    cadastro,
    arquivoNome: `${cadastro}.csv`,
    tabela: { cabecalhos, linhas },
  });
  if (!r.ok) throw new Error(r.mensagem);
  return r.data;
}

const confirmar = (ctx: Contexto, loteId: string) =>
  confirmarImportacao(deps, ctx, { loteId, confirmou: true });

describe("importação contra o banco real (fluxo completo)", () => {
  setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  // Os dados persistem entre execuções: blocos e nomes únicos por teste.
  let n = Date.now() % 1_000_000;
  const unico = () => `${n++}`;

  const cabUnidades = ["Tipo", "Bloco/Torre/Quadra", "Número"];
  const cabMoradores = [
    "Bloco/Torre/Quadra",
    "Unidade",
    "Nome completo",
    "Papel",
    "WhatsApp",
  ];

  it("unidades: só as linhas boas entram, o erro fica de fora, e tudo é conferido antes", async () => {
    const bloco = `IMP${unico()}`;
    const lote = await enviar(ctxA, "unidades", cabUnidades, [
      ["Apartamento", bloco, "101"],
      ["Apartamento", bloco, "102"],
      ["Garagem", bloco, "103"],
    ]);

    expect(lote).toMatchObject({ prontas: 2, erros: 1 });
    // Conferir não grava: as unidades ainda não existem.
    expect(
      (await estruturaRepo.listarUnidades(ctxA, { busca: bloco })).itens,
    ).toHaveLength(0);

    const r = await confirmar(ctxA, lote.loteId);

    expect(r).toMatchObject({ ok: true, data: { criados: 2 } });
    const unidades = await estruturaRepo.listarUnidades(ctxA, { busca: bloco });
    expect(unidades.itens.map((u) => u.codigo).sort()).toEqual([
      `${bloco}-101`,
      `${bloco}-102`,
    ]);
    // O bloco virou uma área da árvore.
    expect(
      (await estruturaRepo.arvore(ctxA)).some((a) => a.nome === bloco),
    ).toBe(true);
  });

  it("confirmar duas vezes não grava de novo", async () => {
    const bloco = `IMP${unico()}`;
    const lote = await enviar(ctxA, "unidades", cabUnidades, [
      ["Apartamento", bloco, "201"],
    ]);

    await confirmar(ctxA, lote.loteId);
    const segunda = await confirmar(ctxA, lote.loteId);

    expect(segunda).toMatchObject({
      ok: true,
      mensagem: "Este lote já foi importado.",
    });
    expect(
      (await estruturaRepo.listarUnidades(ctxA, { busca: bloco })).itens,
    ).toHaveLength(1);
  });

  it("moradores: entram sem consentimento; duplicado só entra com decisão; desfazer inativa", async () => {
    const bloco = `IMP${unico()}`;
    const unidades = await enviar(ctxA, "unidades", cabUnidades, [
      ["Apartamento", bloco, "301"],
    ]);
    await confirmar(ctxA, unidades.loteId);
    const nome = `Morador Importado ${unico()}`;
    const celular = `119${unico().padStart(8, "0")}`;
    const linha = [bloco, "301", nome, "Titular", celular];

    const lote = await enviar(ctxA, "moradores", cabMoradores, [linha]);
    expect(lote).toMatchObject({ prontas: 1, erros: 0 });
    const r = await confirmar(ctxA, lote.loteId);
    expect(r).toMatchObject({ ok: true, data: { criados: 1 } });

    const lista = await pessoasRepo.listarPessoas(ctxA, { busca: nome });
    expect(lista.itens).toHaveLength(1);
    const pessoa = await pessoasRepo.pessoaPorId(ctxA, lista.itens[0]!.id);
    expect(pessoa?.contatos).toHaveLength(1);
    // O consentimento nunca vem da planilha.
    expect(pessoa?.contatos[0]?.consentimentoEm).toBeNull();
    expect(pessoa?.vinculos[0]).toMatchObject({
      tipo: "titular",
      status: "ativo",
    });

    // A mesma pessoa de novo: duplicada, e só entra se o gestor decidir.
    const repetido = await enviar(ctxA, "moradores", cabMoradores, [linha]);
    expect(repetido).toMatchObject({ duplicadas: 1, prontas: 0 });
    const [dup] = await importacaoRepo.listarLinhas(ctxA, repetido.loteId);
    await decidirDuplicado(deps, ctxA, {
      loteId: repetido.loteId,
      linhaId: dup!.id,
      decisao: "atualizar",
    });
    const atualizado = await confirmar(ctxA, repetido.loteId);
    expect(atualizado).toMatchObject({
      ok: true,
      data: { atualizados: 1, criados: 0 },
    });
    expect(
      (await pessoasRepo.listarPessoas(ctxA, { busca: nome })).itens,
    ).toHaveLength(1);

    // Desfazer: inativa e encerra, sem apagar.
    const desfeito = await desfazerImportacao(deps, ctxA, {
      loteId: lote.loteId,
    });
    expect(desfeito).toMatchObject({ ok: true, data: { desfeitos: 1 } });
    const depois = await pessoasRepo.pessoaPorId(ctxA, lista.itens[0]!.id);
    expect(depois?.vinculos[0]).toMatchObject({
      status: "encerrado",
      recebeAviso: false,
    });
  });

  it("moradores de unidade que não existe ficam com erro e nada entra", async () => {
    const lote = await enviar(ctxA, "moradores", cabMoradores, [
      ["ZZZ", "999", "Ninguém", "Titular", ""],
    ]);

    expect(lote).toMatchObject({ prontas: 0, erros: 1 });
    const r = await confirmar(ctxA, lote.loteId);
    expect(r).toMatchObject({ ok: true, data: { criados: 0 } });
  });

  it("autorizados: entram em nome de um morador ativo da unidade", async () => {
    const bloco = `IMP${unico()}`;
    await confirmar(
      ctxA,
      (
        await enviar(ctxA, "unidades", cabUnidades, [
          ["Apartamento", bloco, "401"],
        ])
      ).loteId,
    );
    const morador = `Morador Autoriza ${unico()}`;
    await confirmar(
      ctxA,
      (
        await enviar(ctxA, "moradores", cabMoradores, [
          [bloco, "401", morador, "Titular", ""],
        ])
      ).loteId,
    );

    const lote = await enviar(
      ctxA,
      "autorizados",
      [
        "Bloco/Torre/Quadra",
        "Unidade",
        "Em nome de",
        "Nome do autorizado",
        "Relação",
      ],
      [[bloco, "401", morador, "Diarista Importada", "Diarista"]],
    );
    expect(lote).toMatchObject({ prontas: 1 });
    await confirmar(ctxA, lote.loteId);

    const dono = (await pessoasRepo.listarPessoas(ctxA, { busca: morador }))
      .itens[0]!;
    const autorizados = await pessoasRepo.autorizadosDe(ctxA, dono.id);
    expect(autorizados.map((a) => a.nome)).toEqual(["Diarista Importada"]);
  });

  it("áreas comuns entram como unidade do tipo área comum", async () => {
    const nome = `Academia ${unico()}`;
    const lote = await enviar(ctxA, "areas_comuns", ["Nome"], [[nome]]);
    await confirmar(ctxA, lote.loteId);

    const areas = await estruturaRepo.areasComuns(ctxA);
    expect(areas.find((a) => a.codigo === nome)).toMatchObject({
      avisarResponsavel: false,
    });
  });

  it("lote deixado pela metade aparece para retomar até ser cancelado", async () => {
    const bloco = `IMP${unico()}`;
    const lote = await enviar(ctxA, "unidades", cabUnidades, [
      ["Apartamento", bloco, "601"],
    ]);

    const abertos = await importacaoRepo.lotesEmConferencia(ctxA);
    expect(abertos.map((l) => l.id)).toContain(lote.loteId);
    expect(
      (await importacaoRepo.lotesEmConferencia(ctxB)).map((l) => l.id),
    ).not.toContain(lote.loteId);

    await importacaoRepo.cancelarLote(ctxA, lote.loteId);

    expect(
      (await importacaoRepo.lotesEmConferencia(ctxA)).map((l) => l.id),
    ).not.toContain(lote.loteId);
    expect(await confirmar(ctxA, lote.loteId)).toMatchObject({
      ok: false,
      codigo: "CONFLITO",
    });
  });

  it("lote de outro empreendimento não é visto nem confirmado", async () => {
    const bloco = `IMP${unico()}`;
    const lote = await enviar(ctxA, "unidades", cabUnidades, [
      ["Apartamento", bloco, "501"],
    ]);

    expect(await importacaoRepo.buscarLote(ctxB, lote.loteId)).toBeNull();
    expect(await confirmar(ctxB, lote.loteId)).toMatchObject({
      ok: false,
      codigo: "NAO_ENCONTRADO",
    });
  });
});
