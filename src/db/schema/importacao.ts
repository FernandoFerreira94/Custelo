import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { empreendimentos, organizacoes } from "./tenancy";

export const importacaoCadastroEnum = pgEnum("importacao_cadastro", [
  "unidades",
  "moradores",
  "lojistas",
  "funcionarios",
  "autorizados",
  "areas_comuns",
]);
export const importacaoStatusEnum = pgEnum("importacao_status", [
  "conferindo",
  "confirmada",
  "cancelada",
  "desfeita",
]);
export const importacaoSituacaoEnum = pgEnum("importacao_situacao", [
  "ok",
  "aviso",
  "erro",
  "duplicado",
  "ignorada",
]);
export const importacaoDecisaoEnum = pgEnum("importacao_decisao", [
  "criar",
  "atualizar",
  "ignorar",
]);

/** Um lote enviado por planilha. O arquivo original não é guardado, só as linhas normalizadas. */
export const importacoes = pgTable(
  "importacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    cadastro: importacaoCadastroEnum("cadastro").notNull(),
    arquivoNome: text("arquivo_nome").notNull(),
    linhasTotal: integer("linhas_total").notNull(),
    status: importacaoStatusEnum("status").notNull().default("conferindo"),
    criadoPor: uuid("criado_por").notNull(),
    confirmadoPor: uuid("confirmado_por"),
    confirmadoEm: timestamp("confirmado_em", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("importacoes_emp_idx").on(t.empreendimentoId, t.createdAt)],
);

export const importacaoLinhas = pgTable(
  "importacao_linhas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    importacaoId: uuid("importacao_id")
      .notNull()
      .references(() => importacoes.id, { onDelete: "restrict" }),
    numeroLinha: integer("numero_linha").notNull(),
    dados: jsonb("dados").$type<Record<string, unknown>>().notNull(),
    situacao: importacaoSituacaoEnum("situacao").notNull(),
    problemas: jsonb("problemas").$type<string[]>().notNull().default([]),
    decisao: importacaoDecisaoEnum("decisao"),
    registroId: uuid("registro_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("importacao_linhas_numero_uidx").on(
      t.importacaoId,
      t.numeroLinha,
    ),
    index("importacao_linhas_emp_idx").on(t.empreendimentoId, t.createdAt),
  ],
);
