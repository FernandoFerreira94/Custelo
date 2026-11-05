import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

describe("audit_log", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  const inserir = (f: typeof FIXTURE_ORG_A) =>
    withRls(
      sql,
      f,
      (tx) => tx`
      insert into audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, origem)
      values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${f.userId}::uuid, 'TESTE', 'teste', 'web')
      returning id`,
    );

  it("grava e lê só no próprio tenant", async () => {
    await inserir(FIXTURE_ORG_A);
    await inserir(FIXTURE_ORG_B);
    const linhas = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`select org_id from audit_log where acao = 'TESTE'`,
    );
    expect(linhas.every((l) => l.org_id === FIXTURE_ORG_A.orgId)).toBe(true);
  });

  it("não aceita UPDATE nem DELETE", async () => {
    const [{ id }] = await inserir(FIXTURE_ORG_A);
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`update audit_log set acao = 'X' where id = ${id}`,
      ),
    ).rejects.toThrow();
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`delete from audit_log where id = ${id}`,
      ),
    ).rejects.toThrow();
  });

  it("list_escopos_acessiveis recusa usuário diferente do da sessão", async () => {
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`select app.list_escopos_acessiveis(${FIXTURE_ORG_B.userId}::uuid)`,
      ),
    ).rejects.toThrow(/FORBIDDEN/);
  });
});
