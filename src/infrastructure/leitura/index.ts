import "server-only";

import { env } from "@/lib/env";
import type { LabelExtractor } from "@/ports/label-extractor";

import { criarLeitorLlm } from "./llm-visao";
import { criarLeitorOcr } from "./ocr-texto";

/**
 * Leitor ligado pelo kill switch `LEITURA_ETIQUETA`. Sem modo ou sem chave,
 * devolve null: a tela segue no manual e o recebimento nunca para (invariante 5).
 */
export function leitorConfigurado(): LabelExtractor | null {
  switch (env.LEITURA_ETIQUETA) {
    case "ocr":
      return env.LEITURA_OCR_CHAVE
        ? criarLeitorOcr(env.LEITURA_OCR_CHAVE)
        : null;
    case "llm":
      return env.LEITURA_LLM_CHAVE
        ? criarLeitorLlm(env.LEITURA_LLM_CHAVE)
        : null;
    default:
      return null;
  }
}
