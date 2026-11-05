import { describe, expect, it } from "vitest";

import { escaparCelulaExportada, lerCsv } from "./ler-csv";

describe("lerCsv", () => {
  it("separador ; (padrão BR) detectado pelo cabeçalho", () => {
    const r = lerCsv("Nome;Papel\nAna;Titular\nBruno;Morador\n");
    expect(r).toEqual({
      ok: true,
      data: {
        cabecalhos: ["Nome", "Papel"],
        linhas: [
          ["Ana", "Titular"],
          ["Bruno", "Morador"],
        ],
      },
    });
  });

  it("separador , também é detectado pelo cabeçalho", () => {
    const r = lerCsv("Nome,Papel\nAna,Titular\n");
    expect(r).toMatchObject({
      ok: true,
      data: { cabecalhos: ["Nome", "Papel"], linhas: [["Ana", "Titular"]] },
    });
  });

  it("remove o BOM do UTF-8 e aceita quebra de linha do Windows", () => {
    const r = lerCsv("﻿Nome;Papel\r\nAna;Titular\r\n");
    expect(r).toMatchObject({
      ok: true,
      data: { cabecalhos: ["Nome", "Papel"], linhas: [["Ana", "Titular"]] },
    });
  });

  it("aspas protegem o separador e a quebra de linha, e aspas duplas viram uma", () => {
    const r = lerCsv('Nome;Obs\n"Silva; Ana";"disse ""oi""\ne saiu"\n');
    expect(r).toMatchObject({
      ok: true,
      data: { linhas: [["Silva; Ana", 'disse "oi"\ne saiu']] },
    });
  });

  it("ignora linha vazia, inclusive as que só têm separadores", () => {
    const r = lerCsv("Nome;Papel\n\nAna;Titular\n;\n   \n");
    expect(r).toMatchObject({
      ok: true,
      data: { linhas: [["Ana", "Titular"]] },
    });
  });

  it("mantém zero à esquerda (tudo é texto)", () => {
    const r = lerCsv("Número\n01\n007\n");
    expect(r).toMatchObject({ ok: true, data: { linhas: [["01"], ["007"]] } });
  });

  it("mais de 5.000 linhas é recusado com a contagem e o limite", () => {
    const corpo = Array.from({ length: 7200 }, (_, i) => `A;${i}`).join("\n");
    expect(lerCsv(`Bloco;Numero\n${corpo}`)).toEqual({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem:
        "O arquivo tem 7.200 linhas. O limite é 5.000; divida em partes.",
    });
  });

  it("arquivo vazio ou só com cabeçalho explica o que falta", () => {
    expect(lerCsv("")).toMatchObject({ ok: false });
    expect(lerCsv("Nome;Papel\n")).toMatchObject({
      ok: false,
      mensagem: "O arquivo não tem nenhuma linha de dados.",
    });
  });
});

describe("escaparCelulaExportada (injeção de fórmula no relatório de erros)", () => {
  it.each([
    ["=SOMA(A1)", "'=SOMA(A1)"],
    ["+55119", "'+55119"],
    ["-1", "'-1"],
    ["@cmd", "'@cmd"],
    ["Ana", "Ana"],
    ["", ""],
  ])("%s → %s", (entrada, esperado) => {
    expect(escaparCelulaExportada(entrada)).toBe(esperado);
  });
});
