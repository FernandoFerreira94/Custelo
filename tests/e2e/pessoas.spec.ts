import { expect, type Page, test } from "@playwright/test";

// Usa o gestor do seed de desenvolvimento e cria dados de verdade no projeto de teste
// (nome e telefone únicos por execução). A estrutura precisa ter ao menos uma unidade
// (a de estrutura.spec.ts ou a geração em lote cria).
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

test("cadastrar morador, ver o contato autorizado e encerrar o vínculo", async ({
  page,
}) => {
  const sufixo = String(Date.now() % 1_000_000);
  const nome = `E2E Morador ${sufixo}`;
  const celular = `119${sufixo.padStart(8, "0")}`;
  await entrarComoGestor(page);
  await page.goto("/gestao/pessoas");

  await page.getByRole("button", { name: "Novo morador" }).click();
  await page.getByLabel("Unidade", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Nome", { exact: true }).fill(nome);
  await page.getByLabel("WhatsApp", { exact: true }).fill(celular);
  await page
    .getByLabel("O morador autorizou receber avisos por WhatsApp")
    .click();
  await page.getByRole("button", { name: "Cadastrar morador" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByLabel("Buscar por nome").fill(nome);
  await page.getByRole("search").press("Enter");
  await page.getByRole("link", { name: nome }).click();

  // Dados: o contato nasceu com a autorização do gestor.
  await expect(
    page.getByRole("heading", { name: `Pessoa: ${nome}` }),
  ).toBeAttached();
  await expect(page.getByText(/Autorizou em/)).toBeVisible();

  // Vínculos: o aviso está ligado; encerrar pede motivo e não apaga a pessoa.
  await page.getByRole("tab", { name: "Vínculos" }).click();
  await expect(
    page.getByRole("switch", { name: "Recebe aviso" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Encerrar vínculo" }).first().click();
  await page.getByRole("button", { name: "Encerrar vínculo" }).last().click();
  await expect(page.getByText("Diga por que o vínculo terminou")).toBeVisible();
  await page.getByLabel("Motivo").fill("mudou de apartamento");
  await page.getByRole("button", { name: "Encerrar vínculo" }).last().click();

  await expect(
    page.getByText("Encerrado", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("switch", { name: "Recebe aviso" })).toHaveCount(
    0,
  );
});

test("o filtro 'Sem contato' e a busca vão para a URL", async ({ page }) => {
  await entrarComoGestor(page);
  await page.goto("/gestao/pessoas");

  await page.getByRole("button", { name: /Sem contato/ }).click();
  await expect(page).toHaveURL(/filtro=semContato/);
});
