import definicao from "../../../docs/product/importacao-colunas.json";

import { semAcento } from "@/domain/estrutura/unidade";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

export type Cadastro =
  | "unidades"
  | "moradores"
  | "lojistas"
  | "funcionarios"
  | "autorizados"
  | "areas_comuns";

export const CADASTROS: readonly Cadastro[] = [
  "unidades",
  "moradores",
  "lojistas",
  "funcionarios",
  "autorizados",
  "areas_comuns",
];

/** O arquivo de definição usa hífen (`areas-comuns`); o banco e o código usam `areas_comuns`. */
const CHAVE_NO_ARQUIVO: Record<Cadastro, keyof typeof definicao> = {
  unidades: "unidades",
  moradores: "moradores",
  lojistas: "lojistas",
  funcionarios: "funcionarios",
  autorizados: "autorizados",
  areas_comuns: "areas-comuns",
};

export type Coluna = {
  cabecalho: string;
  obrigatoria: boolean;
  valores: readonly string[] | null;
  dica: string;
};

export function colunasDe(cadastro: Cadastro): readonly Coluna[] {
  return definicao[CHAVE_NO_ARQUIVO[cadastro]].colunas as readonly Coluna[];
}

/** "Número" = "numero" = "NÚMERO": sem acento, sem caixa, sem espaço nem pontuação. */
export function chaveDoCabecalho(texto: string): string {
  return semAcento(texto)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export type CabecalhoMapeado = {
  /** Cabeçalho oficial → posição na planilha. */
  indices: Record<string, number>;
  /** Colunas que a planilha tem e o modelo não: ignoradas (a tela avisa). */
  ignoradas: string[];
};

function listar(nomes: string[]): string {
  const aspas = nomes.map((n) => `"${n}"`);
  if (aspas.length === 1) return aspas[0]!;
  return `${aspas.slice(0, -1).join(", ")} e ${aspas.at(-1)}`;
}

/** Liga o cabeçalho da planilha às colunas do modelo; coluna obrigatória faltando falha. */
export function mapearCabecalho(
  cadastro: Cadastro,
  cabecalhos: readonly string[],
): Resultado<CabecalhoMapeado> {
  const colunas = colunasDe(cadastro);
  const porChave = new Map(
    colunas.map((c) => [chaveDoCabecalho(c.cabecalho), c]),
  );

  const indices: Record<string, number> = {};
  const ignoradas: string[] = [];
  cabecalhos.forEach((texto, i) => {
    const coluna = porChave.get(chaveDoCabecalho(texto));
    if (coluna && !(coluna.cabecalho in indices)) indices[coluna.cabecalho] = i;
    else if (texto.trim()) ignoradas.push(texto);
  });

  const faltando = colunas
    .filter((c) => c.obrigatoria && !(c.cabecalho in indices))
    .map((c) => c.cabecalho);
  if (faltando.length > 0) {
    return falha(
      "ENTRADA_INVALIDA",
      faltando.length === 1
        ? `Falta a coluna ${listar(faltando)} na planilha. Baixe o modelo para conferir.`
        : `Faltam as colunas ${listar(faltando)} na planilha. Baixe o modelo para conferir.`,
    );
  }
  return sucesso({ indices, ignoradas });
}
