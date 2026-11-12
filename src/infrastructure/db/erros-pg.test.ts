import { describe, expect, it, vi } from "vitest";

vi.mock("@sentry/nextjs", () => ({ captureMessage: vi.fn() }));

import { codigoPg, falhaDeErroPg } from "@/infrastructure/db/erros-pg";

describe("falhaDeErroPg", () => {
  it("23505 vira DUPLICADO, venha o código no erro ou no cause (drizzle)", () => {
    expect(falhaDeErroPg({ code: "23505" })).toMatchObject({
      ok: false,
      codigo: "DUPLICADO",
    });
    expect(falhaDeErroPg({ cause: { code: "23505" } })).toMatchObject({
      codigo: "DUPLICADO",
    });
  });

  it("23503 vira ENTRADA_INVALIDA e 42501 vira SEM_PERMISSAO", () => {
    expect(falhaDeErroPg({ code: "23503" })).toMatchObject({
      codigo: "ENTRADA_INVALIDA",
    });
    expect(falhaDeErroPg({ code: "42501" })).toMatchObject({
      codigo: "SEM_PERMISSAO",
    });
  });

  it("erro que não conhece devolve null (a action decide)", () => {
    expect(falhaDeErroPg(new Error("conexão caiu"))).toBeNull();
    expect(codigoPg(null)).toBeUndefined();
  });
});
