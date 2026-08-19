import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/lib/env";

import * as schema from "./schema";

/**
 * Conexao Drizzle. Nao instancia no import — sem DATABASE_URL o app ainda
 * sobe (I1). I2 passa a exigir URL ao nascer a primeira tabela.
 *
 * `prepare: false` e exigencia do pooler do Supabase em transacao.
 */
export function createDb(url: string) {
  const client = postgres(url, { prepare: false, max: 1 });
  return { db: drizzle(client, { schema }), client };
}

export function getDatabaseUrl(): string | undefined {
  return env.DATABASE_URL;
}
