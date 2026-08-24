import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedSession } from "@/application/auth/session-context";
import type { UserScope } from "@/application/auth/user-scope";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  defineActiveContext: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  listAccessibleScopes: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock("@/infrastructure/auth/session", () => ({
  getAuthenticatedSession: mocks.getAuthenticatedSession,
}));

vi.mock("@/infrastructure/auth/user-scopes", () => ({
  defineActiveContext: mocks.defineActiveContext,
  listAccessibleScopes: mocks.listAccessibleScopes,
}));

vi.mock("@/infrastructure/auth/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import {
  resolveContextLanding,
  selectContextAction,
} from "@/app/(auth)/contexto/actions";

const activeSession: AuthenticatedSession = {
  userId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  email: "porteiro@custelo.test",
  claims: { user_status: "ativo" },
};

const scopes: UserScope[] = [
  {
    orgId: "11111111-1111-4111-8111-111111111111",
    orgNome: "Condominios Colinas",
    empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    empreendimentoNome: "Residencial Colinas",
    isOrgScope: false,
    papelCodigo: "recepcionista",
    papelNome: "Recepcionista",
  },
  {
    orgId: "22222222-2222-4222-8222-222222222222",
    orgNome: "Condominios Vale",
    empreendimentoId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    empreendimentoNome: "Residencial Vale",
    isOrgScope: false,
    papelCodigo: "empreendimento_gestor",
    papelNome: "Gestor",
  },
];

function mockSupabaseRefresh() {
  mocks.refreshSession.mockResolvedValue({ error: null });
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: { refreshSession: mocks.refreshSession },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mockSupabaseRefresh();
});

describe("resolveContextLanding â€” AUTH-005", () => {
  it("redireciona usuario sem sessao para entrar", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(null);

    await expect(resolveContextLanding()).resolves.toEqual({
      kind: "unauthorized",
      href: "/entrar",
    });
    expect(mocks.listAccessibleScopes).not.toHaveBeenCalled();
  });

  it.each(["desativado", "convite_pendente"] as const)(
    "redireciona usuario %s para sem acesso",
    async (userStatus) => {
      mocks.getAuthenticatedSession.mockResolvedValue({
        ...activeSession,
        claims: { user_status: userStatus },
      });

      await expect(resolveContextLanding()).resolves.toEqual({
        kind: "no-access",
        href: "/sem-acesso",
      });
      expect(mocks.listAccessibleScopes).not.toHaveBeenCalled();
    },
  );

  it("persiste o unico escopo e envia recepcionista para OPS", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(activeSession);
    mocks.listAccessibleScopes.mockResolvedValue([scopes[0]]);
    mocks.defineActiveContext.mockResolvedValue({
      ok: true,
      papelCodigo: "recepcionista",
    });

    await expect(resolveContextLanding()).resolves.toEqual({
      kind: "redirect",
      href: "/receber",
    });
    expect(mocks.defineActiveContext).toHaveBeenCalledWith(
      activeSession.userId,
      scopes[0]?.orgId,
      scopes[0]?.empreendimentoId,
    );
    expect(mocks.refreshSession).toHaveBeenCalledOnce();
  });
});

describe("selectContextAction â€” AUTH-005", () => {
  it("valida a selecao multipla contra os escopos do usuario no servidor", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(activeSession);
    mocks.listAccessibleScopes.mockResolvedValue(scopes);
    mocks.defineActiveContext.mockResolvedValue({
      ok: true,
      papelCodigo: "empreendimento_gestor",
    });

    await expect(
      selectContextAction({
        orgId: scopes[1]?.orgId,
        empreendimentoId: scopes[1]?.empreendimentoId,
      }),
    ).resolves.toEqual({ ok: true, redirectTo: "/gestao" });
    expect(mocks.defineActiveContext).toHaveBeenCalledWith(
      activeSession.userId,
      scopes[1]?.orgId,
      scopes[1]?.empreendimentoId,
    );
  });

  it("nao altera contexto quando o escopo enviado nao pertence ao usuario", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(activeSession);
    mocks.listAccessibleScopes.mockResolvedValue([scopes[0]]);

    await expect(
      selectContextAction({
        orgId: scopes[1]?.orgId,
        empreendimentoId: scopes[1]?.empreendimentoId,
      }),
    ).resolves.toEqual({ ok: false, code: "INVALID_SCOPE" });
    expect(mocks.defineActiveContext).not.toHaveBeenCalled();
    expect(mocks.refreshSession).not.toHaveBeenCalled();
  });
});
