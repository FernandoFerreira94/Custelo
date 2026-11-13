import { describe, expect, it } from "vitest";

import { erroDeContrato } from "@/infrastructure/contratos/contratos-repo";

describe("erroDeContrato", () => {
  it("converte o prefixo levantado pelo banco", () => {
    const erro = erroDeContrato(
      new Error("SEM_PERMISSAO: so o gestor do condominio ativa o contrato"),
    );
    expect(erro?.codigo).toBe("SEM_PERMISSAO");
  });

  it("ignora erro que o contrato não conhece", () => {
    expect(erroDeContrato(new Error("connection refused"))).toBeNull();
    expect(erroDeContrato(null)).toBeNull();
  });
});
