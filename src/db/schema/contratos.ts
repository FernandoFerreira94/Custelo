import {
  date,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import {
  contratoServicoTipoEnum,
  contratoStatusEnum,
  papelCodigoEnum,
} from "./enums";
import { empreendimentos, organizacoes, usuarios } from "./tenancy";

/**
 * Contrato entre uma prestadora (ex.: Selva) e um condominio (D20, migration 0013).
 * O dado continua do condominio. Escrita so pelas funcoes `app.*_contrato`; o app so le.
 * Checks, indice parcial de contrato vivo e RLS das duas pontas vivem na migration.
 */
export const contratosServico = pgTable(
  "contratos_servico",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    prestadoraOrgId: uuid("prestadora_org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    localOrgId: uuid("local_org_id").notNull(),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    servico: contratoServicoTipoEnum("servico").notNull(),
    /** Subconjunto de recepcionista e auditor; nunca papel de gestao (check no banco). */
    papeisPermitidos: papelCodigoEnum("papeis_permitidos").array().notNull(),
    status: contratoStatusEnum("status").notNull().default("proposto"),
    inicio: date("inicio").notNull().defaultNow(),
    fim: date("fim"),
    propostoPor: uuid("proposto_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
    aceitoPor: uuid("aceito_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
    aceitoEm: timestamp("aceito_em", { withTimezone: true }),
    encerradoPor: uuid("encerrado_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
    encerradoEm: timestamp("encerrado_em", { withTimezone: true }),
    motivo: text("motivo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "contratos_servico_local_fk",
      columns: [t.empreendimentoId, t.localOrgId],
      foreignColumns: [empreendimentos.id, empreendimentos.orgId],
    }).onDelete("restrict"),
    unique("contratos_servico_id_local_uq").on(
      t.id,
      t.localOrgId,
      t.empreendimentoId,
    ),
    index("contratos_servico_prestadora_idx").on(t.prestadoraOrgId),
    index("contratos_servico_local_idx").on(t.localOrgId, t.empreendimentoId),
  ],
);
