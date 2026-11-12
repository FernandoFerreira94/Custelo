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
        on conflict do nothing
      `;
    });
    await withRls(sql, FIXTURE_ORG_B, async (tx) => {
      await tx`
        insert into unidades (org_id, empreendimento_id, codigo, nome)
        values (${FIXTURE_ORG_B.orgId}::uuid, ${FIXTURE_ORG_B.empreendimentoId}::uuid, '201', 'Unidade Beta')
        on conflict do nothing
      `;
    });

    const rows = await withRls(
      sql,
      FIXTURE_ORG_A,
      async (tx) =>
        tx<
          { codigo: string }[]
        >`select codigo from unidades where codigo in ('101', '201') order by codigo`,
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
      async (tx) =>
        tx<
          { nome: string }[]
        >`select nome from pessoas where nome = 'Pessoa Beta'`,
    );

    expect(rows).toHaveLength(0);
  });

  // --- Task 3.1: integridade entre tenants, código normalizado, histórico e DELETE ---

  // Os dados persistem entre execuções: cada teste usa códigos únicos.
  let n = Date.now() % 1_000_000;
  const unico = (prefixo: string) => `${prefixo}${n++}`;

  const novaUnidade = (f: typeof FIXTURE_ORG_A, codigo: string) =>
    withRls(
      sql,
      f,
      async (tx) =>
        (
          await tx<{ id: string }[]>`
            insert into unidades (org_id, empreendimento_id, codigo, tipo)
            values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${codigo}, 'apartamento')
            returning id`
        )[0]!,
    );

  const novaPessoa = (f: typeof FIXTURE_ORG_A, nome: string) =>
    withRls(
      sql,
      f,
      async (tx) =>
        (
          await tx<{ id: string }[]>`
            insert into pessoas (org_id, empreendimento_id, nome)
            values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${nome})
            returning id`
        )[0]!,
    );

  const novoVinculo = (
    f: typeof FIXTURE_ORG_A,
    pessoaId: string,
    unidadeId: string,
  ) =>
    withRls(
      sql,
      f,
      (tx) => tx`
        insert into vinculos (org_id, empreendimento_id, pessoa_id, unidade_id, tipo)
        values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pessoaId}::uuid, ${unidadeId}::uuid, 'morador')
        returning id`,
    );

  it("não vincula pessoa de B a unidade de A (FK composta)", async () => {
    const unidadeA = await novaUnidade(FIXTURE_ORG_A, unico("FK-"));
    const pessoaB = await novaPessoa(FIXTURE_ORG_B, "Pessoa B");

    await expect(
      novoVinculo(FIXTURE_ORG_A, pessoaB.id, unidadeA.id),
    ).rejects.toMatchObject({ code: "23503" });
  });

  it("não grava linha com empreendimento de outra org", async () => {
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
          insert into unidades (org_id, empreendimento_id, codigo, tipo)
          values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_B.empreendimentoId}::uuid, ${unico("X-")}, 'apartamento')`,
      ),
    ).rejects.toThrow(); // RLS (42501) ou FK composta (23503)
  });

  it("código da unidade é único pelo normalizado: 'B-304' e 'b 304' colidem", async () => {
    const sufixo = unico("");
    await novaUnidade(FIXTURE_ORG_A, `B-${sufixo}`);
    await expect(
      novaUnidade(FIXTURE_ORG_A, `b ${sufixo}`),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("A-304 e B-304 convivem no mesmo empreendimento", async () => {
    const sufixo = unico("");
    const a = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx<{ codigo_normalizado: string }[]>`
        insert into unidades (org_id, empreendimento_id, codigo, tipo)
        values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, ${`A-${sufixo}`}, 'apartamento')
        returning codigo_normalizado`,
    );
    await novaUnidade(FIXTURE_ORG_A, `B-${sufixo}`);
    expect(a[0]?.codigo_normalizado).toBe(`A${sufixo}`);
  });

  it("vínculo encerrado libera novo vínculo ativo da mesma pessoa na mesma unidade", async () => {
    const unidade = await novaUnidade(FIXTURE_ORG_A, unico("V-"));
    const pessoa = await novaPessoa(FIXTURE_ORG_A, "Pessoa V");
    const [vinculo] = await novoVinculo(FIXTURE_ORG_A, pessoa.id, unidade.id);

    // segundo ativo na mesma unidade: bloqueado
    await expect(
      novoVinculo(FIXTURE_ORG_A, pessoa.id, unidade.id),
    ).rejects.toMatchObject({ code: "23505" });

    await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`
        update vinculos set status = 'encerrado', vigencia_fim = now()
        where id = ${vinculo!.id}::uuid`,
    );

    await expect(
      novoVinculo(FIXTURE_ORG_A, pessoa.id, unidade.id),
    ).resolves.toHaveLength(1);
  });

  it("vínculo encerrado exige vigencia_fim", async () => {
    const unidade = await novaUnidade(FIXTURE_ORG_A, unico("E-"));
    const pessoa = await novaPessoa(FIXTURE_ORG_A, "Pessoa E");
    const [vinculo] = await novoVinculo(FIXTURE_ORG_A, pessoa.id, unidade.id);

    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
          update vinculos set status = 'encerrado'
          where id = ${vinculo!.id}::uuid`,
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("árvore de áreas recusa ciclo", async () => {
    const criarArea = (nome: string, parentId: string | null) =>
      withRls(
        sql,
        FIXTURE_ORG_A,
        async (tx) =>
          (
            await tx<{ id: string }[]>`
              insert into areas (org_id, empreendimento_id, nome, parent_id)
              values (${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, ${nome}, ${parentId}::uuid)
              returning id`
          )[0]!,
      );
    const a1 = await criarArea(unico("Bloco "), null);
    const a2 = await criarArea(unico("Andar "), a1.id);

    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`update areas set parent_id = ${a2.id}::uuid where id = ${a1.id}::uuid`,
      ),
    ).rejects.toThrow(/AREA_CICLO/);
  });

  it("custelo_app não apaga cadastro", async () => {
    const unidade = await novaUnidade(FIXTURE_ORG_A, unico("D-"));
    const pessoa = await novaPessoa(FIXTURE_ORG_A, "Pessoa D");
    await novoVinculo(FIXTURE_ORG_A, pessoa.id, unidade.id);

    for (const tabela of ["vinculos", "unidades", "pessoas"]) {
      await expect(
        withRls(sql, FIXTURE_ORG_A, (tx) => tx.unsafe(`delete from ${tabela}`)),
      ).rejects.toMatchObject({ code: "42501" });
    }
  });

  it("contato não lê de outro tenant e não aponta pessoa de outro empreendimento", async () => {
    const pessoaA = await novaPessoa(FIXTURE_ORG_A, "Pessoa Contato A");
    const pessoaB = await novaPessoa(FIXTURE_ORG_B, "Pessoa Contato B");
    const valor = `${unico("55119")}`;

    const inserir = (f: typeof FIXTURE_ORG_A, pessoaId: string) =>
      withRls(
        sql,
        f,
        (tx) => tx`
          insert into contatos (org_id, empreendimento_id, pessoa_id, canal, valor)
          values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pessoaId}::uuid, 'whatsapp', ${valor})`,
      );

    await inserir(FIXTURE_ORG_A, pessoaA.id);
    await inserir(FIXTURE_ORG_B, pessoaB.id);
    // pessoa de B num contato de A: FK composta recusa
    await expect(inserir(FIXTURE_ORG_A, pessoaB.id)).rejects.toMatchObject({
      code: "23503",
    });

    const lidos = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx<{ org_id: string }[]>`select org_id from contatos`,
    );
    expect(lidos.every((c) => c.org_id === FIXTURE_ORG_A.orgId)).toBe(true);
  });
});
