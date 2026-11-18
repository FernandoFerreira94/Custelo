import { beforeEach, describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { registrarRecebimento } from "@/application/recebimento/registrar-recebimento";
import {
  type EntradaRecebimento,
  esquemaDeRecebimento,
} from "@/application/recebimento/schemas";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import { criarCustodiaRepoFake } from "@/tests/fakes/custodia-repo";
import { FakeJobScheduler } from "@/tests/fakes/job-scheduler";

const ctx = (papel: Contexto["papel"]): Contexto => ({
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel,
  escopoDeOrg: false,
});
const recepcionista = ctx("recepcionista");
const AGORA = new Date("2026-11-18T14:00:00Z");

let n = 0;
const uuid = () => `0196f000-0000-7000-8000-${String(++n).padStart(12, "0")}`;
const U_B304 = "0196f000-0000-7000-8000-aaaaaaaab304";
const U_B034 = "0196f000-0000-7000-8000-aaaaaaaab034";
const P_MARI = "0196f000-0000-7000-8000-bbbbbbbbbbb1";
const PONTO = "0196f000-0000-7000-8000-cccccccccccc";
const C2 = "0196f000-0000-7000-8000-ddddddddddc2";

function entrada(extra: Partial<EntradaRecebimento> = {}): EntradaRecebimento {
  return esquemaDeRecebimento.parse({
    encomendaId: uuid(),
    eventos: { recebimento: uuid(), destino: uuid(), local: uuid() },
    destino: { tipo: "unidade", unidadeId: U_B304, pessoaId: P_MARI },
    pontoId: PONTO,
    localGuardaId: C2,
    volumes: 1,
    comFoto: true,
    foto: {
      caminho: "o1/e1/x.webp",
      sha256: "a".repeat(64),
      bytes: 1200,
      mime: "image/webp",
    },
    leitura: { id: uuid(), confianca: "alta", unidadeSugeridaId: U_B304 },
    origem: "online",
    ocorridoEm: AGORA.toISOString(),
    dispositivoId: "aparelho-1",
    ...extra,
  });
}

describe("registrarRecebimento", () => {
  let fake: ReturnType<typeof criarCustodiaRepoFake>;
  let jobs: FakeJobScheduler;
  const deps = () => ({ repo: fake.repo, jobs, clock: { now: () => AGORA } });

  beforeEach(() => {
    fake = criarCustodiaRepoFake();
    jobs = new FakeJobScheduler();
    fake.semearUnidade({ id: U_B304, codigo: "B-304" });
    fake.semearUnidade({ id: U_B034, codigo: "B-034" });
    fake.semearUnidade({ id: "inativa", codigo: "Z-1", ativo: false });
    fake.semearMorador({
      pessoaId: P_MARI,
      unidadeId: U_B304,
      nome: "Mariana Souza",
    });
    fake.semearLocal({ id: C2, codigo: "C2", pontoId: PONTO });
  });

  it("feliz: uma transação com encomenda, 3 eventos, foto e leitura aceita", async () => {
    const e = entrada();
    const r = await registrarRecebimento(recepcionista, e, deps());
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_RECEBIMENTO.salvo("B-304"),
      data: { identificada: true, repetido: false },
    });
    expect(fake.eventos.map((x) => x.tipo)).toEqual([
      "RECEBIMENTO_REGISTRADO",
      "IDENTIFICACAO_CONFIRMADA",
      "LOCALIZACAO_ALTERADA",
    ]);
    expect(fake.eventos[0]?.dados).toMatchObject({
      com_foto: true,
      leitura: { confianca: "alta", aceita: true },
    });
    expect(fake.encomendas[0]).toMatchObject({
      estado: "IDENTIFICADA",
      unidadeId: U_B304,
      pessoaId: P_MARI,
      localGuardaId: C2,
    });
    expect(fake.fotos).toHaveLength(1);
    expect(fake.leiturasVinculadas[0]).toMatchObject({ aceita: true });
    expect(jobs.enqueued[0]).toMatchObject({
      name: "custodia/encomenda.identificada",
      idempotencyKey: e.eventos.destino,
    });
  });

  it("o porteiro trocou a sugestão: aceita false e a sugerida fica no evento", async () => {
    await registrarRecebimento(
      recepcionista,
      entrada({
        destino: { tipo: "unidade", unidadeId: U_B034 },
        leitura: { id: uuid(), confianca: "media", unidadeSugeridaId: U_B304 },
      }),
      deps(),
    );
    expect(fake.leiturasVinculadas[0]).toMatchObject({ aceita: false });
    expect(fake.eventos[1]?.dados).toMatchObject({
      sugerida: U_B304,
      para: { unidade_id: U_B034 },
    });
  });

  it("pessoa fora do cadastro: nome na encomenda e sugestão para o gestor", async () => {
    const r = await registrarRecebimento(
      recepcionista,
      entrada({
        destino: {
          tipo: "unidade",
          unidadeId: U_B304,
          nomeDestinatario: "Mariana S. Souza",
        },
      }),
      deps(),
    );
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_RECEBIMENTO.salvoSemPessoa("Mariana", "B-304"),
    });
    expect(fake.eventos[1]?.dados.para).toMatchObject({
      pessoa_id: null,
      nome_destinatario: "Mariana S. Souza",
    });
    expect(fake.sugestoes).toEqual([
      expect.objectContaining({ unidadeId: U_B304, nome: "Mariana S. Souza" }),
    ]);
  });

  it("avisar a unidade toda marca o evento", async () => {
    await registrarRecebimento(
      recepcionista,
      entrada({
        destino: {
          tipo: "unidade",
          unidadeId: U_B304,
          avisarUnidadeToda: true,
        },
      }),
      deps(),
    );
    expect(fake.eventos[1]?.dados).toMatchObject({
      avisar_unidade: true,
      para: { pessoa_id: null },
    });
  });

  it("não identificada: sem aviso e sem job", async () => {
    const r = await registrarRecebimento(
      recepcionista,
      entrada({ destino: { tipo: "nao_identificada" }, leitura: undefined }),
      deps(),
    );
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_RECEBIMENTO.naoIdentificada,
    });
    expect(fake.encomendas[0]?.estado).toBe("NAO_IDENTIFICADA");
    expect(jobs.enqueued).toHaveLength(0);
  });

  it("reenvio do mesmo recebimento devolve o primeiro, sem duplicar", async () => {
    const e = entrada();
    await registrarRecebimento(recepcionista, e, deps());
    const r = await registrarRecebimento(recepcionista, e, deps());
    expect(r).toMatchObject({ ok: true, data: { repetido: true } });
    expect(fake.encomendas).toHaveLength(1);
    expect(fake.eventos).toHaveLength(3);
    expect(jobs.enqueued).toHaveLength(1);
  });

  it("unidade inativa ou de outro empreendimento: nada é criado", async () => {
    const r = await registrarRecebimento(
      recepcionista,
      entrada({
        destino: {
          tipo: "unidade",
          unidadeId: "0196f000-0000-7000-8000-00000000dead",
        },
      }),
      deps(),
    );
    expect(r).toMatchObject({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem: MSG_RECEBIMENTO.unidadeInativa,
    });
    expect(fake.encomendas).toHaveLength(0);
  });

  it("relógio do aparelho 15 min à frente: grava e marca o desvio", async () => {
    await registrarRecebimento(
      recepcionista,
      entrada({
        ocorridoEm: new Date(AGORA.getTime() + 15 * 60_000).toISOString(),
      }),
      deps(),
    );
    expect(fake.eventos[0]?.dados).toMatchObject({ relogio_desvio_s: 900 });
  });

  it("job fora do ar não desfaz o registro", async () => {
    jobs.nextResult = { ok: false, reason: "unavailable" };
    const r = await registrarRecebimento(recepcionista, entrada(), deps());
    expect(r).toMatchObject({ ok: true });
    expect(fake.encomendas).toHaveLength(1);
  });

  it("auditor não registra", async () => {
    const r = await registrarRecebimento(ctx("auditor"), entrada(), deps());
    expect(r).toMatchObject({ ok: false, codigo: "SEM_PERMISSAO" });
  });
});
