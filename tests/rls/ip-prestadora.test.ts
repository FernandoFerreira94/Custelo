import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

// IP.1 — prestadora (ex.: Selva) atende condominios de outras contas por contrato.
// O dado continua do condominio; a prestadora so ve os proprios contratos.

const ORG_SCOPE = "00000000-0000-0000-0000-000000000001";

const PRESTADORA_P = "dddddddd-dddd-4ddd-8ddd-dddddddddd01";
const PRESTADORA_Q = "dddddddd-dddd-4ddd-8ddd-dddddddddd02";

const GESTOR_P = "dddddddd-0000-4000-8000-0000000000a1";
const GESTOR_Q = "dddddddd-0000-4000-8000-0000000000a2";
const FUNCIONARIO_F = "dddddddd-0000-4000-8000-0000000000f1";
const FUNCIONARIO_F2 = "dddddddd-0000-4000-8000-0000000000f2";
const FUNCIONARIO_F3 = "dddddddd-0000-4000-8000-0000000000f3";
const FUNCIONARIO_NOVO = "dddddddd-0000-4000-8000-0000000000f4";
const GESTOR_A = "cccccccc-cccc-4ccc-8ccc-cccccccccc04"; // seed_access_management_fixtures
const GESTOR_B = "dddddddd-0000-4000-8000-0000000000b1";

const CONTRATO_P_A = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee01"; // ativo, portaria
const CONTRATO_Q_A = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee02"; // ativo, outra prestadora
const CONTRATO_P_B_PROPOSTO = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee03";
const CONTRATO_P_A_ENCERRAR = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeee04"; // ativo, vigilancia

const UNIDADE_A = "eeeeeeee-0000-4000-8000-0000000000a1";
const UNIDADE_B = "eeeeeeee-0000-4000-8000-0000000000b1";

const gestorP = {
  orgId: PRESTADORA_P,
  empreendimentoId: ORG_SCOPE,
  userId: GESTOR_P,
};
const gestorQ = {
  orgId: PRESTADORA_Q,
  empreendimentoId: ORG_SCOPE,
  userId: GESTOR_Q,
};
const gestorA = { ...FIXTURE_ORG_A, userId: GESTOR_A };
const gestorB = { ...FIXTURE_ORG_B, userId: GESTOR_B };
const funcionarioNoLocalA = { ...FIXTURE_ORG_A, userId: FUNCIONARIO_F };

