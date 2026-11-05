import { expect, test } from "@playwright/test";

test("/sessao-expirada explica e leva de volta ao login", async ({ page }) => {
  await page.goto("/sessao-expirada?voltar=/gestao");
  await expect(
    page.getByRole("heading", { name: "Sua sessão terminou" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Entrar de novo" }),
  ).toHaveAttribute("href", "/entrar?voltar=%2Fgestao");
});

test("/sessao-expirada ignora destino externo", async ({ page }) => {
  await page.goto("/sessao-expirada?voltar=//evil.com");
  await expect(
    page.getByRole("link", { name: "Entrar de novo" }),
  ).toHaveAttribute("href", "/entrar");
});

test("/manutencao orienta a portaria", async ({ page }) => {
  await page.goto("/manutencao");
  await expect(
    page.getByRole("heading", { name: "Estamos melhorando o PacoteZap" }),
  ).toBeVisible();
  await expect(page.getByText("caderno de contingência")).toBeVisible();
});
