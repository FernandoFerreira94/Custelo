import type { EntradaAuditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import type { Estado, TipoEvento } from "@/domain/custodia/estados";
import type { Prazos } from "@/domain/custodia/situacao";
import type { Resultado } from "@/lib/resultado";

import type { EventoDaLinha, Rotulos } from "./linha-do-tempo";

export type CampoProjetado =
  | "unidade_id"
  | "pessoa_id"
  | "nome_destinatario"
  | "local_guarda_id"
  | "ponto_id";

/** `dados` nunca leva CPF, telefone, foto ou texto bruto da etiqueta. */
export type DadosEvento = {
  de?: Partial<Record<CampoProjetado, string | null>>;
  para?: Partial<Record<CampoProjetado, string | null>>;
  [extra: string]: unknown;
};

export type NovoEvento = {
  /** UUIDv7 gerado por quem registra: é a chave de idempotência. */
  id: string;
  tipo: TipoEvento;
  dados?: DadosEvento;
  motivo?: string;
  origem: "online" | "offline";
  superficie: "ops" | "web";
  dispositivoId?: string;
  ocorridoEm: Date;
  lembrete?: boolean;
};

export type EventoParaGravar = NovoEvento & {
  dados: DadosEvento;
  encomendaId: string;
  sequencia: number;
  estadoAnterior: Estado | null;
  estadoNovo: Estado;
  atorTipo: "usuario" | "sistema";
  atorUsuarioId: string | null;
};

/** Colunas de `encomendas` aceitas no insert. Estado e versão só mudam por evento. */
export type NovaEncomenda = {
  id: string;
  codigoCurto: string;
  pontoId: string | null;
  transportadora?: string | null;
  rastreio?: string | null;
  volumes?: number;
  porte?: string | null;
  excepcional?: string | null;
  origem: "online" | "offline";
  ocorridoEm: Date;
  recebidoPor: string;
};

export type EncomendaTravada = {
  estado: Estado;
  versao: number;
  unidadeId: string | null;
  pessoaId: string | null;
  localGuardaId: string | null;
  pontoId: string | null;
};

/** Prateleira com a ocupação atual (encomendas ativas guardadas nela). */
export type LocalGuarda = {
  id: string;
  codigo: string;
  pontoId: string;
  capacidade: number | null;
  volumeGrande: boolean;
  ativo: boolean;
  usado: number;
};

export interface CustodiaTx {
  eventoPorId(id: string): Promise<{
    encomendaId: string;
    sequencia: number;
    estadoNovo: Estado;
  } | null>;
  /**
   * Lê o estado atual. A garantia de ordem é do banco: o trigger trava a linha ao
   * gravar o evento e recusa sequência divergente (vira CONFLITO).
   */
  travarEncomenda(id: string): Promise<EncomendaTravada | null>;
  localPorId(id: string): Promise<LocalGuarda | null>;
  /** Usada pelo recebimento (I5). */
  criarEncomenda(e: NovaEncomenda): Promise<void>;
  inserirEvento(e: EventoParaGravar): Promise<void>;
  /** Mesma transação do evento: sem auditoria, sem evento. */
  auditar(e: EntradaAuditoria): Promise<void>;
}

export interface CustodiaRepo {
  /** Roda `fn` numa transação com RLS. Se `fn` devolver `ok: false` ou lançar, desfaz tudo. */
  naTransacao<T>(
    ctx: Contexto,
    fn: (tx: CustodiaTx) => Promise<Resultado<T>>,
  ): Promise<Resultado<T>>;
}

export type PrateleiraEntrada = {
  /** Ausente = prateleira nova. */
  id?: string;
  codigo: string;
  capacidade: number | null;
  volumeGrande: boolean;
};

export type PlanoPrateleiras = {
  criar: PrateleiraEntrada[];
  atualizar: (PrateleiraEntrada & { id: string })[];
  desativar: string[];
};

export interface LocaisRepo {
  /** Prateleiras ativas do ponto com a ocupação; `null` se o ponto não é deste empreendimento. */
  locaisDoPonto(ctx: Contexto, pontoId: string): Promise<LocalGuarda[] | null>;
  /**
   * Aplica tudo numa transação. Reconfere sob trava as prateleiras a desativar e
   * desfaz se alguma ganhou encomenda: devolve quantas encomendas bloquearam.
   */
  aplicarPrateleiras(
    ctx: Contexto,
    pontoId: string,
    plano: PlanoPrateleiras,
  ): Promise<{ comEncomenda: number }>;
}

// ---- Consultas (leitura) ----

export type FiltroFila = "prontas" | "falha" | "prazo" | "naoIdent";

export type Pagina<T> = { itens: T[]; proximo: string | null };

export type EstadoComIdade = { estado: Estado; ocorridoEm: Date };

/** Uma linha por unidade com encomenda ativa; sem destino = uma linha por encomenda. */
export type LinhaFilaRepo = {
  chave: string;
  unidadeId: string | null;
  unidadeCodigo: string | null;
  destinatario: string | null;
  encomendas: number;
  volumes: number;
  localMaisAntiga: string | null;
  idMaisAntiga: string;
  ocorridoEmMaisAntiga: Date;
  itens: EstadoComIdade[];
};

export type LinhaEncomendaRepo = {
  id: string;
  codigoCurto: string;
  estado: Estado;
  unidadeCodigo: string | null;
  destinatario: string | null;
  local: string | null;
  ocorridoEm: Date;
  recebidoPor: string | null;
};

export type FiltrosLista = {
  estado?: Estado;
  filtro?: FiltroFila;
  busca?: string;
  unidadeId?: string;
  de?: Date;
  ate?: Date;
  cursor?: string;
};

export type DetalheRepo = {
  id: string;
  codigoCurto: string;
  estado: Estado;
  versao: number;
  ocorridoEm: Date;
  registradoEm: Date;
  origem: "online" | "offline";
  volumes: number;
  porte: string | null;
  excepcional: string | null;
  transportadora: string | null;
  rastreio: string | null;
  unidade: { id: string; codigo: string } | null;
  destinatario: string | null;
  local: { id: string; codigo: string } | null;
  ponto: { id: string; nome: string } | null;
  recebidoPor: string | null;
  outrasAtivas: { id: string; codigoCurto: string; estado: Estado }[];
};

export type LocalComOcupacao = LocalGuarda & { pontoNome: string };

export interface ConsultasCustodiaRepo {
  prazos(ctx: Contexto): Promise<Prazos>;
  filaPorUnidade(
    ctx: Contexto,
    f: { busca?: string; filtro?: FiltroFila; cursor?: string },
    p: Prazos,
  ): Promise<Pagina<LinhaFilaRepo>>;
  listaEncomendas(
    ctx: Contexto,
    f: FiltrosLista,
    p: Prazos,
  ): Promise<Pagina<LinhaEncomendaRepo>>;
  /** Contagem por estado e as atrasadas, só das ativas. */
  contadores(
    ctx: Contexto,
    p: Prazos,
  ): Promise<{
    todas: number;
    prontas: number;
    falha: number;
    prazo: number;
    naoIdent: number;
  }>;
  detalhe(ctx: Contexto, id: string): Promise<DetalheRepo | null>;
  eventos(
    ctx: Contexto,
    id: string,
  ): Promise<{ eventos: EventoDaLinha[]; rotulos: Rotulos }>;
  locaisComOcupacao(
    ctx: Contexto,
    pontoId?: string,
  ): Promise<LocalComOcupacao[]>;
}
