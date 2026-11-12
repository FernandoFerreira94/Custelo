import { describe, expect, it } from "vitest";

import {
  esquemaDeGeracao,
  esquemaDeUnidade,
} from "@/application/estrutura/schemas";
import {
  esquemaDeAutorizacao,
  esquemaDeEncerramento,
  esquemaDePessoa,
} from "@/application/pessoas/schemas";

const UUID = "11111111-1111-4111-8111-111111111111";

describe("schemas de estrutura", () => {
  it("unidade: número é obrigatório e vazio vira null no bloco", () => {
    const r = esquemaDeUnidade.safeParse({
      bloco: "  ",
      numero: "304",
      tipo: "apartamento",
    });
    expect(r.success && r.data.bloco).toBeNull();
    expect(
      esquemaDeUnidade.safeParse({ numero: " ", tipo: "casa" }).success,
    ).toBe(false);
  });

  it("unidade: tipo fora da lista é recusado com a mensagem", () => {
    const r = esquemaDeUnidade.safeParse({ numero: "1", tipo: "garagem" });
    expect(r.success).toBe(false);
  });

  it("geração aceita número de blocos ou lista de nomes", () => {
    const base = { andares: 2, porAndar: 3, numeracao: "andar" as const };
    expect(esquemaDeGeracao.safeParse({ ...base, blocos: 3 }).success).toBe(
      true,
    );
    expect(
      esquemaDeGeracao.safeParse({ ...base, blocos: ["A", "B"] }).success,
    ).toBe(true);
    expect(esquemaDeGeracao.safeParse({ ...base, blocos: 27 }).success).toBe(
      false,
    );
    expect(
      esquemaDeGeracao.safeParse({ ...base, blocos: 1, andares: 0 }).success,
    ).toBe(false);
  });
});

describe("schemas de pessoas", () => {
  it("pessoa exige nome, unidade e papel", () => {
    const r = esquemaDePessoa.safeParse({
      nome: "",
      unidadeId: "x",
      tipo: "ok",
    });
    expect(r.success).toBe(false);
  });

  it("encerramento exige o motivo com o texto do domínio", () => {
    const r = esquemaDeEncerramento.safeParse({ vinculoId: UUID, motivo: " " });
    expect(!r.success && r.error.issues[0]?.message).toBe(
      "Diga por que o vínculo terminou (mudou, vendeu, erro de cadastro).",
    );
  });

  it("autorização converte a data que chega como texto", () => {
    const r = esquemaDeAutorizacao.safeParse({
      unidadeId: UUID,
      nome: "Joana",
      cpf: "529.982.247-25",
      relacao: "irmã",
      valeAte: "2026-12-01",
      emNomeDePessoaId: UUID,
    });
    expect(r.success && r.data.valeAte).toBeInstanceOf(Date);
  });
});
