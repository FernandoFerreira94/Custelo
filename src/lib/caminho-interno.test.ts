import { describe, expect, it } from "vitest";

import { caminhoInterno } from "@/lib/caminho-interno";

describe("caminhoInterno", () => {
  it.each([
    ["/receber", "/receber"],
    ["/gestao?x=1", "/gestao?x=1"],
    ["//evil.com", "/"],
    ["https://evil.com", "/"],
    ["/\\evil.com", "/"],
    ["receber", "/"],
    [undefined, "/"],
  ])("%s -> %s", (entrada, esperado) => {
    expect(caminhoInterno(entrada)).toBe(esperado);
  });
});
