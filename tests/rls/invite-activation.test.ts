import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

describe("aceite de convite — AUTH-002", () => {
  const sql = setupRlsSuite(async (client) => {
    await seedTenantPair(client);
  });

  it("ativa somente o proprio usuario pendente", async () => {
    await sql`
      insert into usuarios (id, email, nome, status)
      values ('aaaaaaaa-0000-4000-8000-000000000003', 'pending@example.test', 'Pendente', 'convite_pendente')
      on conflict (id) do update set status = 'convite_pendente'
    `;

    const pending = {
      ...FIXTURE_ORG_A,
      userId: "aaaaaaaa-0000-4000-8000-000000000003",
    };
    const result = await withRls(
      sql,
      pending,
      async (tx) =>
        tx<
          { result: { ok: boolean } }[]
        >`select app.aceitar_convite('Nome Aceito') as result`,
    );

    expect(result[0]?.result.ok).toBe(true);
  });
});
