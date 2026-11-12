import type { Auditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import type { Cadastro } from "@/domain/importacao/colunas";
import type {
  ContextoDeValidacao,
  SituacaoDaLinha,
} from "@/domain/importacao/validar-linha";

export type StatusDoLote =
  "conferindo" | "confirmada" | "cancelada" | "desfeita";
export type SituacaoNoLote = SituacaoDaLinha | "ignorada";
export type DecisaoDaLinha = "criar" | "atualizar" | "ignorar";

export type Lote = {
  id: string;
  cadastro: Cadastro;
  arquivoNome: string;
  linhasTotal: number;
  status: StatusDoLote;
  criadoPor: string;
  confirmadoEm: Date | null;
};

/** Lote que ficou pela metade: aparece para retomar. */
export type LoteEmConferencia = Pick<
  Lote,
  "id" | "cadastro" | "arquivoNome" | "linhasTotal"
> & { criadoEm: Date };

export type LinhaDoLote = {
  id: string;
  numeroLinha: number;
  /** Já normalizados; o arquivo original nunca é guardado. */
  dados: Record<string, unknown>;
  situacao: SituacaoNoLote;
  problemas: string[];
  decisao: DecisaoDaLinha | null;
  /** O que a linha criou, para desfazer sem apagar. */
  registroId: string | null;
};

export type LinhaNova = Pick<
  LinhaDoLote,
  "numeroLinha" | "dados" | "situacao" | "problemas"
>;

export type ResultadoDaGravacao = {
  criados: number;
  atualizados: number;
  ignorados: number;
};

/** Contexto que só o banco sabe; o resto (papel, data, vistos) o caso de uso acrescenta. */
export type ContextoDoBanco = Pick<
  ContextoDeValidacao,
  "codigosDeUnidade" | "pessoasPorUnidade" | "moradoresPorUnidade"
>;

export interface ImportacaoRepo {
  contextoDeValidacao(
    ctx: Contexto,
    cadastro: Cadastro,
  ): Promise<ContextoDoBanco>;
  criarLote(
    ctx: Contexto,
    e: { cadastro: Cadastro; arquivoNome: string; linhas: LinhaNova[] },
  ): Promise<{ id: string }>;
  buscarLote(ctx: Contexto, id: string): Promise<Lote | null>;
  lotesEmConferencia(ctx: Contexto): Promise<LoteEmConferencia[]>;
  cancelarLote(ctx: Contexto, id: string): Promise<void>;
  listarLinhas(ctx: Contexto, loteId: string): Promise<LinhaDoLote[]>;
  atualizarLinha(
    ctx: Contexto,
    linhaId: string,
    e: {
      dados?: Record<string, unknown>;
      situacao: SituacaoNoLote;
      problemas: string[];
      decisao?: DecisaoDaLinha | null;
    },
  ): Promise<void>;
  /**
   * Grava os cadastros das linhas e marca o lote como confirmado, tudo numa
   * transação só: ou o lote inteiro entra, ou nada entra.
   */
  gravarLote(
    ctx: Contexto,
    e: { lote: Lote; linhas: LinhaDoLote[]; agora: Date },
  ): Promise<ResultadoDaGravacao | null>;
  /** Inativa e encerra o que o lote criou. Nunca apaga. */
  desfazerLote(
    ctx: Contexto,
    e: { lote: Lote; linhas: LinhaDoLote[]; agora: Date },
  ): Promise<{ desfeitos: number }>;
}

export type DepsDeImportacao = {
  repo: ImportacaoRepo;
  auditoria: Auditoria;
  agora: () => Date;
};

export const CADASTROS_IMPORTAVEIS: readonly Cadastro[] = [
  "unidades",
  "moradores",
  "lojistas",
  "autorizados",
  "areas_comuns",
];

export const MSG_FUNCIONARIOS =
  "Funcionários ainda não podem ser importados: os convites são criados e enviados pela tela Equipe.";
