import {
  boolean,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { contatoCanalEnum, contatoStatusEnum } from "./enums";
import { pessoas } from "./pessoas-vinculos";
import { empreendimentos, organizacoes } from "./tenancy";

/** Contato de uma pessoa. O aviso so vai para contato com consentimento (D3). */
export const contatos = pgTable(
  "contatos",
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
    canal: contatoCanalEnum("canal").notNull(),
    valor: text("valor").notNull(),
    status: contatoStatusEnum("status")
      .notNull()
      .default("precisa_confirmacao"),
    ordem: smallint("ordem").notNull().default(0),
    consentimentoEm: timestamp("consentimento_em", { withTimezone: true }),
    /** 'gestor' ou 'opt_in'. Nunca vem da planilha. */
    consentimentoOrigem: text("consentimento_origem"),
    consentimentoPor: uuid("consentimento_por"),
    ativo: boolean("ativo").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("contatos_ativo_uidx")
      .on(table.empreendimentoId, table.pessoaId, table.canal, table.valor)
      .where(sql`ativo`),
    index("contatos_pessoa_idx").on(
      table.empreendimentoId,
      table.pessoaId,
      table.ordem,
    ),
  ],
);
