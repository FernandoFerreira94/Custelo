import { describe, expect, it } from "vitest";

import {
  agruparLinhaDoTempo,
  descreverEvento,
  type EventoDaLinha,
  type Rotulos,
} from "@/application/custodia/linha-do-tempo";

const R: Rotulos = {
  unidades: { b304: "B-304", b034: "B-034" },
  locais: { c2: "C2", vg: "VG" },
  pontos: { p1: "Portaria principal" },
};

let seq = 0;
const T = new Date("2026-11-18T14:42:00Z"); // 11:42 em São Paulo
const ev = (
  tipo: EventoDaLinha["tipo"],
  extra: Partial<EventoDaLinha> = {},
): EventoDaLinha => ({
  id: `ev-${++seq}`,
  sequencia: seq,
  tipo,
  dados: {},
  motivo: null,
  origem: "online",
  atorTipo: "usuario",
  atorNome: "Carlos",
  ocorridoEm: T,
  registradoEm: new Date(T.getTime() + seq * 1000),
  ...extra,
});

describe("descreverEvento", () => {
  it.each([
    [
      ev("MARCADA_NAO_IDENTIFICADA"),
      "Sem destino identificado",
      "Aguarda identificação · Carlos",
    ],
    [
      ev("IDENTIFICACAO_CONFIRMADA", {
        atorNome: "Rita",
        dados: { para: { unidade_id: "b304" } },
      }),
      "Destino identificado: B-304",
      "Por Rita",
    ],
    [
      ev("LOCALIZACAO_ALTERADA", {
        dados: { para: { local_guarda_id: "c2", ponto_id: "p1" } },
      }),
      "Guardada na C2",
      "Carlos · Portaria principal",
    ],
    [
      ev("LOCALIZACAO_ALTERADA", {
        dados: {
          de: { local_guarda_id: "c2" },
          para: { local_guarda_id: "vg" },
          motivo_rapido: "Prateleira cheia",
        },
      }),
      "Movida de C2 para VG",
      "Carlos · Prateleira cheia",
    ],
    [
      ev("ETIQUETA_IMPRESSA", { dados: { impressao: 2 } }),
      "Etiqueta impressa",
      "2ª impressão · Carlos",
    ],
    [
      ev("ASSOCIACAO_CORRIGIDA", {
        atorNome: "Rita",
        motivo: "Bloco trocado no cadastro",
        dados: { de: { unidade_id: "b304" }, para: { unidade_id: "b034" } },
      }),
      "Unidade corrigida de B-304 para B-034",
      "Motivo: Bloco trocado no cadastro · Rita",
    ],
    [
      ev("REGISTRO_CANCELADO", {
        atorNome: "Rita",
        motivo: "Registro em duplicidade",
      }),
      "Registro cancelado",
      "Motivo: Registro em duplicidade · Rita",
    ],
    [
      ev("MARCADA_NAO_IDENTIFICADA", { origem: "offline" }),
      "Sem destino identificado",
      "Aguarda identificação · Carlos · registrado sem internet às 11:42",
    ],
    [
      ev("NOTIFICACAO_ENVIADA", { atorTipo: "sistema", atorNome: null }),
      "Aviso enviado",
      "Automático",
    ],
  ])("%#: %s", (e, titulo, descricao) => {
    expect(descreverEvento(e, R)).toEqual({ titulo, descricao });
  });
});

describe("agruparLinhaDoTempo", () => {
  it("recebimento com foto e identificação na mesma transação vira um item só", () => {
    const rec = ev("RECEBIMENTO_REGISTRADO", { dados: { com_foto: true } });
    const ident = ev("IDENTIFICACAO_CONFIRMADA", {
      registradoEm: rec.registradoEm,
      dados: { para: { unidade_id: "b304" } },
    });
    const itens = agruparLinhaDoTempo([rec, ident], R);
    expect(itens).toEqual([
      expect.objectContaining({
        titulo: "Recebida com foto da etiqueta",
        descricao: "Sugestão lida: B-304 · confirmada por Carlos",
      }),
    ]);
  });

  it("recebimento sem foto com identificação", () => {
    const rec = ev("RECEBIMENTO_REGISTRADO");
    const ident = ev("IDENTIFICACAO_CONFIRMADA", {
      registradoEm: rec.registradoEm,
      dados: { para: { unidade_id: "b304" } },
    });
    expect(agruparLinhaDoTempo([rec, ident], R)[0]).toMatchObject({
      titulo: "Recebida sem foto",
      descricao: "Registrada à mão por Carlos",
    });
  });

  it("ordem decrescente e a correção põe selo no item que afirmou a unidade antiga", () => {
    const rec = ev("RECEBIMENTO_REGISTRADO");
    const ident = ev("IDENTIFICACAO_CONFIRMADA", {
      registradoEm: rec.registradoEm,
      dados: { para: { unidade_id: "b304" } },
    });
    const guarda = ev("LOCALIZACAO_ALTERADA", {
      dados: { para: { local_guarda_id: "c2", ponto_id: "p1" } },
    });
    const corr = ev("ASSOCIACAO_CORRIGIDA", {
      motivo: "Bloco trocado no cadastro",
      dados: { de: { unidade_id: "b304" }, para: { unidade_id: "b034" } },
    });
    const itens = agruparLinhaDoTempo([guarda, corr, ident, rec], R);
    expect(itens.map((i) => [i.titulo, i.corrigido])).toEqual([
      ["Unidade corrigida de B-304 para B-034", false],
      ["Guardada na C2", false],
      ["Recebida sem foto", true],
    ]);
  });
});
