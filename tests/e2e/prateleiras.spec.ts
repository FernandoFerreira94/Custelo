import { expect, test } from "@playwright/test";

// Precisa da migration 0015 (I4) no banco do ambiente. Usa o gestor do seed de
// desenvolvimento; o ponto ganha nome único por execução.
const email = process.env.E2E_GESTOR_EMAIL ?? "gestor@colinas.com.br";
const senha = process.env.E2E_GESTOR_PASSWORD ?? "gestor12345";

test("criar ponto com 3 prateleiras e ver a ocupação", async ({ page }) => {
  const nome = `Portaria E2E ${Date.now() % 1_000_000}`;
  await page.goto("/entrar");
  await page.getByRole("textbox", { name: "E-mail" }).fill(email);
  await page.getByRole("textbox", { name: "Senha" }).fill(senha);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(/\/gestao$/, { timeout: 15_000 });

  await page.goto("/gestao/estrutura/areas");
  await page.getByRole("button", { name: "Ponto", exact: true }).click();
  await page.getByLabel("Nome").fill(nome);
  for (const [i, codigo, cap] of [
    [1, "A1", "24"],
    [2, "B2", "24"],
    [3, "VG", "8"],
  ] as const) {
    await page.getByRole("button", { name: "Adicionar prateleira" }).click();
    await page.getByLabel(`Prateleira ${i}, nome`).fill(codigo);
    await page.getByLabel(`Prateleira ${i}, capacidade`).fill(cap);
  }
  await page.getByRole("button", { name: "Salvar ponto" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  const item = page.getByRole("listitem").filter({ hasText: nome });
  for (const codigo of ["A1", "B2", "VG"])
    await expect(
      item.getByRole("meter", { name: `Prateleira ${codigo}` }),
    ).toBeVisible();
});
