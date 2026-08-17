# Boot Protocol — Status

Sessao de preparacao: **16/08/2026**. Nenhuma funcionalidade implementada, por
instrucao explicita.

## Pre-condicao verificada

A pagina do projeto no Notion diz "nao iniciar Boot Protocol antes do
Architecture Freeze" e mostra G3 como `PENDING`. **Esse cabecalho esta
desatualizado**: a subpagina _Architecture Freeze — ADRs e Technology Stack_
registra `ARCHITECTURE FREEZE CONCLUIDO — 13/08/2026` e encerra com "nenhuma
dessas questoes bloqueia o inicio da implementacao". O bloqueio esta liberado.

Pendente de correcao no Notion: G3 e o cabecalho da pagina principal.

## Feito

### Fundacao tecnica

- Repositorio git inicializado (`main`).
- Next.js 16.3.1 · React 19.2.8 · TypeScript strict · Tailwind v4 · pnpm 10.33.
- shadcn/ui inicializado (base radix, preset nova, CSS variables).
- Dependencias da stack congelada instaladas: Drizzle, Supabase (`ssr` +
  `supabase-js`), Inngest, TanStack Query/Table, React Hook Form + Zod, Dexie,
  Serwist, Recharts, signature_pad, zxing, uuidv7, Sentry, PostHog.
- Estrutura de diretorios conforme **ADR-001** — uma app, route groups
  `(ops)` `(web)` `(saas)` `(auth)`, camadas `domain` / `application` /
  `infrastructure` / `ports`.

### Configuracao e qualidade

- `src/lib/env.ts` — validacao de ambiente com `@t3-oss/env-nextjs` + Zod.
- `.env.example` — nomes e formato, sem valores.
- ESLint com regra que **bloqueia import de framework/SDK** em `src/domain` e
  `src/application` (a fronteira que o ADR-001 aponta como principal risco).
- Prettier + `prettier-plugin-tailwindcss`.
- Vitest com tres projetos: `unit`, `ui`, `rls` (Postgres real).
- Playwright com tres projetos: `web`, `ops` (viewport de celular), `a11y`.
- `drizzle.config.ts`; `src/db/schema/index.ts` vazio por decisao.
- commitlint com escopos = modulos do Module Map.
- Cabecalhos de seguranca em `next.config.ts`.

### Design System

- Tokens LOCKED materializados em `src/app/globals.css`: paleta de marca, light
  e dark mode, 9 estados operacionais, escala de elevacao de 3 niveis, raio
  fechado, espacamento base 4, alvos de toque, motion.
- Inter carregada via `next/font` em `layout.tsx`.
- `.design-system/` com 9 documentos (README, colors, typography, layouts,
  components, icons, animations, responsive, accessibility, examples).

### Camada de agentes

- `CLAUDE.md` enxuto, com apontadores — arquitetura nao duplicada.
- `AGENTS.md` — contrato unico para qualquer ferramenta.
- `.claude/memory.md` com bloco `## Summary`, `.claude/scope.md`,
  `.claude/gotchas.md`.
- `.claude/rules/` — 9 regras path-scoped (`security.md` sempre ativa).
- `.claude/skills/` — **18 skills de modulo**, materializadas do catalogo do
  Notion.
- `.claude/commands/` — `/verify`, `/security-review`, `/performance-review`,
  `/tela <ID>`.
- `.claude/agents/` — 5 agentes: `domain-backend`, `frontend-ui`, `ops-pwa`,
  `security-reviewer`, `test-engineer`.
- `.claude/hooks/` — 5 hooks: `boot-check`, `secret-guard`, `destructive-guard`,
  `lint`, `quality-check`.
- `.claude/settings.json` — deny/ask/allow + os 5 hooks.

### Paridade Cursor ↔ Claude Code

- `.cursor/rules/` — 10 arquivos `.mdc` com `globs` equivalentes, **referenciando
  os mesmos** `.claude/rules/*.md`. Sem duplicacao de conteudo, sem divergencia.
- `.cursor/commands/` — os 4 comandos espelhados.
- `.cursor/hooks.json` — reusa **os mesmos scripts** de `.claude/hooks/`.
- Mesma verificacao (`pnpm verify`), mesma memoria (`.claude/memory.md`), mesmo
  contrato (`AGENTS.md`).

## Falta nesta sessao de preparacao

- [ ] `docs/architecture/` — indice de ADRs e module map
- [ ] `docs/product/` — invariantes, screen map, fluxos, roadmaps backend/mobile
- [ ] `docs/workflow/` — quality gates, ciclo de tarefa, registro de skills/MCPs/plugins
- [ ] `docs/adr/` — processo de ADR
- [ ] CI (GitHub Actions) com os gates de merge
- [ ] git hooks (husky: pre-commit, commit-msg)
- [ ] `.gitignore` revisado
- [ ] indice Graphify
- [ ] `pnpm verify` verde
- [ ] commit inicial
- [ ] atualizacao das paginas do Notion

## Nao feito de proposito

Nenhuma pagina funcional, API real, regra de negocio, migration de dominio,
autenticacao, OCR ou integracao WhatsApp. A implementacao comeca na fase **I1**.
