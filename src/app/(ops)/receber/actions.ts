"use server";

import {
  esquemaDeIdentificacao,
  identificar,
} from "@/application/recebimento/identificar";
import { registrarRecebimento } from "@/application/recebimento/registrar-recebimento";
import { esquemaDeRecebimento } from "@/application/recebimento/schemas";
import { executarAcao } from "@/infrastructure/auth/executar-acao";
import { SystemClock } from "@/infrastructure/clock/system-clock";
import { custodiaRepo } from "@/infrastructure/custodia/custodia-repo";
import { InngestJobScheduler } from "@/infrastructure/jobs/inngest-scheduler";

const deps = () => ({
  repo: custodiaRepo,
  jobs: new InngestJobScheduler(),
  clock: new SystemClock(),
});

export async function registrarRecebimentoAction(entrada: unknown) {
  return executarAcao(esquemaDeRecebimento, entrada, {
    revalidar: ["/gestao/encomendas"],
    executar: (ctx, d) => registrarRecebimento(ctx, d, deps()),
  });
}

export async function identificarAction(entrada: unknown) {
  return executarAcao(esquemaDeIdentificacao, entrada, {
    revalidar: ["/gestao/encomendas"],
    executar: (ctx, d) => identificar(ctx, d, deps()),
  });
}
