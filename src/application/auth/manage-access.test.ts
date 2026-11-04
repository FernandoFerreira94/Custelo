import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  AccessActor,
  ManagedScope,
} from "@/application/auth/access-management";

const mocks = vi.hoisted(() => ({
  loadAccessActor: vi.fn(),
  loadTargetScopes: vi.fn(),
  persistInviteRegistration: vi.fn(),
  persistScopeGrant: vi.fn(),
  persistScopeRevocation: vi.fn(),
  persistUserDeactivation: vi.fn(),
  revokeUserSessions: vi.fn(),
  sendInviteByEmail: vi.fn(),
}));

vi.mock("@/infrastructure/auth/access-management-repository", () => ({
  loadAccessActor: mocks.loadAccessActor,
  loadTargetScopes: mocks.loadTargetScopes,
  persistInviteRegistration: mocks.persistInviteRegistration,
  persistScopeGrant: mocks.persistScopeGrant,
  persistScopeRevocation: mocks.persistScopeRevocation,
  persistUserDeactivation: mocks.persistUserDeactivation,
}));

vi.mock("@/infrastructure/auth/session-revocation", () => ({
  revokeUserSessions: mocks.revokeUserSessions,
}));

vi.mock("@/infrastructure/auth/invite-service", () => ({
  sendInviteByEmail: mocks.sendInviteByEmail,
}));

import {
  changeScope,
  deactivateUser,
  inviteUser,
  revokeScope,
} from "@/application/auth/manage-access";

const orgAdmin: AccessActor = {
  userId: "admin-id",
  status: "ativo",
  scopes: [
    {
      orgId: "11111111-1111-4111-8111-111111111111",
      empreendimentoId: "00000000-0000-0000-0000-000000000001",
      isOrgScope: true,
      roleCode: "org_admin",
    },
  ],
};

const gestorEmpA: AccessActor = {
  userId: "gestor-id",
  status: "ativo",
  scopes: [
    {
      orgId: "11111111-1111-4111-8111-111111111111",
      empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      isOrgScope: false,
      roleCode: "empreendimento_gestor",
    },
  ],
};

const recepcionistaEmpA: AccessActor = {
  userId: "recepcionista-id",
  status: "ativo",
  scopes: [
    {
      orgId: "11111111-1111-4111-8111-111111111111",
      empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      isOrgScope: false,
      roleCode: "recepcionista",
    },
  ],
};

const scopeInEmpA: ManagedScope = {
  orgId: "11111111-1111-4111-8111-111111111111",
  empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  isOrgScope: false,
  roleCode: "recepcionista",
};

const scopeInOrgB: ManagedScope = {
  orgId: "22222222-2222-4222-8222-222222222222",
  empreendimentoId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  isOrgScope: false,
  roleCode: "recepcionista",
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.sendInviteByEmail.mockResolvedValue({ ok: true });
  mocks.loadAccessActor.mockResolvedValue(orgAdmin);
  mocks.persistScopeGrant.mockResolvedValue({ ok: true });
  mocks.persistScopeRevocation.mockResolvedValue({ ok: true });
  mocks.persistUserDeactivation.mockResolvedValue({ ok: true });
  mocks.revokeUserSessions.mockResolvedValue(undefined);
  mocks.loadTargetScopes.mockResolvedValue([scopeInEmpA]);
});

