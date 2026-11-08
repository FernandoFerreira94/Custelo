import { readSheet, SheetNotFoundError } from "read-excel-file/node";

import type { FormatoDoArquivo } from "@/application/importacao/validar-arquivo";
import {
  lerCsv,
  montarTabela,
  type TabelaLida,
} from "@/domain/importacao/ler-csv";
import { falha, type Resultado } from "@/lib/resultado";

/** O modelo oficial guarda os dados nesta aba; as outras são instruções. */
export const ABA_DO_MODELO = "Preencha aqui";

const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function comoTexto(celula: unknown): string {
  if (celula === null || celula === undefined) return "";
  if (celula instanceof Date) return dia.format(celula);
  return String(celula).trim();
}

/** Células do Excel (texto, número, data) viram a mesma tabela de texto do CSV. */
export function tabelaDeCelulas(linhas: readonly (readonly unknown[])[]) {
  return montarTabela(linhas.map((l) => l.map(comoTexto)));
}

function decodificar(bytes: Uint8Array): string {
  // UTF-8 primeiro; o Excel antigo salva CSV em Windows-1252, e aí o UTF-8 estrito falha.
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

/**
 * Lê CSV ou XLSX (só a aba "Preencha aqui") e devolve a mesma tabela de texto.
 * Tudo vira texto: o zero à esquerda de "01" não se perde. O arquivo não é guardado.
 */
export async function lerArquivo(
  formato: FormatoDoArquivo,
  bytes: Uint8Array,
): Promise<Resultado<TabelaLida>> {
  if (formato === "csv") return lerCsv(decodificar(bytes));

  try {
    const linhas = await readSheet(Buffer.from(bytes), ABA_DO_MODELO);
    return tabelaDeCelulas(linhas);
  } catch (erro) {
    if (erro instanceof SheetNotFoundError) {
      return falha(
        "ENTRADA_INVALIDA",
        `A planilha não tem a aba "${ABA_DO_MODELO}". Baixe o modelo e preencha nela.`,
      );
    }
    return falha(
      "ENTRADA_INVALIDA",
      "Não conseguimos abrir esta planilha. Baixe o modelo e tente de novo.",
    );
  }
}
