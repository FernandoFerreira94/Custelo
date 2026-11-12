import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { organizacoes } from "./tenancy";

/** Trilha append-only: o banco recusa UPDATE e DELETE (migration 0010). */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => organizacoes.id, { onDelete: "restrict" }),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    atorUsuarioId: uuid("ator_usuario_id"),
    acao: text("acao").notNull(),
    alvoTipo: text("alvo_tipo").notNull(),
    alvoId: uuid("alvo_id"),
    antes: jsonb("antes").$type<Record<string, unknown>>(),
    depois: jsonb("depois").$type<Record<string, unknown>>(),
    motivo: text("motivo"),
    origem: text("origem").notNull(),
    requestId: text("request_id"),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_emp_idx").on(t.empreendimentoId, t.criadoEm),
    index("audit_log_org_idx").on(t.orgId, t.criadoEm),
    index("audit_log_alvo_idx").on(t.alvoTipo, t.alvoId),
  ],
);
