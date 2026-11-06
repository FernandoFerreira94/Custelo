import { describe, expect, it } from "vitest";

import { relatorioDeErros } from "./relatorio-de-erros";

describe("relatorioDeErros", () => {
  const cabecalhos = ["Tipo", "Número"];

  it("monta o CSV com BOM, separador ; e os motivos juntos", () => {
    const csv = relatorioDeErros(cabecalhos, [
      {
        numeroLinha: 3,
        situacao: "erro",
        problemas: ["Tipo precisa ser Apartamento.", "Informe o número."],
        entrada: { Tipo: "Garagem", Número: "" },
      },
    ]);

    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv.split("\r\n")).toEqual([
      "﻿Linha;Situação;Problemas;Tipo;Número",
      "3;erro;Tipo precisa ser Apartamento. | Informe o número.;Garagem;",
      "",
    ]);
  });

  it("neutraliza fórmula vinda da planilha em qualquer coluna", () => {
    const csv = relatorioDeErros(cabecalhos, [
      {
        numeroLinha: 1,
        situacao: "erro",
        problemas: ['=HYPERLINK("http://x")'],
        entrada: { Tipo: "=1+1", Número: "@soma" },
      },
    ]);

    const linha = csv.split("\r\n")[1]!;
    expect(linha).toContain("'=1+1");
    expect(linha).toContain("'@soma");
    expect(linha).toContain("'=HYPERLINK");
    expect(linha).not.toMatch(/(^|;)=/);
  });

  it("protege aspas, ponto e vírgula e quebra de linha dentro da célula", () => {
    const csv = relatorioDeErros(
      ["Obs"],
      [
        {
          numeroLinha: 2,
          situacao: "erro",
          problemas: [],
          entrada: { Obs: 'disse "oi"; saiu' },
        },
      ],
    );

    expect(csv.split("\r\n")[1]).toBe('2;erro;;"disse ""oi""; saiu"');
  });
});
