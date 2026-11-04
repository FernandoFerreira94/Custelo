import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SplashSessao } from "@/components/auth/splash-sessao";
import {
  CHAVE_SPLASH,
  SCRIPT_SPLASH,
} from "@/components/auth/splash-sessao-script";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  sessionStorage.clear();
});

describe("SplashSessao", () => {
  it("nasce visível, sem esperar efeito, e some sozinho", () => {
    vi.useFakeTimers();
    const { container } = render(<SplashSessao />);

    expect(container.querySelector(".pz-splash")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(container.querySelector(".pz-splash")).toBeNull();
  });

  it("some ao toque", () => {
    const { container } = render(<SplashSessao />);

    fireEvent.click(container.firstElementChild as Element);

    expect(container.querySelector(".pz-splash")).toBeNull();
  });
});

describe("SCRIPT_SPLASH", () => {
  function rodar(movimentoReduzido = false) {
    // jsdom não implementa matchMedia.
    vi.stubGlobal("matchMedia", () => ({ matches: movimentoReduzido }));
    const splash = document.createElement("div");
    const script = document.createElement("script");
    document.body.append(splash, script);
    Object.defineProperty(document, "currentScript", {
      configurable: true,
      value: script,
    });
    new Function(SCRIPT_SPLASH)();
    Object.defineProperty(document, "currentScript", {
      configurable: true,
      value: null,
    });
    splash.remove();
    script.remove();
    return splash;
  }

  it("na primeira abertura mostra o splash e marca a sessão", () => {
    const splash = rodar();

    expect(splash.hidden).toBe(false);
    expect(sessionStorage.getItem(CHAVE_SPLASH)).toBe("1");
  });

  it("esconde o splash com movimento reduzido", () => {
    expect(rodar(true).hidden).toBe(true);
  });

  it("esconde o splash se a sessão já o viu", () => {
    sessionStorage.setItem(CHAVE_SPLASH, "1");

    expect(rodar().hidden).toBe(true);
  });
});
