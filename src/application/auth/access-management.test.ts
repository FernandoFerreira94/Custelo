import { describe, expect, it } from "vitest";

import {
  authorizeInvite,
  authorizeScopeChange,
  authorizeScopeRevocation,
  authorizeScopeManagement,
  authorizeUserDeactivation,
  type AccessActor,
  type ManagedScope,
} from "@/application/auth/access-management";

const orgAdmin: AccessActor = {
  userId: "admin-org-a",
  status: "ativo",
  scopes: [
    {
      orgId: "org-a",
      empreendimentoId: "org-scope",
      isOrgScope: true,
      roleCode: "org_admin",
    },
  ],
};

const gestorEmpA: AccessActor = {
  userId: "gestor-emp-a",
  status: "ativo",
  scopes: [
    {
      orgId: "org-a",
      empreendimentoId: "emp-a",
      isOrgScope: false,
      roleCode: "empreendimento_gestor",
    },
  ],
};

const scopeInEmpA: ManagedScope = {
  orgId: "org-a",
  empreendimentoId: "emp-a",
  isOrgScope: false,
  roleCode: "recepcionista",
};

const scopeInOrgA: ManagedScope = {
  orgId: "org-a",
  empreendimentoId: "org-scope",
  isOrgScope: true,
  roleCode: "auditor",
};

const scopeInOrgB: ManagedScope = {
  orgId: "org-b",
  empreendimentoId: "emp-b",
  isOrgScope: false,
  roleCode: "recepcionista",
};

const pendingOrgAdmin: AccessActor = {
  ...orgAdmin,
  status: "convite_pendente",
};

const recepcionistaEmpA: AccessActor = {
  ...gestorEmpA,
  userId: "recepcionista-emp-a",
  scopes: [{ ...scopeInEmpA }],
};

const auditorEmpA: AccessActor = {
  ...gestorEmpA,
  userId: "auditor-emp-a",
  scopes: [{ ...scopeInEmpA, roleCode: "auditor" }],
};

describe("authorizeScopeManagement", () => {
  it("permite org_admin na propria organizacao", () => {
    expect(
      authorizeScopeManagement(orgAdmin, {
        orgId: "org-a",
        empreendimentoId: "emp-b",
        isOrgScope: false,
        roleCode: "recepcionista",
      }),
    ).toEqual({ ok: true });
  });

  it("recusa gestor fora do proprio empreendimento", () => {
    expect(
      authorizeScopeManagement(gestorEmpA, {
        orgId: "org-a",
        empreendimentoId: "emp-b",
        isOrgScope: false,
        roleCode: "recepcionista",
      }),
    ).toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
  });
});

describe("casos de uso de gestao de acesso", () => {
  it("recusa convite por usuario pendente", () => {
    expect(authorizeInvite(pendingOrgAdmin, scopeInOrgA)).toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
  });

  it("permite gestor convidar para o proprio empreendimento", () => {
    expect(authorizeInvite(gestorEmpA, scopeInEmpA)).toEqual({ ok: true });
  });

  it("recusa gestor que tenta conceder org_admin", () => {
    expect(
      authorizeScopeChange(gestorEmpA, {
        ...scopeInEmpA,
        roleCode: "org_admin",
      }),
    ).toEqual({ ok: false, code: "ROLE_ESCALATION" });
  });

  it.each([recepcionistaEmpA, auditorEmpA])(
    "recusa %s para gerenciar escopo",
    (actor) => {
      expect(authorizeScopeChange(actor, scopeInEmpA)).toEqual({
        ok: false,
        code: "UNAUTHORIZED",
      });
    },
  );

  it("permite revogar escopo dentro da autoridade", () => {
    expect(authorizeScopeRevocation(gestorEmpA, scopeInEmpA)).toEqual({
      ok: true,
    });
  });

  it("recusa revogar escopo fora da autoridade", () => {
    expect(authorizeScopeRevocation(gestorEmpA, scopeInOrgB)).toEqual({
      ok: false,
      code: "OUTSIDE_SCOPE",
    });
  });

  it("recusa desativar usuario com escopo fora da autoridade do ator", () => {
    expect(
      authorizeUserDeactivation(orgAdmin, [scopeInOrgA, scopeInOrgB]),
    ).toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
  });

  it("permite desativar usuario quando todos os escopos pertencem ao ator", () => {
    expect(
      authorizeUserDeactivation(orgAdmin, [scopeInOrgA, scopeInEmpA]),
    ).toEqual({
      ok: true,
    });
  });
});
