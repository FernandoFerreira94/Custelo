import { describe, expect, it } from "vitest";

import {
  cadastroDoSlug,
  chaveDoCabecalho,
  colunasDe,
  mapearCabecalho,
  slugDoCadastro,
} from "./colunas";

describe("colunasDe", () => {
  it("lê as colunas do modelo oficial (fonte única: docs/product/importacao-colunas.json)", () => {
    const unidades = colunasDe("unidades");
    expect(unidades.map((c) => c.cabecalho)).toEqual([
      "Tipo",
      "Bloco/Torre/Quadra",
      "Número",
      "Andar",
      "Como aparece na etiqueta",
    ]);
    expect(
      unidades.filter((c) => c.obrigatoria).map((c) => c.cabecalho),
    ).toEqual(["Tipo", "Número"]);
  });

  it("áreas comuns usa a chave do banco, não a do arquivo", () => {
    expect(colunasDe("areas_comuns")[0]?.cabecalho).toBe("Nome");
  });
});

describe("chaveDoCabecalho", () => {
  it("ignora acento, caixa, espaço e pontuação", () => {
    expect(chaveDoCabecalho("Número")).toBe(chaveDoCabecalho("numero"));
    expect(chaveDoCabecalho("Bloco/Torre/Quadra")).toBe(
      chaveDoCabecalho("bloco torre quadra"),
    );
  });
});

describe("mapearCabecalho", () => {
  it("aceita o cabeçalho do modelo ignorando acento e caixa", () => {
    const r = mapearCabecalho("unidades", ["tipo", "Numero", "ANDAR"]);
    expect(r).toMatchObject({
      ok: true,
      data: { indices: { Tipo: 0, Número: 1, Andar: 2 }, ignoradas: [] },
    });
  });

  it("coluna obrigatória faltando falha nomeando a coluna", () => {
    expect(mapearCabecalho("unidades", ["Tipo", "Andar"])).toEqual({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem:
        'Falta a coluna "Número" na planilha. Baixe o modelo para conferir.',
    });
  });

  it("várias faltando: nomeia todas", () => {
    const r = mapearCabecalho("moradores", ["Papel"]);
    expect(r).toMatchObject({
      ok: false,
      mensagem:
        'Faltam as colunas "Unidade" e "Nome completo" na planilha. Baixe o modelo para conferir.',
    });
  });

  it("coluna a mais é ignorada e devolvida para avisar", () => {
    const r = mapearCabecalho("unidades", ["Tipo", "Número", "Cor da porta"]);
    expect(r).toMatchObject({
      ok: true,
      data: { ignoradas: ["Cor da porta"] },
    });
  });

  it("coluna opcional ausente não atrapalha", () => {
    const r = mapearCabecalho("moradores", [
      "Unidade",
      "Nome completo",
      "Papel",
    ]);
    expect(r).toMatchObject({ ok: true });
  });
});

describe("slug do cadastro", () => {
  it("vai e volta, inclusive o de áreas comuns", () => {
    expect(slugDoCadastro("areas_comuns")).toBe("areas-comuns");
    expect(cadastroDoSlug("areas-comuns")).toBe("areas_comuns");
    expect(cadastroDoSlug("moradores")).toBe("moradores");
    expect(cadastroDoSlug("qualquer-coisa")).toBeNull();
  });
});
