/**
 * Seed local para o login de desenvolvimento.
 *
 * Uso:
 *   node --env-file=.env scripts/seed-dev-gestor.mjs
 *
 * A chave service_role e usada apenas neste processo de CLI para criar o
 * usuario no Auth e os dados de tenancy. Ela nao e importada pelo app nem
 * enviada ao navegador.
 */
import { createClient } from "@supabase/supabase-js";

const EMAIL = "gestor@colinas.com.br";
const PASSWORD = "gestor12345";
const ORG_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc01";
const EMP_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc02";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function throwIfError(error) {
  if (error) {
    throw error;
  }
}

async function resolveUserId() {
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nome: "Gestor Dev" },
    });

  if (!createError) {
    if (!created.user) {
      throw new Error("Usuario de teste nao foi criado.");
    }
    return created.user.id;
  }

  if (!createError.message.includes("already been registered")) {
    throw createError;
  }

  const { data: listed, error: listError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  throwIfError(listError);

  const existing = listed.users.find((user) => user.email === EMAIL);
  if (!existing) {
    throw createError;
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    existing.id,
    { password: PASSWORD, email_confirm: true },
  );
  throwIfError(updateError);

  return existing.id;
}

async function main() {
  const userId = await resolveUserId();

  const { error: organizationError } = await supabase
    .from("organizacoes")
    .upsert(
      { id: ORG_ID, nome: "Colinas", slug: "colinas", status: "ativa" },
      { onConflict: "id", ignoreDuplicates: true },
    );
  throwIfError(organizationError);

  const { error: developmentError } = await supabase
    .from("empreendimentos")
    .upsert(
      {
        id: EMP_ID,
        org_id: ORG_ID,
        empreendimento_id: EMP_ID,
        nome: "Colinas Residencial",
        slug: "colinas-residencial",
        status: "ativo",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
  throwIfError(developmentError);

  const { error: userError } = await supabase
    .from("usuarios")
    .upsert(
      { id: userId, email: EMAIL, nome: "Gestor Dev", status: "ativo" },
      { onConflict: "id" },
    );
  throwIfError(userError);

  const { data: role, error: roleError } = await supabase
    .from("papeis")
    .select("id")
    .eq("codigo", "empreendimento_gestor")
    .maybeSingle();
  throwIfError(roleError);

  if (!role) {
    throw new Error("Papel empreendimento_gestor nao encontrado.");
  }

  const { error: scopeError } = await supabase.from("escopos_usuario").upsert(
    {
      usuario_id: userId,
      org_id: ORG_ID,
      empreendimento_id: EMP_ID,
      papel_id: role.id,
      ativo: true,
    },
    { onConflict: "usuario_id,org_id,empreendimento_id" },
  );
  throwIfError(scopeError);

  process.stdout.write("Seed de login local concluido.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
