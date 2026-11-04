# Custelo — visao geral

SaaS B2B multi-tenant de recebimento e **cadeia de custodia** para portarias e
operacoes prediais. Produto proprio da Webcodeff. Brasil, LGPD.

**Estado em 20/08/2026: I2 em andamento** (tenancy + auth). Contexto de agentes
em `.ai/`. Nao reabra RN/Expo.

## Arquitetura (LOCKED — Architecture Freeze 13/08/2026, 20 ADRs)

Uma aplicacao Next.js 16 (App Router), tres superficies por route group:
`(ops)` PWA operacional client-side · `(web)` gestao em Server Components ·
`(saas)` admin da plataforma. Um repo, um deploy, um pipeline.

Stack: TypeScript strict · Tailwind v4 + shadcn/ui · Drizzle + PostgreSQL
(Supabase) com RLS · Supabase Auth + Storage · Inngest · Serwist + Dexie ·
Vercel · Vitest + Playwright.

## Camadas

- `src/domain` e `src/application` sao **puros** — ESLint bloqueia import de
  Next, React, Drizzle, Supabase, Inngest, Dexie, Sentry e PostHog.
- `src/ports` — contratos: `LabelExtractor`, `MessagingProvider`,
  `EvidenceStorage`, `JobScheduler`, `Clock`.
- `src/infrastructure` — unico lugar onde SDK de fornecedor pode ser importado.
- `src/db` — schema Drizzle (vazio ate a fase I2) + migrations.

## Invariantes que nenhum codigo pode violar

1. Tenant vem do contexto autenticado, nunca do cliente. Toda tabela de dominio
   tem `org_id` e `empreendimento_id`.
2. Autorizacao server-side; a aplicacao decide, o banco recusa (RLS).
3. `custody_events` e append-only — UPDATE/DELETE revogados no Postgres.
4. Nao existe hard delete de evidencia operacional.
5. Recebimento nunca bloqueia por falha de OCR, rede ou WhatsApp.
6. IA sugere, humano confirma — nada e cadastrado automaticamente.
7. Matching: unidade/endereco e filtro primario, nome e o segundo sinal.
8. QR e locator opaco — nunca autoriza retirada.
9. Sync offline e append, nunca merge; sem last-write-wins.
10. Correcao pos-notificacao nunca revela o destinatario correto.
11. Falha de notificacao e estado visivel, nunca silencio.
12. Nunca logar dado pessoal, imagem de etiqueta ou segredo.

## Onde procurar

| Preciso de                       | Arquivo                                   |
| -------------------------------- | ----------------------------------------- |
| regras fixas e comandos          | `CLAUDE.md`                               |
| contrato de agentes              | `AGENTS.md`                               |
| ADRs resumidos                   | `docs/architecture/adr-index.md`          |
| modulos e camadas                | `docs/architecture/module-map.md`         |
| invariantes e maquinas de estado | `docs/product/invariantes.md`             |
| 83 telas (indice)                | `docs/product/screen-map.md`              |
| ordem de construcao              | `docs/product/implementation-roadmap.md`  |
| regras por stack                 | `.ai/rules/*.md`                          |
| regra de negocio por modulo      | `.ai/modules/<modulo>.md`                 |
| cache de UI                      | `DESIGN.md`                               |
| tracker de telas                 | `docs/product/screen-tracker.md`          |
| design system                    | `.design-system/` + `src/app/globals.css` |

## Verificacao

`pnpm verify` (typecheck + lint + format + test) · `pnpm test:rls`
(negativo cross-tenant, Postgres real — o gate mais importante) · `pnpm test:e2e`.

## Proxima fase

I2.3 / AUTH — depois I3. Nada de tabela de dominio extra antes da RLS (I2.1)
estar de pe.
