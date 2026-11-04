import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  verifyOtp: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/infrastructure/auth/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

import { GET } from "@/app/auth/confirm/route";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      verifyOtp: mocks.verifyOtp,
      exchangeCodeForSession: mocks.exchangeCodeForSession,
    },
  });
});

describe("GET /auth/confirm", () => {
  it("abre o palco de nova senha apos validar recovery", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: null });

    const response = await GET(
      new Request(
        "https://custelo.example/auth/confirm?token_hash=token-seguro&type=recovery",
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://custelo.example/entrar?view=senha",
    );
    expect(mocks.verifyOtp).toHaveBeenCalledWith({
      token_hash: "token-seguro",
      type: "recovery",
    });
  });

  it("abre o palco de convite apos validar invite", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: null });

    const response = await GET(
      new Request(
        "https://custelo.example/auth/confirm?token_hash=token-seguro&type=invite",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://custelo.example/entrar?view=convite",
    );
  });

  it("recusa link incompleto ou invalido", async () => {
    const response = await GET(
      new Request("https://custelo.example/auth/confirm?type=recovery"),
    );

    expect(response.headers.get("location")).toBe(
      "https://custelo.example/entrar?auth_error=invalid_link",
    );
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
  });

  it("recusa token rejeitado pelo Supabase", async () => {
    mocks.verifyOtp.mockResolvedValue({ error: { message: "expired" } });

    const response = await GET(
      new Request(
        "https://custelo.example/auth/confirm?token_hash=expirado&type=recovery",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://custelo.example/entrar?auth_error=invalid_link",
    );
  });

  it("troca codigo PKCE por sessao antes de abrir o palco", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request(
        "https://custelo.example/auth/confirm?code=codigo-pkce&view=senha",
      ),
    );

    expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("codigo-pkce");
    expect(response.headers.get("location")).toBe(
      "https://custelo.example/entrar?view=senha",
    );
  });
});
