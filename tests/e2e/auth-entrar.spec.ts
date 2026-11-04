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

test("AUTH-004 solicitar recuperacao confirma o envio", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Esqueci minha senha" }).click();
  await expect(
    page.getByRole("heading", { name: "Recuperar acesso" }),
  ).toBeVisible();
  const recoveryEmail = page.getByRole("textbox", { name: "E-mail" });
  await recoveryEmail.click();
  await recoveryEmail.fill("condominio@condominio.com.br");
  await page
    .getByRole("button", { name: "Enviar link de recuperação" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Link enviado" }),
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
  const email = page.getByRole("textbox", { name: "E-mail" });
  await email.click();
  await email.fill(seededEmail);
  await expect(email).toHaveValue(seededEmail);
  await page.getByRole("textbox", { name: "Senha" }).fill(seededPassword);
  await expect(email).toHaveValue(seededEmail);
  const authResponse = page.waitForResponse((response) =>
    response.url().includes("/auth/v1/token"),
  );
  await page.getByRole("button", { name: "Entrar" }).click();
  const response = await authResponse;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/receber$/);
  await expect(
    page.getByRole("heading", { name: "Recebimento" }),
  ).toBeVisible();
});
