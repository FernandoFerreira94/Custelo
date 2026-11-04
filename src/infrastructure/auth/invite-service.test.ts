import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptPendingInvite: vi.fn(),
  fetchPendingInviteMetadata: vi.fn(),
  persistInviteRegistration: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  refreshSession: vi.fn(),
  isSupabaseAdminConfigured: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
  inviteUserByEmail: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: "https://custelo.example",
  },
}));

vi.mock("@/infrastructure/auth/access-management-repository", () => ({
  acceptPendingInvite: mocks.acceptPendingInvite,
  fetchPendingInviteMetadata: mocks.fetchPendingInviteMetadata,
  persistInviteRegistration: mocks.persistInviteRegistration,
}));

vi.mock("@/infrastructure/auth/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/infrastructure/auth/supabase-admin", () => ({
  isSupabaseAdminConfigured: mocks.isSupabaseAdminConfigured,
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

import {
  acceptInviteForSession,
  sendInviteByEmail,
} from "@/infrastructure/auth/invite-service";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: mocks.getUser,
      updateUser: mocks.updateUser,
      refreshSession: mocks.refreshSession,
    },
  });
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "user-id" } },
  });
  mocks.updateUser.mockResolvedValue({ error: null });
  mocks.isSupabaseAdminConfigured.mockReturnValue(true);
  mocks.createSupabaseAdminClient.mockReturnValue({
    auth: {
      admin: {
        inviteUserByEmail: mocks.inviteUserByEmail,
        deleteUser: mocks.deleteUser,
      },
    },
  });
});

describe("sendInviteByEmail", () => {
  it("envia o convite para o callback seguro do site configurado", async () => {
    mocks.inviteUserByEmail.mockResolvedValue({
      data: { user: { id: "invited-user-id" } },
      error: null,
    });
    mocks.persistInviteRegistration.mockResolvedValue({ ok: true });

    await expect(
      sendInviteByEmail({
        actorUserId: "actor-id",
        actorOrgId: "org-id",
        actorEmpreendimentoId: "emp-id",
        email: "convidado@example.test",
        scope: {
          orgId: "org-id",
          empreendimentoId: "emp-id",
          isOrgScope: false,
          roleCode: "recepcionista",
        },
      }),
    ).resolves.toEqual({ ok: true });

    expect(mocks.inviteUserByEmail).toHaveBeenCalledWith(
      "convidado@example.test",
      {
        redirectTo: "https://custelo.example/auth/confirm?view=convite",
      },
    );
  });
});

describe("acceptInviteForSession", () => {
  it("nao altera senha quando nao existe convite pendente", async () => {
    mocks.fetchPendingInviteMetadata.mockResolvedValue({
      ok: false,
      code: "INVALID_INVITE",
    });
    mocks.acceptPendingInvite.mockResolvedValue({
      ok: false,
      code: "INVALID_INVITE",
    });

    await expect(
      acceptInviteForSession({
        fullName: "Nome Aceito",
        password: "SenhaSegura1!",
      }),
    ).resolves.toEqual({
      ok: false,
      message: "Convite inválido ou já utilizado.",
    });

    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.acceptPendingInvite).not.toHaveBeenCalled();
  });
});
