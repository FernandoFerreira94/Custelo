import type {
  JobEnqueueInput,
  JobEnqueueResult,
  JobScheduler,
} from "@/ports/job-scheduler";

import { inngest } from "./inngest-client";

export class InngestJobScheduler implements JobScheduler {
  async enqueue(input: JobEnqueueInput): Promise<JobEnqueueResult> {
    try {
      await inngest.send({
        id: input.idempotencyKey,
        name: input.name,
        data: input.data,
        ts: input.runAt?.getTime(),
      });
      return { ok: true };
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
}
