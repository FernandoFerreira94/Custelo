import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { empreendimentos, organizacoes } from "./tenancy";

const orgRef = () =>
  uuid("org_id")
    .notNull()
    .references(() => organizacoes.id, { onDelete: "restrict" });
const empRef = () =>
  uuid("empreendimento_id")
    .notNull()
    .references(() => empreendimentos.id, { onDelete: "restrict" });
const ts = (name: string) => timestamp(name, { withTimezone: true });

/** Foto da etiqueta (bucket privado `etiquetas`). FKs compostas na migration 0016. */
export const fotosEtiqueta = pgTable(
  "fotos_etiqueta",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: orgRef(),
    empreendimentoId: empRef(),
    encomendaId: uuid("encomenda_id").notNull().unique(),
    caminho: text("caminho").notNull(),
    sha256: text("sha256").notNull(),
    bytes: integer("bytes").notNull(),
    mime: text("mime").notNull(),
    enviadaEm: ts("enviada_em").notNull().defaultNow(),
    expurgadaEm: ts("expurgada_em"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("fotos_emp_idx").on(t.empreendimentoId, sql`${t.createdAt} desc`),
  ],
);

export type ResultadoLeitura =
  "ok" | "timeout" | "indisponivel" | "ilegivel" | "limite" | "recusado";
export type Confianca = "alta" | "media" | "baixa" | "nenhuma";

/** Uma leitura da etiqueta: o que foi sugerido, custo, latência e se o porteiro aceitou. */
export const leiturasEtiqueta = pgTable(
  "leituras_etiqueta",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: orgRef(),
    empreendimentoId: empRef(),
    encomendaId: uuid("encomenda_id"),
    provedor: text("provedor").notNull(),
    modelo: text("modelo").notNull(),
    versaoPrompt: text("versao_prompt").notNull(),
    latenciaMs: integer("latencia_ms").notNull(),
    resultado: text("resultado").$type<ResultadoLeitura>().notNull(),
    confianca: text("confianca").$type<Confianca>().notNull(),
    unidadeLida: text("unidade_lida"),
    nomeLido: text("nome_lido"),
    unidadeSugeridaId: uuid("unidade_sugerida_id"),
    pessoaSugeridaId: uuid("pessoa_sugerida_id"),
    aceita: boolean("aceita"),
    tokensEntrada: integer("tokens_entrada"),
    tokensSaida: integer("tokens_saida"),
    custoMicroUsd: integer("custo_micro_usd"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("leituras_emp_idx").on(t.empreendimentoId, sql`${t.createdAt} desc`),
  ],
);

/** Pessoa que não está no cadastro: vira sugestão para o gestor (ninguém se cadastra sozinho). */
export const sugestoesCadastro = pgTable(
  "sugestoes_cadastro",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: orgRef(),
    empreendimentoId: empRef(),
    unidadeId: uuid("unidade_id").notNull(),
    nome: text("nome").notNull(),
    origem: text("origem").$type<"recebimento" | "retirada">().notNull(),
    encomendaId: uuid("encomenda_id"),
    status: text("status")
      .$type<"pendente" | "aceita" | "descartada">()
      .notNull()
      .default("pendente"),
    criadoPor: uuid("criado_por").notNull(),
    resolvidoPor: uuid("resolvido_por"),
    resolvidoEm: ts("resolvido_em"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("sugestoes_emp_idx").on(t.empreendimentoId, sql`${t.createdAt} desc`),
  ],
);
