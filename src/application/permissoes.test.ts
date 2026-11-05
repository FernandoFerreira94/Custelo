import { describe, expect, it } from "vitest";

import { pode } from "@/application/permissoes";

describe("matriz de permissões", () => {
  it.each([
    ["recepcionista", "cadastro.editar", false],
    ["recepcionista", "cadastro.ler", true],
    ["recepcionista", "custodia.registrar", true],
    ["recepcionista", "custodia.corrigir", false],
    ["recepcionista", "custodia.cancelar", false],
    ["recepcionista", "retirada.corrigir", false],
    ["recepcionista", "aviso.enviarForaDaJanela", false],
    ["auditor", "cadastro.ler", true],
    ["auditor", "cadastro.editar", false],
    ["auditor", "auditoria.ler", true],
    ["empreendimento_gestor", "cadastro.editar", true],
    ["empreendimento_gestor", "custodia.corrigir", true],
    ["empreendimento_gestor", "equipe.gerir", true],
    ["org_admin", "custodia.corrigir", true],
    ["org_admin", "organizacao.gerir", true],
    ["empreendimento_gestor", "organizacao.gerir", false],
    ["platform_super_admin", "custodia.registrar", false],
  ] as const)("%s em %s = %s", (papel, permissao, esperado) => {
    expect(pode(papel, permissao)).toBe(esperado);
  });
});
