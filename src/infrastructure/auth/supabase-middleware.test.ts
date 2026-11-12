import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

type Cookies = {
  getAll: () => { name: string; value: string }[];
  setAll: (l: { name: string; value: string; options?: object }[]) => void;
};
let capturado: Cookies | undefined;
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_u: string, _k: string, o: { cookies: Cookies }) => {
    capturado = o.cookies;
    return { auth: { getUser: vi.fn() } };
  },
}));
vi.mock("@/lib/env", () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "http://x",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "k",
  },
}));

describe("createSupabaseMiddlewareClient", () => {
  it("cookie renovado vai para a request repassada e para a resposta", async () => {
    const { createSupabaseMiddlewareClient } =
      await import("./supabase-middleware");
    const req = new NextRequest("http://localhost/gestao", {
      headers: { cookie: "sb=velho" },
    });
    const { getResponse } = createSupabaseMiddlewareClient(req);
    capturado!.setAll([{ name: "sb", value: "novo", options: { path: "/" } }]);
    const res = getResponse();
    expect(req.cookies.get("sb")?.value).toBe("novo");
    expect(res.cookies.get("sb")?.value).toBe("novo");
    expect(
      res.headers.get("x-middleware-request-cookie") ??
        res.headers.get("x-middleware-override-headers"),
    ).toBeTruthy();
  });
});
