/**
 * Convida um usuario via Supabase Auth + tenancy.
 *
 * Uso:
 *   node --env-file=.env --env-file=.env.local scripts/invite-user.mjs email@dominio.com recepcionista
 */
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const email = process.argv[2];
const roleCode = process.argv[3] ?? "recepcionista";

const ORG_ID =
  process.env.INVITE_ORG_ID ?? "cccccccc-cccc-4ccc-8ccc-cccccccccc01";
const EMP_ID =
  process.env.INVITE_EMPREENDIMENTO_ID ??
  "cccccccc-cccc-4ccc-8ccc-cccccccccc02";
const ACTOR_USER_ID =
  process.env.INVITE_ACTOR_USER_ID ?? "colinas-dev-user-placeholder";

if (!email) {
  console.error(
    "Uso: node --env-file=.env scripts/invite-user.mjs <email> [papel]",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!url || !serviceKey || !databaseUrl || !siteUrl) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL ou NEXT_PUBLIC_SITE_URL.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resolveActorUserId(sql) {
  if (!ACTOR_USER_ID.includes("placeholder")) {
    return ACTOR_USER_ID;
  }

  const rows = await sql`
    select u.id
    from usuarios u
    join escopos_usuario e on e.usuario_id = u.id
    join papeis p on p.id = e.papel_id
    where u.email = 'colinas@colinas.com.br' and p.codigo = 'org_admin'
    limit 1
  `;

  return rows[0]?.id;
}

async function main() {
  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    const actorUserId = await resolveActorUserId(sql);
    if (!actorUserId) {
      throw new Error(
        "Ator convidador nao encontrado. Rode seed-dev-colinas.mjs antes.",
      );
    }

    const callbackUrl = new URL("/auth/confirm", siteUrl);
    callbackUrl.searchParams.set("view", "convite");
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: callbackUrl.toString(),
    });

    if (error || !data.user) {
      throw error ?? new Error("Convite nao criado.");
    }

    await sql.begin(async (tx) => {
      await tx`select set_config('app.current_user_id', ${actorUserId}, true)`;
      await tx`select set_config('app.current_org_id', ${ORG_ID}, true)`;
      await tx`select set_config('app.current_empreendimento_id', '00000000-0000-0000-0000-000000000001', true)`;

      const [{ result }] = await tx`
        select app.registrar_convite_pendente(
          ${data.user.id}::uuid,
          ${email},
          ${ORG_ID}::uuid,
          ${EMP_ID}::uuid,
          ${roleCode}::papel_codigo
        ) as result
      `;

      if (!result?.ok) {
        throw new Error(
          `Falha ao registrar convite: ${result?.code ?? "UNKNOWN"}`,
        );
      }
    });

    console.warn(`Convite enviado para ${email} (${roleCode}).`);
  } finally {
    await sql.end({ timeout: 2 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
