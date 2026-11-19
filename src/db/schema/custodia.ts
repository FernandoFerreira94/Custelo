import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { empreendimentos, organizacoes } from "./tenancy";

export const encomendaEstadoEnum = pgEnum("encomenda_estado", [
  "RECEBIDA",
  "IDENTIFICADA",
  "NAO_IDENTIFICADA",
  "AGUARDANDO_NOTIFICACAO",
  "NOTIFICADA",
  "FALHA_NOTIFICACAO",
  "RETIRADA",
  "DEVOLVIDA",
  "CANCELADA",
]);

const orgRef = () =>
  uuid("org_id")
    .notNull()
    .references(() => organizacoes.id, { onDelete: "restrict" });
const empRef = () =>
  uuid("empreendimento_id")
    .notNull()
    .references(() => empreendimentos.id, { onDelete: "restrict" });
const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Prazos por empreendimento (CFG-005). As FKs compostas vivem na migration 0015. */
export const empreendimentoConfig = pgTable("empreendimento_config", {
  empreendimentoId: uuid("empreendimento_id").primaryKey(),
  orgId: orgRef(),
  fuso: text("fuso").notNull().default("America/Sao_Paulo"),
  prazoLembreteDias: smallint("prazo_lembrete_dias").notNull().default(2),
  prazoLembreteLigado: boolean("prazo_lembrete_ligado").notNull().default(true),
  prazoAtrasoDias: smallint("prazo_atraso_dias").notNull().default(7),
  prazoAtrasoLigado: boolean("prazo_atraso_ligado").notNull().default(true),
  prazoDevolucaoDias: smallint("prazo_devolucao_dias").notNull().default(30),
  prazoDevolucaoLigado: boolean("prazo_devolucao_ligado")
    .notNull()
    .default(true),
  /** CFG-006 (I11). Kill switch da leitura por empreendimento (I5). */
  leituraAutomatica: boolean("leitura_automatica").notNull().default(true),
  fotoObrigatoria: boolean("foto_obrigatoria").notNull().default(true),
  leiturasPorDia: smallint("leituras_por_dia").notNull().default(600),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

/** Prateleiras de cada ponto de recebimento. */
export const locaisGuarda = pgTable("locais_guarda", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: orgRef(),
  empreendimentoId: empRef(),
  pontoId: uuid("ponto_id").notNull(),
  codigo: text("codigo").notNull(),
  capacidade: smallint("capacidade"),
  volumeGrande: boolean("volume_grande").notNull().default(false),
  ordem: smallint("ordem").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: ts("created_at").notNull().defaultNow(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

/** Estado materializado: só nasce por INSERT e só muda por evento (trigger). */
export const encomendas = pgTable(
  "encomendas",
  {
    id: uuid("id").primaryKey(),
    orgId: orgRef(),
    empreendimentoId: empRef(),
    estado: encomendaEstadoEnum("estado").notNull().default("RECEBIDA"),
    versao: integer("versao").notNull().default(0),
    unidadeId: uuid("unidade_id"),
    pessoaId: uuid("pessoa_id"),
    nomeDestinatario: text("nome_destinatario"),
    pontoId: uuid("ponto_id"),
    localGuardaId: uuid("local_guarda_id"),
    codigoCurto: text("codigo_curto").notNull(),
    transportadora: text("transportadora"),
    rastreio: text("rastreio"),
    volumes: smallint("volumes").notNull().default(1),
    porte: text("porte"),
    excepcional: text("excepcional"),
    observacao: text("observacao"),
    origem: text("origem").notNull(),
    ocorridoEm: ts("ocorrido_em").notNull(),
    registradoEm: ts("registrado_em").notNull().defaultNow(),
    recebidoPor: uuid("recebido_por").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("encomendas_lista_idx").on(
      t.empreendimentoId,
      sql`${t.createdAt} desc`,
      t.id,
    ),
    index("encomendas_codigo_idx").on(t.empreendimentoId, t.codigoCurto),
  ],
);

/** Append-only: o banco recusa UPDATE, DELETE e limpeza da tabela (migration 0015). */
export const custodyEvents = pgTable(
  "custody_events",
  {
    id: uuid("id").primaryKey(),
    orgId: orgRef(),
    empreendimentoId: empRef(),
    encomendaId: uuid("encomenda_id").notNull(),
    sequencia: integer("sequencia").notNull(),
    tipo: text("tipo").notNull(),
    estadoAnterior: encomendaEstadoEnum("estado_anterior"),
    estadoNovo: encomendaEstadoEnum("estado_novo").notNull(),
    dados: jsonb("dados").notNull().default({}),
    motivo: text("motivo"),
    atorTipo: text("ator_tipo").notNull(),
    atorUsuarioId: uuid("ator_usuario_id"),
    origem: text("origem").notNull(),
    dispositivoId: text("dispositivo_id"),
    ocorridoEm: ts("ocorrido_em").notNull(),
    registradoEm: ts("registrado_em").notNull().defaultNow(),
  },
  (t) => [
    index("ce_emp_idx").on(t.empreendimentoId, sql`${t.registradoEm} desc`),
  ],
);
