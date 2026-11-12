import { expect, type Page, test } from "@playwright/test";

// Usa o gestor do seed de desenvolvimento. Cada execução importa um bloco com nome único
// e desfaz os dois lotes no fim, para não deixar dado de teste no ambiente.
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

/** Envia o CSV, confere, autoriza e importa; devolve a tela de conclusão. */
async function importar(page: Page, slug: string, csv: string, total: number) {
  await page.goto(`/gestao/importar/${slug}`);
  // Sem hidratar, o onChange do input ainda não existe e o arquivo escolhido se perde.
  await page.waitForLoadState("networkidle");
  await page.locator("#arquivo-planilha").setInputFiles({
    name: `${slug}.csv`,
    mimeType: "text/csv",
    buffer: Buffer.from(csv, "utf-8"),
  });
  await page.getByRole("button", { name: "Conferir planilha" }).click();

  await page
    .getByRole("button", { name: "Continuar para a confirmação" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Confirmar importação" }),
  ).toBeVisible();
  await page.getByLabel(/Confirmo que tenho autorização/).click();
  await page
    .getByRole("button", { name: `Importar ${total} cadastros` })
    .click();

  await expect(
    page.getByRole("heading", { name: `${total} cadastros importados` }),
  ).toBeVisible({ timeout: 20_000 });
}

async function desfazer(page: Page) {
  await page.getByRole("button", { name: /^Desfazer/ }).click();
  await expect(page.getByRole("button", { name: /^Desfazer/ })).toHaveCount(0, {
    timeout: 20_000,
  });
}

test("importar 3 unidades e 2 moradores", async ({ page }) => {
  const bloco = `E2E${Date.now().toString(36).toUpperCase()}`;

  await entrarComoGestor(page);

  const unidades = [
    "Tipo;Bloco/Torre/Quadra;Número;Andar;Como aparece na etiqueta",
    `Apartamento;${bloco};101;1;`,
    `Apartamento;${bloco};102;1;`,
    `Apartamento;${bloco};201;2;`,
  ].join("\n");
  await importar(page, "unidades", unidades, 3);
  const loteUnidades = page.url();

  const moradores = [
    "Bloco/Torre/Quadra;Unidade;Nome completo;Papel;WhatsApp;E-mail",
    `${bloco};101;Helena E2E;Titular;11987654321;`,
    `${bloco};102;Bruno E2E;Morador;11991230000;`,
  ].join("\n");
  await importar(page, "moradores", moradores, 2);

  // O que foi importado aparece na lista de pessoas.
  await page.goto("/gestao/pessoas");
  await expect(page.getByText("Helena E2E")).toBeVisible();
  await expect(page.getByText("Bruno E2E")).toBeVisible();

  // Desfaz os dois lotes, do último para o primeiro.
  await page.goBack();
  await page.goBack();
  await desfazer(page);
  await page.goto(loteUnidades);
  await desfazer(page);
});
