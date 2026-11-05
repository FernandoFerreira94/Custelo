import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

describe("importação — isolamento e integridade", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  const novoLote = (f: typeof FIXTURE_ORG_A) =>
    withRls(
      sql,
      f,
      async (tx) =>
        (
          await tx<{ id: string }[]>`
            insert into importacoes (org_id, empreendimento_id, cadastro, arquivo_nome, linhas_total, criado_por)
            values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'unidades', 'modelo-unidades.csv', 2, ${f.userId}::uuid)
            returning id`
        )[0]!,
    );

  const novaLinha = (
    f: typeof FIXTURE_ORG_A,
    importacaoId: string,
    numero: number,
  ) =>
    withRls(
      sql,
      f,
      (tx) => tx`
        insert into importacao_linhas (org_id, empreendimento_id, importacao_id, numero_linha, dados, situacao)
        values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${importacaoId}::uuid, ${numero}, '{"codigo":"A-1"}'::jsonb, 'ok')
        returning id`,
    );

  it("cada tenant só enxerga os próprios lotes", async () => {
    const a = await novoLote(FIXTURE_ORG_A);
    const b = await novoLote(FIXTURE_ORG_B);

    const vistoPorA = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx<{ id: string }[]>`select id from importacoes`,
    );

    expect(vistoPorA.map((l) => l.id)).toContain(a.id);
    expect(vistoPorA.map((l) => l.id)).not.toContain(b.id);
  });

  it("linha não aponta para lote de outro empreendimento (FK composta)", async () => {
    const loteDeB = await novoLote(FIXTURE_ORG_B);

    await expect(novaLinha(FIXTURE_ORG_A, loteDeB.id, 1)).rejects.toMatchObject(
      { code: "23503" },
    );
  });

  it("o mesmo número de linha não repete no lote", async () => {
    const lote = await novoLote(FIXTURE_ORG_A);
    await novaLinha(FIXTURE_ORG_A, lote.id, 1);

    await expect(novaLinha(FIXTURE_ORG_A, lote.id, 1)).rejects.toMatchObject({
      code: "23505",
    });
    await expect(novaLinha(FIXTURE_ORG_A, lote.id, 2)).resolves.toHaveLength(1);
  });

  it("custelo_app não apaga lote nem linha", async () => {
    const lote = await novoLote(FIXTURE_ORG_A);
    await novaLinha(FIXTURE_ORG_A, lote.id, 1);

    for (const tabela of ["importacao_linhas", "importacoes"]) {
      await expect(
        withRls(sql, FIXTURE_ORG_A, (tx) => tx.unsafe(`delete from ${tabela}`)),
      ).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("situação fora da lista e linha 0 são recusadas", async () => {
    const lote = await novoLote(FIXTURE_ORG_A);

    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
          insert into importacao_linhas (org_id, empreendimento_id, importacao_id, numero_linha, dados, situacao)
          values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, ${lote.id}::uuid, 0, '{}'::jsonb, 'ok')`,
      ),
    ).rejects.toMatchObject({ code: "23514" });
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
          insert into importacao_linhas (org_id, empreendimento_id, importacao_id, numero_linha, dados, situacao)
          values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, ${lote.id}::uuid, 9, '{}'::jsonb, 'qualquer')`,
      ),
    ).rejects.toMatchObject({ code: "22P02" });
  });
});
