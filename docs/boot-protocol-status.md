# Boot Protocol — Status

Sessao original: **16/08/2026**. Revisao de fechamento: **18/08/2026**.
Nenhuma funcionalidade de produto implementada — por instrucao explicita.

## Pre-condicao

Architecture Freeze **CONCLUIDO em 13/08/2026** (20 ADRs). O cabecalho da pagina
principal no Notion ainda diz "AGUARDANDO ARCHITECTURE FREEZE" / G3 `PENDING` —
esta desatualizado. Nao tratar como bloqueio. Correcao: `docs/workflow/notion-pages.md`.

## Aplicado

### Fundacao tecnica

- Git em `main`; Next.js 16.3.1 · React 19.2.8 · TypeScript strict · Tailwind v4 ·
  pnpm 10.33 · shadcn/ui (radix, preset nova).
- Stack congelada instalada: Drizzle, Supabase ssr+js, Inngest, TanStack Query/Table,
  RHF + Zod, Dexie, Serwist, Recharts, signature_pad, zxing, uuidv7, Sentry, PostHog.
- Estrutura **ADR-001**: uma app, route groups `(ops)` `(web)` `(saas)` `(auth)`,
  camadas `domain` / `application` / `infrastructure` / `ports` / `components`
  (READMEs de fronteira; sem codigo de produto).
- **Nao** ha `apps/web|api|mobile`. Isso violaria o freeze.

### Qualidade

- `src/lib/env.ts` + `.env.example`
- ESLint bloqueando framework/SDK em `domain` e `application`
- Prettier + plugin Tailwind · Vitest (`unit` `ui` `rls`) · Playwright (`web` `ops` `a11y`)
- commitlint (escopos = modulos) · Husky pre-commit + commit-msg · lint-staged
- CI: verify, build, tenant-isolation (Postgres 16), security (audit + segredo)
- Dependabot semanal (npm + actions)
- Cabecalhos de seguranca em `next.config.ts`
- Placeholder RLS + fumaca e2e/a11y do scaffold (nao sao telas de produto)

### Design System

Tokens LOCKED em `src/app/globals.css`. `.design-system/` com 9 docs.
Glass effect revogado. Inter via `next/font`. 53 componentes-mestre no Penpot,
zero em codigo.

### Agentes

- `CLAUDE.md` enxuto · `AGENTS.md` contrato unico
- `.claude/memory.md` `scope.md` `gotchas.md`
- 9 rules path-scoped (`security.md` sempre ativa)
- **19 skills de modulo** (18 originais + `relatorios`)
- commands `/verify` `/security-review` `/performance-review` `/tela`
- 5 agentes: `domain-backend` `frontend-ui` `ops-pwa` `security-reviewer`
  `test-engineer` (+ Reality Checker global)
- 5 hooks: boot-check, secret-guard, destructive-guard, lint, quality-check
- Paridade Cursor: `.cursor/rules` `.cursor/commands` `.cursor/hooks.json`

### Documentacao de produto e workflow

- `docs/architecture/` ADR index + module map
- `docs/product/` invariantes, screen-map, tracker+CSV, fluxos, roadmaps
  I1–I13, backend, mobile, riscos
- `docs/workflow/` quality gates, task lifecycle, agent workflow, tooling,
  dev environment, paginas Notion
- `docs/adr/` processo para ADR-021+
- Graphify indexado localmente (`graphify-out/` gitignored)

## Skills / MCP / plugins — resumo

Ver tabelas canônicas em `docs/workflow/agent-workflow.md`.
Avaliadas nesta revisao e **nao adotadas**: Graphiti (Graphify cobre),
ui-ux-pro-max, Emotion, GapSkill (nao encontrado), Figma MCP, Turborepo,
Storybook, OTel, feature flags, MSW. Serena fica para I1.

## Falta (nao bloqueia comecar I1 no codigo)

- [ ] Autenticar MCP Notion no Cursor e corrigir o cabecalho G3
- [ ] Importar `docs/product/screen-tracker.csv` na database do Roadmap Mestre
- [ ] Logo SVG + favicon/app icon (cliente) — bloqueia PWA install, nao I1
- [ ] Validar HEX dos estados contra o board Penpot "00 — Foundations"
- [ ] Contas Vercel / Supabase / Inngest / Sentry — trabalho de **I1**

## Nao feito de proposito

Nenhuma pagina funcional, API real, regra de negocio, migration de dominio,
autenticacao, OCR ou WhatsApp. Proxima sessao: **I1 — Fundacao tecnica**.
