const { chromium } = require('playwright');
const fs = require('fs');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1800, height: 1000 }, deviceScaleFactor: 1 });
  const idx = JSON.parse(fs.readFileSync(`${out}/index.json`));
  await p.goto('http://localhost:8790/index.html#estados', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const s = p.locator('section[aria-labelledby^="e-"]');
  for (let i = 0; i < await s.count(); i++) {
    const sec = s.nth(i); if (!(await sec.isVisible())) continue;
    const id = await sec.getAttribute('aria-labelledby'); const tit = await sec.locator('h2').first().innerText();
    const file = `estados/bloco-${id}.png`; await sec.scrollIntoViewIfNeeded(); await sec.screenshot({ path: `${out}/${file}` });
    idx.push({ aba: 'estados', id, titulo: tit, file });
  }
  await p.goto('http://localhost:8790/index.html#formularios', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${out}/formularios/formularios-completo.png`, fullPage: true });
  idx.push({ aba: 'formularios', id: 'FORMS', titulo: 'Formulários de cadastro (página inteira)', file: 'formularios/formularios-completo.png' });
  fs.writeFileSync(`${out}/index.json`, JSON.stringify(idx, null, 1)); console.log(idx.length); await b.close();
})();
