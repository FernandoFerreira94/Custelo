import "server-only";

import { revalidatePath } from "next/cache";
import type { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import { contextoDaSessao } from "@/infrastructure/auth/contexto";
import { falhaDeErroPg } from "@/infrastructure/db/erros-pg";
import { codigoDeFalha, mensagemDeFalha } from "@/lib/mensagens";
import { falha, falhaDeEntrada, type Resultado } from "@/lib/resultado";

/**
 * Modelo único das actions de cadastro (plano 5.4): sessão e contexto no servidor,
 * entrada validada com Zod, caso de uso, e a lista revalidada só se deu certo.
 * Exceção nunca vaza: vira falha com texto do catálogo.
 */
export async function executarAcao<S extends z.ZodType, T>(
  esquema: S,
  entrada: unknown,
  opcoes: {
    revalidar: string[];
    executar: (ctx: Contexto, dados: z.output<S>) => Promise<Resultado<T>>;
  },
): Promise<Resultado<T>> {
  const ctx = await contextoDaSessao();
  if (!ctx.ok) return ctx;

  const lido = esquema.safeParse(entrada);
  if (!lido.success) return falhaDeEntrada(lido.error);

  let resultado: Resultado<T>;
  try {
    resultado = await opcoes.executar(ctx.data, lido.data);
  } catch (erro) {
    return (
      falhaDeErroPg(erro) ?? falha(codigoDeFalha(erro), mensagemDeFalha(erro))
    );
  }

  if (resultado.ok) {
    for (const caminho of opcoes.revalidar) revalidatePath(caminho);
  }
  return resultado;
}
