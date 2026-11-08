import { describe, expect, it } from "vitest";

import { lerSituacao, PRAZOS_PADRAO } from "./situacao";

const agora = new Date("2026-11-10T10:00:00-03:00");
const ha = (dias: number, horas = 0) =>
  new Date(agora.getTime() - (dias * 24 + horas) * 3_600_000);

describe("lerSituacao (derivada, nunca persistida)", () => {
  it("rótulo vem do estado", () => {
    expect(
      lerSituacao(
        { estado: "IDENTIFICADA", ocorridoEm: ha(0, 1) },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    ).toBe("recebida");
    expect(
      lerSituacao(
        { estado: "AGUARDANDO_NOTIFICACAO", ocorridoEm: ha(0, 1) },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    ).toBe("aguardando");
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(0, 1) },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    ).toBe("pronta");
    expect(
      lerSituacao(
        { estado: "FALHA_NOTIFICACAO", ocorridoEm: ha(0, 1) },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    ).toBe("falha");
    expect(
      lerSituacao(
        { estado: "NAO_IDENTIFICADA", ocorridoEm: ha(0, 1) },
        agora,
        PRAZOS_PADRAO,
      ).badge,
    ).toBe("naoIdent");
  });

  it("7 dias completos = atrasada; 6 dias e 23 h ainda não", () => {
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(7) },
        agora,
        PRAZOS_PADRAO,
      ),
    ).toMatchObject({ atrasada: true, badge: "urgente" });
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(6, 23) },
        agora,
        PRAZOS_PADRAO,
      ),
    ).toMatchObject({ atrasada: false, badge: "pronta" });
  });

  it("falha e não identificada mantêm o próprio rótulo mesmo atrasadas (a ação é outra)", () => {
    expect(
      lerSituacao(
        { estado: "FALHA_NOTIFICACAO", ocorridoEm: ha(9) },
        agora,
        PRAZOS_PADRAO,
      ),
    ).toMatchObject({ atrasada: true, badge: "falha" });
    expect(
      lerSituacao(
        { estado: "NAO_IDENTIFICADA", ocorridoEm: ha(9) },
        agora,
        PRAZOS_PADRAO,
      ),
    ).toMatchObject({ atrasada: true, badge: "naoIdent" });
  });

  it("prazo desligado não marca", () => {
    const p = { ...PRAZOS_PADRAO, atrasoLigado: false };
    expect(
      lerSituacao({ estado: "NOTIFICADA", ocorridoEm: ha(20) }, agora, p)
        .atrasada,
    ).toBe(false);
  });

  it("terminal nunca fica atrasada nem pede devolução", () => {
    expect(
      lerSituacao(
        { estado: "RETIRADA", ocorridoEm: ha(40) },
        agora,
        PRAZOS_PADRAO,
      ),
    ).toMatchObject({
      atrasada: false,
      sugerirDevolucao: false,
      badge: "retirada",
    });
  });

  it("30 dias sugere devolução ao gestor (nada é devolvido sozinho)", () => {
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(30) },
        agora,
        PRAZOS_PADRAO,
      ).sugerirDevolucao,
    ).toBe(true);
  });

  it("lembrete único: devido a partir de 2 dias para NOTIFICADA, e só se ainda não foi", () => {
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(2) },
        agora,
        PRAZOS_PADRAO,
      ).lembreteDevido,
    ).toBe(true);
    expect(
      lerSituacao(
        { estado: "NOTIFICADA", ocorridoEm: ha(2), lembreteEnviado: true },
        agora,
        PRAZOS_PADRAO,
      ).lembreteDevido,
    ).toBe(false);
    expect(
      lerSituacao(
        { estado: "FALHA_NOTIFICACAO", ocorridoEm: ha(3) },
        agora,
        PRAZOS_PADRAO,
      ).lembreteDevido,
    ).toBe(false);
  });

  it("relógio do aparelho adiantado não gera idade negativa", () => {
    expect(
      lerSituacao(
        {
          estado: "IDENTIFICADA",
          ocorridoEm: new Date(agora.getTime() + 60_000),
        },
        agora,
        PRAZOS_PADRAO,
      ).diasNaPortaria,
    ).toBe(0);
  });
});