describe("IP.1 — prestadora, contratos e escopo via contrato", () => {
  const sql = setupRlsSuite(async (db) => {
    await seedTenantPair(db);
    await db`select app.seed_access_management_fixtures()`;

    // Roda como postgres (dono das tabelas): fixtures idempotentes, reexecutaveis no mesmo banco.
    await db`
      insert into organizacoes (id, nome, slug, tipo) values
        (${PRESTADORA_P}, 'Selva Servicos', 'ip-selva', 'prestadora'),
        (${PRESTADORA_Q}, 'Outra Prestadora', 'ip-outra', 'prestadora')
      on conflict (id) do update set tipo = excluded.tipo
    `;
    await db`
      insert into usuarios (id, email, nome, status) values
        (${GESTOR_P}, 'gestor-p@example.test', 'Gestor P', 'ativo'),
        (${GESTOR_Q}, 'gestor-q@example.test', 'Gestor Q', 'ativo'),
        (${FUNCIONARIO_F}, 'func-f@example.test', 'Funcionario F', 'ativo'),
        (${FUNCIONARIO_F2}, 'func-f2@example.test', 'Funcionario F2', 'ativo'),
        (${FUNCIONARIO_F3}, 'func-f3@example.test', 'Funcionario F3', 'ativo'),
        (${FUNCIONARIO_NOVO}, 'func-novo@example.test', 'Funcionario Novo', 'ativo'),
        (${GESTOR_B}, 'gestor-b@example.test', 'Gestor B', 'ativo')
      on conflict (id) do update set status = 'ativo'
    `;

    // Escopos diretos: gestores das prestadoras, membros da Selva e gestor do condominio B.
    const diretos: [string, string, string, string][] = [
      [GESTOR_P, PRESTADORA_P, ORG_SCOPE, "org_admin"],
      [GESTOR_Q, PRESTADORA_Q, ORG_SCOPE, "org_admin"],
      [FUNCIONARIO_F, PRESTADORA_P, ORG_SCOPE, "recepcionista"],
      [FUNCIONARIO_F2, PRESTADORA_P, ORG_SCOPE, "recepcionista"],
      [FUNCIONARIO_F3, PRESTADORA_P, ORG_SCOPE, "recepcionista"],
      [FUNCIONARIO_NOVO, PRESTADORA_P, ORG_SCOPE, "recepcionista"],
      [
        GESTOR_B,
        FIXTURE_ORG_B.orgId,
        FIXTURE_ORG_B.empreendimentoId,
        "empreendimento_gestor",
      ],
    ];
    for (const [usuario, org, emp, papel] of diretos) {
      await db`
        insert into escopos_usuario (usuario_id, org_id, empreendimento_id, papel_id, ativo)
        select ${usuario}, ${org}, ${emp}, p.id, true from papeis p where p.codigo = ${papel}
        on conflict (usuario_id, org_id, empreendimento_id) do update
          set papel_id = excluded.papel_id, ativo = true
      `;
    }

    // Contratos voltam ao estado inicial a cada execucao.
    const contratos: [string, string, string, string, string, string][] = [
      [
        CONTRATO_P_A,
        PRESTADORA_P,
        FIXTURE_ORG_A.orgId,
        FIXTURE_ORG_A.empreendimentoId,
        "portaria",
        "ativo",
      ],
      [
        CONTRATO_Q_A,
        PRESTADORA_Q,
        FIXTURE_ORG_A.orgId,
        FIXTURE_ORG_A.empreendimentoId,
        "portaria",
        "ativo",
      ],
      [
        CONTRATO_P_B_PROPOSTO,
        PRESTADORA_P,
        FIXTURE_ORG_B.orgId,
        FIXTURE_ORG_B.empreendimentoId,
        "portaria",
        "proposto",
      ],
      [
        CONTRATO_P_A_ENCERRAR,
        PRESTADORA_P,
        FIXTURE_ORG_A.orgId,
        FIXTURE_ORG_A.empreendimentoId,
        "vigilancia",
        "ativo",
      ],
    ];
    for (const [id, prestadora, local, emp, servico, status] of contratos) {
      await db`
        insert into contratos_servico
          (id, prestadora_org_id, local_org_id, empreendimento_id, servico, papeis_permitidos, status)
        values
          (${id}, ${prestadora}, ${local}, ${emp}, ${servico}::contrato_servico_tipo,
           array['recepcionista','auditor']::papel_codigo[], ${status}::contrato_status)
        on conflict (id) do update set
          status = excluded.status, encerrado_por = null, encerrado_em = null, motivo = null
      `;
    }

    // Escopos via contrato no condominio A.
    const viaContrato: [string, string][] = [
      [FUNCIONARIO_F, CONTRATO_P_A],
      [FUNCIONARIO_F2, CONTRATO_P_A_ENCERRAR],
      [FUNCIONARIO_F3, CONTRATO_P_A_ENCERRAR],
    ];
    for (const [usuario, contrato] of viaContrato) {
      await db`
        insert into escopos_usuario
          (usuario_id, org_id, empreendimento_id, papel_id, ativo, via_contrato_id)
        select ${usuario}, ${FIXTURE_ORG_A.orgId}, ${FIXTURE_ORG_A.empreendimentoId}, p.id, true, ${contrato}
        from papeis p where p.codigo = 'recepcionista'
        on conflict (usuario_id, org_id, empreendimento_id) do update
          set ativo = true, via_contrato_id = excluded.via_contrato_id, papel_id = excluded.papel_id
      `;
    }
    await db`
      delete from escopos_usuario
      where usuario_id = ${FUNCIONARIO_NOVO} and via_contrato_id is not null
    `;

    await db`
      insert into unidades (id, org_id, empreendimento_id, codigo) values
        (${UNIDADE_A}, ${FIXTURE_ORG_A.orgId}, ${FIXTURE_ORG_A.empreendimentoId}, 'IP-A-101'),
        (${UNIDADE_B}, ${FIXTURE_ORG_B.orgId}, ${FIXTURE_ORG_B.empreendimentoId}, 'IP-B-101')
      on conflict (id) do nothing
    `;
  });

  it("prestadora Q nao le contrato da prestadora P (0 linhas)", async () => {
    const rows = await withRls(
      sql,
      gestorQ,
      async (tx) =>
        tx`select id from contratos_servico where id = ${CONTRATO_P_A}`,
    );
    expect(rows).toHaveLength(0);
  });

  it("as duas pontas do contrato enxergam o contrato", async () => {
    const pelaPrestadora = await withRls(
      sql,
      gestorP,
      async (tx) =>
        tx`select id from contratos_servico where id = ${CONTRATO_P_A}`,
    );
    const peloCondominio = await withRls(
      sql,
      gestorA,
      async (tx) =>
        tx`select id from contratos_servico where id = ${CONTRATO_P_A}`,
    );
    expect(pelaPrestadora).toHaveLength(1);
    expect(peloCondominio).toHaveLength(1);
  });

  it("app nao escreve em contratos_servico direto (so pelas funcoes)", async () => {
    await expect(
      withRls(
        sql,
        gestorP,
        async (tx) =>
          tx`update contratos_servico set status = 'ativo' where id = ${CONTRATO_P_B_PROPOSTO}`,
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("recepcionista do condominio chama propor_contrato: SEM_PERMISSAO", async () => {
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        async (tx) =>
          tx`
          select app.propor_contrato(
            ${FIXTURE_ORG_B.orgId}::uuid,
            ${FIXTURE_ORG_B.empreendimentoId}::uuid,
            'vigilancia'::contrato_servico_tipo,
            array['recepcionista']::papel_codigo[]
          )
        `,
      ),
    ).rejects.toThrow(/SEM_PERMISSAO/);
  });

  it("funcionario via contrato chama atribuir_funcionario_contrato: SEM_PERMISSAO", async () => {
    await expect(
      withRls(
        sql,
        funcionarioNoLocalA,
        async (tx) =>
          tx`
          select app.atribuir_funcionario_contrato(
            ${CONTRATO_P_A}::uuid, ${FUNCIONARIO_NOVO}::uuid, 'recepcionista'::papel_codigo
          )
        `,
      ),
    ).rejects.toThrow(/SEM_PERMISSAO/);
  });

  it("contrato nao aceita papel de gestao em papeis_permitidos (check)", async () => {
    await expect(
      sql`
        insert into contratos_servico
          (prestadora_org_id, local_org_id, empreendimento_id, servico, papeis_permitidos)
        values
          (${PRESTADORA_Q}, ${FIXTURE_ORG_B.orgId}, ${FIXTURE_ORG_B.empreendimentoId},
           'vigilancia', array['empreendimento_gestor']::papel_codigo[])
      `,
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("atribuir empreendimento_gestor por contrato: erro", async () => {
    await expect(
      withRls(
        sql,
        gestorP,
        async (tx) =>
          tx`
          select app.atribuir_funcionario_contrato(
            ${CONTRATO_P_A}::uuid, ${FUNCIONARIO_NOVO}::uuid, 'empreendimento_gestor'::papel_codigo
          )
        `,
      ),
    ).rejects.toThrow(/PAPEL_FORA_DO_CONTRATO/);
  });

  it("gestor da prestadora atribui funcionario com papel permitido", async () => {
    const escopos = await withRls(sql, gestorP, async (tx) => {
      await tx`
        select app.atribuir_funcionario_contrato(
          ${CONTRATO_P_A}::uuid, ${FUNCIONARIO_NOVO}::uuid, 'auditor'::papel_codigo
        )
      `;
      await tx.unsafe(`reset role`);
      return tx<{ ativo: boolean; via_contrato_id: string }[]>`
        select ativo, via_contrato_id from escopos_usuario
        where usuario_id = ${FUNCIONARIO_NOVO} and org_id = ${FIXTURE_ORG_A.orgId}
      `;
    });
    expect(escopos).toEqual([{ ativo: true, via_contrato_id: CONTRATO_P_A }]);
  });

  it("prestadora ativa contrato sozinha (sem aceite do condominio): SEM_PERMISSAO", async () => {
    await expect(
      withRls(
        sql,
        gestorP,
        async (tx) =>
          tx`select app.aceitar_contrato(${CONTRATO_P_B_PROPOSTO}::uuid)`,
      ),
    ).rejects.toThrow(/SEM_PERMISSAO/);
  });

  it("gestor do condominio aceita o contrato proposto", async () => {
    const rows = await withRls(sql, gestorB, async (tx) => {
      await tx`select app.aceitar_contrato(${CONTRATO_P_B_PROPOSTO}::uuid)`;
      return tx<{ status: string }[]>`
        select status from contratos_servico where id = ${CONTRATO_P_B_PROPOSTO}
      `;
    });
    expect(rows).toEqual([{ status: "ativo" }]);
  });

  it("encerrar_contrato desativa todos os escopos do contrato na mesma transacao", async () => {
    const resultado = await withRls(sql, gestorA, async (tx) => {
      await tx`select app.encerrar_contrato(${CONTRATO_P_A_ENCERRAR}::uuid, 'fim do servico')`;
      await tx.unsafe(`reset role`);
      const escopos = await tx<{ ativo: boolean }[]>`
        select ativo from escopos_usuario where via_contrato_id = ${CONTRATO_P_A_ENCERRAR}
      `;
      const [contrato] = await tx<{ status: string; encerrado_por: string }[]>`
        select status, encerrado_por from contratos_servico where id = ${CONTRATO_P_A_ENCERRAR}
      `;
      return { escopos, contrato };
    });
    expect(resultado.escopos).toHaveLength(2);
    expect(resultado.escopos.every((e) => e.ativo === false)).toBe(true);
    expect(resultado.contrato).toEqual({
      status: "encerrado",
      encerrado_por: GESTOR_A,
    });
  });

  it("escopo via contrato encerrado nao reativa por update direto", async () => {
    await expect(
      // Como dono da tabela (sem RLS): nem um update direto reativa escopo de contrato encerrado.
      sql.begin(async (tx) => {
        await tx`
          update contratos_servico set status = 'encerrado' where id = ${CONTRATO_P_A_ENCERRAR}
        `;
        await tx`
          update escopos_usuario set ativo = true where via_contrato_id = ${CONTRATO_P_A_ENCERRAR}
        `;
      }),
    ).rejects.toThrow(/CONTRATO_INATIVO/);
  });

  it("funcionario via contrato le so o local do escopo ativo (0 linhas de outro condominio)", async () => {
    const rows = await withRls(
      sql,
      funcionarioNoLocalA,
      async (tx) =>
        tx<{ id: string }[]>`
        select id from unidades where id in (${UNIDADE_A}, ${UNIDADE_B})
      `,
    );
    expect(rows.map((r) => r.id)).toEqual([UNIDADE_A]);
  });

  it("evento do funcionario via contrato grava prestadora_org_id e contrato_id no audit_log", async () => {
    const [linha] = await withRls(
      sql,
      funcionarioNoLocalA,
      async (tx) =>
        tx<{ prestadora_org_id: string; contrato_id: string }[]>`
        insert into audit_log (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, origem)
        values (${FIXTURE_ORG_A.orgId}, ${FIXTURE_ORG_A.empreendimentoId}, ${FUNCIONARIO_F},
                'teste.ip1', 'unidade', 'ops')
        returning prestadora_org_id, contrato_id
      `,
    );
    expect(linha).toEqual({
      prestadora_org_id: PRESTADORA_P,
      contrato_id: CONTRATO_P_A,
    });
  });

  it("evento fora de contrato nao forja prestadora_org_id", async () => {
    const [linha] = await withRls(
      sql,
      gestorA,
      async (tx) =>
        tx<{ prestadora_org_id: string | null; contrato_id: string | null }[]>`
        insert into audit_log
          (org_id, empreendimento_id, ator_usuario_id, acao, alvo_tipo, origem, prestadora_org_id)
        values (${FIXTURE_ORG_A.orgId}, ${FIXTURE_ORG_A.empreendimentoId}, ${GESTOR_A},
                'teste.ip1', 'unidade', 'web', ${PRESTADORA_Q})
        returning prestadora_org_id, contrato_id
      `,
    );
    expect(linha).toEqual({ prestadora_org_id: null, contrato_id: null });
  });

  it("list_escopos_acessiveis mostra o contrato do funcionario", async () => {
    const [{ escopos }] = await withRls(
      sql,
      funcionarioNoLocalA,
      async (tx) =>
        tx<{ escopos: Record<string, unknown>[] }[]>`
        select app.list_escopos_acessiveis(${FUNCIONARIO_F}::uuid) as escopos
      `,
    );
    expect(escopos).toContainEqual(
      expect.objectContaining({
        org_id: FIXTURE_ORG_A.orgId,
        via_contrato: true,
        prestadora_nome: "Selva Servicos",
        contrato_status: "ativo",
      }),
    );
    expect(escopos).toContainEqual(
      expect.objectContaining({ org_id: PRESTADORA_P, via_contrato: false }),
    );
  });
});
