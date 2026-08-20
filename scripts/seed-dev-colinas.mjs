/**
 * Seed dev — usuario Colinas para testes locais de login.
 *
 * Uso:
 *   node --env-file=.env scripts/seed-dev-colinas.mjs
 *
 * Cria o usuario no Supabase Auth (Admin API). Os registros de dominio
 * (organizacao, empreendimento, usuarios, escopos) precisam bypass de RLS —
 * rode via Supabase SQL Editor ou MCP execute_sql se o DATABASE_URL usar
 * custelo_app.
 */
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

const EMAIL = "colinas@colinas.com.br";
const PASSWORD = "colinas123";
const ORG_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc01";
const EMP_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc02";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!url || !serviceKey || !databaseUrl) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ou DATABASE_URL.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sql = postgres(databaseUrl, { prepare: false, max: 1 });

async function main() {
  const existing = await sql`
    select id from usuarios where email = ${EMAIL} limit 1
  `;

  let userId = existing[0]?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nome: "Colinas Dev" },
    });

    if (error) {
      if (error.message.includes("already been registered")) {
        const { data: listed } = await supabase.auth.admin.listUsers();
        const found = listed.users.find((u) => u.email === EMAIL);
        if (!found) {
          throw error;
        }
        userId = found.id;
        await supabase.auth.admin.updateUserById(userId, {
          password: PASSWORD,
          email_confirm: true,
        });
      } else {
        throw error;
      }
    } else {
      userId = data.user.id;
    }
  }

  await sql`
    insert into organizacoes (id, nome, slug, status)
    values (${ORG_ID}, 'Colinas', 'colinas', 'ativa')
    on conflict (id) do nothing
  `;

  await sql`
    insert into empreendimentos (id, org_id, empreendimento_id, nome, slug, status)
    values (
      ${EMP_ID},
      ${ORG_ID},
      ${EMP_ID},
      'Colinas Residencial',
      'colinas-residencial',
      'ativo'
    )
    on conflict (id) do nothing
  `;

  await sql`
    insert into usuarios (id, email, nome, status)
    values (${userId}, ${EMAIL}, 'Colinas Dev', 'ativo')
    on conflict (id) do update set
      email = excluded.email,
      nome = excluded.nome,
      status = excluded.status
  `;

  const [papel] = await sql`
    select id from papeis where codigo = 'recepcionista' limit 1
  `;

  if (!papel) {
    throw new Error("Papel recepcionista nao encontrado.");
  }

  await sql`
    insert into escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
    values (${userId}, ${ORG_ID}, ${EMP_ID}, ${papel.id}, true)
    on conflict (usuario_id, org_id, empreendimento_id) do update set
      papel_id = excluded.papel_id,
      ativo = true
  `;

  process.stdout.write(`Usuario dev pronto: ${EMAIL} (${userId})\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end({ timeout: 2 });
  });
