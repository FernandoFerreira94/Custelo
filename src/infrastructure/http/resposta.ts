import "server-only";

import { NextResponse } from "next/server";

import type { CodigoFalha, Resultado } from "@/lib/resultado";

const STATUS: Record<CodigoFalha, number> = {
  SEM_SESSAO: 401,
  SEM_PERMISSAO: 403,
  ENTRADA_INVALIDA: 400,
  NAO_ENCONTRADO: 404,
  CONFLITO: 409,
  DUPLICADO: 409,
  INDISPONIVEL: 503,
};

/**
 * Resposta JSON das rotas do `(ops)`. Nunca vai para cache: é dado do tenant.
 * A falha leva só código e mensagem do catálogo (sem stack nem id interno).
 */
export function responder<T>(r: Resultado<T>): NextResponse {
  const cabecalhos = { "Cache-Control": "no-store" };
  if (r.ok)
    return NextResponse.json(
      { ok: true, data: r.data, mensagem: r.mensagem },
      { headers: cabecalhos },
    );
  return NextResponse.json(
    { ok: false, codigo: r.codigo, mensagem: r.mensagem, campos: r.campos },
    { status: STATUS[r.codigo], headers: cabecalhos },
  );
}
