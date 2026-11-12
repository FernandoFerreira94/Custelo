"use server";

import { auditoriaRepo } from "@/infrastructure/auditoria/auditoria-repo";
import { criarArea } from "@/application/estrutura/criar-area";
import { criarPonto, editarPonto } from "@/application/estrutura/criar-ponto";
import { desativarArea } from "@/application/estrutura/desativar";
import { editarArea } from "@/application/estrutura/editar-area";
import { gerarUnidades } from "@/application/estrutura/gerar-unidades";
import type { DepsDeEstrutura } from "@/application/estrutura/ports";
import {
  esquemaDeArea,
  esquemaDeEdicaoDeArea,
  esquemaDeEdicaoDePonto,
  esquemaDeGeracao,
  esquemaDeId,
  esquemaDePonto,
} from "@/application/estrutura/schemas";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { estruturaRepo } from "@/infrastructure/estrutura/estrutura-repo";

const deps: DepsDeEstrutura = { repo: estruturaRepo, auditoria: auditoriaRepo };
const LISTAS = ["/gestao/estrutura", "/gestao/unidades"];

export async function criarAreaAction(entrada: unknown) {
  return executarAcao(esquemaDeArea, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => criarArea(deps, ctx, d),
  });
}

export async function editarAreaAction(entrada: unknown) {
  return executarAcao(esquemaDeEdicaoDeArea, entrada, {
    revalidar: LISTAS,
    executar: (ctx, { id, ...campos }) => editarArea(deps, ctx, id, campos),
  });
}

export async function desativarAreaAction(entrada: unknown) {
  return executarAcao(esquemaDeId, entrada, {
    revalidar: LISTAS,
    executar: (ctx, { id }) => desativarArea(deps, ctx, id),
  });
}

export async function gerarUnidadesAction(entrada: unknown) {
  return executarAcao(esquemaDeGeracao, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => gerarUnidades(deps, ctx, d),
  });
}

export async function criarPontoAction(entrada: unknown) {
  return executarAcao(esquemaDePonto, entrada, {
    revalidar: ["/gestao/estrutura"],
    executar: (ctx, d) => criarPonto(deps, ctx, d),
  });
}

export async function editarPontoAction(entrada: unknown) {
  return executarAcao(esquemaDeEdicaoDePonto, entrada, {
    revalidar: ["/gestao/estrutura"],
    executar: (ctx, { id, ...campos }) => editarPonto(deps, ctx, id, campos),
  });
}