describe("inviteUser — I2.3", () => {
  it("convida usuario apos autorizacao e persistencia", async () => {
    await expect(
      inviteUser({
        actorUserId: orgAdmin.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.sendInviteByEmail).toHaveBeenCalledWith({
      actorUserId: orgAdmin.userId,
      actorOrgId: orgAdmin.scopes[0]?.orgId,
      actorEmpreendimentoId: orgAdmin.scopes[0]?.empreendimentoId,
      email: "novo@example.test",
      scope: scopeInEmpA,
    });
  });

  it("recusa convite com papel org_admin antes do Supabase", async () => {
    await expect(
      inviteUser({
        actorUserId: orgAdmin.userId,
        email: "novo@example.test",
        initialScope: {
          ...scopeInEmpA,
          isOrgScope: true,
          empreendimentoId: "00000000-0000-0000-0000-000000000001",
          roleCode: "org_admin",
        },
      }),
    ).resolves.toEqual({ ok: false, code: "ROLE_ESCALATION" });

    expect(mocks.sendInviteByEmail).not.toHaveBeenCalled();
  });

  it("propaga falha de persistencia do convite", async () => {
    mocks.sendInviteByEmail.mockResolvedValue({
      ok: false,
      code: "INVALID_SCOPE",
    });

    await expect(
      inviteUser({
        actorUserId: orgAdmin.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "INVALID_SCOPE" });

    expect(mocks.sendInviteByEmail).toHaveBeenCalledOnce();
  });

  it("recusa convite sem ator", async () => {
    mocks.loadAccessActor.mockResolvedValue(null);

    await expect(
      inviteUser({
        actorUserId: "missing",
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });

    expect(mocks.sendInviteByEmail).not.toHaveBeenCalled();
  });

  it("permite gestor convidar no proprio empreendimento", async () => {
    mocks.loadAccessActor.mockResolvedValue(gestorEmpA);
    await expect(
      inviteUser({
        actorUserId: gestorEmpA.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("recusa gestor fora do empreendimento", async () => {
    mocks.loadAccessActor.mockResolvedValue(gestorEmpA);

    await expect(
      inviteUser({
        actorUserId: gestorEmpA.userId,
        email: "novo@example.test",
        initialScope: scopeInOrgB,
      }),
    ).resolves.toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
  });

  it("recusa recepcionista", async () => {
    mocks.loadAccessActor.mockResolvedValue(recepcionistaEmpA);

    await expect(
      inviteUser({
        actorUserId: recepcionistaEmpA.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
  });

  it("recusa quando o servico de convite nao esta configurado", async () => {
    mocks.sendInviteByEmail.mockResolvedValue({
      ok: false,
      code: "UNAVAILABLE",
    });

    await expect(
      inviteUser({
        actorUserId: orgAdmin.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAVAILABLE" });
  });

  it("recusa quando convite Supabase falha", async () => {
    mocks.sendInviteByEmail.mockResolvedValue({
      ok: false,
      code: "INVITE_FAILED",
    });

    await expect(
      inviteUser({
        actorUserId: orgAdmin.userId,
        email: "novo@example.test",
        initialScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "INVITE_FAILED" });
  });
});

describe("changeScope — I2.3", () => {
  it("concede escopo apos autorizacao", async () => {
    await expect(
      changeScope({
        actorUserId: orgAdmin.userId,
        targetUserId: "target-user",
        requestedScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.persistScopeGrant).toHaveBeenCalledOnce();
  });

  it("recusa troca de escopo sem ator", async () => {
    mocks.loadAccessActor.mockResolvedValue(null);

    await expect(
      changeScope({
        actorUserId: "missing",
        targetUserId: "target",
        requestedScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
  });

  it("recusa gestor que tenta conceder org_admin", async () => {
    mocks.loadAccessActor.mockResolvedValue(gestorEmpA);

    await expect(
      changeScope({
        actorUserId: gestorEmpA.userId,
        targetUserId: "target",
        requestedScope: {
          ...scopeInEmpA,
          roleCode: "org_admin",
        },
      }),
    ).resolves.toEqual({ ok: false, code: "ROLE_ESCALATION" });
  });

  it("recusa recepcionista", async () => {
    mocks.loadAccessActor.mockResolvedValue(recepcionistaEmpA);

    await expect(
      changeScope({
        actorUserId: recepcionistaEmpA.userId,
        targetUserId: "target",
        requestedScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
  });

  it("propaga falha de persistencia", async () => {
    mocks.persistScopeGrant.mockResolvedValue({
      ok: false,
      code: "INVALID_SCOPE",
    });

    await expect(
      changeScope({
        actorUserId: orgAdmin.userId,
        targetUserId: "target",
        requestedScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "INVALID_SCOPE" });
  });
});

describe("revokeScope — I2.3", () => {
  it("revoga escopo dentro da autoridade", async () => {
    mocks.loadAccessActor.mockResolvedValue(gestorEmpA);

    await expect(
      revokeScope({
        actorUserId: gestorEmpA.userId,
        scopeId: "scope-id",
        existingScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.persistScopeRevocation).toHaveBeenCalledOnce();
  });

  it("recusa revogar escopo fora da autoridade", async () => {
    mocks.loadAccessActor.mockResolvedValue(gestorEmpA);

    await expect(
      revokeScope({
        actorUserId: gestorEmpA.userId,
        scopeId: "scope-id",
        existingScope: scopeInOrgB,
      }),
    ).resolves.toEqual({ ok: false, code: "OUTSIDE_SCOPE" });
  });

  it("recusa recepcionista", async () => {
    mocks.loadAccessActor.mockResolvedValue(recepcionistaEmpA);

    await expect(
      revokeScope({
        actorUserId: recepcionistaEmpA.userId,
        scopeId: "scope-id",
        existingScope: scopeInEmpA,
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
  });
});

describe("deactivateUser — I2.3", () => {
  it("desativa usuario e revoga sessoes", async () => {
    await expect(
      deactivateUser({
        actorUserId: orgAdmin.userId,
        targetUserId: "target-user",
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.persistUserDeactivation).toHaveBeenCalledOnce();
    expect(mocks.revokeUserSessions).toHaveBeenCalledWith("target-user");
  });

  it("recusa desativar quando algum escopo esta fora da autoridade", async () => {
    mocks.loadTargetScopes.mockResolvedValue([scopeInEmpA, scopeInOrgB]);

    await expect(
      deactivateUser({
        actorUserId: orgAdmin.userId,
        targetUserId: "target-user",
      }),
    ).resolves.toEqual({ ok: false, code: "OUTSIDE_SCOPE" });

    expect(mocks.persistUserDeactivation).not.toHaveBeenCalled();
  });

  it("recusa quando revogacao de sessao falha", async () => {
    mocks.revokeUserSessions.mockRejectedValue(new Error("network"));

    await expect(
      deactivateUser({
        actorUserId: orgAdmin.userId,
        targetUserId: "target-user",
      }),
    ).resolves.toEqual({ ok: false, code: "UNAVAILABLE" });
  });

  it("propaga falha de persistencia", async () => {
    mocks.persistUserDeactivation.mockResolvedValue({
      ok: false,
      code: "INVALID_SCOPE",
    });

    await expect(
      deactivateUser({
        actorUserId: orgAdmin.userId,
        targetUserId: "target-user",
      }),
    ).resolves.toEqual({ ok: false, code: "INVALID_SCOPE" });

    expect(mocks.revokeUserSessions).not.toHaveBeenCalled();
  });
});
