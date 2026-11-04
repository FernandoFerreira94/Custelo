import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

import Home from "@/app/page";

describe("Home", () => {
  it("manda a raiz para /contexto, que decide entre /entrar e a superfície", () => {
    Home();

    expect(mocks.redirect).toHaveBeenCalledWith("/contexto");
  });
});
