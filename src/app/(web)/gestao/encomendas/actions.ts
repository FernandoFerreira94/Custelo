"use server";

import { z } from "zod";

import { moverEncomenda } from "@/application/custodia/mover";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { custodiaRepo } from "@/infrastructure/custodia/custodia-repo";

const esquemaDeMover = z.object({
  id: z.uuid(),
  eventoId: z.uuid(),
  paraLocalId: z.uuid(),
  motivoRapido: z
    .enum(["Prateleira cheia", "Volume grande", "Reorganização"])
    .optional(),
});

export async function moverEncomendaAction(entrada: unknown) {
  return executarAcao(esquemaDeMover, entrada, {
    revalidar: ["/gestao/encomendas"],
    executar: (ctx, { id, ...p }) =>
      moverEncomenda(
        ctx,
        id,
        { ...p, origem: "online", superficie: "web", ocorridoEm: new Date() },
        { repo: custodiaRepo },
      ),
  });
}
