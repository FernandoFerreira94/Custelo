import * as Sentry from "@sentry/nextjs";

import { log } from "@/infrastructure/observability/logger";
import type { ResultadoLeitura } from "@/ports/label-extractor";

type Falha = Extract<ResultadoLeitura, { ok: false }>;

/**
 * Status HTTP do provedor → falha da porta (tabela da Task 5.5). Alerta vai sem
 * imagem e sem texto: só o provedor e o motivo.
 */
export function falhaHttp(
  provedor: string,
  status: number,
  retryAfter: string | null,
  latenciaMs: number,
): Falha {
  if (status === 429) {
    const espera = Number(retryAfter);
    if (retryAfter !== null && Number.isFinite(espera) && espera <= 2)
      return { ok: false, motivo: "limite", repetir: true, latenciaMs };
    alertar(provedor, "limite");
    return { ok: false, motivo: "limite", repetir: false, latenciaMs };
  }
  if (status === 402) {
    alertar(provedor, "limite");
    return { ok: false, motivo: "limite", repetir: false, latenciaMs };
  }
  if (status === 400 || status === 401 || status === 403) {
    alertar(provedor, "chave_ou_config");
    return { ok: false, motivo: "indisponivel", repetir: false, latenciaMs };
  }
  return { ok: false, motivo: "indisponivel", repetir: true, latenciaMs };
}

function alertar(provedor: string, motivo: string) {
  Sentry.captureMessage(`leitura_etiqueta_${motivo}`, {
    level: "warning",
    tags: { provedor },
  });
}

export function falhaDeExcecao(sinal: AbortSignal, latenciaMs: number): Falha {
  return sinal.aborted
    ? { ok: false, motivo: "timeout", repetir: true, latenciaMs }
    : { ok: false, motivo: "indisponivel", repetir: true, latenciaMs };
}

/**
 * Única saída de log da leitura: só metadados. Imagem, linhas lidas e nome
 * nunca chegam aqui (invariante 12); o teste do adaptador confere.
 */
export function registrarMetrica(
  r: ResultadoLeitura,
  meta: { provedor: string; modelo: string },
) {
  const partes = [
    `provedor=${meta.provedor}`,
    `modelo=${meta.modelo}`,
    `ms=${r.latenciaMs}`,
    `resultado=${r.ok ? "ok" : r.motivo}`,
  ];
  if (r.ok && r.uso)
    partes.push(
      `tokens=${r.uso.tokensEntrada}+${r.uso.tokensSaida}`,
      `custo_micro_usd=${r.uso.custoMicroUsd}`,
    );
  log(r.ok ? "info" : "warn", { msg: `leitura_etiqueta ${partes.join(" ")}` });
}
