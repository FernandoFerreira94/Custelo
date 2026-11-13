import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import {
  comRecusaDoBanco,
  type DepsDeContratos,
  esquemaDeMotivo,
  MSG_CONTRATOS,
} from "@/application/contratos/ports";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import { falhaDeEntrada, type Resultado, sucesso } from "@/lib/resultado";

const esquema = z.object({
  contratoId: z.uuid(),
  usuarioId: z.uuid(),
  motivo: esquemaDeMotivo,
});

/** Gestor do condomínio tira um funcionário da prestadora deste local, com motivo. */
export async function suspenderFuncionario(
  deps: DepsDeContratos,
  ctx: Contexto,
  entrada: unknown,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "equipe.gerir");
  if (negado) return negado;

  const lido = esquema.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);
  const { contratoId, usuarioId, motivo } = lido.data;

  const r = await comRecusaDoBanco(() =>
    deps.repo.suspenderFuncionario(ctx, contratoId, usuarioId, motivo),
  );
  if (!r.ok) return r;
  return sucesso(null, MSG_CONTRATOS.suspenso);
}
