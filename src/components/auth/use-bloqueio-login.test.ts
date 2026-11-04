import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BLOQUEIO_MS,
  formatarRegressiva,
  MAX_TENTATIVAS,
  useBloqueioLogin,
} from "@/components/auth/use-bloqueio-login";

describe("formatarRegressiva", () => {
  it("mostra minutos e segundos com zero à esquerda", () => {
    expect(formatarRegressiva(BLOQUEIO_MS)).toBe("15:00");
    expect(formatarRegressiva(65_000)).toBe("1:05");
    expect(formatarRegressiva(999)).toBe("0:01");
    expect(formatarRegressiva(0)).toBe("0:00");
  });
});

describe("useBloqueioLogin", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("só bloqueia na quinta falha seguida", () => {
    const { result } = renderHook(() => useBloqueioLogin());
    for (let i = 0; i < MAX_TENTATIVAS - 1; i++) {
      act(() => result.current.registrarFalha());
    }
    expect(result.current.bloqueado).toBe(false);
    act(() => result.current.registrarFalha());
    expect(result.current.bloqueado).toBe(true);
    expect(result.current.restanteMs).toBe(BLOQUEIO_MS);
  });

  it("conta regressivamente e libera depois dos 15 minutos", () => {
    const { result } = renderHook(() => useBloqueioLogin());
    for (let i = 0; i < MAX_TENTATIVAS; i++) {
      act(() => result.current.registrarFalha());
    }
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.restanteMs).toBe(BLOQUEIO_MS - 60_000);
    act(() => vi.advanceTimersByTime(BLOQUEIO_MS));
    expect(result.current.bloqueado).toBe(false);
  });

  it("login com sucesso zera as falhas", () => {
    const { result } = renderHook(() => useBloqueioLogin());
    for (let i = 0; i < MAX_TENTATIVAS - 1; i++) {
      act(() => result.current.registrarFalha());
    }
    act(() => result.current.zerar());
    act(() => result.current.registrarFalha());
    expect(result.current.bloqueado).toBe(false);
  });
});
