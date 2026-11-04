const { chromium } = require('playwright');
const fs = require('fs');
// Uso: servir o build pz-todas.html em http://localhost:8790/index.html e rodar `node capturar-pranchas.cjs <saida>`.
const out = process.argv[2];
const tabs = ['entrada','portaria','fluxo','painel','cadastros','estrutura','gestao','formularios','estados','importacao','importar','config','plataforma'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 });
  const idx = [];
  for (const t of tabs) {
    await p.goto(`http://localhost:8790/index.html#${t}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    const n = await p.locator('figure:has(figcaption .font-mono)').count();
    fs.mkdirSync(`${out}/${t}`, { recursive: true });
    for (let i = 0; i < n; i++) {
      const f = p.locator('figure:has(figcaption .font-mono)').nth(i);
      if (!(await f.isVisible())) continue;
      const id = (await f.locator('figcaption .font-mono').first().innerText()).trim();
      const tit = (await f.locator('figcaption').first().innerText()).split('\n')[0].split('·').slice(1).join('·').trim();
      const slug = (id + '-' + tit).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
      let file = `${t}/${slug}.png`;
      for (let k = 2; idx.some(x => x.file === file); k++) file = `${t}/${slug}-${k}.png`;
      await f.scrollIntoViewIfNeeded();
      await f.screenshot({ path: `${out}/${file}` });
      idx.push({ aba: t, id, titulo: tit, file });
    }
  }
  fs.writeFileSync(`${out}/index.json`, JSON.stringify(idx, null, 1));
  console.log(idx.length);
  await b.close();
})();
