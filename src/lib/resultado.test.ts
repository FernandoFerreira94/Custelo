import { describe, expect, it } from "vitest";
import { z } from "zod";

import { falha, falhaDeEntrada, sucesso } from "@/lib/resultado";

describe("resultado", () => {
  it("sucesso carrega dado e mensagem opcional", () => {
    expect(sucesso({ id: "1" }, "Salvo.")).toEqual({
      ok: true,
      data: { id: "1" },
      mensagem: "Salvo.",
    });
  });

  it("falha carrega código e mensagem", () => {
    expect(falha("CONFLITO", "Já existe.")).toEqual({
      ok: false,
      codigo: "CONFLITO",
      mensagem: "Já existe.",
    });
  });

  it("falhaDeEntrada vira campos por caminho, com a 1ª mensagem de cada campo", () => {
    const schema = z.object({
      numero: z.string().min(1, "Informe o número da unidade."),
      bloco: z.string().min(1, "Escolha o bloco."),
    });
    const r = schema.safeParse({ numero: "", bloco: "" });
    if (r.success) throw new Error("devia falhar");
    expect(falhaDeEntrada(r.error)).toEqual({
      ok: false,
      codigo: "ENTRADA_INVALIDA",
      mensagem: "Confira os campos destacados.",
      campos: {
        numero: "Informe o número da unidade.",
        bloco: "Escolha o bloco.",
      },
    });
  });
});
