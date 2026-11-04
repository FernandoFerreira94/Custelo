import { describe, expect, it } from "vitest";

import {
  findUserScope,
  labelForScope,
  resolveSurfaceRedirect,
  type UserScope,
} from "@/application/auth/user-scope";

const sampleScope: UserScope = {
  orgId: "11111111-1111-4111-8111-111111111111",
  orgNome: "Colinas",
  empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  empreendimentoNome: "Colinas Residencial",
  isOrgScope: false,
  papelCodigo: "recepcionista",
  papelNome: "Recepcionista / Porteiro",
};

describe("resolveSurfaceRedirect", () => {
  it("envia recepcionista para OPS", () => {
    expect(resolveSurfaceRedirect("recepcionista")).toBe("/receber");
  });

  it("envia gestor e admin para WEB", () => {
    expect(resolveSurfaceRedirect("empreendimento_gestor")).toBe("/gestao");
    expect(resolveSurfaceRedirect("org_admin")).toBe("/gestao");
    expect(resolveSurfaceRedirect("auditor")).toBe("/gestao");
  });

  it("envia super admin para plataforma", () => {
    expect(resolveSurfaceRedirect("platform_super_admin")).toBe("/plataforma");
  });
});

describe("findUserScope", () => {
  it("localiza escopo pelo par org/empreendimento", () => {
    expect(
      findUserScope(
        [sampleScope],
        sampleScope.orgId,
        sampleScope.empreendimentoId,
      ),
    ).toEqual(sampleScope);
  });

  it("retorna undefined para escopo inexistente", () => {
    expect(
      findUserScope(
        [sampleScope],
        "22222222-2222-4222-8222-222222222222",
        sampleScope.empreendimentoId,
      ),
    ).toBeUndefined();
  });
});

describe("labelForScope", () => {
  it("rotula empreendimento com org", () => {
    expect(labelForScope(sampleScope)).toBe("Colinas · Colinas Residencial");
  });

  it("rotula escopo de organizacao inteira", () => {
    expect(
      labelForScope({
        ...sampleScope,
        isOrgScope: true,
        empreendimentoNome: null,
        empreendimentoId: "00000000-0000-0000-0000-000000000001",
      }),
    ).toBe("Colinas — organização inteira");
  });
});
