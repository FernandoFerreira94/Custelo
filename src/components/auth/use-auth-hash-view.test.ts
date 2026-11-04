import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthHashView } from "@/components/auth/use-auth-hash-view";

const { getSession, onAuthStateChange, isSupabaseBrowserConfigured } =
  vi.hoisted(() => ({
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    isSupabaseBrowserConfigured: vi.fn(),
  }));

vi.mock("@/infrastructure/auth/supabase-browser", () => ({
  isSupabaseBrowserConfigured,
  createSupabaseBrowserClient: () => ({
    auth: {
      getSession,
      onAuthStateChange,
    },
  }),
}));

describe("useAuthHashView", () => {
  afterEach(() => {
    window.location.hash = "";
    vi.clearAllMocks();
  });

  it("nao detecta view sem hash de convite ou recuperacao", () => {
    isSupabaseBrowserConfigured.mockReturnValue(true);
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const onDetected = vi.fn();
    renderHook(() => useAuthHashView(onDetected));

    expect(onDetected).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("detecta convite quando a sessao e estabelecida pelo hash", async () => {
    isSupabaseBrowserConfigured.mockReturnValue(true);
    window.location.hash = "#type=invite&access_token=test";
    getSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const replaceState = vi.spyOn(window.history, "replaceState");
    const onDetected = vi.fn();

    renderHook(() => useAuthHashView(onDetected));

    await waitFor(() => expect(onDetected).toHaveBeenCalledWith("convite"));
    expect(replaceState).toHaveBeenCalledWith(null, "", "/");
  });

  it("detecta definicao de senha para hash de recuperacao", async () => {
    isSupabaseBrowserConfigured.mockReturnValue(true);
    window.location.hash = "#type=recovery&access_token=test";
    getSession.mockResolvedValue({ data: { session: { user: { id: "1" } } } });
    onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const onDetected = vi.fn();
    renderHook(() => useAuthHashView(onDetected));

    await waitFor(() => expect(onDetected).toHaveBeenCalledWith("senha"));
  });
});
