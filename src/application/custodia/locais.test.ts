import { beforeEach, describe, expect, it } from "vitest";

import type { EntradaAuditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import { salvarPrateleiras } from "@/application/custodia/locais";
import type {
  LocaisRepo,
  LocalGuarda,
  PlanoPrateleiras,
} from "@/application/custodia/ports";
import { MSG_CUSTODIA } from "@/lib/mensagens";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const gestor = ctx("empreendimento_gestor");

const ID_A1 = "0196f000-0000-7000-8000-0000000000a1";
const ID_B2 = "0196f000-0000-7000-8000-0000000000b2";

function repoFake(atuais: LocalGuarda[] | null) {
  const aplicados: PlanoPrateleiras[] = [];
  const auditoria: EntradaAuditoria[] = [];
  let bloqueioNaTransacao = 0;
  const repo: LocaisRepo = {
    locaisDoPonto: async () => atuais,
    aplicarPrateleiras: async (_ctx, _ponto, plano) => {
      if (bloqueioNaTransacao) return { comEncomenda: bloqueioNaTransacao };
      aplicados.push(plano);
      return { comEncomenda: 0 };
    },
  };
  return {
    deps: {
      repo,
      auditoria: {
        registrar: async (_c: unknown, e: EntradaAuditoria) =>
          void auditoria.push(e),
      },
    },
    aplicados,
    auditoria,
    bloquear: (n: number) => (bloqueioNaTransacao = n),
  };
}

const local = (id: string, codigo: string, usado = 0): LocalGuarda => ({
  id,
  codigo,
  pontoId: "p1",
  capacidade: 24,
  volumeGrande: false,
  ativo: true,
  usado,
});

describe("salvarPrateleiras", () => {
  let f: ReturnType<typeof repoFake>;
  beforeEach(() => {
    f = repoFake([local(ID_A1, "A1"), local(ID_B2, "B2", 3)]);
  });

  it("cria, atualiza e desativa numa chamada e audita", async () => {
    f = repoFake([local(ID_A1, "A1"), local(ID_B2, "B2")]);
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [
        { id: ID_A1, codigo: "A1", capacidade: 24, volumeGrande: false },
        { codigo: "VG", capacidade: 8, volumeGrande: true },
      ],
      f.deps,
    );
    expect(r).toMatchObject({ ok: true, data: { ativas: 2 } });
    expect(f.aplicados[0]).toEqual({
      criar: [{ codigo: "VG", capacidade: 8, volumeGrande: true }],
      atualizar: [
        { id: ID_A1, codigo: "A1", capacidade: 24, volumeGrande: false },
      ],
      desativar: [ID_B2],
    });
    expect(f.auditoria[0]).toMatchObject({ acao: "PRATELEIRAS_SALVAS" });
  });

  it("código repetido no ponto (sem diferenciar maiúscula) é DUPLICADO", async () => {
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [
        { id: ID_A1, codigo: "A1", capacidade: 24, volumeGrande: false },
        { id: ID_B2, codigo: "B2", capacidade: 24, volumeGrande: false },
        { codigo: " a1 ", capacidade: null, volumeGrande: false },
      ],
      f.deps,
    );
    expect(r).toMatchObject({ ok: false, codigo: "DUPLICADO" });
    expect(f.aplicados).toHaveLength(0);
  });

  it("remover prateleira com 3 encomendas ativas é CONFLITO e nada muda", async () => {
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [{ id: ID_A1, codigo: "A1", capacidade: 24, volumeGrande: false }],
      f.deps,
    );
    expect(r).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem: MSG_CUSTODIA.prateleiraComEncomenda(3),
    });
    expect(f.aplicados).toHaveLength(0);
  });

  it("encomenda que chegou durante o salvar também bloqueia (reconferido na transação)", async () => {
    f = repoFake([local(ID_A1, "A1"), local(ID_B2, "B2")]);
    f.bloquear(1);
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [{ id: ID_A1, codigo: "A1", capacidade: 24, volumeGrande: false }],
      f.deps,
    );
    expect(r).toMatchObject({
      ok: false,
      mensagem: MSG_CUSTODIA.prateleiraComEncomenda(1),
    });
    expect(f.auditoria).toHaveLength(0);
  });

  it("recepcionista não edita prateleiras", async () => {
    const r = await salvarPrateleiras(ctx("recepcionista"), "p1", [], f.deps);
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });

  it("ponto de outro empreendimento é NAO_ENCONTRADO", async () => {
    f = repoFake(null);
    const r = await salvarPrateleiras(gestor, "p1", [], f.deps);
    expect(r).toMatchObject({ ok: false, codigo: "NAO_ENCONTRADO" });
  });

  it("id que não é do ponto é CONFLITO", async () => {
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [
        {
          id: "0196f000-0000-7000-8000-0000000000ff",
          codigo: "Z9",
          capacidade: null,
          volumeGrande: false,
        },
      ],
      f.deps,
    );
    expect(r).toMatchObject({ ok: false, codigo: "CONFLITO" });
  });

  it("entrada inválida aponta o campo", async () => {
    const r = await salvarPrateleiras(
      gestor,
      "p1",
      [{ codigo: "", capacidade: 0, volumeGrande: false }],
      f.deps,
    );
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      campos: { "0.codigo": "Dê um nome à prateleira." },
    });
  });
});
