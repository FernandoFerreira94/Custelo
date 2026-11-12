import { describe, expect, it } from "vitest";

import { montarCodigo, normalizarApelidos, normalizarCodigo } from "./unidade";

describe("normalizarCodigo (igual à coluna gerada do banco)", () => {
  it.each([
    ["B-304", "B304"],
    ["b 304", "B304"],
    ["BL B AP 304", "BLBAP304"],
    ["Casa 23", "CASA23"],
    ["  l-04 ", "L04"],
    ["01", "01"],
  ])("%s → %s", (entrada, saida) =>
    expect(normalizarCodigo(entrada)).toBe(saida),
  );
});

describe("montarCodigo", () => {
  it("bloco + número com hífen", () =>
    expect(
      montarCodigo({ bloco: "B", numero: "304", tipo: "apartamento" }),
    ).toBe("B-304"));
  it("sem bloco usa só o número", () =>
    expect(montarCodigo({ numero: "304", tipo: "apartamento" })).toBe("304"));
  it("casa sem bloco ganha o prefixo", () =>
    expect(montarCodigo({ numero: "23", tipo: "casa" })).toBe("Casa 23"));
  it("bloco com nome longo mantém o nome", () =>
    expect(
      montarCodigo({ bloco: "Torre 2", numero: "81", tipo: "apartamento" }),
    ).toBe("Torre 2-81"));
  it("mantém zero à esquerda", () =>
    expect(montarCodigo({ bloco: "A", numero: "01", tipo: "sala" })).toBe(
      "A-01",
    ));
});

describe("normalizarApelidos", () => {
  it("tira vazio, repetido e o próprio código", () => {
    expect(
      normalizarApelidos(
        ["B 304", " ", "b304", "BL B AP 304", "B-304"],
        "B-304",
      ),
    ).toEqual(["BL B AP 304"]);
  });
});
