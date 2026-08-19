import { readFileSync } from "node:fs";
import path from "node:path";

import postgres from "postgres";
import { afterAll, beforeAll } from "vitest";

const APP_ROLE = "custelo_app";

export const FIXTURE_ORG_A: TenantFixture = {
  orgId: "11111111-1111-4111-8111-111111111111",
  empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  userId: "aaaaaaaa-0000-4000-8000-000000000001",
};

export const FIXTURE_ORG_B: TenantFixture = {
  orgId: "22222222-2222-4222-8222-222222222222",
  empreendimentoId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  userId: "bbbbbbbb-0000-4000-8000-000000000002",
};

export type TenantFixture = {
  orgId: string;
  empreendimentoId: string;
  userId: string;
};

export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL obrigatorio para testes RLS");
  }
  return url;
}

export function createSql(url = requireDatabaseUrl()) {
  return postgres(url, { prepare: false, max: 4 });
}

/** Aplica migrations versionadas quando ainda nao existem (CI usa postgres DDL). */
export async function migrateLatest(
  sql: ReturnType<typeof postgres>,
): Promise<void> {
  const exists = await sql<{ ready: boolean }[]>`
    select to_regclass('public.organizacoes') is not null as ready
  `;
  if (exists[0]?.ready) {
    return;
  }

  const migrationPath = path.join(
    process.cwd(),
    "src/db/migrations/0000_tenancy_i2.sql",
  );
  const migrationSql = readFileSync(migrationPath, "utf8");
  await sql.unsafe(migrationSql);
}

export async function seedTenantPair(
  sql: ReturnType<typeof postgres>,
): Promise<{
  orgA: TenantFixture;
  orgB: TenantFixture;
}> {
  await sql`select app.seed_rls_fixtures()`;
  return { orgA: FIXTURE_ORG_A, orgB: FIXTURE_ORG_B };
}

export async function withRls<T>(
  sql: ReturnType<typeof postgres>,
  context: TenantFixture,
  fn: (tx: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return sql.begin(async (tx) => {
    const [{ role }] = await tx<{ role: string }[]>`
      select current_user as role
    `;
    if (role !== APP_ROLE) {
      await tx.unsafe(`set local role ${APP_ROLE}`);
    }
    await tx`select set_config('app.current_org_id', ${context.orgId}, true)`;
    await tx`select set_config('app.current_empreendimento_id', ${context.empreendimentoId}, true)`;
    await tx`select set_config('app.current_user_id', ${context.userId}, true)`;
    return fn(tx);
  }) as Promise<T>;
}

export function setupRlsSuite(
  setup: (sql: ReturnType<typeof postgres>) => Promise<void>,
) {
  const sql = createSql();

  beforeAll(async () => {
    await migrateLatest(sql);
    await setup(sql);
  });

  afterAll(async () => {
    await sql.end({ timeout: 5 });
  });

  return sql;
}
