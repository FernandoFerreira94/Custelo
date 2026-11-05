import { falha, type Resultado, sucesso } from "@/lib/resultado";

export const TAMANHO_MAXIMO_EM_BYTES = 5 * 1024 * 1024;

export type FormatoDoArquivo = "csv" | "xlsx";

const TIPOS_DE_CSV = new Set([
  "text/csv",
  "application/csv",
  "text/plain",
  // O Windows costuma mandar CSV como "excel": a extensão decide.
  "application/vnd.ms-excel",
]);
const TIPO_DE_XLSX =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * Valida no servidor, antes de ler o conteúdo: tamanho e formato. O navegador
 * não é confiável; o nome e o tipo conferem juntos.
 */
export function validarArquivo(e: {
  nome: string;
  tipo: string;
  bytes: number;
}): Resultado<FormatoDoArquivo> {
  if (e.bytes > TAMANHO_MAXIMO_EM_BYTES) {
    return falha(
      "ENTRADA_INVALIDA",
      "O arquivo passa de 5 MB. Divida a planilha em partes.",
    );
  }
  const extensao = e.nome.toLowerCase().split(".").pop();
  if (e.tipo === TIPO_DE_XLSX && extensao === "xlsx") return sucesso("xlsx");
  if (extensao === "csv" && TIPOS_DE_CSV.has(e.tipo)) return sucesso("csv");
  return falha(
    "ENTRADA_INVALIDA",
    "Envie um arquivo .csv ou .xlsx, de preferência o modelo da tela.",
  );
}
