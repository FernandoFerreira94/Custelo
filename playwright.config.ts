import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

/**
 * E2E + acessibilidade.
 *
 * Regra dura do ADR-019: staging NUNCA aponta para o numero de WhatsApp real de
 * um cliente nem para dado de producao. O mesmo vale aqui — E2E roda contra
 * ambiente efemero/local, jamais contra producao.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Os e2e logados dividem o mesmo usuário seed: logins simultâneos dele falham de vez em quando.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  },
  projects: [
    {
      name: "web",
      testDir: "./tests/e2e",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1088 },
      },
    },
    {
      // Aparelho de portaria e Android de baixo custo (ADR-012) — o alvo real.
      name: "ops",
      testDir: "./tests/e2e",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "a11y",
      testDir: "./tests/a11y",
      // Ilustração decorativa anima opacidade: o axe mediria o contraste no meio do fade.
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { reducedMotion: "reduce" },
      },
    },
  ],
  webServer: process.env.CI
    ? { command: "pnpm start", url: baseURL, reuseExistingServer: false }
    : undefined,
});
