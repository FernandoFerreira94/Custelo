import type { Auditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import type { TipoUnidade } from "@/domain/estrutura/unidade";

export type NovaArea = {
  nome: string;
  parentId?: string | null;
  ordem?: number;
};

export type NovaUnidade = {
  codigo: string;
  tipo: TipoUnidade;
  areaId?: string | null;
  numero?: string | null;
  apelidos: string[];
  nome?: string | null;
  responsavelPessoaId?: string | null;
  avisarResponsavel: boolean;
};

export type NovoPonto = { nome: string; funcionamento?: string | null };

export type NoArvore = {
  id: string;
  nome: string;
  ordem: number;
  unidadesAtivas: number;
  filhos: NoArvore[];
};

export type UnidadeResumo = {
  id: string;
  codigo: string;
  tipo: TipoUnidade;
  areaId: string | null;
  ativo: boolean;
  apelidos: string[];
};

/** Uma unidade na árvore: o bastante para o selo e o painel, sem ir ao banco de novo. */
export type UnidadeNaArvore = {
  id: string;
  codigo: string;
  tipo: TipoUnidade;
  areaId: string | null;
  apelidos: string[];
  /** Nomes de quem mora (titular, morador, inquilino, dependente) com vínculo ativo. */
  moradores: string[];
  /** Ninguém com vínculo ativo que recebe aviso E contato com consentimento. */
  semContato: boolean;
};

export type Pagina<T> = { itens: T[]; proximo?: string };

export type FiltroDeUnidades = {
  busca?: string;
  areaId?: string;
  tipo?: TipoUnidade;
  /** Só unidades sem vínculo ativo com `recebe_aviso` e contato consentido. */
  semContato?: boolean;
  /** Só as desativadas. Sem isso, a lista mostra só as ativas. */
  inativas?: boolean;
  cursor?: string;
};

export type ContagensDeUnidades = {
  todas: number;
  semContato: number;
  areasComuns: number;
  inativas: number;
};

/** Plano de uma geração em lote: tudo entra numa transação ou nada entra. */
export type PlanoDeEstrutura = {
  blocos: {
    nome: string;
    andares: {
      andar: number;
      unidades: { numero: string; codigo: string }[];
    }[];
  }[];
};

/** Lançado pelo repositório quando o banco recusa a árvore com ciclo (`AREA_CICLO`). */
export class AreaEmCiclo extends Error {
  constructor() {
    super("AREA_CICLO");
    this.name = "AreaEmCiclo";
  }
}

export interface EstruturaRepo {
  arvore(ctx: Contexto): Promise<NoArvore[]>;
  /** Todas as unidades ativas (até o limite do repositório) para montar a árvore. */
  resumoDeUnidades(ctx: Contexto): Promise<UnidadeNaArvore[]>;
  contagensDeUnidades(ctx: Contexto): Promise<ContagensDeUnidades>;
  listarUnidades(
    ctx: Contexto,
    f: FiltroDeUnidades,
  ): Promise<Pagina<UnidadeResumo>>;
  unidadePorCodigoNormalizado(
    ctx: Contexto,
    codigoNormalizado: string,
  ): Promise<{ id: string } | null>;
  /** Quais destes códigos normalizados já existem (uma consulta só, sem N+1). */
  codigosNormalizadosExistentes(
    ctx: Contexto,
    codigosNormalizados: string[],
  ): Promise<string[]>;
  unidadePorId(
    ctx: Contexto,
    id: string,
  ): Promise<{ id: string; codigo: string } | null>;
  criarArea(ctx: Contexto, a: NovaArea): Promise<{ id: string }>;
  atualizarArea(
    ctx: Contexto,
    id: string,
    a: Partial<NovaArea> & { ativo?: boolean },
  ): Promise<void>;
  criarUnidades(ctx: Contexto, u: NovaUnidade[]): Promise<{ ids: string[] }>;
  /** Blocos, andares e unidades numa transação só. */
  criarEstruturaEmLote(
    ctx: Contexto,
    plano: PlanoDeEstrutura,
  ): Promise<{ areas: number; unidades: number }>;
  atualizarUnidade(
    ctx: Contexto,
    id: string,
    u: Partial<NovaUnidade> & { ativo?: boolean },
  ): Promise<void>;
  contarUnidadesAtivasNaArea(ctx: Contexto, areaId: string): Promise<number>;
  contarVinculosAtivosDaUnidade(
    ctx: Contexto,
    unidadeId: string,
  ): Promise<number>;
  criarPonto(ctx: Contexto, p: NovoPonto): Promise<{ id: string }>;
  atualizarPonto(
    ctx: Contexto,
    id: string,
    p: Partial<NovoPonto> & { ativo?: boolean },
  ): Promise<void>;
}

export type DepsDeEstrutura = { repo: EstruturaRepo; auditoria: Auditoria };

export const MSG_ESTRUTURA = {
  ciclo: "Uma área não pode ficar dentro dela mesma. Escolha outro bloco.",
  responsavel: "Escolha quem recebe o aviso desta área.",
} as const;
