import { expect, type Page, test } from "@playwright/test";

// Usa o gestor do seed de desenvolvimento. Não cria unidade de verdade: os dados persistem
// no projeto de teste, então só exercita a tela e a prévia (a criação é coberta no teste RLS).
const email = process.env.E2E_GESTOR_EMAIL ?? "gestor@colinas.com.br";
const senha = process.env.E2E_GESTOR_PASSWORD ?? "gestor12345";

test.describe.configure({ mode: "serial" });

async function entrarComoGestor(page: Page) {
  await page.goto("/entrar");
  const campo = page.getByRole("textbox", { name: "E-mail" });
  await campo.click();
  await campo.fill(email);
  await expect(campo).toHaveValue(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/gestao$/, { timeout: 15_000 });
}

test("a estrutura abre com a árvore ou com o convite para montá-la", async ({
  page,
}) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/estrutura");

  await expect(
    page.getByRole("heading", { name: "Estrutura", exact: true }),
  ).toBeVisible();
  const arvore = page.getByRole("tree", { name: "Estrutura do condomínio" });
  const vazio = page.getByText("Monte a estrutura do condomínio");
  await expect(arvore.or(vazio)).toBeVisible();
});

test("o painel de geração mostra a prévia ao vivo", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/estrutura");

  await page
    .getByRole("button", { name: /Novo bloco|Gerar blocos e unidades/ })
    .first()
    .click();

  await expect(page.getByText("A-101 … C-908 · 216 unidades")).toBeVisible();
  await page.getByLabel("Unidades por andar").fill("120");
  await expect(page.getByText(/até 99 unidades por andar/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar unidades" }),
  ).toBeDisabled();
});
