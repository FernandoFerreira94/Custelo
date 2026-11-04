import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_TIMEOUT_MS,
  AuthTimeoutError,
  comTimeoutDeAuth,
} from "@/infrastructure/auth/com-timeout";

describe("comTimeoutDeAuth", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("devolve o resultado quando o Supabase responde a tempo", async () => {
    await expect(comTimeoutDeAuth(Promise.resolve("ok"))).resolves.toBe("ok");
  });

  it("rejeita com AuthTimeoutError quando o Supabase nao responde", async () => {
    vi.useFakeTimers();
    const pendente = comTimeoutDeAuth(new Promise<never>(() => {}));
    const esperado = expect(pendente).rejects.toBeInstanceOf(AuthTimeoutError);
    await vi.advanceTimersByTimeAsync(AUTH_TIMEOUT_MS);
    await esperado;
  });
});
