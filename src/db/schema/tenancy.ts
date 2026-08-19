import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  empreendimentoStatusEnum,
  organizacaoStatusEnum,
  papelCodigoEnum,
  usuarioStatusEnum,
} from "./enums";

/**
 * Conta contratante. Nao carrega org_id/empreendimento_id — e a raiz do tenant.
 */
export const organizacoes = pgTable(
  "organizacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    slug: text("slug").notNull(),
    status: organizacaoStatusEnum("status").notNull().default("ativa"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("organizacoes_slug_uidx").on(table.slug)],
);

/**
 * Empreendimento dentro de uma organizacao.
 * `empreendimento_id` espelha `id` via trigger na migration (ADR-004).
 */
export const empreendimentos = pgTable(
  "empreendimentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    nome: text("nome").notNull(),
    slug: text("slug").notNull(),
    status: empreendimentoStatusEnum("status").notNull().default("ativo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("empreendimentos_empreendimento_id_idx").on(table.empreendimentoId),
    index("empreendimentos_org_id_idx").on(table.orgId),
    uniqueIndex("empreendimentos_org_slug_uidx").on(table.orgId, table.slug),
  ],
);

/** Perfil de usuario vinculado ao Supabase Auth (id = auth.users.id). */
export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  nome: text("nome").notNull(),
  status: usuarioStatusEnum("status").notNull().default("convite_pendente"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Catalogo de papeis — referencia global, sem colunas de tenant. */
export const papeis = pgTable(
  "papeis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codigo: papelCodigoEnum("codigo").notNull(),
    nome: text("nome").notNull(),
    descricao: text("descricao"),
    nivel: text("nivel").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("papeis_codigo_uidx").on(table.codigo)],
);

/**
 * Escopo efetivo do usuario. Fonte de verdade alem do JWT (ADR-005).
 * `empreendimento_id = ORG_SCOPE_SENTINEL` => escopo de org inteira.
 */
export const ORG_SCOPE_SENTINEL = "00000000-0000-0000-0000-000000000001";

export const escoposUsuario = pgTable(
  "escopos_usuario",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "cascade" }),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    papelId: uuid("papel_id")
      .notNull()
      .references(() => papeis.id, { onDelete: "restrict" }),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("escopos_usuario_empreendimento_id_idx").on(table.empreendimentoId),
    index("escopos_usuario_org_id_idx").on(table.orgId),
    index("escopos_usuario_usuario_id_idx").on(table.usuarioId),
    uniqueIndex("escopos_usuario_scope_uidx").on(
      table.usuarioId,
      table.orgId,
      table.empreendimentoId,
    ),
  ],
);
