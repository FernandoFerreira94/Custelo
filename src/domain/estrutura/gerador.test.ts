import { describe, expect, it } from "vitest";

import { gerarUnidades } from "./gerador";

describe("gerarUnidades", () => {
  it("3 blocos × 9 andares × 8 por andar, andar + final → A-101 … C-908 (prévia da prancha)", () => {
    const r = gerarUnidades({
      blocos: 3,
      andares: 9,
      porAndar: 8,
      numeracao: "andar",
    });
    if (!r.ok) throw new Error(r.mensagem);
    expect(r.data.total).toBe(216);
    const todas = r.data.blocos.flatMap((b) =>
      b.andares.flatMap((a) => a.unidades.map((u) => u.codigo)),
    );
    expect(todas[0]).toBe("A-101");
    expect(todas.at(-1)).toBe("C-908");
    expect(new Set(todas).size).toBe(216);
  });

  it("sequencial reinicia por bloco: A-1 … A-72", () => {
    const r = gerarUnidades({
      blocos: ["A"],
      andares: 9,
      porAndar: 8,
      numeracao: "seq",
    });
    if (!r.ok) throw new Error(r.mensagem);
    const a = r.data.blocos[0].andares.flatMap((x) =>
      x.unidades.map((u) => u.codigo),
    );
    expect(a[0]).toBe("A-1");
    expect(a.at(-1)).toBe("A-72");
  });

  it("mais de 99 por andar no modo andar é recusado (o final teria 3 dígitos)", () => {
    const r = gerarUnidades({
      blocos: 1,
      andares: 2,
      porAndar: 120,
      numeracao: "andar",
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
  });

  it("limite de 5.000 unidades por geração", () => {
    const r = gerarUnidades({
      blocos: 10,
      andares: 30,
      porAndar: 20,
      numeracao: "andar",
    });
    expect(r).toMatchObject({ ok: false, codigo: "ENTRADA_INVALIDA" });
  });

  it("0 bloco = condomínio sem bloco: códigos só com número", () => {
    const r = gerarUnidades({
      blocos: 0,
      andares: 1,
      porAndar: 3,
      numeracao: "andar",
    });
    if (!r.ok) throw new Error(r.mensagem);
    expect(r.data.blocos[0].nome).toBe("");
    expect(r.data.blocos[0].andares[0].unidades.map((u) => u.codigo)).toEqual([
      "101",
      "102",
      "103",
    ]);
  });
});
