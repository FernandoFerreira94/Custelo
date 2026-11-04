import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

describe("I3 estrutura fisica — isolamento de tenant", () => {
  const sql = setupRlsSuite(async (client) => {
    await seedTenantPair(client);
  });

  it("le unidades apenas do tenant ativo", async () => {
    await withRls(sql, FIXTURE_ORG_A, async (tx) => {
      await tx`
        insert into unidades (org_id, empreendimento_id, codigo, nome)
        values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, '101', 'Unidade Alpha')
        on conflict (empreendimento_id, codigo) do nothing
      `;
    });
    await withRls(sql, FIXTURE_ORG_B, async (tx) => {
      await tx`
        insert into unidades (org_id, empreendimento_id, codigo, nome)
        values (${FIXTURE_ORG_B.orgId}::uuid, ${FIXTURE_ORG_B.empreendimentoId}::uuid, '201', 'Unidade Beta')
        on conflict (empreendimento_id, codigo) do nothing
      `;
    });

    const rows = await withRls(
      sql,
      FIXTURE_ORG_A,
      async (tx) =>
        tx<{ codigo: string }[]>`select codigo from unidades order by codigo`,
    );

    expect(rows.map((row) => row.codigo)).toEqual(["101"]);
  });

  it("rejeita leitura cross-tenant de pessoas", async () => {
    await withRls(sql, FIXTURE_ORG_B, async (tx) => {
      await tx`
        insert into pessoas (org_id, empreendimento_id, nome)
        select ${FIXTURE_ORG_B.orgId}::uuid, ${FIXTURE_ORG_B.empreendimentoId}::uuid, 'Pessoa Beta'
        where not exists (
          select 1 from pessoas
          where org_id = ${FIXTURE_ORG_B.orgId}::uuid
            and empreendimento_id = ${FIXTURE_ORG_B.empreendimentoId}::uuid
            and nome = 'Pessoa Beta'
        )
      `;
    });

    const rows = await withRls(
      sql,
      FIXTURE_ORG_A,
      async (tx) => tx<{ nome: string }[]>`select nome from pessoas`,
    );

    expect(rows).toHaveLength(0);
  });
});
