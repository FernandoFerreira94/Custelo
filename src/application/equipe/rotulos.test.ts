import { describe, expect, it } from "vitest";

import {
  GRUPOS_DE_PERMISSAO,
  PAPEIS_CONVIDAVEIS,
  ROTULO_PAPEL,
  ROTULO_PERMISSAO,
} from "@/application/equipe/rotulos";
import { PAPEIS, PERMISSOES } from "@/application/permissoes";

describe("rótulos de permissão", () => {
  it("todo papel e toda permissão têm rótulo, sem rótulo órfão", () => {
    expect(Object.keys(ROTULO_PERMISSAO).sort()).toEqual(
      Object.keys(PERMISSOES).sort(),
    );
    expect([...PAPEIS].every((p) => ROTULO_PAPEL[p])).toBe(true);
  });

  it("cada permissão operada pelos papéis da matriz aparece em exatamente um grupo", () => {
    const naMatriz = GRUPOS_DE_PERMISSAO.flatMap((g) => g.permissoes);
    const operaveis = Object.keys(PERMISSOES).filter(
      (p) => p !== "plataforma.operar",
    );
    expect(new Set(naMatriz).size).toBe(naMatriz.length);
    expect([...naMatriz].sort()).toEqual([...operaveis].sort());
  });

  it("não se convida plataforma nem administrador da organização", () => {
    expect(PAPEIS_CONVIDAVEIS).not.toContain("platform_super_admin");
    expect(PAPEIS_CONVIDAVEIS).not.toContain("org_admin");
  });
});
