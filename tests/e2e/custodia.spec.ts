import { expect, type Page, test } from "@playwright/test";

import { semearCustodia } from "./fixtures/custodia";

// Precisa da migration 0015 no banco do ambiente e de E2E_DATABASE_URL.
const email = process.env.E2E_GESTOR_EMAIL ?? "gestor@colinas.com.br";
const senha = process.env.E2E_GESTOR_PASSWORD ?? "gestor12345";

test.describe.configure({ mode: "serial" });

async function entrar(page: Page) {
  await page.goto("/entrar");
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/gestao$/, { timeout: 15_000 });
}

test("lista da gestão filtra, abre a encomenda e mostra a linha do tempo", async ({
  page,
}) => {
  const s = await semearCustodia(email);
  await entrar(page);
  await page.goto(`/gestao/encomendas?q=${s.codigo}`);
  await expect(page.getByText("Falha no aviso").first()).toBeVisible();
  await page.goto(`/gestao/encomendas?q=${s.codigo}&filtro=prontas`);
  const linhas = page.getByRole("link", { name: new RegExp(s.codigo) });
  await expect(linhas.first()).toBeVisible();
  await linhas.first().click();
  await expect(page.getByText("Linha do tempo")).toBeVisible();
  await expect(page.getByText("Guardada na C2")).toBeVisible();
});

test("mover de C2 para VG e ver na linha do tempo", async ({ page }) => {
  const s = await semearCustodia(email);
  await entrar(page);
  await page.goto(`/gestao/encomendas/${s.ids[0]}`);
  await page.getByRole("button", { name: "Mover" }).click();
  await page.getByRole("radio", { name: /VG/ }).click();
  await page.getByRole("radio", { name: "Prateleira cheia" }).click();
  await page.getByRole("button", { name: "Mover para VG" }).click();
  await expect(page.getByText("Movida de C2 para VG")).toBeVisible();
});
