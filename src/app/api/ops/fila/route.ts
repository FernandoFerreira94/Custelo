import { z } from "zod";

import { contadores, filaPorUnidade } from "@/application/custodia/consultas";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { consultasCustodiaRepo } from "@/infrastructure/custodia/custodia-repo";
import { responder } from "@/infrastructure/http/resposta";
import { falhaDeEntrada, sucesso } from "@/lib/resultado";

export const dynamic = "force-dynamic";

const esquema = z.object({
  busca: z.string().trim().max(60).optional(),
  filtro: z.enum(["prontas", "falha", "prazo", "naoIdent"]).optional(),
  cursor: z.string().max(200).optional(),
});

/** CUS-001 da portaria: uma linha por unidade + os contadores dos filtros. */
export async function GET(req: Request) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return responder(ctx);
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const lido = esquema.safeParse(params);
  if (!lido.success) return responder(falhaDeEntrada(lido.error));

  const deps = { repo: consultasCustodiaRepo, agora: () => new Date() };
  const [fila, conta] = await Promise.all([
    filaPorUnidade(ctx.data, lido.data, deps),
    contadores(ctx.data, deps),
  ]);
  if (!fila.ok) return responder(fila);
  if (!conta.ok) return responder(conta);
  return responder(sucesso({ ...fila.data, contadores: conta.data }));
}
