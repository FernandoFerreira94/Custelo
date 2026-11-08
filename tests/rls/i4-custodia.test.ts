import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
  withRls,
} from "./helpers";

type F = typeof FIXTURE_ORG_A;

describe("I4 custódia", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  async function novaEncomenda(f: F) {
    const id = uuidv7();
    await withRls(
      sql,
      f,
      (tx) => tx`
      insert into encomendas (id, org_id, empreendimento_id, codigo_curto, origem, ocorrido_em, recebido_por)
      values (${id}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'AB12', 'online', now(), ${f.userId}::uuid)`,
    );
    return id;
  }

  function evento(
    f: F,
    encomendaId: string,
    seq: number,
    tipo: string,
    de: string | null,
    para: string,
    dados: Record<string, unknown> = {},
  ) {
    return withRls(
      sql,
      f,
      (tx) => tx`
      insert into custody_events (id, org_id, empreendimento_id, encomenda_id, sequencia, tipo,
        estado_anterior, estado_novo, dados, ator_tipo, ator_usuario_id, origem, ocorrido_em)
      values (${uuidv7()}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${encomendaId}::uuid, ${seq}, ${tipo},
        ${de}::encomenda_estado, ${para}::encomenda_estado, ${sql.json(dados as never)}, 'usuario', ${f.userId}::uuid, 'online', now())
      returning id`,
    );
  }

  /** Ponto + local de guarda criados como dono (fixture), para o teste de FK composta. */
  async function novoLocal(f: F) {
    const pontoId = uuidv7();
    const localId = uuidv7();
    await sql`
      insert into pontos_recebimento (id, org_id, empreendimento_id, nome)
      values (${pontoId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'Portaria')`;
    await sql`
      insert into locais_guarda (id, org_id, empreendimento_id, ponto_id, codigo)
      values (${localId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pontoId}::uuid, ${`L-${localId.slice(-6)}`})`;
    return localId;
  }

  it("encomenda nasce RECEBIDA, versão 0, sem unidade, mesmo que o insert peça outra coisa", async () => {
    const id = uuidv7();
    await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`
      insert into encomendas (id, org_id, empreendimento_id, estado, versao, codigo_curto, origem, ocorrido_em, recebido_por)
      values (${id}::uuid, ${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, 'RETIRADA', 9,
              'AB12', 'online', now(), ${FIXTURE_ORG_A.userId}::uuid)`,
    );
    const [e] = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) =>
        tx`select estado, versao, unidade_id from encomendas where id = ${id}`,
    );
    expect(e).toMatchObject({
      estado: "RECEBIDA",
      versao: 0,
      unidade_id: null,
    });
  });

  it("evento projeta estado e versão na mesma transação", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    await evento(
      FIXTURE_ORG_A,
      id,
      2,
      "MARCADA_NAO_IDENTIFICADA",
      "RECEBIDA",
      "NAO_IDENTIFICADA",
    );
    const [e] = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`select estado, versao from encomendas where id = ${id}`,
    );
    expect(e).toMatchObject({ estado: "NAO_IDENTIFICADA", versao: 2 });
  });

  it("evento não aceita UPDATE, DELETE nem TRUNCATE, nem como dono da tabela", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    const [ev] = await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`update custody_events set tipo = 'X' where id = ${ev.id}`,
      ),
    ).rejects.toThrow();
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`delete from custody_events where id = ${ev.id}`,
      ),
    ).rejects.toThrow();
    // `sql` é a conexão do dono (fora do withRls): o trigger recusa mesmo assim.
    await expect(
      sql`update custody_events set tipo = 'X' where id = ${ev.id}`,
    ).rejects.toThrow(/APPEND_ONLY/);
    await expect(
      sql`delete from custody_events where id = ${ev.id}`,
    ).rejects.toThrow(/APPEND_ONLY/);
    await expect(sql`truncate custody_events cascade`).rejects.toThrow(
      /APPEND_ONLY/,
    );
  });

  it("custelo_app não altera nem apaga a encomenda diretamente", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`update encomendas set estado = 'RETIRADA' where id = ${id}`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`delete from encomendas where id = ${id}`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("recusa sequência fora de ordem e estado anterior divergente", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    await expect(
      evento(
        FIXTURE_ORG_A,
        id,
        3,
        "MARCADA_NAO_IDENTIFICADA",
        "RECEBIDA",
        "NAO_IDENTIFICADA",
      ),
    ).rejects.toThrow(/VERSAO_DIVERGENTE/);
    await expect(
      evento(
        FIXTURE_ORG_A,
        id,
        2,
        "MARCADA_NAO_IDENTIFICADA",
        "IDENTIFICADA",
        "NAO_IDENTIFICADA",
      ),
    ).rejects.toThrow(/ESTADO_DIVERGENTE/);
  });

  it("estado terminal não volta a ativo, nem por insert direto", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    await evento(
      FIXTURE_ORG_A,
      id,
      2,
      "REGISTRO_CANCELADO",
      "RECEBIDA",
      "CANCELADA",
    );
    await expect(
      evento(
        FIXTURE_ORG_A,
        id,
        3,
        "IDENTIFICACAO_CONFIRMADA",
        "CANCELADA",
        "IDENTIFICADA",
      ),
    ).rejects.toThrow(/TRANSICAO_PROIBIDA/);
  });

  it("não grava evento de A em encomenda de B", async () => {
    const idB = await novaEncomenda(FIXTURE_ORG_B);
    await expect(
      evento(FIXTURE_ORG_A, idB, 1, "RECEBIMENTO_REGISTRADO", null, "RECEBIDA"),
    ).rejects.toThrow();
  });

  it("evento não aponta local de guarda de outro empreendimento (FK composta na projeção)", async () => {
    const localB = await novoLocal(FIXTURE_ORG_B);
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    await expect(
      evento(
        FIXTURE_ORG_A,
        id,
        2,
        "LOCALIZACAO_ALTERADA",
        "RECEBIDA",
        "RECEBIDA",
        { para: { local_guarda_id: localB } },
      ),
    ).rejects.toMatchObject({ code: "23503" });
  });

  it("não lê encomendas nem eventos de outro tenant", async () => {
    const idB = await novaEncomenda(FIXTURE_ORG_B);
    await evento(
      FIXTURE_ORG_B,
      idB,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    expect(
      await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`select id from encomendas where id = ${idB}`,
      ),
    ).toEqual([]);
    expect(
      await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`select id from custody_events where encomenda_id = ${idB}`,
      ),
    ).toEqual([]);
  });

  it("dois eventos concorrentes na mesma versão: um passa, o outro falha", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    await evento(
      FIXTURE_ORG_A,
      id,
      1,
      "RECEBIMENTO_REGISTRADO",
      null,
      "RECEBIDA",
    );
    const r = await Promise.allSettled([
      evento(
        FIXTURE_ORG_A,
        id,
        2,
        "MARCADA_NAO_IDENTIFICADA",
        "RECEBIDA",
        "NAO_IDENTIFICADA",
      ),
      evento(
        FIXTURE_ORG_A,
        id,
        2,
        "REGISTRO_CANCELADO",
        "RECEBIDA",
        "CANCELADA",
      ),
    ]);
    expect(r.filter((x) => x.status === "fulfilled")).toHaveLength(1);
    expect(r.filter((x) => x.status === "rejected")).toHaveLength(1);
  });

  it("custelo_app não apaga local de guarda", async () => {
    const localId = await novoLocal(FIXTURE_ORG_A);
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`delete from locais_guarda where id = ${localId}`,
      ),
    ).rejects.toMatchObject({ code: "42501" });
  });
});
