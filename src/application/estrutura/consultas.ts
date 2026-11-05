import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import type {
  ContagensDeUnidades,
  DepsDeEstrutura,
  FiltroDeUnidades,
  NoArvore,
  Pagina,
  UnidadeNaArvore,
  UnidadeResumo,
} from "@/application/estrutura/ports";
import { type Resultado, sucesso } from "@/lib/resultado";

export async function arvore(
  deps: DepsDeEstrutura,
  ctx: Contexto,
): Promise<Resultado<NoArvore[]>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.arvore(ctx));
}

export async function listarUnidades(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  filtro: FiltroDeUnidades,
): Promise<Resultado<Pagina<UnidadeResumo>>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.listarUnidades(ctx, filtro));
}

/** Atalho da lista de "pendências": unidades que hoje ninguém consegue avisar. */
export function unidadesSemContato(
  deps: DepsDeEstrutura,
  ctx: Contexto,
  filtro: Omit<FiltroDeUnidades, "semContato"> = {},
) {
  return listarUnidades(deps, ctx, { ...filtro, semContato: true });
}

export async function resumoDeUnidades(
  deps: DepsDeEstrutura,
  ctx: Contexto,
): Promise<Resultado<UnidadeNaArvore[]>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.resumoDeUnidades(ctx));
}

export async function contagensDeUnidades(
  deps: DepsDeEstrutura,
  ctx: Contexto,
): Promise<Resultado<ContagensDeUnidades>> {
  const negado = negarSemPermissao(ctx, "cadastro.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.contagensDeUnidades(ctx));
}
