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
  return withAppRls(getClient(), context, async (tx) =>
    // TransactionSql nao expoe end/options, que o drizzle nao usa dentro da transacao.
    fn(drizzle(tx as unknown as postgres.Sql, { schema })),
  );
}
