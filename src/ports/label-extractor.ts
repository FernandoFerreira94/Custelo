/** O que a leitura devolve. `linhas` existe só em memória, para o matching: nunca é gravado nem logado. */
export type LeituraEtiqueta = {
  /** Como está na etiqueta: "Bloco B Ap 304". */
  unidadeTexto: string | null;
  nomeTexto: string | null;
  transportadora: string | null;
  rastreio: string | null;
  linhas: readonly string[];
};

export type UsoLeitura = {
  tokensEntrada: number;
  tokensSaida: number;
  custoMicroUsd: number;
};

export type MotivoFalhaLeitura =
  "timeout" | "indisponivel" | "ilegivel" | "limite" | "recusado";

export type ResultadoLeitura =
  | {
      ok: true;
      leitura: LeituraEtiqueta;
      provedor: string;
      modelo: string;
      versaoPrompt: string | null;
      latenciaMs: number;
      uso: UsoLeitura | null;
    }
  | {
      ok: false;
      motivo: MotivoFalhaLeitura;
      /** Vale tentar de novo (rede, 429, 5xx); ilegível ou recusado não. */
      repetir: boolean;
      latenciaMs: number;
    };

/** Leitura da etiqueta (ADR-014, D4). A IA só sugere: quem decide é o matching e o porteiro. */
export interface LabelExtractor {
  ler(
    imagem: Uint8Array,
    opcoes: { mime: "image/jpeg" | "image/webp"; sinal: AbortSignal },
  ): Promise<ResultadoLeitura>;
}
