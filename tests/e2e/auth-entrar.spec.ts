import { expect, test } from "@playwright/test";

const seededEmail = process.env.E2E_AUTH_EMAIL ?? "colinas@colinas.com.br";
const seededPassword = process.env.E2E_AUTH_PASSWORD ?? "colinas123";

test("AUTH-001 entrar mostra o formulario", async ({ page }) => {
  await page.goto("/entrar");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByLabel("E-mail")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Senha" })).toBeVisible();
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
  await expect(
    page.getByRole("heading", { name: "Recuperar acesso" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "E-mail" })
    .fill("condominio@condominio.com.br");
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

test("I2 login real do usuario seed redireciona para recebimento", async ({
  page,
}) => {
  await page.goto("/entrar");
  await page.getByLabel("E-mail").fill(seededEmail);
  await page.getByRole("textbox", { name: "Senha" }).fill(seededPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/receber$/);
  await expect(
    page.getByRole("heading", { name: "Recebimento" }),
  ).toBeVisible();
});
