import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserScope } from "@/application/auth/user-scope";

const mocks = vi.hoisted(() => ({
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
  createSupabaseServerClient: async () => ({
    auth: { refreshSession: mocks.refreshSession },
  }),
}));

import { GET } from "@/app/(auth)/contexto/auto/route";

const escopo: UserScope = {
  orgId: "11111111-1111-4111-8111-111111111111",
  orgNome: "Condominios Colinas",
  empreendimentoId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  empreendimentoNome: "Residencial Colinas",
  isOrgScope: false,
  papelCodigo: "recepcionista",
  papelNome: "Recepcionista",
};

const sessao = {
  userId: "u1",
  email: "porteiro@custelo.test",
  claims: { user_status: "ativo" as const },
};

async function chamar(): Promise<string> {
  const resposta = await GET(new Request("http://app.test/contexto/auto"));
  const destino = new URL(resposta.headers.get("location") ?? "");
  return destino.pathname + destino.search;
}

describe("GET /contexto/auto", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getAuthenticatedSession.mockResolvedValue(sessao);
    mocks.listAccessibleScopes.mockResolvedValue([escopo]);
    mocks.defineActiveContext.mockResolvedValue({
      ok: true,
      papelCodigo: "recepcionista",
    });
    mocks.refreshSession.mockResolvedValue({ error: null });
  });

  it("grava o único escopo, renova a sessão e leva para a portaria", async () => {
    expect(await chamar()).toBe("/receber");
    expect(mocks.defineActiveContext).toHaveBeenCalledWith(
      "u1",
      escopo.orgId,
      escopo.empreendimentoId,
    );
    expect(mocks.refreshSession).toHaveBeenCalled();
  });

  it("falha ao renovar a sessão volta para a lista com aviso, sem loop", async () => {
    mocks.refreshSession.mockResolvedValue({ error: { status: 500 } });
    expect(await chamar()).toBe("/contexto?erro=sessao");
  });

  it("mais de um escopo volta para a escolha", async () => {
    mocks.listAccessibleScopes.mockResolvedValue([escopo, escopo]);
    expect(await chamar()).toBe("/contexto");
  });

  it("sem sessão vai para /entrar", async () => {
    mocks.getAuthenticatedSession.mockResolvedValue(null);
    expect(await chamar()).toBe("/entrar");
  });
});
