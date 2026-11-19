/**
 * Constantes únicas da leitura da etiqueta (D4). Modelo, endpoint e preço vêm da
 * doc oficial NO DIA em que o Fernando ligar a leitura; aqui ficam os valores
 * marcados como não conferidos, e `LEITURA_ETIQUETA` nasce `desligada`.
 * Pendência registrada em docs/PENDENCIAS-FERNANDO.md.
 */
export const CONFERIDO_EM: string | null = null;

export const VERSAO_PROMPT = "etiqueta-v1";

/** ADR-014: OCR de texto (Google Cloud Vision, TEXT_DETECTION) + matching local. */
export const OCR = {
  provedor: "google-vision",
  modelo: "TEXT_DETECTION",
  endpoint: "https://vision.googleapis.com/v1/images:annotate",
  /** Preço por imagem em micro-USD. Não conferido. */
  custoPorImagemMicroUsd: 1500,
} as const;

/** Direção do Notion de 17/08: LLM com visão (Gemini) devolvendo campos em JSON. */
export const LLM = {
  provedor: "google-gemini",
  modelo: "gemini-2.5-flash",
  endpoint: (modelo: string) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
  /** Preço por milhão de tokens em micro-USD. Não conferido. */
  entradaPorMilhaoMicroUsd: 300_000,
  saidaPorMilhaoMicroUsd: 2_500_000,
} as const;

export type ModoLeitura = "desligada" | "ocr" | "llm";
