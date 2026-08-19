import type {
  JobEnqueueInput,
  JobEnqueueResult,
  JobScheduler,
} from "@/ports/job-scheduler";

/**
 * Fila em memoria. Replica a regra de idempotencia da porta: mesma chave
 * nao enfileira de novo.
 */
export class FakeJobScheduler implements JobScheduler {
  readonly enqueued: JobEnqueueInput[] = [];
  nextResult: JobEnqueueResult = { ok: true };

  async enqueue(input: JobEnqueueInput): Promise<JobEnqueueResult> {
    if (this.nextResult.ok === false) {
      return this.nextResult;
    }
    const duplicata = this.enqueued.some(
      (job) => job.idempotencyKey === input.idempotencyKey,
    );
    if (!duplicata) {
      this.enqueued.push(input);
    }
    return { ok: true };
  }
}
