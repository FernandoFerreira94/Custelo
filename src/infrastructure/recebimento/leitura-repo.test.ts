import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { blocoENumero } from "@/infrastructure/recebimento/leitura-repo";

describe("blocoENumero", () => {
  it.each([
    ["B-304", "B", "304"],
    ["A 101", "A", "101"],
    ["T2-1504", "T2", "1504"],
    ["Casa 23", null, "23"],
    ["Sala 12", null, "12"],
    ["Administração", null, null],
  ])("%s → bloco %s, número %s", (codigo, bloco, numero) => {
    expect(blocoENumero(codigo)).toEqual({ bloco, numero });
  });
});
