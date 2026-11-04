#!/usr/bin/env node
/**
 * Plano B do `npx shadcn add @webcode/<nome>`: copia componentes do registry WebCode
 * quando o CLI não alcança ui.shadcn.com ou o site do DS (proxy, sem rede).
 *
 * Uso:
 *   node scripts/webcode-add.mjs button card sheet
 *   WEBCODE_REGISTRY=../webcode-design/site/public/r node scripts/webcode-add.mjs button
 *   node scripts/webcode-add.mjs --overwrite button   (troca arquivo que já existe)
 *
 * Fonte padrão: https://webcode-design.vercel.app/r/{nome}.json
 * Resolve as dependências do registry (registryDependencies), reescreve os imports
 * `@/registry/webcode/{ui,lib,hooks}` para os aliases do app e lista os pacotes npm
 * que faltam. Não instala nada no npm sozinho e não mexe em CSS (tema é manual, ver plano).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const overwrite = args.includes("--overwrite");
const nomes = args.filter((a) => !a.startsWith("--"));
if (nomes.length === 0) {
  console.error(
    "Informe ao menos um componente. Ex.: node scripts/webcode-add.mjs button",
  );
  process.exit(1);
}

const fonte =
  process.env.WEBCODE_REGISTRY ?? "https://webcode-design.vercel.app/r";
const raiz = process.cwd();
const print = (texto) => process.stdout.write(`${texto}\n`);

const DESTINO = [
  [/^registry\/webcode\/ui\//, "src/components/ui/"],
  [/^registry\/webcode\/lib\//, "src/lib/"],
  [/^registry\/webcode\/hooks\//, "src/hooks/"],
  [/^lib\//, "src/lib/"],
];

const IMPORTS = [
  [/@\/registry\/webcode\/ui\//g, "@/components/ui/"],
  [/@\/registry\/webcode\/lib\//g, "@/lib/"],
  [/@\/registry\/webcode\/hooks\//g, "@/hooks/"],
];

async function ler(nome) {
  if (/^https?:/.test(fonte)) {
    const resp = await fetch(`${fonte}/${nome}.json`);
    if (!resp.ok) throw new Error(`${nome}: HTTP ${resp.status}`);
    return resp.json();
  }
  return JSON.parse(readFileSync(join(fonte, `${nome}.json`), "utf8"));
}

const vistos = new Set();
const npm = new Set();
const escritos = [];
const pulados = [];

async function instalar(nome) {
  if (vistos.has(nome)) return;
  vistos.add(nome);
  const item = await ler(nome);
  for (const dep of item.registryDependencies ?? []) {
    if (!dep.startsWith("@webcode/")) {
      console.warn(
        `! ${nome} depende de ${dep} (fora do @webcode): instale à parte.`,
      );
      continue;
    }
    await instalar(dep.replace("@webcode/", ""));
  }
  for (const pacote of item.dependencies ?? []) npm.add(pacote);
  if (item.type === "registry:theme") {
    pulados.push(
      `${nome} (tema: aplicar à mão no globals.css, ver plano passo 2)`,
    );
    return;
  }
  for (const arquivo of item.files ?? []) {
    const regra = DESTINO.find(([re]) => re.test(arquivo.path));
    if (!regra) {
      pulados.push(`${arquivo.path} (destino desconhecido)`);
      continue;
    }
    const alvo = join(raiz, arquivo.path.replace(regra[0], regra[1]));
    if (existsSync(alvo) && !overwrite) {
      pulados.push(
        `${alvo.replace(raiz + "/", "")} (já existe; use --overwrite)`,
      );
      continue;
    }
    let conteudo = arquivo.content;
    for (const [re, novo] of IMPORTS) conteudo = conteudo.replace(re, novo);
    mkdirSync(dirname(alvo), { recursive: true });
    writeFileSync(alvo, conteudo);
    escritos.push(alvo.replace(raiz + "/", ""));
  }
}

for (const nome of nomes) await instalar(nome);

const pkg = JSON.parse(readFileSync(join(raiz, "package.json"), "utf8"));
const temos = { ...pkg.dependencies, ...pkg.devDependencies };
const faltam = [...npm].filter((p) => !(p in temos));

print(`Escritos (${escritos.length}):\n  ${escritos.join("\n  ") || "-"}`);
if (pulados.length) print(`Pulados:\n  ${pulados.join("\n  ")}`);
print(
  faltam.length
    ? `Falta instalar: pnpm add ${faltam.join(" ")}`
    : "Pacotes npm: nada faltando.",
);
