import { expect, test } from "@playwright/test";

// O service worker só existe no build de produção (`pnpm build && pnpm start`).
test("manifest da portaria é válido", async ({ request }) => {
  const r = await request.get("/manifest.webmanifest");
  expect(r.ok()).toBe(true);
  const m = await r.json();
  expect(m).toMatchObject({
    name: "PacoteZap Portaria",
    start_url: "/receber",
    display: "standalone",
  });
  expect(
    m.icons.some((i: { purpose?: string }) => i.purpose === "maskable"),
  ).toBe(true);
});

test("service worker é servido e não guarda resposta de API", async ({
  request,
}) => {
  test.skip(
    !process.env.CI && !process.env.E2E_BUILD,
    "só no build de produção",
  );
  const r = await request.get("/sw.js");
  expect(r.ok()).toBe(true);
  expect(await r.text()).toContain("/api/");
});
