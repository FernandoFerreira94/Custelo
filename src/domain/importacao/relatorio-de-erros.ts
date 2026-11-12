import { escaparCelulaExportada } from "./ler-csv";

export type LinhaDoRelatorio = {
  numeroLinha: number;
  situacao: string;
  problemas: readonly string[];
  /** O que veio na planilha, por cabeçalho. */
  entrada: Readonly<Record<string, string>>;
};

const celula = (texto: string) => {
  const seguro = escaparCelulaExportada(texto);
  return /[;"\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
};

/**
 * CSV com as linhas que não entraram e o motivo. Cada célula passa por
 * `escaparCelulaExportada`: o relatório pode ser aberto no Excel, e quem digitou
 * "=..." na planilha não pode virar fórmula no arquivo que baixamos.
 */
export function relatorioDeErros(
  cabecalhos: readonly string[],
  linhas: readonly LinhaDoRelatorio[],
): string {
  const topo = ["Linha", "Situação", "Problemas", ...cabecalhos];
  const corpo = linhas.map((l) =>
    [
      String(l.numeroLinha),
      l.situacao,
      l.problemas.join(" | "),
      ...cabecalhos.map((c) => l.entrada[c] ?? ""),
    ]
      .map(celula)
      .join(";"),
  );
  // BOM para o Excel reconhecer o UTF-8 e não quebrar os acentos.
  return `﻿${[topo.map(celula).join(";"), ...corpo].join("\r\n")}\r\n`;
}
