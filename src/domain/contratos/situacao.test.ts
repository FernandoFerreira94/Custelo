import { describe, expect, it } from "vitest";

import {
  efeitoDoEncerramento,
  ESTADO_CONTRATO,
  papeisPermitidosValidos,
  podeTransicionar,
  STATUS_CONTRATO,
} from "@/domain/contratos/situacao";

describe("papeisPermitidosValidos", () => {
  it("aceita recepcionista e auditor", () => {
    expect(papeisPermitidosValidos(["recepcionista", "auditor"])).toBe(true);
  });

  it("recusa papel de gestão, lista vazia e repetição", () => {
    expect(papeisPermitidosValidos(["empreendimento_gestor"])).toBe(false);
    expect(papeisPermitidosValidos(["recepcionista", "org_admin"])).toBe(false);
    expect(papeisPermitidosValidos([])).toBe(false);
    expect(papeisPermitidosValidos(["auditor", "auditor"])).toBe(false);
  });
});

describe("podeTransicionar", () => {
  it("segue proposto > ativo > suspenso/encerrado", () => {
    expect(podeTransicionar("proposto", "ativo")).toBe(true);
    expect(podeTransicionar("ativo", "suspenso")).toBe(true);
    expect(podeTransicionar("ativo", "encerrado")).toBe(true);
    expect(podeTransicionar("suspenso", "ativo")).toBe(true);
  });

  it("proposto não pula para suspenso", () => {
    expect(podeTransicionar("proposto", "suspenso")).toBe(false);
  });

  it("encerrado não reabre", () => {
    for (const para of STATUS_CONTRATO) {
      expect(podeTransicionar("encerrado", para)).toBe(false);
    }
  });
});

describe("mensagens de estado", () => {
  it("todo status tem rótulo e explicação", () => {
    for (const status of STATUS_CONTRATO) {
      expect(ESTADO_CONTRATO[status].rotulo).not.toBe("");
      expect(ESTADO_CONTRATO[status].explicacao).not.toBe("");
    }
  });

  it("encerramento diz o efeito com o nome da prestadora", () => {
    expect(efeitoDoEncerramento("Selva")).toBe(
      "Os funcionários da Selva saem deste condomínio agora. O histórico fica com o condomínio.",
    );
  });
});
