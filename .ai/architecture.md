# Architecture

**Architecture Freeze — 13/08/2026.** LOCKED. Alteracao exige ADR novo em
`docs/adr/` e atualizacao de `docs/architecture/adr-index.md`.

> A pagina Notion do projeto ainda descreve **React Native/Expo** e **monorepo
> web+mobile**. Isso **nao vale**. Canonico: ADR-001 (uma app Next) e ADR-012
> (PWA). Racional estendido: `docs/architecture/`.

## Locked decisions

| ADR | Decisao                                                   | Alternativa considerada            | Por que                               | Status |
| --- | --------------------------------------------------------- | ---------------------------------- | ------------------------------------- | ------ |
| 001 | Uma app Next.js, route groups `(ops)` `(web)` `(saas)`    | apps separados / Turborepo de apps | dominio e custodia nao podem divergir | LOCKED |
| 002 | Route Handlers + Server Actions (adaptadores)             | Nest separado                      | um deploy, regra numa camada          | LOCKED |
| 003 | PostgreSQL no Supabase                                    | MySQL / SQLite                     | relacional, transacao evento+estado   | LOCKED |
| 004 | Schema compartilhado + `org_id`/`empreendimento_id` + RLS | schema-por-tenant                  | milhares de sites pequenos            | LOCKED |
| 005 | Supabase Auth + claims + checagem server-side             | so JWT                             | revogacao imediata                    | LOCKED |
| 006 | Drizzle + `SET LOCAL`; supabase-js so Auth/Storage        | Prisma / supabase-js em tudo       | SQL e RLS no controle                 | LOCKED |
| 007 | `custody_events` append-only + estado materializado       | event sourcing puro                | imutabilidade no banco                | LOCKED |
| 008 | Storage privado, URL assinada                             | bucket publico                     | evidencia                             | LOCKED |
| 009 | Inngest                                                   | cron na serverless de request      | espera de horas                       | LOCKED |
| 010 | Sem realtime no MVP                                       | Supabase Realtime                  | risco/custo                           | LOCKED |
| 011 | Sem Redis/cache dedicado                                  | cache distribuido                  | vazamento cross-tenant                | LOCKED |
| 012 | PWA (Serwist + Dexie)                                     | React Native/Expo / Capacitor ja   | um codebase; iOS e o ponto fraco      | LOCKED |
| 013 | UUIDv7, dois timestamps, append, sem LWW                  | last-write-wins                    | evidencia                             | LOCKED |
| 014 | OCR texto + matching local                                | multimodal                         | custo, latencia, auditabilidade       | LOCKED |
| 015 | WhatsApp Cloud API + Embedded Signup                      | BSP so como fuga                   | metering no dia 1                     | LOCKED |
| 016 | Sentry + logs + Inngest + Better Stack                    | OTel cedo                          | superficie menor                      | LOCKED |
| 017 | PostHog sem PII; audit no Postgres                        | misturar analytics e audit         | LGPD                                  | LOCKED |
| 018 | Tailwind + shadcn; TanStack Query; RHF+Zod                | CSS-in-JS / outro kit              | Freeze + design system                | LOCKED |
| 019 | Vercel; Supabase por ambiente; migrations no pipeline     | outro host                         | um pipeline                           | LOCKED |
| 020 | PITR; RPO 5 min; RTO 4h                                   | backup so de volume                | stop-ship de piloto                   | LOCKED |

## Runtime topology

Um deploy Next.js. `(ops)` e PWA client-side. `(web)` e `(saas)` em Server
Components. Backend no mesmo app. Jobs fora do request (Inngest). Offline so
no recebimento, append na sync.

Portas: `LabelExtractor` · `MessagingProvider` · `EvidenceStorage` ·
`JobScheduler` · `Clock`. Dominio nao importa SDK.

## Security boundaries

- Tenant **nunca** do cliente. Aplicacao decide; RLS recusa.
- Token ~15 min; hook Postgres `public.custom_access_token_hook` (nao HTTP).
- Multi-empreendimento: `empreendimento_id` / `papel_codigo` nulos no JWT ate
  o usuario escolher contexto (AUTH-005).
- `service_role` fora de request e do cliente.
- UPDATE/DELETE em `custody_events` revogados para o role da app.

## Data / infra

Indice de dominio lidera por `empreendimento_id`. Evento e estado na mesma
transacao. Staging nao aponta WhatsApp real de cliente.

## Open architecture questions

Nenhuma bloqueia implementar. OCR vendor, regiao dos dados, prazos de retencao,
Tech Provider Meta e volume/hora dependem de juridico, Meta ou piloto.
