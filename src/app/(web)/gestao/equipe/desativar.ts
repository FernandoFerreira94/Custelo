"use server";

import { z } from "zod";

import { deactivateUser } from "@/application/auth/manage-access";
import { pode } from "@/application/permissoes";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { MSG } from "@/lib/mensagens";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

const pedido = z.object({
  usuarioId: z.uuid("Escolha a pessoa."),
  motivo: z.string().trim().min(3, "Conte o motivo, em poucas palavras."),
});

/** Desativa a pessoa e encerra as sessões. O motivo vai para a auditoria. */
export async function desativarAction(
  entrada: unknown,
): Promise<Resultado<null>> {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return ctx;
  if (!pode(ctx.data.papel, "equipe.gerir")) {
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  }

  const lido = pedido.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);

  if (lido.data.usuarioId === ctx.data.usuarioId) {
    return falha("CONFLITO", "Você não pode desativar o seu próprio acesso.");
  }

  const resultado = await deactivateUser({
    actorUserId: ctx.data.usuarioId,
    targetUserId: lido.data.usuarioId,
    motivo: lido.data.motivo,
  });

  if (resultado.ok) {
    return sucesso(
      null,
      "Acesso desativado. A pessoa saiu de todos os aparelhos.",
    );
  }
  switch (resultado.code) {
    case "UNAUTHORIZED":
    case "OUTSIDE_SCOPE":
    case "ROLE_ESCALATION":
      return falha("SEM_PERMISSAO", MSG.semPermissao);
    case "INVALID_SCOPE":
      return falha("NAO_ENCONTRADO", "Não achamos essa pessoa nesta equipe.");
    default:
      return falha("INDISPONIVEL", MSG.instavel);
  }
}
