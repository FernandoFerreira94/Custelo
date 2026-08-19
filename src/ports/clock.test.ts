import { describe, expect, it } from "vitest";

import { FakeClock } from "@/tests/fakes/clock";

describe("FakeClock", () => {
  it("devolve uma copia, nao a referencia interna", () => {
    const clock = new FakeClock(new Date("2026-08-18T12:00:00.000Z"));
    const a = clock.now();
    a.setUTCHours(0);
    expect(clock.now().toISOString()).toBe("2026-08-18T12:00:00.000Z");
  });

  it("avanca o tempo sem esperar o relogio real", () => {
    const clock = new FakeClock(new Date("2026-08-18T12:00:00.000Z"));
    clock.advance(60_000);
    expect(clock.now().toISOString()).toBe("2026-08-18T12:01:00.000Z");
  });
});
