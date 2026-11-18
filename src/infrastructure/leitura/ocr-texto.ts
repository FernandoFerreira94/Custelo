import type { LabelExtractor } from "@/ports/label-extractor";

import { OCR, VERSAO_PROMPT } from "./config";
import { falhaDeExcecao, falhaHttp, registrarMetrica } from "./http";

type Fetch = typeof fetch;

const base64 = (b: Uint8Array) => Buffer.from(b).toString("base64");

/**
 * ADR-014: o provedor devolve as linhas de texto e o nosso matching interpreta.
 * `unidadeTexto` e `nomeTexto` ficam nulos: quem acha a unidade são as linhas.
 */
export function criarLeitorOcr(
  chave: string,
  opcoes: { fetch?: Fetch; agora?: () => number } = {},
): LabelExtractor {
  const http = opcoes.fetch ?? fetch;
  const agora = opcoes.agora ?? Date.now;
  return {
    async ler(imagem, { sinal }) {
      const inicio = agora();
      const ms = () => agora() - inicio;
      const meta = { provedor: OCR.provedor, modelo: OCR.modelo };
      let resultado: Awaited<ReturnType<LabelExtractor["ler"]>>;
      try {
        const r = await http(
          `${OCR.endpoint}?key=${encodeURIComponent(chave)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requests: [
                {
                  image: { content: base64(imagem) },
                  features: [{ type: "TEXT_DETECTION" }],
                  imageContext: { languageHints: ["pt"] },
                },
              ],
            }),
            signal: sinal,
          },
        );
        if (!r.ok) {
          resultado = falhaHttp(
            OCR.provedor,
            r.status,
            r.headers.get("retry-after"),
            ms(),
          );
        } else {
          const corpo = (await r.json()) as {
            responses?: {
              fullTextAnnotation?: { text?: string };
              error?: { message?: string };
            }[];
          };
          const texto = corpo.responses?.[0]?.fullTextAnnotation?.text ?? "";
          const linhas = texto
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);
          resultado = linhas.length
            ? {
                ok: true,
                provedor: OCR.provedor,
                modelo: OCR.modelo,
                versaoPrompt: VERSAO_PROMPT,
                latenciaMs: ms(),
                uso: {
                  tokensEntrada: 0,
                  tokensSaida: 0,
                  custoMicroUsd: OCR.custoPorImagemMicroUsd,
                },
                leitura: {
                  unidadeTexto: null,
                  nomeTexto: null,
                  transportadora: null,
                  rastreio: null,
                  linhas,
                },
              }
            : {
                ok: false,
                motivo: "ilegivel",
                repetir: false,
                latenciaMs: ms(),
              };
        }
      } catch {
        resultado = falhaDeExcecao(sinal, ms());
      }
      registrarMetrica(resultado, meta);
      return resultado;
    },
  };
}
