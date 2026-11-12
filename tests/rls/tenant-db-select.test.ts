import { describe, expect, it } from "vitest";

import { empreendimentos } from "@/db/schema";
import { withTenantDb } from "@/infrastructure/db/tenant-db";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
} from "./helpers";

// Regressão: o drizzle lê `client.options.parsers` ao montar um SELECT, e a
// transação do postgres não tinha `options` ("reading 'parsers'", 500 em /gestao/equipe).
describe("withTenantDb", () => {
  setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  it("faz SELECT com drizzle dentro da transação e respeita o tenant", async () => {
    const linhas = await withTenantDb(FIXTURE_ORG_A, (db) =>
      db.select({ id: empreendimentos.id }).from(empreendimentos),
    );

    expect(linhas.map((l) => l.id)).toContain(FIXTURE_ORG_A.empreendimentoId);
    expect(linhas.map((l) => l.id)).not.toContain(
      FIXTURE_ORG_B.empreendimentoId,
    );
  });
});
