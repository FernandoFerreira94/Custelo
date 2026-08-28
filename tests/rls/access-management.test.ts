import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

const ORG_ADMIN_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc03";
const GESTOR_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc04";
const TARGET_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccc05";
const ORG_SCOPE_EMPREENDIMENTO = "00000000-0000-0000-0000-000000000001";

function orgAdminContext() {
  return {
    ...FIXTURE_ORG_A,
    userId: ORG_ADMIN_ID,
    empreendimentoId: ORG_SCOPE_EMPREENDIMENTO,
  };
}

function gestorContext() {
  return {
    ...FIXTURE_ORG_A,
    userId: GESTOR_ID,
  };
}

describe("gestao de acesso — I2.3", () => {
  const sql = setupRlsSuite(async (client) => {
    await seedTenantPair(client);
    await client`select app.seed_access_management_fixtures()`;
  });

  it("org_admin concede escopo dentro da organizacao", async () => {
    const result = await withRls(
      sql,
      orgAdminContext(),
      async (tx) =>
        tx<{ result: { ok: boolean } }[]>`
        select app.conceder_escopo(
          ${TARGET_ID}::uuid,
          ${FIXTURE_ORG_A.orgId}::uuid,
          ${FIXTURE_ORG_A.empreendimentoId}::uuid,
          'auditor'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(true);
  });

  it("recepcionista nao concede escopo", async () => {
    const result = await withRls(
      sql,
      FIXTURE_ORG_A,
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.conceder_escopo(
          ${TARGET_ID}::uuid,
          ${FIXTURE_ORG_A.orgId}::uuid,
          ${FIXTURE_ORG_A.empreendimentoId}::uuid,
          'auditor'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });

  it("recepcionista nao revoga escopo", async () => {
    const scopeRows = await sql<{ id: string }[]>`
      select e.id
      from escopos_usuario e
      where e.usuario_id = ${TARGET_ID}::uuid
        and e.ativo = true
      limit 1
    `;
    const scopeId = scopeRows[0]?.id;
    expect(scopeId).toBeDefined();

    const result = await withRls(
      sql,
      FIXTURE_ORG_A,
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.revogar_escopo(${scopeId}::uuid) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });

  it("org_admin nao gerencia escopo de outra organizacao", async () => {
    const result = await withRls(
      sql,
      orgAdminContext(),
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.conceder_escopo(
          ${FIXTURE_ORG_B.userId}::uuid,
          ${FIXTURE_ORG_B.orgId}::uuid,
          ${FIXTURE_ORG_B.empreendimentoId}::uuid,
          'auditor'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });

  it("gestor concede escopo no proprio empreendimento", async () => {
    const result = await withRls(
      sql,
      gestorContext(),
      async (tx) =>
        tx<{ result: { ok: boolean } }[]>`
        select app.conceder_escopo(
          ${TARGET_ID}::uuid,
          ${FIXTURE_ORG_A.orgId}::uuid,
          ${FIXTURE_ORG_A.empreendimentoId}::uuid,
          'auditor'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(true);
  });

  it("gestor nao concede escopo em outra organizacao", async () => {
    const result = await withRls(
      sql,
      gestorContext(),
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.conceder_escopo(
          ${FIXTURE_ORG_B.userId}::uuid,
          ${FIXTURE_ORG_B.orgId}::uuid,
          ${FIXTURE_ORG_B.empreendimentoId}::uuid,
          'recepcionista'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });

  it("gestor nao concede escopo de org_admin", async () => {
    const result = await withRls(
      sql,
      gestorContext(),
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.conceder_escopo(
          ${TARGET_ID}::uuid,
          ${FIXTURE_ORG_A.orgId}::uuid,
          ${ORG_SCOPE_EMPREENDIMENTO}::uuid,
          'org_admin'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });

  it("gestor revoga escopo no proprio empreendimento", async () => {
    const scopeRows = await sql<{ id: string }[]>`
      select e.id
      from escopos_usuario e
      where e.usuario_id = ${FIXTURE_ORG_A.userId}::uuid
        and e.ativo = true
      limit 1
    `;
    const scopeId = scopeRows[0]?.id;
    expect(scopeId).toBeDefined();

    const result = await withRls(
      sql,
      gestorContext(),
      async (tx) =>
        tx<{ result: { ok: boolean } }[]>`
        select app.revogar_escopo(${scopeId}::uuid) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(true);
  });

  it("desativar_usuario encerra escopos do alvo", async () => {
    const result = await withRls(
      sql,
      orgAdminContext(),
      async (tx) =>
        tx<{ result: { ok: boolean } }[]>`
        select app.desativar_usuario(${TARGET_ID}::uuid) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(true);

    const status = await sql<{ status: string }[]>`
      select status from usuarios where id = ${TARGET_ID}::uuid
    `;

    expect(status[0]?.status).toBe("desativado");

    const activeScopes = await sql<{ count: string }[]>`
      select count(*)::text as count
      from escopos_usuario
      where usuario_id = ${TARGET_ID}::uuid and ativo = true
    `;

    expect(activeScopes[0]?.count).toBe("0");
  });

  it("usuario desativado nao concede escopo", async () => {
    const result = await withRls(
      sql,
      {
        ...FIXTURE_ORG_A,
        userId: TARGET_ID,
      },
      async (tx) =>
        tx<{ result: { ok: boolean; code?: string } }[]>`
        select app.conceder_escopo(
          ${FIXTURE_ORG_A.userId}::uuid,
          ${FIXTURE_ORG_A.orgId}::uuid,
          ${FIXTURE_ORG_A.empreendimentoId}::uuid,
          'auditor'::papel_codigo
        ) as result
      `,
    );

    expect(result[0]?.result.ok).toBe(false);
    expect(result[0]?.result.code).toBe("UNAUTHORIZED");
  });
});
