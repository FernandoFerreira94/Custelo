# Roadmap

Ordem **por dependencia**, nao por tela. Fases I1–I13:
`docs/product/implementation-roadmap.md`. Telas: `.ai/page-map.md`.

Atualizado: **27/08/2026**. Fonte de progresso = repo, nao o cabecalho Notion.

## IN PROGRESS

- **I3 estrutura fisica + pessoas** — migration `0007` com `areas`, `unidades`,
  `pontos_recebimento`, `pessoas`, `vinculos` + RLS. Schema Drizzle no repo.
  Proximo: application commands/queries + telas UNI/PES.
- **I1 nuvem** — contas humanas: Supabase x3, GitHub remote, DSN Sentry,
  chaves Inngest. Codigo da fundacao ja esta no repo.

## NEXT

- Aplicar migrations `0006` e `0007` no Supabase remoto; rodar `pnpm test:rls`.
- Configurar redirect URLs + e-mail Supabase Auth (convite/recuperacao).
- I3 application layer: CRUD unidades/pessoas/vinculos.

## BLOCKED

- Logo SVG + licenca da didone do wordmark — bloqueia PWA install/favicon,
  nao bloqueia I2.
- HEX final dos estados vs board Penpot "00 — Foundations" — validar antes
  da wave visual pesada.
- Homologacao Meta/WABA — I7.
- Prazos de retencao — I12 (motor parametrizavel ja e a regra).

## DONE

- Architecture Freeze (20 ADRs, 13/08/2026).
- Boot Protocol no repo (16–18/08) e **reaplicacao universal `.ai/`** (20/08).
- Design MVP: 77/83 telas APPROVED no Penpot; 53 componentes-mestre.
- **I1 codigo:** Clock, JobScheduler, health, Inngest serve, Sentry com DSN,
  camadas, quality gates, CI.
- **I2.1:** 5 tabelas de tenancy, RLS + GUC `app.current_*`, migration
  `0000_tenancy_i2.sql`, `pnpm test:rls` verde.
- **I2.2:** Supabase SSR, middleware refresh, `app.resolve_auth_claims()`,
  hook Postgres `custom_access_token_hook`, `requestSession()` real.
- **I2.3:** adaptadores auth-rbac reais (migration `0006`, convite, escopo,
  desativacao, recovery/senha, 109 testes). Commit `30b5379`.

## LATER / PHASE 2

- I4 cadeia de custodia → I5 recebimento/OCR → I6 offline → I7 WhatsApp →
  I8 saida → I9 correcoes → I10 importacao/relatorios → I11 billing/SaaS →
  I12 retencao/DR → I13 piloto.
- Pos-MVP (6 telas): AUTH-007 MFA · CUS-006 · DASH-002 · SAAS-007 · BIL-001/002.
- iOS nativo so se o gatilho do ADR-012 disparar (PWA insuficiente).

## Dependencias que nao invertem

I2 antes de qualquer tabela de dominio extra. I4 antes de I5. I6 logo apos I5.
I7 depois de I4. I8 depois de I6. I12 antes do piloto.
