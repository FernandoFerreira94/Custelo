import { expect, type Page, test } from "@playwright/test";

// Usa o gestor do seed de desenvolvimento (scripts/seed-dev-gestor.mjs).
// Não envia convite nem desativa ninguém de verdade: só exercita as telas e as validações.
const email = process.env.E2E_GESTOR_EMAIL ?? "gestor@colinas.com.br";
const senha = process.env.E2E_GESTOR_PASSWORD ?? "gestor12345";

// Um login por vez: logins paralelos do mesmo usuário esbarram no limite do Supabase Auth.
test.describe.configure({ mode: "serial" });

async function entrarComoGestor(page: Page) {
  await page.goto("/entrar");
  const campo = page.getByRole("textbox", { name: "E-mail" });
  await campo.click();
  await campo.fill(email);
  await expect(campo).toHaveValue(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/gestao$/);
}

test("equipe lista as pessoas com e-mail mascarado", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/equipe");

  await expect(page.getByRole("heading", { name: "Equipe" })).toBeVisible();
  await expect(page.getByText("c***@colinas.com.br")).toBeVisible();
  await expect(page.getByText("colinas@colinas.com.br")).toHaveCount(0);
});

test("convite com e-mail inválido mostra o erro no campo", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/equipe");

  await page.getByRole("button", { name: "Convidar" }).click();
  await page.getByLabel("E-mail").fill("isso-nao-e-email");
  await page.getByRole("button", { name: "Enviar convite" }).click();

  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
});

test("desativar exige o motivo e avisa o efeito", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/equipe");

  await page.getByRole("button", { name: "Desativar" }).first().click();
  await expect(
    page.getByText("A pessoa sai de todos os aparelhos agora"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Desativar acesso" }).click();

  await expect(
    page.getByText("Conte o motivo, em poucas palavras."),
  ).toBeVisible();
});

test("papéis e permissões abre em só leitura", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/equipe/papeis");

  await expect(
    page.getByRole("heading", { name: "Papéis e permissões" }),
  ).toBeVisible();
  await expect(page.getByText("Registrar encomenda")).toBeVisible();
  await expect(page.getByText("Ninguém apaga evidência")).toBeVisible();
});

test("o item Equipe do trilho leva à tela e fica marcado", async ({ page }) => {
  await entrarComoGestor(page);

  await page.getByRole("link", { name: "Equipe", exact: true }).click();

  await expect(page).toHaveURL(/\/gestao\/equipe$/);
  await expect(
    page.getByRole("link", { name: "Equipe", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});
