import { falha, type Resultado, sucesso } from "@/lib/resultado";

export const LIMITE_DE_LINHAS = 5000;

export type TabelaLida = { cabecalhos: string[]; linhas: string[][] };

const milhar = new Intl.NumberFormat("pt-BR");

/** `;` é o padrão BR do Excel; `,` vale quando o cabeçalho não tem `;`. */
function detectarSeparador(primeiraLinha: string): ";" | "," {
  const pontoEVirgula = (primeiraLinha.match(/;/g) ?? []).length;
  const virgulas = (primeiraLinha.match(/,/g) ?? []).length;
  return pontoEVirgula >= virgulas && pontoEVirgula > 0
    ? ";"
    : virgulas > 0
      ? ","
      : ";";
}

/** Divide o texto em linhas de células respeitando aspas (separador e quebra dentro de aspas). */
function dividir(texto: string, separador: string): string[][] {
  const linhas: string[][] = [];
  let celula = "";
  let linha: string[] = [];
  let dentroDeAspas = false;

  const fecharCelula = () => {
    linha.push(celula);
    celula = "";
  };
  const fecharLinha = () => {
    fecharCelula();
    linhas.push(linha);
    linha = [];
  };

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!;
    if (dentroDeAspas) {
      if (c === '"' && texto[i + 1] === '"') {
        celula += '"';
        i++;
      } else if (c === '"') {
        dentroDeAspas = false;
      } else {
        celula += c;
      }
    } else if (c === '"') {
      dentroDeAspas = true;
    } else if (c === separador) {
      fecharCelula();
    } else if (c === "\n") {
      fecharLinha();
    } else if (c !== "\r") {
      celula += c;
    }
  }
  if (celula !== "" || linha.length > 0) fecharLinha();
  return linhas;
}

/**
 * Lê CSV com `;` ou `,`, com ou sem BOM. Tudo é texto: o zero à esquerda
 * ("01") nunca se perde. Linha em branco é ignorada.
 */
export function lerCsv(texto: string): Resultado<TabelaLida> {
  const limpo = texto.replace(/^﻿/, "");
  const primeiraLinha = limpo.split(/\r?\n/, 1)[0] ?? "";
  if (!primeiraLinha.trim()) {
    return falha("ENTRADA_INVALIDA", "O arquivo está vazio.");
  }

  const todas = dividir(limpo, detectarSeparador(primeiraLinha)).map((l) =>
    l.map((c) => c.trim()),
  );
  const [cabecalhos = [], ...linhas] = todas;
  const dados = linhas.filter((l) => l.some((c) => c !== ""));

  if (dados.length === 0) {
    return falha(
      "ENTRADA_INVALIDA",
      "O arquivo não tem nenhuma linha de dados.",
    );
  }
  if (dados.length > LIMITE_DE_LINHAS) {
    return falha(
      "ENTRADA_INVALIDA",
      `O arquivo tem ${milhar.format(dados.length)} linhas. O limite é ${milhar.format(LIMITE_DE_LINHAS)}; divida em partes.`,
    );
  }
  return sucesso({ cabecalhos, linhas: dados });
}

/**
 * Célula de relatório (CSV/XLSX) que começa com `=`, `+`, `-` ou `@` vira fórmula
 * no Excel. O apóstrofo na frente a mantém como texto.
 */
export function escaparCelulaExportada(texto: string): string {
  return /^[=+\-@]/.test(texto) ? `'${texto}` : texto;
}
