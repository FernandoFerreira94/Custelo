import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import type { NovoEvento } from "@/application/custodia/ports";
import {
  anexarEvento,
  registrarEvento,
} from "@/application/custodia/registrar-evento";
import { MSG_CORRECAO, MSG_CUSTODIA } from "@/lib/mensagens";
import { criarCustodiaRepoFake } from "@/tests/fakes/custodia-repo";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const gestor = ctx("empreendimento_gestor");
const recepcionista = ctx("recepcionista");

let n = 0;
const evento = (tipo: NovoEvento["tipo"], extra: Partial<NovoEvento> = {}) =>
  ({
    id: `ev-${++n}`,
    tipo,
    origem: "online",
    superficie: "ops",
    ocorridoEm: new Date("2026-11-18T12:00:00Z"),
    ...extra,
  }) satisfies NovoEvento;

const MOTIVO = "Cadastro feito na unidade errada";

describe("registrarEvento", () => {
  let fake: ReturnType<typeof criarCustodiaRepoFake>;
  beforeEach(() => {
    fake = criarCustodiaRepoFake();
    fake.semear({ id: "enc-1", estado: "IDENTIFICADA", versao: 2 });
    fake.semear({ id: "enc-2", estado: "NAO_IDENTIFICADA", versao: 2 });
    fake.semear({
      id: "enc-outro",
      estado: "IDENTIFICADA",
      versao: 2,
      empreendimentoId: "e2",
    });
  });
  const deps = () => ({ repo: fake.repo });

  it("recusa quem não tem a permissão do evento", async () => {
    const r = await registrarEvento(
      recepcionista,
      "enc-1",
      evento("ASSOCIACAO_CORRIGIDA", { motivo: MOTIVO }),
      deps(),
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
    expect(fake.eventos).toHaveLength(0);
  });

  it("recusa evento que só o sistema emite", async () => {
    const r = await registrarEvento(
      gestor,
      "enc-1",
      evento("NOTIFICACAO_ENVIADA"),
      deps(),
    );
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("exige motivo de 10 caracteres em evento elevado", async () => {
    const r = await registrarEvento(
      gestor,
      "enc-1",
      evento("REGISTRO_CANCELADO", { motivo: "erro" }),
      deps(),
    );
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { motivo: MSG_CORRECAO.motivoObrigatorio },
    });
  });

  it("grava a próxima sequência e mantém o estado na troca de local", async () => {
    const r = await registrarEvento(
      recepcionista,
      "enc-1",
      evento("LOCALIZACAO_ALTERADA", {
        dados: {
          de: { local_guarda_id: null },
          para: { local_guarda_id: "l1" },
        },
      }),
      deps(),
    );
    expect(r).toEqual({
      ok: true,
      data: { estado: "IDENTIFICADA", sequencia: 3, repetido: false },
    });
    expect(fake.eventos[0]).toMatchObject({
      sequencia: 3,
      estadoAnterior: "IDENTIFICADA",
      estadoNovo: "IDENTIFICADA",
      atorTipo: "usuario",
      atorUsuarioId: "u1",
    });
    expect(fake.encomendas[0]).toMatchObject({
      versao: 3,
      localGuardaId: "l1",
    });
  });

  it("é idempotente pelo id do evento", async () => {
    const ev = evento("LOCALIZACAO_ALTERADA");
    await registrarEvento(recepcionista, "enc-1", ev, deps());
    const r = await registrarEvento(recepcionista, "enc-1", ev, deps());
    expect(r).toEqual({
      ok: true,
      data: { estado: "IDENTIFICADA", sequencia: 3, repetido: true },
    });
    expect(fake.eventos).toHaveLength(1);
  });

  it("recusa id já usado em outra encomenda", async () => {
    const ev = evento("LOCALIZACAO_ALTERADA");
    await registrarEvento(recepcionista, "enc-1", ev, deps());
    const r = await registrarEvento(recepcionista, "enc-2", ev, deps());
    expect(r).toMatchObject({
      ok: false,
      codigo: "CONFLITO",
      mensagem: MSG_CUSTODIA.idRepetido,
    });
  });

  it.each(["enc-outro", "nao-existe"])(
    "trata %s como não encontrada",
    async (id) => {
      const r = await registrarEvento(
        recepcionista,
        id,
        evento("LOCALIZACAO_ALTERADA"),
        deps(),
      );
      expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
    },
  );

  it("recusa transição proibida", async () => {
    const r = await registrarEvento(
      recepcionista,
      "enc-2",
      evento("RETIRADA_REGISTRADA"),
      deps(),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.codigo).toBe("CONFLITO");
      expect(r.mensagem).toContain("sem destino identificado");
    }
    expect(fake.eventos).toHaveLength(0);
  });

  it("audita evento elevado na mesma transação", async () => {
    const dados = { de: { unidade_id: "u-a" }, para: { unidade_id: "u-b" } };
    const r = await registrarEvento(
      gestor,
      "enc-1",
      evento("REGISTRO_CANCELADO", { motivo: MOTIVO, dados }),
      deps(),
    );
    expect(r).toMatchObject({ ok: true, data: { estado: "CANCELADA" } });
    expect(fake.eventos).toHaveLength(1);
    expect(fake.auditoria).toEqual([
      {
        acao: "REGISTRO_CANCELADO",
        alvoTipo: "encomenda",
        alvoId: "enc-1",
        antes: dados.de,
        depois: dados.para,
        motivo: MOTIVO,
        origem: "ops",
      },
    ]);
  });

  it("desfaz o evento se a auditoria falhar", async () => {
    const repo = fake.repo;
    const quebrado = {
      naTransacao: ((c, fn) =>
        repo.naTransacao(c, (tx) =>
          fn({
            ...tx,
            auditar: async () => {
              throw new Error("audit_log indisponível");
            },
          }),
        )) as typeof repo.naTransacao,
    };
    await expect(
      registrarEvento(
        gestor,
        "enc-1",
        evento("REGISTRO_CANCELADO", { motivo: MOTIVO }),
        { repo: quebrado },
      ),
    ).rejects.toThrow("audit_log indisponível");
    expect(fake.eventos).toHaveLength(0);
    expect(fake.encomendas[0]).toMatchObject({
      estado: "IDENTIFICADA",
      versao: 2,
    });
  });

  it("anexa vários eventos em sequência na mesma transação", async () => {
    const r = await fake.repo.naTransacao(recepcionista, async (tx) => {
      await tx.criarEncomenda({
        id: "enc-nova",
        codigoCurto: "A1B2",
        pontoId: null,
        origem: "online",
        ocorridoEm: new Date(),
        recebidoPor: "u1",
      });
      const seqs: number[] = [];
      for (const tipo of [
        "RECEBIMENTO_REGISTRADO",
        "IDENTIFICACAO_CONFIRMADA",
        "LOCALIZACAO_ALTERADA",
      ] as const) {
        const g = await anexarEvento(
          tx,
          recepcionista,
          "enc-nova",
          evento(tipo),
        );
        if (!g.ok) return g;
        seqs.push(g.data.sequencia);
      }
      return { ok: true as const, data: seqs };
    });
    expect(r).toEqual({ ok: true, data: [1, 2, 3] });
    expect(fake.eventos.map((e) => e.estadoNovo)).toEqual([
      "RECEBIDA",
      "IDENTIFICADA",
      "IDENTIFICADA",
    ]);
  });
});
