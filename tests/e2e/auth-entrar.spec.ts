import { expect, test } from "@playwright/test";

test("AUTH-001 entrar mostra o formulario", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByLabel("Senha")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Esqueci minha senha" }),
  ).toBeVisible();
});

test("AUTH-003 recuperar acesso troca so o card", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await expect(
    page.getByRole("heading", { name: "Recuperar acesso" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voltar para o login" }).click();
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("AUTH-004 definir senha apos enviar link", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await page.getByLabel("E-mail").fill("condominio@condominio.com.br");
  await page
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Definir nova senha" }),
  ).toBeVisible();
});

test("AUTH-002 aceitar convite troca so o card", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Aceitar convite" }).click();
  await expect(
    page.getByRole("heading", { name: "Aceitar convite" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Voltar para o login" }).click();
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
