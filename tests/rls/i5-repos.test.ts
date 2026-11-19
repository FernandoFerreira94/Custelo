import { uuidv7 } from "uuidv7";
import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { registrarRecebimento } from "@/application/recebimento/registrar-recebimento";
import { esquemaDeRecebimento } from "@/application/recebimento/schemas";
import {
  consultasCustodiaRepo,
  custodiaRepo,
} from "@/infrastructure/custodia/custodia-repo";
import { leituraRepo } from "@/infrastructure/recebimento/leitura-repo";
import { FakeJobScheduler } from "@/tests/fakes/job-scheduler";

import {
  FIXTURE_ORG_A,
  FIXTURE_ORG_B,
  seedTenantPair,
  setupRlsSuite,
} from "./helpers";

type F = typeof FIXTURE_ORG_A;
const ctxDe = (f: F): Contexto => ({
  orgId: f.orgId,
  empreendimentoId: f.empreendimentoId,
  usuarioId: f.userId,
  papel: "recepcionista",
  escopoDeOrg: false,
});
const ctxA = ctxDe(FIXTURE_ORG_A);

describe("recebimento contra o banco real (RLS)", () => {
  const sql = setupRlsSuite(async (c) => {
    await seedTenantPair(c);
  });

  async function cenario(f: F) {
    const unidadeId = uuidv7();
    const pontoId = uuidv7();
    const localId = uuidv7();
    await sql`insert into unidades (id, org_id, empreendimento_id, codigo)
      values (${unidadeId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${`R-${unidadeId.slice(-6)}`})`;
    await sql`insert into pontos_recebimento (id, org_id, empreendimento_id, nome)
      values (${pontoId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, 'Portaria')`;
    await sql`insert into locais_guarda (id, org_id, empreendimento_id, ponto_id, codigo)
      values (${localId}::uuid, ${f.orgId}::uuid, ${f.empreendimentoId}::uuid, ${pontoId}::uuid, 'C2')`;
    return { unidadeId, pontoId, localId };
  }

  const entrada = (
    c: Awaited<ReturnType<typeof cenario>>,
    extra: object = {},
  ) => {
    const encomendaId = uuidv7();
    return esquemaDeRecebimento.parse({
      encomendaId,
      eventos: { recebimento: uuidv7(), destino: uuidv7(), local: uuidv7() },
      destino: {
        tipo: "unidade",
        unidadeId: c.unidadeId,
        nomeDestinatario: "Mariana S. Souza",
      },
      pontoId: c.pontoId,
      localGuardaId: c.localId,
      volumes: 2,
      observacao: "Caixa amassada",
      comFoto: true,
      foto: {
        caminho: `${FIXTURE_ORG_A.orgId}/${FIXTURE_ORG_A.empreendimentoId}/${encomendaId}.webp`,
        sha256: "b".repeat(64),
        bytes: 900,
        mime: "image/webp",
      },
      origem: "online",
      ocorridoEm: new Date().toISOString(),
      dispositivoId: "teste",
      ...extra,
    });
  };

  it("grava encomenda, eventos, foto, leitura e sugestão numa transação só", async () => {
    const c = await cenario(FIXTURE_ORG_A);
    const leituraId = await leituraRepo.gravarLeitura(ctxA, {
      provedor: "teste",
      modelo: "m",
      versaoPrompt: "v1",
      latenciaMs: 800,
      resultado: "ok",
      confianca: "media",
      unidadeLida: "R",
      nomeLido: "MARIANA",
      unidadeSugeridaId: c.unidadeId,
      pessoaSugeridaId: null,
      tokensEntrada: 10,
      tokensSaida: 2,
      custoMicroUsd: 5,
    });
    const e = entrada(c, {
      leitura: {
        id: leituraId,
        confianca: "media",
        unidadeSugeridaId: c.unidadeId,
      },
    });
    const jobs = new FakeJobScheduler();
    const r = await registrarRecebimento(ctxA, e, {
      repo: custodiaRepo,
      jobs,
      clock: { now: () => new Date() },
    });
    expect(r).toMatchObject({ ok: true, data: { identificada: true } });

    const d = await consultasCustodiaRepo.detalhe(ctxA, e.encomendaId);
    expect(d).toMatchObject({
      estado: "IDENTIFICADA",
      versao: 3,
      volumes: 2,
      destinatario: "Mariana S. Souza",
      local: { codigo: "C2" },
    });
    const [foto] =
      await sql`select sha256 from fotos_etiqueta where encomenda_id = ${e.encomendaId}`;
    expect(foto?.sha256).toBe("b".repeat(64));
    const [leitura] =
      await sql`select encomenda_id, aceita from leituras_etiqueta where id = ${leituraId}`;
    expect(leitura).toMatchObject({
      encomenda_id: e.encomendaId,
      aceita: true,
    });
    const [sug] =
      await sql`select nome, status from sugestoes_cadastro where encomenda_id = ${e.encomendaId}`;
    expect(sug).toMatchObject({ nome: "Mariana S. Souza", status: "pendente" });

    // Reenvio (duplo toque ou fila offline): nada duplica.
    const de_novo = await registrarRecebimento(ctxA, e, {
      repo: custodiaRepo,
      jobs,
      clock: { now: () => new Date() },
    });
    expect(de_novo).toMatchObject({ ok: true, data: { repetido: true } });
    expect(jobs.enqueued).toHaveLength(1);
  });

  it("unidade de outro empreendimento é recusada e nada fica gravado", async () => {
    const cA = await cenario(FIXTURE_ORG_A);
    const cB = await cenario(FIXTURE_ORG_B);
    const e = entrada(cA, {
      destino: { tipo: "unidade", unidadeId: cB.unidadeId },
    });
    const r = await registrarRecebimento(ctxA, e, {
      repo: custodiaRepo,
      jobs: new FakeJobScheduler(),
      clock: { now: () => new Date() },
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
    expect(await consultasCustodiaRepo.detalhe(ctxA, e.encomendaId)).toBeNull();
  });

  it("config e cadastro do matching vêm só do próprio empreendimento", async () => {
    const cB = await cenario(FIXTURE_ORG_B);
    const cadastro = await leituraRepo.cadastroMatching(ctxA);
    expect(cadastro.unidades.some((u) => u.id === cB.unidadeId)).toBe(false);
    const config = await leituraRepo.configLeitura(ctxA);
    expect(config).toMatchObject({
      leituraAutomatica: true,
      leiturasPorDia: 600,
    });
  });
});
