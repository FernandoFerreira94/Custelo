import type { Contexto } from "@/application/auth/contexto";
import {
  comRecusaDoBanco,
  type DepsDeContratos,
  esquemaDeProposta,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { falhaDeEntrada, type Resultado, sucesso } from "@/lib/resultado";

/** Gestor da prestadora propõe; o contrato nasce `proposto` e só o condomínio ativa. */
export async function proporContrato(
  deps: DepsDeContratos,
  ctx: Contexto,
  entrada: unknown,
): Promise<Resultado<{ id: string }>> {
  const negado = negarSemPermissao(ctx, "organizacao.gerir");
  if (negado) return negado;

  const lido = esquemaDeProposta.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);

  const r = await comRecusaDoBanco(() => deps.repo.propor(ctx, lido.data));
  if (!r.ok) return r;
  return sucesso({ id: r.valor }, MSG_CONTRATOS.proposto);
}
