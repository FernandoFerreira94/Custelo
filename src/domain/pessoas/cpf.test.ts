import { describe, expect, it } from "vitest";

import { formatarCpf, mascararCpf, validarCpf } from "./cpf";

describe("validarCpf", () => {
  it("aceita CPF válido e devolve só os dígitos", () => {
    expect(validarCpf("529.982.247-25")).toEqual({
      ok: true,
      data: "52998224725",
    });
  });

  it.each(["111.111.111-11", "000.000.000-00"])(
    "recusa sequência repetida %s",
    (cpf) => {
      expect(validarCpf(cpf)).toMatchObject({
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: "CPF inválido. Confira os números.",
      });
    },
  );

  it("recusa dígito verificador errado e tamanho errado", () => {
    expect(validarCpf("529.982.247-24")).toMatchObject({ ok: false });
    expect(validarCpf("5299822472")).toMatchObject({ ok: false });
    expect(validarCpf("")).toMatchObject({ ok: false });
  });
});

describe("mascararCpf", () => {
  it("esconde o começo e o fim", () => {
    expect(mascararCpf("52998224725")).toBe("***.982.247-**");
  });
});

describe("formatarCpf", () => {
  it("põe pontos e traço", () => {
    expect(formatarCpf("52998224725")).toBe("529.982.247-25");
  });
});
