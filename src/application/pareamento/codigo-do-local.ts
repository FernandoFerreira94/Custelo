import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  type CodigoCriado,
  type DepsDePareamento,
  MSG_PAREAMENTO,
} from "@/application/pareamento/ports";
import { gerarCodigoLocal } from "@/domain/aparelho/codigo-local";
import {
  falha,
  falhaDeEntrada,
  type Resultado,
  sucesso,
} from "@/lib/resultado";

const esquema = z.object({
  validadeDias: z
    .number()
    .int()
    .min(1, "Mínimo de 1 dia.")
    .max(365, "No máximo 1 ano."),
});

// 32^6 ≈ 1 bilhão de códigos: colisão é rara; três sorteios bastam.
const SORTEIOS = 3;

/** Gestor do condomínio gera o código do local ativo no contexto. */
export async function criarCodigoDoLocal(
  deps: DepsDePareamento,
  ctx: Contexto,
  entrada: unknown,
): Promise<Resultado<CodigoCriado>> {
  const negado = negarSemPermissao(ctx, "equipe.gerir");
  if (negado) return negado;
  const lido = esquema.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);

  const expiraEm = new Date(
    deps.agora().getTime() + lido.data.validadeDias * 24 * 60 * 60 * 1000,
  );
  for (let i = 0; i < SORTEIOS; i++) {
    const criado = await deps.repo.criarCodigo(
      ctx,
      gerarCodigoLocal(deps.segredos.sortear),
      expiraEm,
    );
    if (criado) return sucesso(criado, MSG_PAREAMENTO.codigoCriado);
  }
  return falha("CONFLITO", MSG_PAREAMENTO.semCodigoLivre);
}

export async function revogarCodigoDoLocal(
  deps: DepsDePareamento,
  ctx: Contexto,
  id: string,
): Promise<Resultado<null>> {
  const negado = negarSemPermissao(ctx, "equipe.gerir");
  if (negado) return negado;
  await deps.repo.revogarCodigo(ctx, id);
  return sucesso(null, MSG_PAREAMENTO.codigoRevogado);
}
