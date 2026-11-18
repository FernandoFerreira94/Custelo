import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { moverEncomenda } from "@/application/custodia/mover";
import { MSG, MSG_CUSTODIA } from "@/lib/mensagens";
import { criarCustodiaRepoFake } from "@/tests/fakes/custodia-repo";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const recepcionista = ctx("recepcionista");

let n = 0;
const pedido = (paraLocalId: string, extra = {}) => ({
  eventoId: `ev-${++n}`,
  paraLocalId,
  motivoRapido: "Prateleira cheia",
  origem: "online" as const,
  superficie: "ops" as const,
  ocorridoEm: new Date("2026-11-18T12:00:00Z"),
  ...extra,
});

describe("moverEncomenda", () => {
  let fake: ReturnType<typeof criarCustodiaRepoFake>;
  const deps = () => ({ repo: fake.repo });

  beforeEach(() => {
    fake = criarCustodiaRepoFake();
    fake.semearLocal({ id: "c2", codigo: "C2", capacidade: 24 });
    fake.semearLocal({ id: "vg", codigo: "VG", capacidade: 8 });
    fake.semearLocal({ id: "x9", codigo: "X9", ativo: false });
    fake.semear({
      id: "enc-1",
      estado: "NOTIFICADA",
      versao: 4,
      unidadeId: "u-b304",
      localGuardaId: "c2",
      pontoId: "p1",
    });
  });

  it("move de C2 para VG e grava de/para, ponto e motivo rápido", async () => {
    const r = await moverEncomenda(
      recepcionista,
      "enc-1",
      pedido("vg"),
      deps(),
    );

    expect(r).toEqual({
      ok: true,
      data: { estado: "NOTIFICADA", sequencia: 5, repetido: false },
      mensagem: MSG_CUSTODIA.movida("C2", "VG"),
    });
    expect(fake.eventos[0]).toMatchObject({
      tipo: "LOCALIZACAO_ALTERADA",
      dados: {
        de: { local_guarda_id: "c2", ponto_id: "p1" },
        para: { local_guarda_id: "vg", ponto_id: "p1" },
        motivo_rapido: "Prateleira cheia",
      },
    });
    expect(fake.encomendas[0]?.localGuardaId).toBe("vg");
  });

  it("primeira guarda (sem local antes) diz só onde ficou", async () => {
    fake.semear({ id: "enc-2", estado: "IDENTIFICADA", versao: 2 });
    const r = await moverEncomenda(
      recepcionista,
      "enc-2",
      pedido("c2", { motivoRapido: undefined }),
      deps(),
    );
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_CUSTODIA.guardada("C2"),
    });
    expect(fake.eventos[0]?.dados).toEqual({
      de: { local_guarda_id: null, ponto_id: null },
      para: { local_guarda_id: "c2", ponto_id: "p1" },
    });
  });

  it("para o mesmo local é entrada inválida", async () => {
    const r = await moverEncomenda(
      recepcionista,
      "enc-1",
      pedido("c2"),
      deps(),
    );
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem: MSG_CUSTODIA.mesmoLocal("C2"),
    });
    expect(fake.eventos).toHaveLength(0);
  });

  it("local desativado ou de outro empreendimento é entrada inválida", async () => {
    for (const local of ["x9", "nao-existe"]) {
      const r = await moverEncomenda(
        recepcionista,
        "enc-1",
        pedido(local),
        deps(),
      );
      expect(r).toMatchObject({
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: MSG_CUSTODIA.localInativo,
      });
    }
  });

  it("local cheio guarda assim mesmo e avisa", async () => {
    for (let i = 0; i < 8; i++)
      fake.semear({
        id: `cheia-${i}`,
        estado: "NOTIFICADA",
        versao: 4,
        localGuardaId: "vg",
      });
    const r = await moverEncomenda(
      recepcionista,
      "enc-1",
      pedido("vg"),
      deps(),
    );
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_CUSTODIA.localCheio("VG", 9, 8),
    });
    expect(fake.eventos).toHaveLength(1);
  });

  it("encomenda retirada não se move", async () => {
    fake.semear({ id: "enc-3", estado: "RETIRADA", versao: 6 });
    const r = await moverEncomenda(
      recepcionista,
      "enc-3",
      pedido("vg"),
      deps(),
    );
    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("auditor não move", async () => {
    const r = await moverEncomenda(
      ctx("auditor"),
      "enc-1",
      pedido("vg"),
      deps(),
    );
    expect(r).toEqual({
      ok: false,
      codigo: "SEM_PERMISSAO",
      mensagem: MSG.semPermissao,
    });
  });

  it("repetir o mesmo evento devolve o resultado gravado, sem mover de novo", async () => {
    const p = pedido("vg");
    await moverEncomenda(recepcionista, "enc-1", p, deps());
    const r = await moverEncomenda(recepcionista, "enc-1", p, deps());
    expect(r).toMatchObject({ ok: true, data: { repetido: true } });
    expect(fake.eventos).toHaveLength(1);
  });

  it("encomenda de outro empreendimento não aparece", async () => {
    fake.semear({
      id: "enc-fora",
      estado: "NOTIFICADA",
      versao: 4,
      empreendimentoId: "e2",
    });
    const r = await moverEncomenda(
      recepcionista,
      "enc-fora",
      pedido("vg"),
      deps(),
    );
    expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
  });
});
