import { describe, expect, it } from "vitest";

import { normalizarEmail, normalizarWhatsapp } from "./contato";

describe("normalizarWhatsapp (E.164)", () => {
  it.each([
    ["11987654321", "+5511987654321"],
    ["(11) 98765-4321", "+5511987654321"],
    ["+55 11 98765 4321", "+5511987654321"],
    ["5511987654321", "+5511987654321"],
    ["+1 415 555 0100", "+14155550100"],
  ])("%s → %s", (entrada, saida) => {
    expect(normalizarWhatsapp(entrada)).toEqual({ ok: true, data: saida });
  });

  it.each(["1187654321", "119876", "", "abc"])(
    "recusa %j com a mensagem do celular",
    (entrada) => {
      expect(normalizarWhatsapp(entrada)).toMatchObject({
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: "WhatsApp precisa ser celular com DDD (11 dígitos).",
      });
    },
  );
});

describe("normalizarEmail", () => {
  it("tira espaço e põe em minúsculas", () => {
    expect(normalizarEmail("  Ana@Exemplo.COM ")).toEqual({
      ok: true,
      data: "ana@exemplo.com",
    });
  });

  it.each(["ana", "ana@", "@x.com", "ana@x"])("recusa %j", (entrada) => {
    expect(normalizarEmail(entrada)).toMatchObject({
      ok: false,
      mensagem: "Informe um e-mail válido.",
    });
  });
});
