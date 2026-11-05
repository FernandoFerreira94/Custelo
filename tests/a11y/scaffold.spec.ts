import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("scaffold da raiz sem violacao serious/critical", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".pz-splash", { state: "detached" });
  const results = await new AxeBuilder({ page }).analyze();
  const graves = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(graves).toEqual([]);
});
