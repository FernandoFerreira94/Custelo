import { describe, expect, it } from "vitest";

import { seedTenantPair, setupRlsSuite, withRls } from "./helpers";

describe("contexto ativo — AUTH-005", () => {
  const sql = setupRlsSuite(async (client) => {
    await seedTenantPair(client);
  });

  it("lista escopos acessiveis do usuario", async () => {
    const { orgA } = await seedTenantPair(sql);

    const rows = await withRls(
      sql,
      orgA,
      (tx) =>
        tx<{ scopes: unknown }[]>`
      select app.list_escopos_acessiveis(${orgA.userId}::uuid) as scopes
    `,
    );

    const scopes = rows[0]?.scopes as Array<{
      org_id: string;
      empreendimento_id: string;
      papel_codigo: string;
    }>;

    expect(scopes).toHaveLength(1);
    expect(scopes[0]?.org_id).toBe(orgA.orgId);
    expect(scopes[0]?.empreendimento_id).toBe(orgA.empreendimentoId);
    expect(scopes[0]?.papel_codigo).toBe("recepcionista");
  });

  it("persiste contexto ativo e reflete nos claims", async () => {
    const { orgA } = await seedTenantPair(sql);

    const defined = await withRls(
      sql,
      orgA,
      (tx) =>
        tx<{ result: { ok: boolean; papel_codigo: string } }[]>`
      select app.definir_contexto_ativo(
        ${orgA.userId}::uuid,
        ${orgA.orgId}::uuid,
        ${orgA.empreendimentoId}::uuid
      ) as result
    `,
    );

    expect(defined[0]?.result.ok).toBe(true);
    expect(defined[0]?.result.papel_codigo).toBe("recepcionista");

    const claims = await withRls(
      sql,
      orgA,
      (tx) =>
        tx<{ claims: Record<string, string> }[]>`
      select app.resolve_auth_claims(${orgA.userId}::uuid) as claims
    `,
    );

    expect(claims[0]?.claims.org_id).toBe(orgA.orgId);
    expect(claims[0]?.claims.empreendimento_id).toBe(orgA.empreendimentoId);
    expect(claims[0]?.claims.papel_codigo).toBe("recepcionista");
  });

  it("rejeita escopo invalido", async () => {
    const { orgA, orgB } = await seedTenantPair(sql);

    const defined = await withRls(
      sql,
      orgA,
      (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
      select app.definir_contexto_ativo(
        ${orgA.userId}::uuid,
        ${orgB.orgId}::uuid,
        ${orgB.empreendimentoId}::uuid
      ) as result
    `,
    );

    expect(defined[0]?.result.ok).toBe(false);
    expect(defined[0]?.result.code).toBe("INVALID_SCOPE");
  });
});
