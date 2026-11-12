import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/db/client";
import * as schema from "@/db/schema";
import { type TenantContext, withAppRls } from "@/db/session";

export type TenantDb = PostgresJsDatabase<typeof schema>;

// Um client por instancia (serverless reaproveita entre requests).
// Abrir e fechar conexao a cada chamada esgota o pooler do Supabase.
let client: ReturnType<typeof postgres> | null = null;

export function getClient(): ReturnType<typeof postgres> {
  if (client) return client;
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  client = postgres(url, { prepare: false, max: 1 });
  return client;
}

export async function withTenantDb<T>(
  context: TenantContext,
  fn: (db: TenantDb) => Promise<T>,
): Promise<T> {
  const root = getClient();
  return withAppRls(root, context, async (tx) => {
    // TransactionSql nao expoe `options`, e o drizzle le `options.parsers` ao
    // montar todo SELECT. Emprestamos as do client raiz (so leitura).
    const scoped = tx as unknown as postgres.Sql;
    if (!scoped.options) {
      Object.defineProperty(scoped, "options", { value: root.options });
    }
    return fn(drizzle(scoped, { schema }));
  });
}
