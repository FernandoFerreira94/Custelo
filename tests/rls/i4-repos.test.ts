import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { linhaDoTempo } from "@/application/custodia/consultas";
import { moverEncomenda } from "@/application/custodia/mover";
import { anexarEvento } from "@/application/custodia/registrar-evento";
import { codigoCurto } from "@/domain/custodia/codigo";
import { PRAZOS_PADRAO } from "@/domain/custodia/situacao";
import {
  consultasCustodiaRepo,
  custodiaRepo,
  locaisRepo,
} from "@/infrastructure/custodia/custodia-repo";
import { MSG_CUSTODIA } from "@/lib/mensagens";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
} from "./helpers";

type F = typeof FIXTURE_ORG_A;
const ctxDe = (
  f: F,
  papel: Contexto["papel"] = "empreendimento_gestor",
): Contexto => ({
  orgId: f.orgId,
  empreendimentoId: f.empreendimentoId,
  usuarioId: f.userId,
  papel,
  escopoDeOrg: false,
});
const ctxA = ctxDe(FIXTURE_ORG_A);
const ctxB = ctxDe(FIXTURE_ORG_B);

// Os dados persistem entre execuções: cada teste cria a própria unidade.
let n = Date.now() % 1_000_000;
const unico = (p: string) => `${p}${n++}`;

