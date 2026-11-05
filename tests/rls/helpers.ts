import { readFileSync } from "node:fs";
import path from "node:path";

import postgres from "postgres";
import { afterAll, beforeAll } from "vitest";

const APP_ROLE = "custelo_app";

const MIGRATIONS = [
  "0000_tenancy_i2.sql",
  "0001_auth_claims.sql",
  "0002_custom_access_token_hook.sql",
  "0003_contexto_ativo.sql",
  "0004_invite_activation.sql",
  "0005_invite_activation_hardening.sql",
  "0006_access_management.sql",
  "0007_i3_estrutura_pessoas.sql",
  "0008_rls_fixture_hardening.sql",
  "0009_revoke_seed_fixtures.sql",
  "0010_base_auditoria.sql",
  "0011_i3_modelo.sql",
] as const;

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

async function migrationApplied(
  sql: ReturnType<typeof postgres>,
  file: (typeof MIGRATIONS)[number],
): Promise<boolean> {
  switch (file) {
    case "0000_tenancy_i2.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regclass('public.organizacoes') is not null as ready
          `
        )[0]?.ready,
      );
    case "0001_auth_claims.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regprocedure('app.resolve_auth_claims(uuid)') is not null as ready
          `
        )[0]?.ready,
      );
    case "0002_custom_access_token_hook.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regprocedure('public.custom_access_token_hook(jsonb)') is not null as ready
          `
        )[0]?.ready,
      );
    case "0003_contexto_ativo.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regclass('public.contexto_ativo') is not null as ready
          `
        )[0]?.ready,
      );
    case "0004_invite_activation.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regprocedure('app.aceitar_convite(text)') is not null as ready
          `
        )[0]?.ready,
      );
    case "0005_invite_activation_hardening.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regprocedure('app.seed_convite_pendente_fixture()') is not null as ready
          `
        )[0]?.ready,
      );
    case "0006_access_management.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regprocedure('app.conceder_escopo(uuid, uuid, uuid, papel_codigo)') is not null as ready
          `
        )[0]?.ready,
      );
    case "0007_i3_estrutura_pessoas.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regclass('public.unidades') is not null as ready
          `
        )[0]?.ready,
      );
    case "0008_rls_fixture_hardening.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select pg_get_functiondef('app.seed_rls_fixtures()'::regprocedure)
              like '%ON CONFLICT (id) DO UPDATE%' as ready
          `
        )[0]?.ready,
      );
    case "0009_revoke_seed_fixtures.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select not has_function_privilege('custelo_app', 'app.seed_rls_fixtures()', 'execute') as ready
          `
        )[0]?.ready,
      );
    case "0010_base_auditoria.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regclass('public.audit_log') is not null as ready
          `
        )[0]?.ready,
      );
    case "0011_i3_modelo.sql":
      return Boolean(
        (
          await sql<{ ready: boolean }[]>`
            select to_regclass('public.contatos') is not null as ready
          `
        )[0]?.ready,
      );
    default:
      return true;
  }
}

/** Aplica migrations versionadas quando ainda nao existem (CI usa postgres DDL). */
export async function migrateLatest(
  sql: ReturnType<typeof postgres>,
): Promise<void> {
  const [{ role }] = await sql<{ role: string }[]>`
    select current_user as role
  `;
  const canRunDdl = role === "postgres" || role === "supabase_admin";

  for (const file of MIGRATIONS) {
    if (await migrationApplied(sql, file)) {
      continue;
    }

    if (!canRunDdl) {
      throw new Error(
        `Migration ${file} ausente no banco. Aplique via pipeline/SQL Editor (role atual: ${role}).`,
      );
    }

    const migrationPath = path.join(process.cwd(), "src/db/migrations", file);
    const migrationSql = readFileSync(migrationPath, "utf8");
    await sql.unsafe(migrationSql);
  }
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
