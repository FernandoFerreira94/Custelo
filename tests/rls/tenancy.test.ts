import { describe, expect, it } from "vitest";

import { seedTenantPair, setupRlsSuite, withRls } from "./helpers";

describe("isolamento de tenant — I2 tenancy", () => {
  const sql = setupRlsSuite(async (client) => {
    await seedTenantPair(client);
  });

  it("le empreendimentos apenas do tenant ativo", async () => {
    const { orgA, orgB } = await seedTenantPair(sql);

    const rowsA = await withRls(sql, orgA, async (tx) => {
      return tx<{ id: string; nome: string }[]>`
        select id, nome from empreendimentos order by nome
      `;
    });

    expect(rowsA).toHaveLength(1);
    expect(rowsA[0]?.nome).toBe("Emp Alpha");

    const rowsB = await withRls(sql, orgB, async (tx) => {
      return tx<{ id: string; nome: string }[]>`
        select id, nome from empreendimentos order by nome
      `;
    });

    expect(rowsB).toHaveLength(1);
    expect(rowsB[0]?.nome).toBe("Emp Beta");
  });

  it("rejeita leitura cross-tenant de organizacoes", async () => {
    const { orgA, orgB } = await seedTenantPair(sql);

    const orgRows = await withRls(sql, orgA, async (tx) => {
      return tx<{ id: string }[]>`
        select id from organizacoes where id = ${orgB.orgId}
      `;
    });

    expect(orgRows).toHaveLength(0);
  });

  it("rejeita escrita cross-tenant em empreendimentos", async () => {
    const { orgA, orgB } = await seedTenantPair(sql);

    await expect(
      withRls(sql, orgA, async (tx) => {
        await tx`
          update empreendimentos
          set nome = 'Invadido'
          where id = ${orgB.empreendimentoId}
        `;
      }),
    ).resolves.not.toThrow();

    const victim = await withRls(sql, orgB, async (tx) => {
      return tx<{ nome: string }[]>`
        select nome from empreendimentos where id = ${orgB.empreendimentoId}
      `;
    });

    expect(victim[0]?.nome).toBe("Emp Beta");
  });

  it("nao expoe escopos de outra organizacao", async () => {
    const { orgA, orgB } = await seedTenantPair(sql);

    const scopes = await withRls(sql, orgA, async (tx) => {
      return tx<{ org_id: string }[]>`
        select org_id from escopos_usuario
      `;
    });

    expect(scopes.every((row) => row.org_id === orgA.orgId)).toBe(true);
    expect(scopes.some((row) => row.org_id === orgB.orgId)).toBe(false);
  });
});
