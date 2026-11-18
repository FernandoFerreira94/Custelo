#!/usr/bin/env node
// Benchmark da leitura da etiqueta (D4). Roda no PC do Fernando, com as chaves
// dele (ver docs/benchmarks/leitura-etiqueta.md). Lê as fotos em
// tests/evals/etiquetas/ (fora do git) e o gabarito.csv.
// Imprime as métricas por adaptador; nenhuma imagem ou texto lido vai para o console.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const PASTA = "tests/evals/etiquetas";
if (!existsSync(PASTA)) {
  console.error(`Coloque as fotos e o gabarito.csv em ${PASTA} (fora do git).`);
  process.exit(1);
}
const fotos = readdirSync(PASTA).filter((f) => /\.(jpe?g|webp)$/i.test(f));

const { criarLeitorOcr } =
  await import("../src/infrastructure/leitura/ocr-texto.ts");
const { criarLeitorLlm } =
  await import("../src/infrastructure/leitura/llm-visao.ts");

const adaptadores = [
  [
    "ocr",
    process.env.LEITURA_OCR_CHAVE &&
      criarLeitorOcr(process.env.LEITURA_OCR_CHAVE),
  ],
  [
    "llm",
    process.env.LEITURA_LLM_CHAVE &&
      criarLeitorLlm(process.env.LEITURA_LLM_CHAVE),
  ],
].filter(([, l]) => l);

const quantil = (xs, q) =>
  [...xs].sort((a, b) => a - b)[Math.floor((xs.length - 1) * q)] ?? 0;

for (const [nome, leitor] of adaptadores) {
  const latencias = [];
  let falhas = 0;
  let custo = 0;
  let leuAlgo = 0;
  for (const f of fotos) {
    const bytes = new Uint8Array(readFileSync(path.join(PASTA, f)));
    const mime = /\.webp$/i.test(f) ? "image/webp" : "image/jpeg";
    const r = await leitor.ler(bytes, {
      mime,
      sinal: AbortSignal.timeout(4000),
    });
    latencias.push(r.latenciaMs);
    if (!r.ok) falhas++;
    else {
      custo += r.uso?.custoMicroUsd ?? 0;
      if (r.leitura.unidadeTexto || r.leitura.linhas.length) leuAlgo++;
    }
  }
  process.stdout.write(
    JSON.stringify({
      adaptador: nome,
      fotos: fotos.length,
      falhas,
      leu_algo: leuAlgo,
      p50_ms: quantil(latencias, 0.5),
      p95_ms: quantil(latencias, 0.95),
      custo_medio_micro_usd: Math.round(custo / Math.max(1, fotos.length)),
    }) + "\n",
  );
}
// O acerto no topo e a precisão da "alta" passam pelo matching com o cadastro do
// piloto: compare a unidade sugerida com o gabarito.csv depois de rodar a I5.
