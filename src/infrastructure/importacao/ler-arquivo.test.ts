import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { colunasDe } from "@/domain/importacao/colunas";
import {
  lerArquivo,
  tabelaDeCelulas,
} from "@/infrastructure/importacao/ler-arquivo";

const modelo = (nome: string) =>
  new Uint8Array(
    readFileSync(path.join(process.cwd(), "public/modelos", nome)),
  );

describe("lerArquivo com os modelos oficiais", () => {
  it("o CSV do modelo de unidades lê o cabeçalho e as linhas de exemplo", async () => {
    const r = await lerArquivo("csv", modelo("modelo-unidades.csv"));

    expect(r).toMatchObject({ ok: true });
    if (!r.ok) return;
    expect(r.data.cabecalhos).toEqual(
      colunasDe("unidades").map((c) => c.cabecalho),
    );
    expect(r.data.linhas.length).toBeGreaterThanOrEqual(3);
    expect(r.data.linhas[0]?.[2]).toBe("112");
  });

  it.each([
    "unidades",
    "moradores",
    "lojistas",
    "autorizados",
    "areas-comuns",
    "funcionarios",
  ])(
    "o XLSX em branco de %s abre na aba 'Preencha aqui' e pede para preencher",
    async (cadastro) => {
      const r = await lerArquivo("xlsx", modelo(`modelo-${cadastro}.xlsx`));

      // O modelo vem só com o cabeçalho: abrir deu certo, falta dado.
      expect(r).toEqual({
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: "O arquivo não tem nenhuma linha de dados.",
      });
    },
  );

  it("as células do Excel viram texto: número, data e vazio", () => {
    const r = tabelaDeCelulas([
      ["Número", "Vale até", "Obs"],
      [112, new Date(Date.UTC(2026, 11, 31)), null],
      ["01", "", ""],
    ]);

    expect(r).toEqual({
      ok: true,
      data: {
        cabecalhos: ["Número", "Vale até", "Obs"],
        linhas: [
          ["112", "31/12/2026", ""],
          ["01", "", ""],
        ],
      },
    });
  });

  it("arquivo que não é planilha vira mensagem, não exceção", async () => {
    const r = await lerArquivo(
      "xlsx",
      new TextEncoder().encode("isto não é xlsx"),
    );
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem:
        "Não conseguimos abrir esta planilha. Baixe o modelo e tente de novo.",
    });
  });

  it("CSV salvo em Windows-1252 também lê (acento não quebra)", async () => {
    // "Número;Tipo\n1;Apartamento" com 'ú' em 0xFA (Windows-1252), não UTF-8.
    const bytes = Uint8Array.from([
      0x4e, 0xfa, 0x6d, 0x65, 0x72, 0x6f, 0x3b, 0x54, 0x69, 0x70, 0x6f, 0x0a,
      0x31, 0x3b, 0x41, 0x0a,
    ]);
    const r = await lerArquivo("csv", bytes);
    expect(r).toMatchObject({
      ok: true,
      data: { cabecalhos: ["Número", "Tipo"] },
    });
  });
});
