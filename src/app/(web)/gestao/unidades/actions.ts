"use server";

import { criarUnidade } from "@/application/estrutura/criar-unidade";
import { desativarUnidade } from "@/application/estrutura/desativar";
import { editarUnidade } from "@/application/estrutura/editar-unidade";
import type { DepsDeEstrutura } from "@/application/estrutura/ports";
import {
  esquemaDeEdicaoDeUnidade,
  esquemaDeId,
  esquemaDeUnidade,
} from "@/application/estrutura/schemas";
import { auditoriaRepo } from "@/infrastructure/auditoria/auditoria-repo";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

const deps: DepsDeEstrutura = { repo: estruturaRepo, auditoria: auditoriaRepo };
const LISTAS = ["/gestao/unidades", "/gestao/estrutura"];

export async function criarUnidadeAction(entrada: unknown) {
  return executarAcao(esquemaDeUnidade, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => criarUnidade(deps, ctx, d),
  });
}

export async function editarUnidadeAction(entrada: unknown) {
  return executarAcao(esquemaDeEdicaoDeUnidade, entrada, {
    revalidar: LISTAS,
    executar: (ctx, { id, ...campos }) => editarUnidade(deps, ctx, id, campos),
  });
}

export async function desativarUnidadeAction(entrada: unknown) {
  return executarAcao(esquemaDeId, entrada, {
    revalidar: LISTAS,
    executar: (ctx, { id }) => desativarUnidade(deps, ctx, id),
  });
}
