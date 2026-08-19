import { describe, expect, it } from "vitest";

import { FakeJobScheduler } from "@/tests/fakes/job-scheduler";

describe("FakeJobScheduler", () => {
  it("enfileira com chave de idempotencia", async () => {
    const jobs = new FakeJobScheduler();
    const input = {
      name: "custelo/foundation.heartbeat",
      data: { source: "test" },
      idempotencyKey: "hb-1",
    };

    expect(await jobs.enqueue(input)).toEqual({ ok: true });
    expect(await jobs.enqueue(input)).toEqual({ ok: true });
    expect(jobs.enqueued).toHaveLength(1);
  });

  it("propaga indisponibilidade sem throw", async () => {
    const jobs = new FakeJobScheduler();
    jobs.nextResult = { ok: false, reason: "unavailable" };

    const result = await jobs.enqueue({
      name: "custelo/foundation.heartbeat",
      data: {},
      idempotencyKey: "hb-2",
    });

    expect(result).toEqual({ ok: false, reason: "unavailable" });
    expect(jobs.enqueued).toHaveLength(0);
  });
});
