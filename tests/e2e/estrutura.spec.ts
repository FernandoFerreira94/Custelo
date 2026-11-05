import { expect, type Page, test } from "@playwright/test";

// Usa o gestor do seed de desenvolvimento. A geração em lote só mostra a prévia; o cadastro
// de uma unidade cria e desativa de verdade, com código único por execução.
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

test("cadastrar unidade, ver duplicada e desativar", async ({ page }) => {
  const numero = String(Date.now() % 1_000_000);
  const codigo = `E2E-${numero}`;
  await entrarComoGestor(page);
  await page.goto("/gestao/unidades");

  async function criar() {
    await page.getByRole("button", { name: "Nova unidade" }).click();
    await page.getByLabel("Bloco (opcional)").fill("E2E");
    await page.getByLabel("Número").fill(numero);
    await expect(
      page.getByRole("dialog").getByText(codigo, { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Criar unidade" }).click();
  }

  await criar();
  // O painel fecha sozinho quando a unidade é criada.
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByLabel("Buscar por código ou apelido").fill(codigo);
  await page.getByRole("search").press("Enter");
  await expect(page.getByRole("cell", { name: codigo })).toBeVisible();

  // A mesma unidade de novo: recusada, com o caminho para abrir a que existe.
  await criar();
  await expect(page.getByRole("alert")).toContainText(
    `Já existe a unidade ${codigo}`,
  );
  await expect(
    page.getByRole("link", { name: `Abrir ${codigo}` }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Desativar" }).first().click();
  await page.getByRole("button", { name: "Desativar unidade" }).click();
  await expect(page.getByRole("cell", { name: codigo })).toHaveCount(0);
});
