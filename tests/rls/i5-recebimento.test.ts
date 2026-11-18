import { createHash } from "node:crypto";

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
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

describe("I5 recebimento: foto, leitura e sugestão de cadastro", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  async function novaEncomenda(f: F) {
    const id = uuidv7();
    await withRls(
      sql,
      f,
      (tx) => tx`
      insert into encomendas (id, org_id, empreendimento_id, codigo_curto, origem, ocorrido_em, recebido_por, observacao)
      values (${id}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'AB12', 'online', now(), ${f.userId}::uuid, 'Caixa amassada')`,
    );
    return id;
  }

  async function novaUnidade(f: F) {
    const id = uuidv7();
    await sql`insert into unidades (id, org_id, empreendimento_id, codigo)
      values (${id}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${`R-${id.slice(-8)}`})`;
    return id;
  }

  const foto = (f: F, encomendaId: string) =>
    withRls(
      sql,
      f,
      (tx) => tx`
      insert into fotos_etiqueta (org_id, empreendimento_id, encomenda_id, caminho, sha256, bytes, mime)
      values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${encomendaId}::uuid,
        ${`${f.orgId}/${f.empreendimentoId}/${encomendaId}.webp`}, ${sha(encomendaId)}, 1200, 'image/webp')
      returning id`,
    );

  const leitura = (
    f: F,
    extra: { unidade?: string; encomenda?: string } = {},
  ) =>
    withRls(
      sql,
      f,
      (tx) => tx`
      insert into leituras_etiqueta (org_id, empreendimento_id, encomenda_id, provedor, modelo, versao_prompt,
        latencia_ms, resultado, confianca, unidade_lida, unidade_sugerida_id)
      values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${extra.encomenda ?? null}::uuid, 'teste', 'modelo-x', 'v1',
        900, 'ok', 'alta', 'Bloco B Ap 304', ${extra.unidade ?? null}::uuid)
      returning id`,
    );

  const sugestao = (f: F, unidadeId: string) =>
    withRls(
      sql,
      f,
      (tx) => tx`
      insert into sugestoes_cadastro (org_id, empreendimento_id, unidade_id, nome, origem, criado_por)
      values (${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${unidadeId}::uuid, 'Mariana S. Souza', 'recebimento', ${f.userId}::uuid)
      returning id`,
    );

  it("encomenda guarda a observação da entrada manual (até 280)", async () => {
    const id = await novaEncomenda(FIXTURE_ORG_A);
    const [e] = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`select observacao from encomendas where id = ${id}`,
    );
    expect(e?.observacao).toBe("Caixa amassada");
    await expect(
      withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
        insert into encomendas (id, org_id, empreendimento_id, codigo_curto, origem, ocorrido_em, recebido_por, observacao)
        values (${uuidv7()}::uuid, ${FIXTURE_ORG_A.orgId}::uuid, ${FIXTURE_ORG_A.empreendimentoId}::uuid, 'AB12',
          'online', now(), ${FIXTURE_ORG_A.userId}::uuid, ${"x".repeat(281)})`,
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("config ganha leitura automática, foto obrigatória e teto diário com padrão", async () => {
    const [c] = await withRls(
      sql,
      FIXTURE_ORG_A,
      (tx) => tx`
      select leitura_automatica, foto_obrigatoria, leituras_por_dia from empreendimento_config
      where empreendimento_id = ${FIXTURE_ORG_A.empreendimentoId}`,
    );
    expect(c).toEqual({
      leitura_automatica: true,
      foto_obrigatoria: true,
      leituras_por_dia: 600,
    });
  });

  describe("fotos_etiqueta", () => {
    it("não lê foto de outro tenant", async () => {
      await foto(FIXTURE_ORG_B, await novaEncomenda(FIXTURE_ORG_B));
      const linhas = await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`select 1 from fotos_etiqueta where empreendimento_id = ${FIXTURE_ORG_B.empreendimentoId}`,
      );
      expect(linhas).toHaveLength(0);
    });

    it("não grava foto apontando para encomenda de outro empreendimento", async () => {
      const deB = await novaEncomenda(FIXTURE_ORG_B);
      await expect(foto(FIXTURE_ORG_A, deB)).rejects.toMatchObject({
        code: "23503",
      });
    });

    it("segunda foto da mesma encomenda é recusada; app não apaga nem altera", async () => {
      const id = await novaEncomenda(FIXTURE_ORG_A);
      await foto(FIXTURE_ORG_A, id);
      await expect(foto(FIXTURE_ORG_A, id)).rejects.toMatchObject({
        code: "23505",
      });
      await expect(
        withRls(
          sql,
          FIXTURE_ORG_A,
          (tx) => tx`delete from fotos_etiqueta where encomenda_id = ${id}`,
        ),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        withRls(
          sql,
          FIXTURE_ORG_A,
          (tx) =>
            tx`update fotos_etiqueta set caminho = 'outro/caminho/x.webp' where encomenda_id = ${id}`,
        ),
      ).rejects.toMatchObject({ code: "42501" });
    });
  });

  describe("leituras_etiqueta", () => {
    it("não lê leitura de outro tenant", async () => {
      await leitura(FIXTURE_ORG_B);
      const linhas = await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`select 1 from leituras_etiqueta where empreendimento_id = ${FIXTURE_ORG_B.empreendimentoId}`,
      );
      expect(linhas).toHaveLength(0);
    });

    it("não sugere unidade de outro empreendimento", async () => {
      const unidadeB = await novaUnidade(FIXTURE_ORG_B);
      await expect(
        leitura(FIXTURE_ORG_A, { unidade: unidadeB }),
      ).rejects.toMatchObject({ code: "23503" });
    });

    it("liga à encomenda e marca aceita, mas não reescreve a confiança", async () => {
      const [l] = await leitura(FIXTURE_ORG_A);
      const id = await novaEncomenda(FIXTURE_ORG_A);
      await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`update leituras_etiqueta set encomenda_id = ${id}::uuid, aceita = true where id = ${l!.id}`,
      );
      await expect(
        withRls(
          sql,
          FIXTURE_ORG_A,
          (tx) =>
            tx`update leituras_etiqueta set confianca = 'baixa' where id = ${l!.id}`,
        ),
      ).rejects.toMatchObject({ code: "42501" });
    });
  });

  describe("sugestoes_cadastro", () => {
    it("não lê sugestão de outro tenant", async () => {
      await sugestao(FIXTURE_ORG_B, await novaUnidade(FIXTURE_ORG_B));
      const linhas = await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) =>
          tx`select 1 from sugestoes_cadastro where empreendimento_id = ${FIXTURE_ORG_B.empreendimentoId}`,
      );
      expect(linhas).toHaveLength(0);
    });

    it("não sugere pessoa numa unidade de outro empreendimento", async () => {
      const unidadeB = await novaUnidade(FIXTURE_ORG_B);
      await expect(sugestao(FIXTURE_ORG_A, unidadeB)).rejects.toMatchObject({
        code: "23503",
      });
    });

    it("gestor resolve a sugestão; o nome sugerido não muda", async () => {
      const [s] = await sugestao(
        FIXTURE_ORG_A,
        await novaUnidade(FIXTURE_ORG_A),
      );
      await withRls(
        sql,
        FIXTURE_ORG_A,
        (tx) => tx`
        update sugestoes_cadastro set status = 'descartada', resolvido_por = ${FIXTURE_ORG_A.userId}::uuid,
          resolvido_em = now() where id = ${s!.id}`,
      );
      await expect(
        withRls(
          sql,
          FIXTURE_ORG_A,
          (tx) =>
            tx`update sugestoes_cadastro set nome = 'Outro Nome' where id = ${s!.id}`,
        ),
      ).rejects.toMatchObject({ code: "42501" });
    });
  });
});
