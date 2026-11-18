import type { EntradaAuditoria } from "@/application/auditoria/ports";
import type { Contexto } from "@/application/auth/contexto";
import type { Estado, TipoEvento } from "@/domain/custodia/estados";
import type { Resultado } from "@/lib/resultado";

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

export interface CustodiaTx {
  eventoPorId(id: string): Promise<{
    encomendaId: string;
    sequencia: number;
    estadoNovo: Estado;
  } | null>;
  /** SELECT ... FOR UPDATE: segura a encomenda até o fim da transação. */
  travarEncomenda(id: string): Promise<EncomendaTravada | null>;
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
