import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("AUTH-001 entrar sem violacao serious/critical", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  const graves = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(graves).toEqual([]);
});
