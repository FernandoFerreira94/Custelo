import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import {
  comRecusaDoBanco,
  type DepsDeContratos,
  esquemaDePapel,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

const esquema = z.object({
  contratoId: z.uuid(),
  usuarioId: z.uuid("Escolha o funcionário."),
  papel: esquemaDePapel,
});

/** Gestor da prestadora põe um funcionário dela no condomínio, com papel do contrato. */
export async function atribuirFuncionario(
  deps: DepsDeContratos,
  ctx: Contexto,
  entrada: unknown,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "organizacao.gerir");
  if (negado) return negado;

  const lido = esquema.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);
  const { contratoId, usuarioId, papel } = lido.data;

  const contrato = await deps.repo.porId(ctx, contratoId);
  if (!contrato) return falha("NAO_ENCONTRADO", MSG_CONTRATOS.naoEncontrado);
  if (contrato.status !== "ativo") {
    return falha("CONFLITO", MSG_CONTRATOS.inativo);
  }
  if (!contrato.papeisPermitidos.includes(papel)) {
    return falha("ENTRADA_INVALIDA", MSG_CONTRATOS.papelFora, {
      papel: MSG_CONTRATOS.papelFora,
    });
  }

  const r = await comRecusaDoBanco(() =>
    deps.repo.atribuirFuncionario(ctx, contratoId, usuarioId, papel),
  );
  if (!r.ok) return r;
  return sucesso(null, MSG_CONTRATOS.atribuido);
}
