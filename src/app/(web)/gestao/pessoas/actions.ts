"use server";

import { autorizarRetirada } from "@/application/pessoas/autorizar-retirada";
import { detalhePessoa } from "@/application/pessoas/consultas";
import { criarPessoa } from "@/application/pessoas/criar-pessoa";
import { encerrarVinculo } from "@/application/pessoas/encerrar-vinculo";
import type { DepsDePessoas } from "@/application/pessoas/ports";
import { registrarConsentimento } from "@/application/pessoas/registrar-consentimento";
import { revogarAutorizacao } from "@/application/pessoas/revogar-autorizacao";
import { salvarContato } from "@/application/pessoas/salvar-contato";
import {
  esquemaDeAutorizacao,
  esquemaDeConsentimento,
  esquemaDeContato,
  esquemaDeDetalhe,
  esquemaDeEncerramento,
  esquemaDePessoa,
  esquemaDeVinculo,
} from "@/application/pessoas/schemas";
import { vincular } from "@/application/pessoas/vincular";
import { auditoriaRepo } from "@/infrastructure/auditoria/auditoria-repo";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { pessoasRepo } from "@/infrastructure/pessoas/pessoas-repo";

const deps: DepsDePessoas = {
  repo: pessoasRepo,
  auditoria: auditoriaRepo,
  agora: () => new Date(),
};
const LISTAS = ["/gestao/pessoas", "/gestao/unidades"];

export async function criarPessoaAction(entrada: unknown) {
  return executarAcao(esquemaDePessoa, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => criarPessoa(deps, ctx, d),
  });
}

export async function vincularAction(entrada: unknown) {
  return executarAcao(esquemaDeVinculo, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => vincular(deps, ctx, d),
  });
}

export async function encerrarVinculoAction(entrada: unknown) {
  return executarAcao(esquemaDeEncerramento, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => encerrarVinculo(deps, ctx, d),
  });
}

export async function autorizarRetiradaAction(entrada: unknown) {
  return executarAcao(esquemaDeAutorizacao, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => autorizarRetirada(deps, ctx, d),
  });
}

export async function revogarAutorizacaoAction(entrada: unknown) {
  return executarAcao(esquemaDeEncerramento, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => revogarAutorizacao(deps, ctx, d),
  });
}

export async function salvarContatoAction(entrada: unknown) {
  return executarAcao(esquemaDeContato, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => salvarContato(deps, ctx, d),
  });
}

export async function registrarConsentimentoAction(entrada: unknown) {
  return executarAcao(esquemaDeConsentimento, entrada, {
    revalidar: LISTAS,
    executar: (ctx, d) => registrarConsentimento(deps, ctx, d),
  });
}

/** Detalhe da pessoa. `mostrarCpf` deixa `CPF_VISUALIZADO` na auditoria. */
export async function detalhePessoaAction(entrada: unknown) {
  return executarAcao(esquemaDeDetalhe, entrada, {
    revalidar: [],
    executar: (ctx, { id, mostrarCpf }) =>
      detalhePessoa(deps, ctx, id, { mostrarCpf }),
  });
}
