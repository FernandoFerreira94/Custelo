import { describe, expect, it } from "vitest";

import { contarLote, linhaEntra } from "@/application/importacao/selecao";

describe("quais linhas entram", () => {
  it.each([
    ["ok", null, true],
    ["aviso", null, true],
    ["erro", null, false],
    ["erro", "atualizar", false],
    ["duplicado", null, false],
    ["duplicado", "ignorar", false],
    ["duplicado", "atualizar", true],
    ["ignorada", null, false],
  ] as const)("%s com decisão %s → %s", (situacao, decisao, esperado) => {
    expect(linhaEntra({ situacao, decisao })).toBe(esperado);
  });

  it("conta cada situação e as duplicadas que esperam decisão", () => {
    const c = contarLote([
      { situacao: "ok", decisao: null },
      { situacao: "ok", decisao: null },
      { situacao: "aviso", decisao: null },
      { situacao: "erro", decisao: null },
      { situacao: "duplicado", decisao: null },
      { situacao: "duplicado", decisao: "atualizar" },
    ]);

    expect(c).toEqual({
      total: 6,
      prontas: 2,
      avisos: 1,
      erros: 1,
      duplicadas: 2,
      semDecisao: 1,
      entram: 4,
    });
  });
});
