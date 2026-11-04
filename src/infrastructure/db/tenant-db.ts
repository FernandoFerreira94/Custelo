import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl } from "@/db/client";
import * as schema from "@/db/schema";
import { type TenantContext, withAppRls } from "@/db/session";

export type TenantDb = PostgresJsDatabase<typeof schema>;

export async function withTenantDb<T>(
  context: TenantContext,
  fn: (db: TenantDb) => Promise<T>,
): Promise<T> {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("DATABASE_UNAVAILABLE");
  }

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    return await withAppRls(sql, context, async (tx) => fn(drizzle(tx, { schema })));
  } finally {
    await sql.end({ timeout: 2 });
  }
}
