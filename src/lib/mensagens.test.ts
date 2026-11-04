import { afterEach, describe, expect, it, vi } from "vitest";

import { MSG, comMensagemDeFalha, mensagemDeFalha } from "@/lib/mensagens";

describe("mensagemDeFalha", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("sem internet vira semConexao, qualquer que seja o erro", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(mensagemDeFalha({ status: 500 })).toBe(MSG.semConexao);
  });

  it("mapeia por causa", () => {
    expect(mensagemDeFalha({ status: 429 })).toBe(MSG.muitasTentativas);
    expect(mensagemDeFalha({ status: 401 })).toBe(MSG.sessaoExpirada);
    expect(mensagemDeFalha({ status: 403 })).toBe(MSG.semPermissao);
    expect(mensagemDeFalha({ status: 503 })).toBe(MSG.instavel);
    expect(mensagemDeFalha({ name: "AuthRetryableFetchError" })).toBe(
      MSG.semConexao,
    );
    expect(mensagemDeFalha(new TypeError("Failed to fetch"))).toBe(
      MSG.semConexao,
    );
    expect(mensagemDeFalha(new Error("x"))).toBe(MSG.inesperado);
  });
});

describe("comMensagemDeFalha", () => {
  it("devolve o resultado da ação quando dá certo", async () => {
    await expect(
      comMensagemDeFalha(async () => ({ ok: true as const })),
    ).resolves.toEqual({ ok: true });
  });

  it("transforma exceção em mensagem, sem estourar", async () => {
    await expect(
      comMensagemDeFalha(async () => {
        throw { status: 503 };
      }),
    ).resolves.toEqual({ ok: false, message: MSG.instavel });
  });
});
