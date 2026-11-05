import { beforeEach, describe, expect, it, vi } from "vitest";

const signInWithPassword = vi.fn();

vi.mock("@/infrastructure/auth/supabase-browser", () => ({
  isSupabaseBrowserConfigured: () => true,
  createSupabaseBrowserClient: () => ({
    auth: { signInWithPassword, signOut: vi.fn() },
  }),
}));

import {
  LOGIN_EMAIL_NAO_CONFIRMADO,
  LOGIN_FAILED,
  requestSession,
} from "@/components/auth/request-session";
import { MSG } from "@/lib/mensagens";

const input = { email: "ana@exemplo.com", password: "senha-forte-123" };

describe("requestSession: mensagem certa por causa", () => {
  beforeEach(() => signInWithPassword.mockReset());

  it("credencial errada diz senha incorreta", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { code: "invalid_credentials", status: 400 },
    });
    await expect(requestSession(input)).resolves.toEqual({
      ok: false,
      mensagem: LOGIN_FAILED,
    });
  });

  it("muitas tentativas não diz senha incorreta", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { code: "over_request_rate_limit", status: 429 },
    });
    await expect(requestSession(input)).resolves.toEqual({
      ok: false,
      mensagem: MSG.muitasTentativas,
    });
  });

  it("e-mail não confirmado tem texto próprio", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { code: "email_not_confirmed", status: 400 },
    });
    await expect(requestSession(input)).resolves.toEqual({
      ok: false,
      mensagem: LOGIN_EMAIL_NAO_CONFIRMADO,
    });
  });

  it("falha de rede vira sem conexão", async () => {
    // O supabase-js não lança em falha de rede: devolve AuthRetryableFetchError.
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { name: "AuthRetryableFetchError", status: 0 },
    });
    await expect(requestSession(input)).resolves.toEqual({
      ok: false,
      mensagem: MSG.semConexao,
    });
  });

  it("servidor fora vira instável", async () => {
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { status: 503 },
    });
    await expect(requestSession(input)).resolves.toEqual({
      ok: false,
      mensagem: MSG.instavel,
    });
  });
});
