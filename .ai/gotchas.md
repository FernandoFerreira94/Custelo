# Gotchas — Custelo

Erros recorrentes ja diagnosticados. Carregado sob demanda (`gotchas`).
Formato: `[GOTCHA] contexto — erro — correcao`

Registre aqui quando o mesmo erro aparecer pela segunda vez. Erro unico vai no
commit, nao aqui.

---

[GOTCHA] pnpm no Windows — `create-next-app` recusa diretorio com maiuscula no
nome ("name can no longer contain capital letters") — scaffoldar em subpasta
minuscula e mover o conteudo, ou definir `name` no package.json antes.

[GOTCHA] shadcn CLI v4 — `init` exige `--preset <nome>` (nova, vega, maia, lyra,
mira, luma, sera, rhea); `--base-color` nao existe mais e `base-nova` nao e um
preset valido — usar `--base radix --preset nova`.

[GOTCHA] Penpot — `export_shape` fica instavel com o arquivo Custelo neste
tamanho: falha por timeout e costuma passar na segunda ou terceira tentativa.

[GOTCHA] Penpot — o plugin so escreve na pagina aberta na tela do usuario. Por
isso os componentes-mestre acabaram na pagina "02 — OPS" em vez de
"01 — Components". Abrir a pagina de destino antes de criar componente.

[GOTCHA] Penpot — instancia de `Status/StatusBadge` com override perde o icone,
o que quebra a regra "cor + label + icone" da fundacao de marca (visivel em
CUS-002). Conferir icone apos qualquer override.

[GOTCHA] Cursor — MCP Notion (`https://mcp.notion.com/mcp`) esta no
`.cursor/mcp.json` mas so aparece depois do OAuth em Settings → MCP → Connect.
Sem isso o agente nao atualiza o tracker; use `docs/product/screen-tracker.csv`.

[GOTCHA] Next 16 — `next dev` anexa um bloco `nextjs-agent-rules` em
`AGENTS.md`. Desligar com `agentRules: false` no `next.config.ts`; o contrato
do Custelo vive neste arquivo e nao pode ser reescrito pelo framework.

[GOTCHA] Notion do projeto vs repo — a pagina-mae ainda pode citar React
Native/Expo e apps `web`+`mobile`. Canonico: ADR-001 (uma Next) e ADR-012
(PWA). Em conflito, o repo ganha; nao "corrigir" o codigo para caber no Notion.
