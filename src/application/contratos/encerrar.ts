import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import {
  comRecusaDoBanco,
  type DepsDeContratos,
  esquemaDeMotivo,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { podeTransicionar } from "@/domain/contratos/situacao";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

const esquema = z.object({ contratoId: z.uuid(), motivo: esquemaDeMotivo });

/**
 * Qualquer ponta encerra, com motivo. O banco derruba os escopos do contrato na
 * mesma transação; a tela mostra antes o efeito (`efeitoDoEncerramento`).
 */
export async function encerrarContrato(
  deps: DepsDeContratos,
  ctx: Contexto,
  entrada: unknown,
): Promise<Resultado<null>> {
  // org_admin da prestadora e gestor do condomínio; o banco confere a ponta.
  const negado = negarSemPermissao(ctx, "equipe.gerir");
  if (negado) return negado;

  const lido = esquema.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);
  const { contratoId, motivo } = lido.data;

  const contrato = await deps.repo.porId(ctx, contratoId);
  if (!contrato) return falha("NAO_ENCONTRADO", MSG_CONTRATOS.naoEncontrado);
  if (!podeTransicionar(contrato.status, "encerrado")) {
    return falha("CONFLITO", MSG_CONTRATOS.jaEncerrado);
  }

  const r = await comRecusaDoBanco(() =>
    deps.repo.encerrar(ctx, contratoId, motivo),
  );
  if (!r.ok) return r;
  return sucesso(null, MSG_CONTRATOS.encerrado);
}
