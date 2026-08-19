/**
 * Fila e espera duravel (ADR-009). A aplicacao emite; o adaptador traduz
 * para o Inngest. `setTimeout` nao e espera duravel.
 *
 * Toda emissao carrega chave de idempotencia. Falha de fornecedor vira
 * resultado tipado, nunca excecao solta ate a UI.
 */
export type JobEnqueueInput = {
  name: string;
  data: Record<string, unknown>;
  idempotencyKey: string;
  runAt?: Date;
};

export type JobEnqueueResult =
  { ok: true } | { ok: false; reason: "unavailable" | "rejected" };

export interface JobScheduler {
  enqueue(input: JobEnqueueInput): Promise<JobEnqueueResult>;
}
