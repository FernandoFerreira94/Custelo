import { z } from "zod";

import { moverEncomenda } from "@/application/custodia/mover";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { custodiaRepo } from "@/infrastructure/custodia/custodia-repo";
import { responder } from "@/infrastructure/http/resposta";
import { falhaDeEntrada } from "@/lib/resultado";

export const dynamic = "force-dynamic";

const esquema = z.object({
  eventoId: z.uuid(),
  paraLocalId: z.uuid(),
  motivoRapido: z
    .enum(["Prateleira cheia", "Volume grande", "Reorganização"])
    .optional(),
});

/** CUS-005 da portaria. Só os campos do esquema chegam ao caso de uso. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return responder(ctx);
  const lido = esquema.safeParse(await req.json().catch(() => null));
  if (!lido.success) return responder(falhaDeEntrada(lido.error));
  const { id } = await params;
  return responder(
    await moverEncomenda(
      ctx.data,
      id,
      {
        ...lido.data,
        origem: "online",
        superficie: "ops",
        ocorridoEm: new Date(),
      },
      { repo: custodiaRepo },
    ),
  );
}
