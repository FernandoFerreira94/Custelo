#!/usr/bin/env node
/**
 * Fotografa rotas do app nas 4 larguras da review de design (celular, tablet, notebook, desktop)
 * e mede rolagem horizontal. Saída em .screens/<pasta>/ (fora do git).
 *
 * Uso (com o app rodando em http://localhost:3000, `pnpm build && pnpm start`):
 *   node scripts/capturar-telas.mjs auth /entrar "/entrar#recuperar" /sem-acesso
 *   BASE_URL=http://localhost:3001 node scripts/capturar-telas.mjs estados /nao-existe
 *
 * Imprime um JSON por largura: { rota, largura, arquivo, rolagemHorizontal }.
 * rolagemHorizontal > 0 é reprovação automática na review.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "@playwright/test";

const [pasta, ...rotas] = process.argv.slice(2);
if (!pasta || rotas.length === 0) {
  process.stderr.write(
    "Uso: node scripts/capturar-telas.mjs <pasta> <rota> [rota...]\n",
  );
  process.exit(1);
}

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LARGURAS = [
  { nome: "celular", width: 390, height: 844 },
  { nome: "tablet", width: 768, height: 1024 },
  { nome: "notebook", width: 1024, height: 768 },
  { nome: "desktop", width: 1440, height: 900 },
];

const destino = join(process.cwd(), ".screens", pasta);
mkdirSync(destino, { recursive: true });

// CHROMIUM_PATH: só quando o Chromium do Playwright do projeto não está instalado (ex.: nuvem).
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
for (const rota of rotas) {
  for (const l of LARGURAS) {
    const pagina = await navegador.newPage({
      viewport: { width: l.width, height: l.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    await pagina.goto(BASE + rota, { waitUntil: "networkidle" });
    await pagina.waitForTimeout(400);
    const rolagemHorizontal = await pagina.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    const nome = `${rota.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "raiz"}-${l.nome}-${l.width}.png`;
    await pagina.screenshot({ path: join(destino, nome), fullPage: true });
    process.stdout.write(
      `${JSON.stringify({ rota, largura: l.width, arquivo: `.screens/${pasta}/${nome}`, rolagemHorizontal })}\n`,
    );
    await pagina.close();
  }
}
await navegador.close();
