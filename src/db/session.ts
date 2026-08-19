import postgres from "postgres";

/** Contexto de tenant injetado por transacao (ADR-006). */
export type TenantContext = {
  orgId: string;
  empreendimentoId: string;
  userId: string;
};

export const ORG_SCOPE_SENTINEL = "00000000-0000-0000-0000-000000000001";

/**
 * Aplica claims de sessao na transacao corrente via SET LOCAL.
 * Deve ser chamado no inicio de toda transacao de dominio.
 */
export async function applyTenantContext(
  sql: postgres.TransactionSql,
  context: TenantContext,
): Promise<void> {
  await sql`select set_config('app.current_org_id', ${context.orgId}, true)`;
  await sql`select set_config('app.current_empreendimento_id', ${context.empreendimentoId}, true)`;
  await sql`select set_config('app.current_user_id', ${context.userId}, true)`;
}

/** Executa callback com RLS ativo para o role da aplicacao. */
export async function withAppRls<T>(
  sql: ReturnType<typeof postgres>,
  context: TenantContext,
  fn: (scoped: postgres.TransactionSql) => Promise<T>,
): Promise<T> {
  return sql.begin(async (tx) => {
    const [{ role }] = await tx<{ role: string }[]>`
      select current_user as role
    `;
    if (role !== "custelo_app") {
      await tx.unsafe("set local role custelo_app");
    }
    await applyTenantContext(tx, context);
    return fn(tx);
  }) as Promise<T>;
}