describe("repositório da custódia contra o banco real (RLS)", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  async function cenario(f: F = FIXTURE_ORG_A) {
    const unidadeId = uuidv7();
    const pontoId = uuidv7();
    const c2 = uuidv7();
    const vg = uuidv7();
    const codigo = unico("T-");
    await sql`insert into unidades (id, org_id, empreendimento_id, codigo)
      values (${unidadeId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${codigo})`;
    await sql`insert into pontos_recebimento (id, org_id, empreendimento_id, nome)
      values (${pontoId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'Portaria principal')`;
    await sql`insert into locais_guarda (id, org_id, empreendimento_id, ponto_id, codigo, capacidade)
      values (${c2}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pontoId}::uuid, 'C2', 24),
             (${vg}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pontoId}::uuid, 'VG', 1)`;
    return { unidadeId, pontoId, c2, vg, codigo };
  }

  /** Recebe e identifica na mesma transação, como a I5 fará. */
  async function receber(
    ctx: Contexto,
    unidadeId: string,
    pontoId: string,
    ocorridoEm = new Date(),
  ) {
    const id = uuidv7();
    const r = await custodiaRepo.naTransacao(ctx, async (tx) => {
      await tx.criarEncomenda({
        id,
        codigoCurto: codigoCurto(id),
        pontoId,
        origem: "online",
        ocorridoEm,
        recebidoPor: ctx.usuarioId,
      });
      const base = {
        origem: "online" as const,
        superficie: "ops" as const,
        ocorridoEm,
      };
      const rec = await anexarEvento(tx, ctx, id, {
        ...base,
        id: uuidv7(),
        tipo: "RECEBIMENTO_REGISTRADO",
        dados: { com_foto: true },
      });
      if (!rec.ok) return rec;
      return anexarEvento(tx, ctx, id, {
        ...base,
        id: uuidv7(),
        tipo: "IDENTIFICACAO_CONFIRMADA",
        dados: { para: { unidade_id: unidadeId } },
      });
    });
    if (!r.ok) throw new Error(JSON.stringify(r));
    return id;
  }

  const mover = (ctx: Contexto, id: string, local: string) =>
    moverEncomenda(
      ctx,
      id,
      {
        eventoId: uuidv7(),
        paraLocalId: local,
        origem: "online",
        superficie: "ops",
        ocorridoEm: new Date(),
      },
      { repo: custodiaRepo },
    );

  it("recebe, guarda e move; a fila, o detalhe e a linha do tempo refletem tudo", async () => {
    const c = await cenario();
    const id = await receber(ctxA, c.unidadeId, c.pontoId);

    expect(await mover(ctxA, id, c.c2)).toMatchObject({
      ok: true,
      mensagem: MSG_CUSTODIA.guardada("C2"),
    });
    expect(await mover(ctxA, id, c.vg)).toMatchObject({
      ok: true,
      mensagem: MSG_CUSTODIA.movida("C2", "VG"),
    });

    const fila = await consultasCustodiaRepo.filaPorUnidade(
      ctxA,
      { busca: c.codigo.toLowerCase() },
      PRAZOS_PADRAO,
    );
    expect(fila.itens).toEqual([
      expect.objectContaining({
        unidadeCodigo: c.codigo,
        localMaisAntiga: "VG",
        encomendas: 1,
        idMaisAntiga: id,
      }),
    ]);

    const d = await consultasCustodiaRepo.detalhe(ctxA, id);
    expect(d).toMatchObject({
      estado: "IDENTIFICADA",
      versao: 4,
      unidade: { codigo: c.codigo },
      local: { codigo: "VG" },
      ponto: { nome: "Portaria principal" },
    });

    const linha = await linhaDoTempo(ctxA, id, { repo: consultasCustodiaRepo });
    expect(linha.ok && linha.data.map((i) => i.titulo)).toEqual([
      "Movida de C2 para VG",
      "Guardada na C2",
      "Recebida com foto da etiqueta",
    ]);
  });

  it("local cheio guarda assim mesmo; desativar prateleira com encomenda é recusado", async () => {
    const c = await cenario();
    const a = await receber(ctxA, c.unidadeId, c.pontoId);
    const b = await receber(ctxA, c.unidadeId, c.pontoId);
    await mover(ctxA, a, c.vg);
    expect(await mover(ctxA, b, c.vg)).toMatchObject({
      ok: true,
      mensagem: MSG_CUSTODIA.localCheio("VG", 2, 1),
    });

    const r = await locaisRepo.aplicarPrateleiras(ctxA, c.pontoId, {
      criar: [{ codigo: "Z1", capacidade: null, volumeGrande: false }],
      atualizar: [],
      desativar: [c.vg],
    });
    expect(r).toEqual({ comEncomenda: 2 });
    const locais = await locaisRepo.locaisDoPonto(ctxA, c.pontoId);
    expect(locais?.map((l) => [l.codigo, l.usado])).toEqual([
      ["C2", 0],
      ["VG", 2],
    ]);
  });

  it("sequência divergente vira CONFLITO e nada fica gravado", async () => {
    const c = await cenario();
    const id = await receber(ctxA, c.unidadeId, c.pontoId);
    const r = await custodiaRepo.naTransacao(ctxA, async (tx) => {
      await tx.inserirEvento({
        id: uuidv7(),
        tipo: "ETIQUETA_IMPRESSA",
        dados: {},
        encomendaId: id,
        sequencia: 9,
        estadoAnterior: "IDENTIFICADA",
        estadoNovo: "IDENTIFICADA",
        atorTipo: "usuario",
        atorUsuarioId: ctxA.usuarioId,
        origem: "online",
        superficie: "ops",
        ocorridoEm: new Date(),
      });
      return { ok: true, data: null };
    });
    expect(r).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem: MSG_CUSTODIA.foraDeOrdem,
    });
    expect((await consultasCustodiaRepo.detalhe(ctxA, id))?.versao).toBe(2);
  });

  it("filtro prazo traz só as atrasadas e a lista pagina por cursor sem repetir", async () => {
    const c = await cenario();
    const antiga = await receber(
      ctxA,
      c.unidadeId,
      c.pontoId,
      new Date(Date.now() - 10 * 86_400_000),
    );
    for (let i = 0; i < 51; i++) await receber(ctxA, c.unidadeId, c.pontoId);

    const atrasadas = await consultasCustodiaRepo.listaEncomendas(
      ctxA,
      { unidadeId: c.unidadeId, filtro: "prazo" },
      PRAZOS_PADRAO,
    );
    expect(atrasadas.itens.map((i) => i.id)).toEqual([antiga]);

    const p1 = await consultasCustodiaRepo.listaEncomendas(
      ctxA,
      { unidadeId: c.unidadeId },
      PRAZOS_PADRAO,
    );
    expect(p1.itens).toHaveLength(50);
    expect(p1.proximo).not.toBeNull();
    const p2 = await consultasCustodiaRepo.listaEncomendas(
      ctxA,
      { unidadeId: c.unidadeId, cursor: p1.proximo! },
      PRAZOS_PADRAO,
    );
    expect(p2.proximo).toBeNull();
    const todos = [...p1.itens, ...p2.itens].map((i) => i.id);
    expect(new Set(todos).size).toBe(52);
    expect(todos.at(-1)).toBe(antiga);
  });

  it("outro empreendimento não vê nem move a encomenda", async () => {
    const c = await cenario();
    const id = await receber(ctxA, c.unidadeId, c.pontoId);
    expect(await consultasCustodiaRepo.detalhe(ctxB, id)).toBeNull();
    expect(
      (await consultasCustodiaRepo.eventos(ctxB, id)).eventos,
    ).toHaveLength(0);
    expect(await mover(ctxB, id, c.c2)).toMatchObject({
      ok: false,
      codigo: "NAO_ENCONTRADO",
    });
    expect(await locaisRepo.locaisDoPonto(ctxB, c.pontoId)).toBeNull();
  });
});
