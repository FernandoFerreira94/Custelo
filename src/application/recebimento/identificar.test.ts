import { describe, expect, it } from "vitest";

import type { Contexto } from "@/application/auth/contexto";
import { identificar } from "@/application/recebimento/identificar";
import { MSG_RECEBIMENTO } from "@/lib/mensagens";
import { criarCustodiaRepoFake } from "@/tests/fakes/custodia-repo";
import { FakeJobScheduler } from "@/tests/fakes/job-scheduler";

const ctx: Contexto = {
  orgId: "o1",
  empreendimentoId: "e1",
  usuarioId: "u1",
  papel: "recepcionista",
  escopoDeOrg: false,
};
const U = "0196f000-0000-7000-8000-aaaaaaaab304";
const ENC = "0196f000-0000-7000-8000-000000000001";
const EV = "0196f000-0000-7000-8000-000000000002";

describe("identificar (CUS-007)", () => {
  it("não identificada ganha destino, emite o job uma vez e repetir não duplica", async () => {
    const fake = criarCustodiaRepoFake();
    fake.semear({ id: ENC, estado: "NAO_IDENTIFICADA", versao: 2 });
    fake.semearUnidade({ id: U, codigo: "B-304" });
    const jobs = new FakeJobScheduler();
    const deps = { repo: fake.repo, jobs, clock: { now: () => new Date() } };
    const e = { encomendaId: ENC, eventoId: EV, unidadeId: U };

    const r = await identificar(ctx, e, deps);
    expect(r).toMatchObject({
      ok: true,
      mensagem: MSG_RECEBIMENTO.identificada("B-304"),
    });
    expect(fake.encomendas[0]).toMatchObject({
      estado: "IDENTIFICADA",
      unidadeId: U,
    });

    const de_novo = await identificar(ctx, e, deps);
    expect(de_novo).toMatchObject({ ok: true, data: { repetido: true } });
    expect(fake.eventos).toHaveLength(1);
    expect(jobs.enqueued).toHaveLength(1);
  });
});
