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

const email = process.env.E2E_AUTH_EMAIL ?? "colinas@colinas.com.br";
const senha = process.env.E2E_AUTH_PASSWORD ?? "colinas123";

async function entrar(page: import("@playwright/test").Page) {
  await page.goto("/entrar");
  const campo = page.getByRole("textbox", { name: "E-mail" });
  await campo.click();
  await campo.fill(email);
  await expect(campo).toHaveValue(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/receber$/);
}

test("404 dentro da casca da portaria", async ({ page }) => {
  await entrar(page);
  await page.goto("/receber/rota-que-nao-existe");
  await expect(
    page.getByRole("heading", { name: "Página não encontrada" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ir para o início" }),
  ).toHaveAttribute("href", "/receber");
});

test("porteiro não entra na gestão: volta para a casa dele", async ({
  page,
}) => {
  await entrar(page);
  await page.goto("/gestao/equipe");
  await expect(page).toHaveURL(/\/receber$/);
});
