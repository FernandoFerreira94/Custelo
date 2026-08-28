import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { vinculoStatusEnum, vinculoTipoEnum } from "./enums";
import { unidades } from "./estrutura-fisica";
import { empreendimentos, organizacoes } from "./tenancy";

/** Pessoa cadastrada manualmente — escopo empreendimento. */
export const pessoas = pgTable(
  "pessoas",
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
    index("pessoas_empreendimento_id_idx").on(table.empreendimentoId),
    index("pessoas_org_id_idx").on(table.orgId),
  ],
);

/** Vinculo pessoa-unidade com vigencia. */
export const vinculos = pgTable(
  "vinculos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id")
      .notNull()
      .references(() => empreendimentos.id, { onDelete: "restrict" }),
    pessoaId: uuid("pessoa_id")
      .notNull()
      .references(() => pessoas.id, { onDelete: "restrict" }),
    unidadeId: uuid("unidade_id")
      .notNull()
      .references(() => unidades.id, { onDelete: "restrict" }),
    tipo: vinculoTipoEnum("tipo").notNull(),
    status: vinculoStatusEnum("status").notNull().default("ativo"),
    vigenciaInicio: timestamp("vigencia_inicio", { withTimezone: true })
      .notNull()
      .defaultNow(),
    vigenciaFim: timestamp("vigencia_fim", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("vinculos_empreendimento_id_idx").on(table.empreendimentoId),
    index("vinculos_org_id_idx").on(table.orgId),
    index("vinculos_pessoa_id_idx").on(table.pessoaId),
    index("vinculos_unidade_id_idx").on(table.unidadeId),
    uniqueIndex("vinculos_pessoa_unidade_uidx").on(
      table.pessoaId,
      table.unidadeId,
    ),
  ],
);
