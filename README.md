# Custelo

SaaS B2B multi-tenant de **recebimento e cadeia de custodia** para portarias e
operacoes prediais. Produto proprio da Webcodeff. Brasil, LGPD.

Portarias operam encomendas em caderno, planilha ou modulo secundario de ERP.
O resultado e atraso de aviso, extravio, associacao errada, cadastro
desatualizado, ausencia de prova de retirada e baixa rastreabilidade quando
alguem erra. O Custelo troca isso por registro em segundos e um historico que
nao pode ser reescrito.

> **Estado: preparacao concluida. Implementacao nao comecou.**
> Ver `docs/boot-protocol-status.md`.

## Stack

TypeScript strict · Next.js 16 App Router · Tailwind v4 + shadcn/ui ·
Drizzle + PostgreSQL (Supabase) com RLS · Supabase Auth + Storage · Inngest ·
PWA (Serwist + Dexie) · Vercel · Vitest + Playwright.

Congelada no Architecture Freeze de 13/08/2026 — 20 ADRs.
Ver `docs/architecture/adr-index.md`.

## Superficies

Uma aplicacao, tres route groups:

| Route group | Superficie          | Usuario                          | Rendering                     |
| ----------- | ------------------- | -------------------------------- | ----------------------------- |
| `(ops)`     | PWA operacional     | Recepcionista/Porteiro           | client-side, offline limitado |
| `(web)`     | Gestao              | Gestor · Administrador · Auditor | Server Components             |
| `(saas)`    | Admin da plataforma | Super Admin                      | Server Components             |

## Comecar

```bash
pnpm install
cp .env.example .env.local   # preencha os valores; nunca commite
pnpm dev
```

Node >= 22.16 · pnpm 10.33.

## Comandos

```bash
pnpm dev            # desenvolvimento
pnpm build          # build de producao
pnpm verify         # typecheck + lint + format + test  ← antes de dizer "pronto"
pnpm test           # unit + ui
pnpm test:rls       # negativo cross-tenant (Postgres real)
pnpm test:e2e       # Playwright: web + ops + a11y
pnpm a11y           # acessibilidade
pnpm db:generate    # gerar migration Drizzle
pnpm analyze        # bundle analyzer
```

## Estrutura

```
src/
  app/          (ops) (web) (saas) (auth) api/   adaptadores de entrega
  application/  casos de uso                      ← puro
  domain/       regras e invariantes              ← puro
  ports/        contratos de fornecedor
  infrastructure/ implementacoes das portas       ← unico lugar com SDK
  db/           schema Drizzle + migrations
  components/   ui · shell · ops · web
  lib/          utilitarios, validacao de env
docs/           arquitetura, produto, workflow, ADRs
.design-system/ fundacao visual
.claude/        rules · skills · commands · agents · hooks
.cursor/        mesmas rules, commands e hooks — paridade total
specs/          specs de feature complexa
```

## Para agentes

Leia `CLAUDE.md` (Claude Code) ou `AGENTS.md` (Cursor, Codex, outros). Os dois
apontam para a mesma memoria e as mesmas regras — nao existe versao por
ferramenta.

## Documentacao

`docs/README.md` e o indice. Comece por `docs/product/invariantes.md` se quiser
entender o que este produto nao pode fazer errado.
