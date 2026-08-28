import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptInviteForSession: vi.fn(),
  getPendingInviteForSession: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  createSupabaseAdminClient: vi.fn(),
  isSupabaseAdminConfigured: vi.fn(),
  headers: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  refreshSession: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/infrastructure/auth/invite-service", () => ({
  acceptInviteForSession: mocks.acceptInviteForSession,
  getPendingInviteForSession: mocks.getPendingInviteForSession,
}));

vi.mock("@/infrastructure/auth/session", () => ({
  getAuthenticatedSession: mocks.getAuthenticatedSession,
}));

vi.mock("@/infrastructure/auth/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/infrastructure/auth/supabase-admin", () => ({
  isSupabaseAdminConfigured: mocks.isSupabaseAdminConfigured,
  createSupabaseAdminClient: mocks.createSupabaseAdminClient,
}));

import {
  acceptInviteAction,
  fetchPendingInviteAction,
  requestRecoveryAction,
  setPasswordAction,
} from "@/app/(auth)/entrar/actions";

const validPassword = "SenhaSegura1!";

function mockSupabaseClient() {
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
      refreshSession: mocks.refreshSession,
    },
  });
  mocks.createSupabaseAdminClient.mockReturnValue({
    auth: {
      admin: {
        signOut: mocks.signOut,
      },
    },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockSupabaseClient();
  mocks.headers.mockResolvedValue(
    new Headers({ origin: "http://localhost:3000" }),
  );
  mocks.isSupabaseAdminConfigured.mockReturnValue(true);
});

describe("fetchPendingInviteAction — AUTH-002", () => {
  it("delega ao servico de convite", async () => {
    mocks.getPendingInviteForSession.mockResolvedValue({
      ok: true,
      metadata: { role: "Recepcionista", properties: "Org", inviter: "Admin" },
    });

    await expect(fetchPendingInviteAction()).resolves.toEqual({
      ok: true,
      metadata: { role: "Recepcionista", properties: "Org", inviter: "Admin" },
    });
  });
});

describe("acceptInviteAction — AUTH-002", () => {
  it("valida entrada antes de aceitar convite", async () => {
    await expect(
      acceptInviteAction({ fullName: "", password: "curta" }),
    ).resolves.toEqual({
      ok: false,
      message: "Preencha nome e senha válidos.",
    });

    expect(mocks.acceptInviteForSession).not.toHaveBeenCalled();
  });

  it("delega aceite valido ao servico", async () => {
    mocks.acceptInviteForSession.mockResolvedValue({
      ok: true,
      redirectTo: "/contexto",
    });

    await expect(
      acceptInviteAction({
        fullName: "Nome Aceito",
        password: validPassword,
      }),
    ).resolves.toEqual({ ok: true, redirectTo: "/contexto" });
  });
});

describe("requestRecoveryAction — AUTH-003", () => {
  it("recusa e-mail invalido", async () => {
    await expect(requestRecoveryAction({ email: "invalido" })).resolves.toEqual(
      {
        ok: false,
        message: "Informe um e-mail válido.",
      },
    );

    expect(mocks.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("envia recuperacao para e-mail valido", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });

    await expect(
      requestRecoveryAction({ email: "usuario@example.test" }),
    ).resolves.toMatchObject({ ok: true });

    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "usuario@example.test",
      { redirectTo: "http://localhost:3000/entrar" },
    );
  });

  it("nao confirma existencia de conta quando Supabase falha", async () => {
    mocks.resetPasswordForEmail.mockResolvedValue({
      error: { message: "failed" },
    });

    await expect(
      requestRecoveryAction({ email: "usuario@example.test" }),
    ).resolves.toEqual({
      ok: false,
      message:
        "Não foi possível enviar o link agora. Tente novamente em instantes.",
    });
  });
});

describe("setPasswordAction — AUTH-004", () => {
  it("recusa senha invalida", async () => {
    await expect(
      setPasswordAction({
        password: "curta",
        confirmPassword: "curta",
      }),
    ).resolves.toEqual({
      ok: false,
      message: "Verifique a senha e a confirmação.",
    });
  });

  it("recusa quando nao ha sessao", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(null);

    await expect(
      setPasswordAction({
        password: validPassword,
        confirmPassword: validPassword,
      }),
    ).resolves.toEqual({
      ok: false,
      message: "Link expirado. Solicite um novo link de recuperação.",
    });
  });

  it("recusa quando admin Supabase nao esta configurado", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue({
      userId: "user-id",
      email: "usuario@example.test",
      claims: { user_status: "ativo" },
    });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.isSupabaseAdminConfigured.mockReturnValue(false);

    await expect(
      setPasswordAction({
        password: validPassword,
        confirmPassword: validPassword,
      }),
    ).resolves.toEqual({
      ok: false,
      message: "Não foi possível concluir a alteração agora. Tente novamente.",
    });

    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("atualiza senha e redireciona para contexto", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue({
      userId: "user-id",
      email: "usuario@example.test",
      claims: { user_status: "ativo" },
    });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.refreshSession.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });

    await expect(
      setPasswordAction({
        password: validPassword,
        confirmPassword: validPassword,
      }),
    ).resolves.toEqual({ ok: true, redirectTo: "/contexto" });

    expect(mocks.signOut).toHaveBeenCalledWith("user-id", "others");
    expect(mocks.refreshSession).toHaveBeenCalledOnce();
  });
});
