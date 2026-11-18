import type { Contexto } from "@/application/auth/contexto";
import { negarSemPermissao } from "@/application/estrutura/guarda";
import {
  type Badge,
  type LeituraSituacao,
  lerSituacao,
} from "@/domain/custodia/situacao";
import { MSG_CUSTODIA } from "@/lib/mensagens";
import { falha, type Resultado, sucesso } from "@/lib/resultado";

import { agruparLinhaDoTempo, type ItemLinhaDoTempo } from "./linha-do-tempo";
import type {
  ConsultasCustodiaRepo,
  DetalheRepo,
  EstadoComIdade,
  FiltroFila,
  FiltrosLista,
  LinhaEncomendaRepo,
  LinhaFilaRepo,
  LocalComOcupacao,
  Pagina,
} from "./ports";

type Deps = { repo: ConsultasCustodiaRepo; agora: () => Date };

/** Ordem de urgência da fila (a de cima vence). */
const URGENCIA: readonly Badge[] = [
  "falha",
  "urgente",
  "naoIdent",
  "aguardando",
  "pronta",
  "recebida",
];

export function badgeMaisUrgente(
  itens: EstadoComIdade[],
  agora: Date,
  prazos: Parameters<typeof lerSituacao>[2],
): Badge {
  const badges = itens.map((i) => lerSituacao(i, agora, prazos).badge);
  return URGENCIA.find((b) => badges.includes(b)) ?? badges[0] ?? "recebida";
}

export type LinhaFila = Omit<LinhaFilaRepo, "itens"> & {
  badge: Badge;
  diasNaPortaria: number;
};
export type LinhaEncomenda = LinhaEncomendaRepo & { badge: Badge };
export type Detalhe = DetalheRepo & { situacao: LeituraSituacao };

export async function filaPorUnidade(
  ctx: Contexto,
  f: { busca?: string; filtro?: FiltroFila; cursor?: string },
  deps: Deps,
): Promise<Resultado<Pagina<LinhaFila>>> {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  const prazos = await deps.repo.prazos(ctx);
  const agora = deps.agora();
  const pagina = await deps.repo.filaPorUnidade(ctx, f, prazos);
  return sucesso({
    proximo: pagina.proximo,
    itens: pagina.itens.map(({ itens, ...linha }) => ({
      ...linha,
      badge: badgeMaisUrgente(itens, agora, prazos),
      diasNaPortaria: lerSituacao(
        { estado: "RECEBIDA", ocorridoEm: linha.ocorridoEmMaisAntiga },
        agora,
        prazos,
      ).diasNaPortaria,
    })),
  });
}

export async function listaEncomendas(
  ctx: Contexto,
  f: FiltrosLista,
  deps: Deps,
): Promise<Resultado<Pagina<LinhaEncomenda>>> {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  const prazos = await deps.repo.prazos(ctx);
  const agora = deps.agora();
  const pagina = await deps.repo.listaEncomendas(ctx, f, prazos);
  return sucesso({
    proximo: pagina.proximo,
    itens: pagina.itens.map((l) => ({
      ...l,
      badge: lerSituacao(l, agora, prazos).badge,
    })),
  });
}

export async function contadores(ctx: Contexto, deps: Deps) {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.contadores(ctx, await deps.repo.prazos(ctx)));
}

export async function detalhe(
  ctx: Contexto,
  id: string,
  deps: Deps,
): Promise<Resultado<Detalhe>> {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  const d = await deps.repo.detalhe(ctx, id);
  if (!d) return falha("NAO_ENCONTRADO", MSG_CUSTODIA.naoEncontrada);
  const prazos = await deps.repo.prazos(ctx);
  return sucesso({ ...d, situacao: lerSituacao(d, deps.agora(), prazos) });
}

export async function linhaDoTempo(
  ctx: Contexto,
  id: string,
  deps: Pick<Deps, "repo">,
): Promise<Resultado<ItemLinhaDoTempo[]>> {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  const { eventos, rotulos } = await deps.repo.eventos(ctx, id);
  if (eventos.length === 0)
    return falha("NAO_ENCONTRADO", MSG_CUSTODIA.naoEncontrada);
  return sucesso(agruparLinhaDoTempo(eventos, rotulos));
}

export async function locaisComOcupacao(
  ctx: Contexto,
  pontoId: string | undefined,
  deps: Pick<Deps, "repo">,
): Promise<Resultado<LocalComOcupacao[]>> {
  const negado = negarSemPermissao(ctx, "custodia.ler");
  if (negado) return negado;
  return sucesso(await deps.repo.locaisComOcupacao(ctx, pontoId));
}
