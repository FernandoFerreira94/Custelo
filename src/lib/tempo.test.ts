import { describe, expect, it } from "vitest";

import { diaEHora, haQuanto } from "@/lib/tempo";

const AGORA = new Date("2026-11-18T15:00:00Z");
const antes = (ms: number) => new Date(AGORA.getTime() - ms);

describe("haQuanto", () => {
  it.each([
    [antes(10_000), "agora"],
    [antes(12 * 60_000), "há 12 min"],
    [antes(3 * 3_600_000), "há 3 h"],
    [antes(86_400_000), "há 1 dia"],
    [antes(5 * 86_400_000), "há 5 dias"],
    [new Date(AGORA.getTime() + 60_000), "agora"],
  ])("%s → %s", (d, esperado) => {
    expect(haQuanto(d, AGORA)).toBe(esperado);
  });
});

it("diaEHora usa o fuso de São Paulo", () => {
  expect(diaEHora(new Date("2026-11-03T17:32:00Z"))).toBe("03/11 às 14:32");
});
