import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { empreendimentos, organizacoes } from "./tenancy";

/** Camada generica configuravel (bloco, torre, quadra…). */
export const areas = pgTable(
  "areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    parentId: uuid("parent_id"),
    nome: text("nome").notNull(),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("areas_empreendimento_id_idx").on(table.empreendimentoId),
    index("areas_org_id_idx").on(table.orgId),
    index("areas_parent_id_idx").on(table.parentId),
  ],
);

/** Unidade operacional — destino obrigatorio de encomenda e vinculo. */
export const unidades = pgTable(
  "unidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    areaId: uuid("area_id").references(() => areas.id, {
      onDelete: "set null",
    }),
    codigo: text("codigo").notNull(),
    nome: text("nome"),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("unidades_empreendimento_id_idx").on(table.empreendimentoId),
    index("unidades_org_id_idx").on(table.orgId),
    index("unidades_area_id_idx").on(table.areaId),
    uniqueIndex("unidades_emp_codigo_uidx").on(
      table.empreendimentoId,
      table.codigo,
    ),
  ],
);

/** Ponto fisico de recebimento dentro do empreendimento. */
export const pontosRecebimento = pgTable(
  "pontos_recebimento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    nome: text("nome").notNull(),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("pontos_recebimento_empreendimento_id_idx").on(
      table.empreendimentoId,
    ),
    index("pontos_recebimento_org_id_idx").on(table.orgId),
  ],
);
