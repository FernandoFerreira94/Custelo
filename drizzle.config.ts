import { defineConfig } from "drizzle-kit";

/**
 * ADR-003 / ADR-006: PostgreSQL no Supabase, Drizzle SQL-first, migrations
 * versionadas em repositorio e aplicadas por pipeline (ADR-019).
 *
 * Migrations de dominio NAO sao geradas nesta fase de preparacao.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
