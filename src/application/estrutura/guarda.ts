import type { Contexto } from "@/application/auth/contexto";
import { type Permissao, pode } from "@/application/permissoes";
import { MSG } from "@/lib/mensagens";
import { falha, type Falha } from "@/lib/resultado";

/** Devolve a falha de permissão, ou null quando o papel pode. */
export function negarSemPermissao(
  ctx: Contexto,
  permissao: Permissao,
): Falha | null {
  return pode(ctx.papel, permissao)
    ? null
    : falha("SEM_PERMISSAO", MSG.semPermissao);
}
