import { NextResponse } from "next/server";
import { z } from "zod";

import { sugerir, TAMANHO_MAXIMO } from "@/application/recebimento/sugerir";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { SystemClock } from "@/infrastructure/clock/system-clock";
import { responder } from "@/infrastructure/http/resposta";
import { leitorConfigurado } from "@/infrastructure/leitura";
import { leituraRepo } from "@/infrastructure/recebimento/leitura-repo";
import { bucketDeEtiquetas } from "@/infrastructure/storage/bucket-da-sessao";
import { criarEvidenceStorage } from "@/infrastructure/storage/supabase-evidence-storage";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import { falha } from "@/lib/resultado";

export const dynamic = "force-dynamic";
// O orçamento da leitura é 8 s; a rota nunca deve passar muito disso.
export const maxDuration = 15;

const encomendaId = z.uuid();

/**
 * REC-002: sobe a foto da etiqueta e devolve a sugestão de destino. Adaptador
 * fino: a regra (tamanho, bytes mágicos, leitura, matching) está em `sugerir`.
 * Imagem e texto lido nunca vão para log.
 */
export async function POST(req: Request) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return responder(ctx);

  const tamanho = Number(req.headers.get("content-length") ?? 0);
  if (tamanho > TAMANHO_MAXIMO + 64_000)
    return NextResponse.json(
      {
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: MSG_RECEBIMENTO.fotoGrande,
      },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );

  const form = await req.formData().catch(() => null);
  const id = encomendaId.safeParse(form?.get("encomendaId"));
  const arquivo = form?.get("imagem");
  if (!id.success || !(arquivo instanceof Blob))
    return responder(falha("ENTRADA_INVALIDA", MSG_RECEBIMENTO.fotoFormato));
  if (arquivo.size > TAMANHO_MAXIMO)
    return NextResponse.json(
      {
        ok: false,
        codigo: "ENTRADA_INVALIDA",
        mensagem: MSG_RECEBIMENTO.fotoGrande,
      },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );

  const r = await sugerir(
    ctx.data,
    {
      encomendaId: id.data,
      imagem: new Uint8Array(await arquivo.arrayBuffer()),
    },
    {
      storage: criarEvidenceStorage(await bucketDeEtiquetas()),
      repo: leituraRepo,
      leitor: leitorConfigurado(),
      clock: new SystemClock(),
    },
  );
  return responder(r);
}
