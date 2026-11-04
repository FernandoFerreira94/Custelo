import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import postgres from "postgres";

const fixtureConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  process.env.DATABASE_URL,
);
const ORG_ADMIN_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc03";
const ORG_ID = "11111111-1111-4111-8111-111111111111";
const ORG_SCOPE_ID = "00000000-0000-0000-0000-000000000001";

function getFixtureEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !databaseUrl) {
    throw new Error("E2E_AUTH_FIXTURE_UNAVAILABLE");
  }

  return { supabaseUrl, anonKey, serviceRoleKey, databaseUrl };
}

function createAuthAdmin() {
  const { supabaseUrl, serviceRoleKey } = getFixtureEnv();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function cleanupAppUser(sql: postgres.Sql, userId: string) {
  await sql.begin(async (tx) => {
    await tx`select set_config('app.current_user_id', ${userId}, true)`;
    await tx`select set_config('app.current_org_id', ${ORG_ID}, true)`;
    await tx`select set_config('app.current_empreendimento_id', ${ORG_SCOPE_ID}, true)`;
    await tx`delete from contexto_ativo where usuario_id = ${userId}::uuid`;
    await tx`delete from escopos_usuario where usuario_id = ${userId}::uuid`;
    await tx`delete from usuarios where id = ${userId}::uuid`;
  });
}

test.use({ trace: "off" });

test.describe("callbacks reais de autenticacao", () => {
  test.skip(
    !fixtureConfigured,
    "Exige as variaveis de Auth e banco do ambiente E2E.",
  );
  test("AUTH-004 recovery valida o link e salva a nova senha", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const { supabaseUrl, anonKey } = getFixtureEnv();
    const admin = createAuthAdmin();
    const suffix = randomUUID();
    const email = `e2e-recovery-${suffix}@example.test`;
    const originalPassword = `Original!${suffix}`;
    const nextPassword = `Recuperada!${suffix}`;
    let userId: string | null = null;

    try {
      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email,
          password: originalPassword,
          email_confirm: true,
        });
      expect(createError).toBeNull();
      expect(created.user).not.toBeNull();
      userId = created.user?.id ?? null;

      const { data: link, error: linkError } =
        await admin.auth.admin.generateLink({ type: "recovery", email });
      expect(linkError).toBeNull();
      if (!link.properties) {
        throw new Error("E2E_RECOVERY_LINK_UNAVAILABLE");
      }

      await page.goto(
        `/auth/confirm?token_hash=${encodeURIComponent(link.properties.hashed_token)}&type=recovery`,
      );
      await expect(
        page.getByRole("heading", { name: "Definir nova senha" }),
      ).toBeVisible({ timeout: 10_000 });

      const password = page.getByRole("textbox", { name: "Nova senha" });
      await password.click();
      await password.fill(nextPassword);
      await page
        .getByRole("textbox", { name: "Confirmar senha" })
        .fill(nextPassword);
      await page.getByRole("button", { name: "Salvar senha" }).click();

      await expect(page).toHaveURL(/\/sem-acesso$/, { timeout: 15_000 });
      await expect(
        page.getByRole("heading", { name: "Sem acesso" }),
      ).toBeVisible();

      const verifier = createClient(supabaseUrl, anonKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: session, error: signInError } =
        await verifier.auth.signInWithPassword({
          email,
          password: nextPassword,
        });
      expect(signInError).toBeNull();
      expect(session.user?.id).toBe(userId);
    } finally {
      if (userId) {
        await admin.auth.admin.deleteUser(userId);
      }
    }
  });

  test("AUTH-002 convite mostra o escopo, ativa a conta e entra", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const { databaseUrl } = getFixtureEnv();
    const admin = createAuthAdmin();
    const sql = postgres(databaseUrl, { prepare: false, max: 1 });
    const suffix = randomUUID();
    const email = `e2e-invite-${suffix}@example.test`;
    const password = `Convite!${suffix}`;
    const fullName = "Pessoa Convite E2E";
    let userId: string | null = null;

    try {
      await sql`select app.seed_access_management_fixtures()`;

      const { data: link, error: linkError } =
        await admin.auth.admin.generateLink({ type: "invite", email });
      expect(linkError).toBeNull();
      if (!link.user || !link.properties) {
        throw new Error("E2E_INVITE_LINK_UNAVAILABLE");
      }
      userId = link.user.id;

      const registered = await sql.begin(async (tx) => {
        await tx`select set_config('app.current_user_id', ${ORG_ADMIN_ID}, true)`;
        await tx`select set_config('app.current_org_id', ${ORG_ID}, true)`;
        await tx`select set_config('app.current_empreendimento_id', ${ORG_SCOPE_ID}, true)`;

        return tx<{ result: { ok: boolean; code?: string } }[]>`
          select app.registrar_convite_pendente(
            ${userId}::uuid,
            ${email},
            ${ORG_ID}::uuid,
            ${ORG_SCOPE_ID}::uuid,
            'recepcionista'::papel_codigo
          ) as result
        `;
      });
      expect(registered[0]?.result).toEqual({ ok: true });

      await page.goto(
        `/auth/confirm?token_hash=${encodeURIComponent(link.properties.hashed_token)}&type=invite`,
      );
      await expect(
        page.getByRole("heading", { name: "Aceitar convite" }),
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        page.getByText("Recepcionista / Porteiro", { exact: true }),
      ).toBeVisible();

      const name = page.getByRole("textbox", { name: "Nome completo" });
      await name.click();
      await name.fill(fullName);
      await page.getByRole("textbox", { name: "Criar senha" }).fill(password);
      await page.getByRole("button", { name: "Criar acesso e entrar" }).click();

      await expect(page).toHaveURL(/\/receber$/, { timeout: 15_000 });
      await expect(
        page.getByRole("heading", { name: "Recebimento" }),
      ).toBeVisible();

      const activated = await sql.begin(async (tx) => {
        await tx`select set_config('app.current_user_id', ${userId}, true)`;
        await tx`select set_config('app.current_org_id', ${ORG_ID}, true)`;
        await tx`select set_config('app.current_empreendimento_id', ${ORG_SCOPE_ID}, true)`;
        return tx<
          { nome: string; status: string }[]
        >`select nome, status from usuarios where id = ${userId}::uuid`;
      });
      expect(activated[0]).toEqual({ nome: fullName, status: "ativo" });
    } finally {
      if (userId) {
        await cleanupAppUser(sql, userId);
        await admin.auth.admin.deleteUser(userId);
      }
      await sql.end({ timeout: 2 });
    }
  });
});
