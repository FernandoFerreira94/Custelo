import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

import * as Sentry from "@sentry/nextjs";

import { criarLeitorLlm } from "@/infrastructure/leitura/llm-visao";
import { criarLeitorOcr } from "@/infrastructure/leitura/ocr-texto";

const IMG = new Uint8Array([9, 9, 9]);
const NOME = "MARIANA S SOUZA";

function resposta(
  status: number,
  corpo: unknown,
  headers: Record<string, string> = {},
) {
  return vi.fn(
    async () => new Response(JSON.stringify(corpo), { status, headers }),
  ) as unknown as typeof fetch;
}

const okOcr = {
  responses: [
    { fullTextAnnotation: { text: `DESTINATARIO ${NOME}\nBLOCO B AP 304\n` } },
  ],
};
const okLlm = {
  candidates: [
    {
      finishReason: "STOP",
      content: {
        parts: [
          {
            text: JSON.stringify({
              unidade: "Bloco B Ap 304",
              nome: NOME,
              transportadora: null,
              rastreio: null,
            }),
          },
        ],
      },
    },
  ],
  usageMetadata: { promptTokenCount: 1000, candidatesTokenCount: 40 },
};

const leitores = [
  ["ocr", (f: typeof fetch) => criarLeitorOcr("chave", { fetch: f }), okOcr],
  [
    "llm",
    (f: typeof fetch) => criarLeitorLlm("chave", { fetch: f, prompt: "p" }),
    okLlm,
  ],
] as const;

const ler = (
  l: ReturnType<(typeof leitores)[number][1]>,
  sinal = new AbortController().signal,
) => l.ler(IMG, { mime: "image/webp", sinal });

let logs: string[] = [];
afterEach(() => {
  vi.restoreAllMocks();
  logs = [];
});
function capturarLogs() {
  for (const m of ["log", "warn", "error"] as const)
    vi.spyOn(console, m).mockImplementation(
      (...a) => void logs.push(a.join(" ")),
    );
  vi.spyOn(process.stdout, "write").mockImplementation((s) => {
    logs.push(String(s));
    return true;
  });
}

describe.each(leitores)("leitor %s", (_n, criar, ok) => {
  it("200 com texto devolve a leitura", async () => {
    const r = await ler(criar(resposta(200, ok)));
    expect(r.ok).toBe(true);
    if (r.ok) {
      const texto = [r.leitura.unidadeTexto, ...r.leitura.linhas].join(" ");
      expect(texto).toContain("304");
      expect(r.uso?.custoMicroUsd).toBeGreaterThan(0);
    }
  });

  it.each([
    [429, { "retry-after": "1" }, "limite", true],
    [429, {}, "limite", false],
    [402, {}, "limite", false],
    [401, {}, "indisponivel", false],
    [403, {}, "indisponivel", false],
    [503, {}, "indisponivel", true],
    [529, {}, "indisponivel", true],
  ] as const)(
    "HTTP %s → %s (repetir=%s)",
    async (status, h, motivo, repetir) => {
      const r = await ler(criar(resposta(status, {}, h)));
      expect(r).toMatchObject({ ok: false, motivo, repetir });
    },
  );

  it("chave errada ou teto disparam alerta, sem imagem", async () => {
    await ler(criar(resposta(401, {})));
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "leitura_etiqueta_chave_ou_config",
      expect.objectContaining({ tags: expect.any(Object) }),
    );
  });

  it("abort vira timeout", async () => {
    const c = new AbortController();
    const f = vi.fn(async () => {
      c.abort();
      throw new Error("aborted");
    }) as unknown as typeof fetch;
    expect(await ler(criar(f), c.signal)).toMatchObject({
      ok: false,
      motivo: "timeout",
    });
  });

  it("o log leva só metadados: nunca o nome, as linhas ou a imagem", async () => {
    capturarLogs();
    await ler(criar(resposta(200, ok)));
    const tudo = logs.join("\n");
    expect(tudo).toContain("leitura_etiqueta");
    expect(tudo).not.toContain("MARIANA");
    expect(tudo).not.toContain("304");
    expect(tudo).not.toContain(Buffer.from(IMG).toString("base64"));
  });
});

describe("leitor llm, saída", () => {
  it("JSON fora do schema, recusa ou nada útil = ilegível", async () => {
    const recusa = { candidates: [{ finishReason: "SAFETY" }] };
    const lixo = {
      candidates: [
        { finishReason: "STOP", content: { parts: [{ text: "oi" }] } },
      ],
    };
    const vazio = {
      candidates: [
        {
          finishReason: "STOP",
          content: {
            parts: [
              {
                text: JSON.stringify({
                  unidade: null,
                  nome: null,
                  transportadora: null,
                  rastreio: null,
                }),
              },
            ],
          },
        },
      ],
    };
    for (const corpo of [recusa, lixo, vazio]) {
      const r = await ler(
        criarLeitorLlm("chave", { fetch: resposta(200, corpo), prompt: "p" }),
      );
      expect(r).toMatchObject({
        ok: false,
        motivo: "ilegivel",
        repetir: false,
      });
    }
  });
});

describe("leitor ocr, imagem sem texto", () => {
  it("é ilegível", async () => {
    const r = await ler(
      criarLeitorOcr("chave", { fetch: resposta(200, { responses: [{}] }) }),
    );
    expect(r).toMatchObject({ ok: false, motivo: "ilegivel" });
  });
});
