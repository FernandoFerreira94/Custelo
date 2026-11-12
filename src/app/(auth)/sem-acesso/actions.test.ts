import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  signOut: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/infrastructure/auth/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import { signOutAction } from "@/app/(auth)/sem-acesso/actions";
import { MSG } from "@/lib/mensagens";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: { signOut: mocks.signOut },
  });
});

describe("signOutAction", () => {
  it("sai e redireciona para /entrar", async () => {
    mocks.signOut.mockResolvedValue({ error: null });

    await signOutAction();

    expect(mocks.redirect).toHaveBeenCalledWith("/entrar");
  });

  it("erro de rede devolve a falha e não redireciona", async () => {
    mocks.signOut.mockResolvedValue({
      error: { name: "AuthRetryableFetchError" },
    });

    await expect(signOutAction()).resolves.toEqual({
      ok: false,
      codigo: "INDISPONIVEL",
      mensagem: MSG.semConexao,
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
