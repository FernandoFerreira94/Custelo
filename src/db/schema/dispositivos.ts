import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { usuarios } from "./tenancy";

/**
 * Código curto do local (IP.3, migration 0014). Escrita só por
 * `app.criar_codigo_local` / `app.revogar_codigo_local`; o app só lê.
 */
export const locaisCodigo = pgTable(
  "locais_codigo",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").notNull(),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    codigo: text("codigo").notNull(),
    criadoPor: uuid("criado_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
    revogadoEm: timestamp("revogado_em", { withTimezone: true }),
    revogadoPor: uuid("revogado_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [index("locais_codigo_emp_idx").on(t.orgId, t.empreendimentoId)],
);

/** Aparelho pareado a um local. Só o hash do token: o token vive no cookie httpOnly. */
export const aparelhosPareados = pgTable(
  "aparelhos_pareados",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").notNull(),
    empreendimentoId: uuid("empreendimento_id").notNull(),
    localCodigoId: uuid("local_codigo_id")
      .notNull()
      .references(() => locaisCodigo.id, { onDelete: "restrict" }),
    tokenSha256: text("token_sha256").notNull(),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ultimoUsoEm: timestamp("ultimo_uso_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revogadoEm: timestamp("revogado_em", { withTimezone: true }),
    revogadoPor: uuid("revogado_por").references(() => usuarios.id, {
      onDelete: "restrict",
    }),
  },
  (t) => [
    index("aparelhos_pareados_emp_idx").on(t.orgId, t.empreendimentoId),
    index("aparelhos_pareados_codigo_idx").on(t.localCodigoId),
  ],
);
