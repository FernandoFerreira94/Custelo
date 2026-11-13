import { z } from "zod";

import type { Contexto } from "@/application/auth/contexto";
import {
  type PapelDeContrato,
  PAPEIS_DE_CONTRATO,
  papeisPermitidosValidos,
  type StatusContrato,
} from "@/domain/contratos/situacao";
import { MSG } from "@/lib/mensagens";
import { falha, type Falha } from "@/lib/resultado";

/**
 * Casos de uso de contrato (IP.2, D20). Quem decide é o banco: as funções
 * `app.*_contrato` checam a permissão e gravam a auditoria (CONTRATO_PROPOSTO,
 * CONTRATO_ACEITO, FUNCIONARIO_ATRIBUIDO, FUNCIONARIO_SUSPENSO, CONTRATO_ENCERRADO)
 * na mesma transação. Por isso os casos de uso não chamam `registrarAuditoria`:
 * seria a mesma trilha em dois lugares.
 */

export type ContratoResumo = {
  id: string;
  status: StatusContrato;
  prestadoraNome: string;
  papeisPermitidos: PapelDeContrato[];
};

export const SERVICOS = ["portaria", "vigilancia"] as const;

export type Proposta = {
  localOrgId: string;
  empreendimentoId: string;
  servico: (typeof SERVICOS)[number];
  papeisPermitidos: PapelDeContrato[];
  inicio?: string | undefined;
  fim?: string | undefined;
};

export interface ContratosRepo {
  porId(ctx: Contexto, id: string): Promise<ContratoResumo | null>;
  propor(ctx: Contexto, proposta: Proposta): Promise<string>;
  aceitar(ctx: Contexto, id: string): Promise<void>;
  atribuirFuncionario(
    ctx: Contexto,
    contratoId: string,
    usuarioId: string,
    papel: PapelDeContrato,
  ): Promise<void>;
  suspenderFuncionario(
    ctx: Contexto,
    contratoId: string,
    usuarioId: string,
    motivo: string,
  ): Promise<void>;
  /** Desativa todos os escopos do contrato na mesma transação. */
  encerrar(ctx: Contexto, id: string, motivo: string): Promise<void>;
}

export type DepsDeContratos = { repo: ContratosRepo };

/** Códigos que as funções do banco levantam (prefixo da mensagem da exceção). */
export const CODIGOS_DO_BANCO = [
  "SEM_PERMISSAO",
  "CONTRATO_NAO_PROPOSTO",
  "CONTRATO_INATIVO",
  "PAPEL_FORA_DO_CONTRATO",
  "FUNCIONARIO_FORA_DA_PRESTADORA",
  "ESCOPO_CONFLITANTE",
  "ESCOPO_NAO_ENCONTRADO",
  "MOTIVO_OBRIGATORIO",
] as const;
export type CodigoDoBanco = (typeof CODIGOS_DO_BANCO)[number];

/** O adaptador converte a exceção do Postgres neste erro; o resto sobe como está. */
export class ErroDeContrato extends Error {
  constructor(readonly codigo: CodigoDoBanco) {
    super(codigo);
    this.name = "ErroDeContrato";
  }
}

export const MSG_CONTRATOS = {
  proposto: "Contrato enviado. Falta o condomínio aceitar.",
  aceito: "Contrato aceito. A prestadora já pode atribuir funcionários.",
  atribuido: "Funcionário atribuído a este condomínio.",
  suspenso: "Funcionário suspenso neste condomínio.",
  encerrado: "Contrato encerrado. Os funcionários da prestadora saíram.",
  naoEncontrado: "Não achamos esse contrato.",
  naoProposto: "Este contrato não está aguardando aceite.",
  jaEncerrado: "Este contrato já está encerrado.",
  inativo: "O contrato não está ativo. Reative ou proponha outro.",
  papelFora: "Esse papel não faz parte do contrato.",
  foraDaPrestadora: "Essa pessoa não é da equipe da prestadora.",
  conflito: "Essa pessoa já tem acesso a este condomínio por outro vínculo.",
  escopoNaoEncontrado: "Essa pessoa não está ativa neste contrato.",
  motivo: "Conte o motivo. Ele fica no histórico do condomínio.",
  papeisInvalidos: "Escolha recepcionista, auditor ou os dois.",
} as const;

const FALHAS: Record<CodigoDoBanco, Falha> = {
  SEM_PERMISSAO: falha("SEM_PERMISSAO", MSG.semPermissao),
  CONTRATO_NAO_PROPOSTO: falha("CONFLITO", MSG_CONTRATOS.naoProposto),
  CONTRATO_INATIVO: falha("CONFLITO", MSG_CONTRATOS.inativo),
  PAPEL_FORA_DO_CONTRATO: falha("ENTRADA_INVALIDA", MSG_CONTRATOS.papelFora),
  FUNCIONARIO_FORA_DA_PRESTADORA: falha(
    "ENTRADA_INVALIDA",
    MSG_CONTRATOS.foraDaPrestadora,
  ),
  ESCOPO_CONFLITANTE: falha("CONFLITO", MSG_CONTRATOS.conflito),
  ESCOPO_NAO_ENCONTRADO: falha(
    "NAO_ENCONTRADO",
    MSG_CONTRATOS.escopoNaoEncontrado,
  ),
  MOTIVO_OBRIGATORIO: falha("ENTRADA_INVALIDA", MSG_CONTRATOS.motivo, {
    motivo: MSG_CONTRATOS.motivo,
  }),
};

/** Recusa conhecida do banco vira Falha com texto; erro desconhecido sobe. */
export async function comRecusaDoBanco<T>(
  acao: () => Promise<T>,
): Promise<{ ok: true; valor: T } | Falha> {
  try {
    return { ok: true, valor: await acao() };
  } catch (erro) {
    if (erro instanceof ErroDeContrato) return FALHAS[erro.codigo];
    throw erro;
  }
}

export const esquemaDeMotivo = z
  .string()
  .trim()
  .min(1, MSG_CONTRATOS.motivo)
  .max(500, "Use no máximo 500 caracteres.");

export const esquemaDePapel = z.enum(
  PAPEIS_DE_CONTRATO,
  MSG_CONTRATOS.papelFora,
);

export const esquemaDeProposta = z
  .object({
    localOrgId: z.uuid(),
    empreendimentoId: z.uuid(),
    servico: z.enum(SERVICOS, "Escolha o serviço."),
    papeisPermitidos: z
      .array(z.string())
      .refine(papeisPermitidosValidos, MSG_CONTRATOS.papeisInvalidos)
      .transform((v) => v as PapelDeContrato[]),
    inicio: z.iso.date("Data inválida.").optional(),
    fim: z.iso.date("Data inválida.").optional(),
  })
  .refine((p) => !p.inicio || !p.fim || p.fim >= p.inicio, {
    message: "O fim não pode ser antes do início.",
    path: ["fim"],
  });
