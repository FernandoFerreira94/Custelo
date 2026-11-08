import { describe, expect, it } from "vitest";

import {
  ESTADOS,
  ehTerminal,
  transicionar,
  TIPOS_EVENTO,
  type Estado,
  type TipoEvento,
} from "./estados";

const ok = (
  atual: Estado | null,
  tipo: TipoEvento,
  esperado: Estado,
  lembrete = false,
) =>
  expect(transicionar(atual, tipo, { lembrete })).toEqual({
    ok: true,
    data: esperado,
  });
const nao = (atual: Estado | null, tipo: TipoEvento, lembrete = false) =>
  expect(transicionar(atual, tipo, { lembrete })).toMatchObject({
    ok: false,
    codigo: "CONFLITO",
  });

describe("máquina de estados da encomenda", () => {
  it("nasce só por RECEBIMENTO_REGISTRADO", () => {
    ok(null, "RECEBIMENTO_REGISTRADO", "RECEBIDA");
    nao(null, "IDENTIFICACAO_CONFIRMADA");
    nao("RECEBIDA", "RECEBIMENTO_REGISTRADO");
  });

  it("identificação: de RECEBIDA ou NAO_IDENTIFICADA para IDENTIFICADA", () => {
    ok("RECEBIDA", "IDENTIFICACAO_CONFIRMADA", "IDENTIFICADA");
    ok("NAO_IDENTIFICADA", "IDENTIFICACAO_CONFIRMADA", "IDENTIFICADA");
    ok("RECEBIDA", "MARCADA_NAO_IDENTIFICADA", "NAO_IDENTIFICADA");
    nao("IDENTIFICADA", "MARCADA_NAO_IDENTIFICADA");
  });

  it("aviso: agendar, enviar, falhar, tentar de novo", () => {
    ok("IDENTIFICADA", "NOTIFICACAO_AGENDADA", "AGUARDANDO_NOTIFICACAO");
    ok("AGUARDANDO_NOTIFICACAO", "NOTIFICACAO_ENVIADA", "NOTIFICADA");
    ok("AGUARDANDO_NOTIFICACAO", "NOTIFICACAO_FALHOU", "FALHA_NOTIFICACAO");
    ok("NOTIFICADA", "NOTIFICACAO_FALHOU", "FALHA_NOTIFICACAO"); // provedor: "sent" e depois "failed"
    ok("FALHA_NOTIFICACAO", "NOTIFICACAO_AGENDADA", "AGUARDANDO_NOTIFICACAO"); // próximo contato
    ok("FALHA_NOTIFICACAO", "NOTIFICACAO_ENVIADA", "NOTIFICADA"); // status atrasado do provedor
    nao("NAO_IDENTIFICADA", "NOTIFICACAO_AGENDADA");
  });

  it("lembrete não muda o estado de quem já foi avisado e falha de lembrete não vira 'falha no aviso'", () => {
    ok("NOTIFICADA", "NOTIFICACAO_AGENDADA", "NOTIFICADA", true);
    ok("NOTIFICADA", "NOTIFICACAO_ENVIADA", "NOTIFICADA", true);
    ok("NOTIFICADA", "NOTIFICACAO_FALHOU", "NOTIFICADA", true);
    nao("IDENTIFICADA", "NOTIFICACAO_AGENDADA", true);
  });

  it("local, etiqueta e cancelamento de aviso não mudam o estado", () => {
    for (const e of [
      "RECEBIDA",
      "IDENTIFICADA",
      "NAO_IDENTIFICADA",
      "NOTIFICADA",
      "FALHA_NOTIFICACAO",
    ] as const) {
      ok(e, "LOCALIZACAO_ALTERADA", e);
      ok(e, "ETIQUETA_IMPRESSA", e);
      ok(e, "NOTIFICACAO_CANCELADA_POR_CORRECAO", e);
    }
  });

  it("correção de associação volta para IDENTIFICADA (o novo destino é avisado de novo)", () => {
    for (const e of [
      "IDENTIFICADA",
      "AGUARDANDO_NOTIFICACAO",
      "NOTIFICADA",
      "FALHA_NOTIFICACAO",
    ] as const) {
      ok(e, "ASSOCIACAO_CORRIGIDA", "IDENTIFICADA");
    }
    nao("NAO_IDENTIFICADA", "ASSOCIACAO_CORRIGIDA"); // aí é IDENTIFICACAO_CONFIRMADA
  });

  it("retirada só de encomenda identificada; devolução e cancelamento de qualquer ativa", () => {
    ok("NOTIFICADA", "RETIRADA_REGISTRADA", "RETIRADA");
    ok("IDENTIFICADA", "RETIRADA_REGISTRADA", "RETIRADA"); // morador chegou antes do aviso
    ok("FALHA_NOTIFICACAO", "RETIRADA_REGISTRADA", "RETIRADA");
    nao("NAO_IDENTIFICADA", "RETIRADA_REGISTRADA");
    ok("NAO_IDENTIFICADA", "DEVOLUCAO_REGISTRADA", "DEVOLVIDA");
    ok("NOTIFICADA", "REGISTRO_CANCELADO", "CANCELADA");
  });

  it("estado terminal nunca volta a ativo; só a correção do próprio terminal é aceita", () => {
    ok("RETIRADA", "RETIRADA_CORRIGIDA", "RETIRADA");
    ok("DEVOLVIDA", "DEVOLUCAO_CORRIGIDA", "DEVOLVIDA");
    for (const terminal of ["RETIRADA", "DEVOLVIDA", "CANCELADA"] as const) {
      for (const tipo of TIPOS_EVENTO) {
        const r = transicionar(terminal, tipo);
        if (r.ok) expect(r.data).toBe(terminal);
      }
    }
    nao("CANCELADA", "IDENTIFICACAO_CONFIRMADA");
    nao("RETIRADA", "LOCALIZACAO_ALTERADA");
    nao("NOTIFICADA", "RETIRADA_CORRIGIDA");
  });

  it("nenhuma combinação leva de terminal para ativo (varredura completa)", () => {
    for (const atual of ESTADOS.filter(ehTerminal)) {
      for (const tipo of TIPOS_EVENTO) {
        for (const lembrete of [false, true]) {
          const r = transicionar(atual, tipo, { lembrete });
          if (r.ok) expect(ehTerminal(r.data)).toBe(true);
        }
      }
    }
  });

  it("a mensagem de recusa diz o estado atual", () => {
    expect(transicionar("RETIRADA", "LOCALIZACAO_ALTERADA")).toMatchObject({
      ok: false,
      mensagem: expect.stringContaining("entregue"),
    });
  });
});
