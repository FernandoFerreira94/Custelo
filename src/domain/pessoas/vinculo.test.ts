import { describe, expect, it } from "vitest";

import type { Contato } from "./contato";
import {
  cascataDeAviso,
  encerrarVinculo,
  podeReceberAviso,
  type Vinculo,
} from "./vinculo";

const AGORA = new Date("2026-11-05T12:00:00Z");

const vinculo = (extra: Partial<Vinculo> = {}): Vinculo => ({
  id: "v1",
  pessoaId: "p1",
  unidadeId: "u1",
  tipo: "morador",
  status: "ativo",
  recebeAviso: true,
  ordemAviso: 0,
  vigenciaFim: null,
  ...extra,
});

const contato = (extra: Partial<Contato> = {}): Contato => ({
  id: "c1",
  canal: "whatsapp",
  valor: "+5511987654321",
  status: "valido",
  ordem: 0,
  consentimentoEm: new Date("2026-10-01T00:00:00Z"),
  ...extra,
});

describe("podeReceberAviso", () => {
  it("vínculo ativo + recebe_aviso + contato com consentimento: sim", () => {
    expect(podeReceberAviso(vinculo(), contato(), AGORA)).toBe(true);
    expect(
      podeReceberAviso(
        vinculo(),
        contato({ status: "precisa_confirmacao" }),
        AGORA,
      ),
    ).toBe(true);
  });

  it("vínculo encerrado: não", () => {
    expect(
      podeReceberAviso(
        vinculo({ status: "encerrado", vigenciaFim: AGORA }),
        contato(),
        AGORA,
      ),
    ).toBe(false);
  });

  it("autorizado retira, não recebe aviso", () => {
    expect(
      podeReceberAviso(vinculo({ tipo: "autorizado" }), contato(), AGORA),
    ).toBe(false);
  });

  it("sem consentimento: não", () => {
    expect(
      podeReceberAviso(vinculo(), contato({ consentimentoEm: null }), AGORA),
    ).toBe(false);
  });

  it("contato em falha: não", () => {
    expect(
      podeReceberAviso(vinculo(), contato({ status: "falha" }), AGORA),
    ).toBe(false);
  });

  it("recebe_aviso desligado: não", () => {
    expect(
      podeReceberAviso(vinculo({ recebeAviso: false }), contato(), AGORA),
    ).toBe(false);
  });

  it("autorizado com validade no passado: não", () => {
    expect(
      podeReceberAviso(
        vinculo({
          tipo: "autorizado",
          vigenciaFim: new Date("2026-11-01T00:00:00Z"),
        }),
        contato(),
        AGORA,
      ),
    ).toBe(false);
  });
});

describe("encerrarVinculo", () => {
  it("encerra, grava o fim e desliga o aviso", () => {
    const r = encerrarVinculo(vinculo(), { motivo: "mudou", agora: AGORA });
    expect(r).toEqual({
      ok: true,
      data: expect.objectContaining({
        status: "encerrado",
        vigenciaFim: AGORA,
        recebeAviso: false,
        motivoEncerramento: "mudou",
      }),
    });
  });

  it("já encerrado: falha", () => {
    expect(
      encerrarVinculo(vinculo({ status: "encerrado", vigenciaFim: AGORA }), {
        motivo: "x",
        agora: AGORA,
      }),
    ).toMatchObject({
      ok: false,
      mensagem: "Este vínculo já está encerrado.",
    });
  });

  it("motivo vazio: falha com o texto do domínio", () => {
    expect(
      encerrarVinculo(vinculo(), { motivo: "  ", agora: AGORA }),
    ).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem:
        "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
    });
  });
});

describe("cascataDeAviso", () => {
  it("ordena por ordem_aviso e depois pela ordem do contato, só quem pode receber", () => {
    const vinculos = [
      vinculo({ id: "v2", pessoaId: "p2", ordemAviso: 2 }),
      vinculo({ id: "v1", pessoaId: "p1", ordemAviso: 1 }),
      vinculo({ id: "v3", pessoaId: "p3", ordemAviso: 3 }),
    ];
    const porPessoa = {
      p1: [contato({ id: "c1b", ordem: 2 }), contato({ id: "c1a", ordem: 1 })],
      p2: [contato({ id: "c2", consentimentoEm: null })],
      p3: [contato({ id: "c3" })],
    };

    const cascata = cascataDeAviso(vinculos, porPessoa, AGORA);

    expect(cascata.map((e) => e.contato.id)).toEqual(["c1a", "c1b", "c3"]);
  });
});
