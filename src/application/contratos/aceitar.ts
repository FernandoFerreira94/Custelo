import type { Contexto } from "@/application/auth/contexto";
import {
  comRecusaDoBanco,
  type DepsDeContratos,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { podeTransicionar } from "@/domain/contratos/situacao";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

/** Só o gestor do condomínio (dono do dado) ativa o contrato. */
export async function aceitarContrato(
  deps: DepsDeContratos,
  ctx: Contexto,
  contratoId: string,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "equipe.gerir");
  if (negado) return negado;

  const contrato = await deps.repo.porId(ctx, contratoId);
  if (!contrato) return falha("NAO_ENCONTRADO", MSG_CONTRATOS.naoEncontrado);
  if (
    contrato.status !== "proposto" ||
    !podeTransicionar(contrato.status, "ativo")
  ) {
    return falha("CONFLITO", MSG_CONTRATOS.naoProposto);
  }

  const r = await comRecusaDoBanco(() => deps.repo.aceitar(ctx, contratoId));
  if (!r.ok) return r;
  return sucesso(null, MSG_CONTRATOS.aceito);
}
