import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guard do Design System.
 *
 * Nao testa comportamento — testa que as decisoes LOCKED da fundacao de marca
 * continuam valendo no CSS. Sao regras que se perdem em refactor e ninguem
 * percebe ate a tela chegar no aparelho do porteiro.
 */
const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

describe("design tokens", () => {
  it("nao usa blur nem superficie translucida (glass effect revogado em 15/08/2026)", () => {
    // Motivo da revogacao: custo de performance no Android de baixo custo que o
    // porteiro realmente usa + perda de contraste sobre conteudo variavel.
    const ativos = [...css.matchAll(/backdrop-filter\s*:\s*([^;}]+)/g)]
      .map((m) => m[1].trim())
      .filter((valor) => valor !== "none");

    expect(ativos).toEqual([]);

    // blur() so e proibido como filtro de superficie; nao ha uso legitimo hoje.
    expect(css).not.toMatch(/filter\s*:\s*[^;}]*\bblur\s*\(/);
  });

  it("define a paleta de marca completa (ADR-021)", () => {
    for (const token of [
      "--brand-navy: #0c2c55",
      "--brand-brasa: #d23b26",
      "--brand-ocean: #629fad",
      "--brand-nevoa: #eef1f5",
    ]) {
      expect(css).toContain(token);
    }
  });

  it("define a escala de elevacao de 3 niveis que substitui o glass", () => {
    for (const nivel of [0, 1, 2, 3]) {
      expect(css).toContain(`--shadow-elevation-${nivel}:`);
    }
  });

  it("define os 9 estados operacionais com foreground proprio", () => {
    const estados = [
      "recebida",
      "aguardando",
      "nao-identificada",
      "falha",
      "urgente",
      "pronta",
      "retirada",
      "devolvida",
      "offline",
    ];

    for (const estado of estados) {
      expect(css).toContain(`--state-${estado}:`);
      expect(css).toContain(`--state-${estado}-fg:`);
    }
  });

  it("aplica o padrao de raio fechado", () => {
    expect(css).toContain("--radius-chip: 0.5rem");
    expect(css).toContain("--radius-field: 0.75rem");
    expect(css).toContain("--radius-surface: 1rem");
    expect(css).toContain("--radius-pill: 999px");
  });

  it("define os alvos de toque minimos do OPS", () => {
    expect(css).toContain("--size-touch-min: 2.75rem");
    expect(css).toContain("--size-touch-primary: 3rem");
  });

  it("respeita prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("liga Plus Jakarta Sans em --font-brand e nos titulos", () => {
    expect(css).toContain("--font-brand: var(--font-brand)");
    expect(css).toContain("--font-heading: var(--font-brand)");
  });

  it("tem dark mode que nao e inversao do light", () => {
    // Fundo dark deve ser mais escuro que o navy da marca, nao o navy puro.
    expect(css).toMatch(/\.dark\s*\{[\s\S]*--background:\s*#0a1b33/);
  });

  it("separa a brasa da marca do vermelho de erro (ADR-021)", () => {
    // Brasa e laranja-avermelhado; erro e urgencia nao podem ter o mesmo tom.
    expect(css).toContain("--destructive: #b4123f");
    expect(css).toContain("--state-falha: #b4123f");
    expect(css).not.toContain("--state-urgente: #c2410c");
  });
});
