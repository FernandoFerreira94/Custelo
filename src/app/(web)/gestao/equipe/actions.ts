"use server";

import { z } from "zod";

import { mascararEmail } from "@/application/auditoria/ports";
import { inviteUser } from "@/application/auth/manage-access";
import { PAPEIS_CONVIDAVEIS } from "@/application/equipe/rotulos";
import { pode } from "@/application/permissoes";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { MSG } from "@/lib/mensagens";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

const convite = z.object({
  email: z.email("Informe um e-mail válido."),
  papel: z.enum(PAPEIS_CONVIDAVEIS, "Escolha o papel."),
});

export type ConviteEnviado = { email: string };

/** Convida alguém para o PRÓPRIO empreendimento da sessão; o servidor decide o escopo. */
export async function convidarAction(
  entrada: unknown,
): Promise<Resultado<ConviteEnviado>> {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return ctx;
  if (!pode(ctx.data.papel, "equipe.gerir")) {
    return falha("SEM_PERMISSAO", MSG.semPermissao);
  }

  const lida = convite.safeParse(entrada);
  if (!lida.success) return falhaDeEntrada(lida.error);

  const { email, papel } = lida.data;
  const resultado = await inviteUser({
    actorUserId: ctx.data.usuarioId,
    email,
    initialScope: {
      orgId: ctx.data.orgId,
      empreendimentoId: ctx.data.empreendimentoId,
      isOrgScope: false,
      roleCode: papel,
    },
  });

  if (resultado.ok) {
    return sucesso(
      { email: mascararEmail(email) },
      `Convite enviado para ${mascararEmail(email)}. O link vale por 24 horas.`,
    );
  }
  switch (resultado.code) {
    case "DUPLICATE":
      return falha(
        "DUPLICADO",
        "Esta pessoa já tem acesso a este empreendimento.",
      );
    case "UNAUTHORIZED":
    case "OUTSIDE_SCOPE":
    case "ROLE_ESCALATION":
      return falha("SEM_PERMISSAO", MSG.semPermissao);
    default:
      return falha("INDISPONIVEL", MSG.instavel);
  }
}
