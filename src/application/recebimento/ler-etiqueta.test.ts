import { afterEach, describe, expect, it, vi } from "vitest";

import {
  lerComOrcamento,
  ORCAMENTO_MS,
} from "@/application/recebimento/ler-etiqueta";
import type { LabelExtractor } from "@/ports/label-extractor";
import { criarLabelExtractorFake } from "@/tests/fakes/label-extractor";

const IMG = new Uint8Array([1, 2, 3]);
const relogio = () => {
  let t = 0;
  return { now: () => new Date(t), andar: (ms: number) => (t += ms) };
};

afterEach(() => vi.useRealTimers());

describe("lerComOrcamento", () => {
  it("sucesso na primeira tentativa", async () => {
    const f = criarLabelExtractorFake({ unidadeTexto: "Bloco B Ap 304" });
    const r = await lerComOrcamento(f.leitor, IMG, "image/webp", relogio());
    expect(r).toMatchObject({
      ok: true,
      leitura: { unidadeTexto: "Bloco B Ap 304" },
    });
    expect(f.chamadas).toBe(1);
  });

  it("erro que vale repetir tenta de novo uma vez só", async () => {
    const f = criarLabelExtractorFake(
      { ok: false, motivo: "indisponivel", repetir: true, latenciaMs: 100 },
      { ok: false, motivo: "indisponivel", repetir: true, latenciaMs: 100 },
      { unidadeTexto: "nunca chega aqui" },
    );
    const r = await lerComOrcamento(f.leitor, IMG, "image/webp", relogio());
    expect(r).toMatchObject({ ok: false, motivo: "indisponivel" });
    expect(f.chamadas).toBe(2);
  });

  it("ilegível não repete", async () => {
    const f = criarLabelExtractorFake({
      ok: false,
      motivo: "ilegivel",
      repetir: false,
      latenciaMs: 50,
    });
    await lerComOrcamento(f.leitor, IMG, "image/webp", relogio());
    expect(f.chamadas).toBe(1);
  });

  it("sem orçamento para a segunda tentativa, devolve a primeira falha", async () => {
    const c = relogio();
    const leitor: LabelExtractor = {
      async ler() {
        c.andar(ORCAMENTO_MS - 400);
        return {
          ok: false,
          motivo: "timeout",
          repetir: true,
          latenciaMs: 7600,
        };
      },
    };
    const espiao = vi.spyOn(leitor, "ler");
    const r = await lerComOrcamento(leitor, IMG, "image/webp", c);
    expect(r).toMatchObject({ ok: false, motivo: "timeout" });
    expect(espiao).toHaveBeenCalledTimes(1);
  });

  it("extrator lento é abortado no timeout e vira timeout, sem lançar", async () => {
    vi.useFakeTimers();
    const leitor: LabelExtractor = {
      ler: (_img, { sinal }) =>
        new Promise((_, rejeitar) =>
          sinal.addEventListener("abort", () => rejeitar(new Error("abort"))),
        ),
    };
    const promessa = lerComOrcamento(leitor, IMG, "image/webp", relogio());
    await vi.advanceTimersByTimeAsync(4000);
    await vi.advanceTimersByTimeAsync(4000);
    expect(await promessa).toMatchObject({ ok: false, motivo: "timeout" });
  });
});
