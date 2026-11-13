import { describe, expect, it } from "vitest";

import {
  ALFABETO_DO_CODIGO,
  gerarCodigoLocal,
  normalizarCodigoDigitado,
} from "@/domain/aparelho/codigo-local";
import {
  type FuncionarioDoAparelho,
  lembrar,
  remover,
  vigentes,
} from "@/domain/aparelho/lista-local";

describe("código do local", () => {
  it("alfabeto não tem 0, O, 1 nem I", () => {
    expect(ALFABETO_DO_CODIGO).not.toMatch(/[0O1I]/);
    expect(ALFABETO_DO_CODIGO).toHaveLength(32);
  });

  it("gera 6 caracteres do alfabeto", () => {
    let i = 0;
    const codigo = gerarCodigoLocal((n) => i++ % n);
    expect(codigo).toBe("ABCDEF");
    expect(normalizarCodigoDigitado(codigo)).toBe(codigo);
  });

  it("aceita minúscula, espaço e hífen; recusa formato errado", () => {
    expect(normalizarCodigoDigitado("abc 234")).toBe("ABC234");
    expect(normalizarCodigoDigitado("ABC-234")).toBe("ABC234");
    expect(normalizarCodigoDigitado("ABC10O")).toBeNull();
    expect(normalizarCodigoDigitado("ABC23")).toBeNull();
    expect(normalizarCodigoDigitado("ABC2345")).toBeNull();
  });
});

describe("lista de funcionários do aparelho", () => {
  const DIA = 24 * 60 * 60 * 1000;
  const agora = 100 * DIA;
  const ana: FuncionarioDoAparelho = {
    usuarioId: "u1",
    nome: "Ana",
    emailMascarado: "a***@selva.com",
    ultimoUsoEm: agora - 2 * DIA,
  };
  const bia = {
    ...ana,
    usuarioId: "u2",
    nome: "Bia",
    ultimoUsoEm: agora - 31 * DIA,
  };

  it("expira quem ficou 30 dias sem entrar", () => {
    expect(vigentes([ana, bia], agora).map((f) => f.nome)).toEqual(["Ana"]);
  });

  it("lembrar atualiza sem duplicar e põe no topo", () => {
    const lista = lembrar([ana, bia], { ...bia, ultimoUsoEm: agora });
    expect(lista.map((f) => f.nome)).toEqual(["Bia", "Ana"]);
    expect(vigentes(lista, agora).map((f) => f.nome)).toEqual(["Bia", "Ana"]);
  });

  it("remover deste aparelho tira só aquela pessoa", () => {
    expect(remover([ana, bia], "u1").map((f) => f.nome)).toEqual(["Bia"]);
  });
});
