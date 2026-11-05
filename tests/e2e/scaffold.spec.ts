import { expect, test } from "@playwright/test";

/**
 * Fumaca do scaffold. Nao e tela de produto — so garante que o app sobe
 * durante a preparacao. Substitui-se pelo redirecionamento por superficie em I2.
 */
test("scaffold da raiz sobe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("PacoteZap").first()).toBeVisible();
});

test("health liveness responde sem vazamento", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as {
    status: string;
    checks: { app: string; db: string };
  };
  expect(body.status).toBe("ok");
  expect(body.checks.app).toBe("ok");
  expect(JSON.stringify(body).toLowerCase()).not.toMatch(
    /password|postgres:\/\/|service_role/,
  );
});
