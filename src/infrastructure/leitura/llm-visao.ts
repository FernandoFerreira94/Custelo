import { readFileSync } from "node:fs";
import path from "node:path";

import { z } from "zod";

import type { LabelExtractor } from "@/ports/label-extractor";

import { LLM, VERSAO_PROMPT } from "./config";
import { falhaDeExcecao, falhaHttp, registrarMetrica } from "./http";

type Fetch = typeof fetch;

/** Prompt versionado em arquivo (diz que o texto da imagem é dado, nunca instrução). */
export function promptDaEtiqueta(): string {
  return readFileSync(
    path.join(
      process.cwd(),
      "src/infrastructure/leitura/prompts",
      `${VERSAO_PROMPT}.md`,
    ),
    "utf8",
  );
}

const campo = z.string().trim().max(120).nullable();
/** Saída estruturada: cada campo pode ser null = "não sei". */
const esquemaSaida = z.object({
  unidade: campo,
  nome: campo,
  transportadora: campo,
  rastreio: campo,
});

const SCHEMA_GEMINI = {
  type: "OBJECT",
  properties: Object.fromEntries(
    ["unidade", "nome", "transportadora", "rastreio"].map((k) => [
      k,
      { type: "STRING", nullable: true },
    ]),
  ),
  required: ["unidade", "nome", "transportadora", "rastreio"],
};

/** Direção do Notion (17/08): modelo com visão devolve os campos; o matching continua nosso. */
export function criarLeitorLlm(
  chave: string,
  opcoes: {
    fetch?: Fetch;
    agora?: () => number;
    prompt?: string;
    modelo?: string;
  } = {},
): LabelExtractor {
  const http = opcoes.fetch ?? fetch;
  const agora = opcoes.agora ?? Date.now;
  const modelo = opcoes.modelo ?? LLM.modelo;
  return {
    async ler(imagem, { mime, sinal }) {
      const inicio = agora();
      const ms = () => agora() - inicio;
      const meta = { provedor: LLM.provedor, modelo };
      let resultado: Awaited<ReturnType<LabelExtractor["ler"]>>;
      try {
        const r = await http(LLM.endpoint(modelo), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": chave,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: opcoes.prompt ?? promptDaEtiqueta() },
                  {
                    inline_data: {
                      mime_type: mime,
                      data: Buffer.from(imagem).toString("base64"),
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0,
              responseMimeType: "application/json",
              responseSchema: SCHEMA_GEMINI,
            },
          }),
          signal: sinal,
        });
        if (!r.ok) {
          resultado = falhaHttp(
            LLM.provedor,
            r.status,
            r.headers.get("retry-after"),
            ms(),
          );
        } else {
          const corpo = (await r.json()) as {
            candidates?: {
              finishReason?: string;
              content?: { parts?: { text?: string }[] };
            }[];
            usageMetadata?: {
              promptTokenCount?: number;
              candidatesTokenCount?: number;
            };
          };
          const c = corpo.candidates?.[0];
          const bruto = c?.content?.parts?.[0]?.text;
          const lido =
            c?.finishReason && c.finishReason !== "STOP"
              ? null
              : esquemaSaida.safeParse(
                  (() => {
                    try {
                      return JSON.parse(bruto ?? "");
                    } catch {
                      return null;
                    }
                  })(),
                );
          if (!lido?.success || (!lido.data.unidade && !lido.data.nome)) {
            resultado = {
              ok: false,
              motivo: "ilegivel",
              repetir: false,
              latenciaMs: ms(),
            };
          } else {
            const entrada = corpo.usageMetadata?.promptTokenCount ?? 0;
            const saida = corpo.usageMetadata?.candidatesTokenCount ?? 0;
            resultado = {
              ok: true,
              provedor: LLM.provedor,
              modelo,
              versaoPrompt: VERSAO_PROMPT,
              latenciaMs: ms(),
              uso: {
                tokensEntrada: entrada,
                tokensSaida: saida,
                custoMicroUsd: Math.round(
                  (entrada * LLM.entradaPorMilhaoMicroUsd +
                    saida * LLM.saidaPorMilhaoMicroUsd) /
                    1_000_000,
                ),
              },
              leitura: {
                unidadeTexto: lido.data.unidade,
                nomeTexto: lido.data.nome,
                transportadora: lido.data.transportadora,
                rastreio: lido.data.rastreio,
                linhas: [],
              },
            };
          }
        }
      } catch {
        resultado = falhaDeExcecao(sinal, ms());
      }
      registrarMetrica(resultado, meta);
      return resultado;
    },
  };
}
