# Roadmap

Ordem **por dependencia**, nao por tela. Fases I1–I13:
`docs/product/implementation-roadmap.md`. Telas: `.ai/page-map.md`.

Atualizado: **18/11/2026**. Fonte de progresso = repo, nao o cabecalho Notion.

## IN PROGRESS

- **I4 cadeia de custodia** — PR #36 (rascunho). Base (0015, dominio) no #35;
  `registrarEvento`, repo, consultas, prateleiras do ponto, CUS-001 fila (ops e
  web), CUS-002/003 detalhe + linha do tempo e CUS-005 mover. Unidade + RLS
  verdes no banco local. Pendente: 0015 no remoto (OK do Fernando) para rodar os
  e2e `custodia.spec.ts` e `prateleiras.spec.ts` e a revisao visual. Lista unica
  do que so o Fernando resolve: `docs/PENDENCIAS-FERNANDO.md`.
- **Lote UX do relatorio de 12/11** (P0 shell mobile da gestao, P1 rotulos,
  alvos, TabBar, placeholder) — proximo, em PR proprio, antes da I5.

- **Plano mestre (04/11/2026)** — `docs/superpowers/plans/2026-11-04-plano-mestre-pacotezap.md`
  e o plano de execucao do resto do sistema: Parte 1 (migracao de UI, abaixo) →
  Fase 0 → I3 … I13 (piloto). Decisoes D1–D19 na secao 1 aguardam o Fernando;
  o plano segue a recomendacao ate a resposta. Telas sem prancha: secao 6.3.

- **Migracao das telas para a WebCode UI** — DONE (PRs #22 e #23: tema Nevoa +
  Brasa, AUTH-001..006, cascas e paginas iniciais). Pendencias em `DESIGN-NOTAS.md`.
  Falta so a limpeza de codigo morto (Tarefa 16). Plano
  passo a passo em `docs/superpowers/plans/2026-11-04-webcode-ui-migracao.md`
  (spec: `docs/plano/PLANO-EXECUCAO-WEBCODE-UI.md`) (base `@webcode`,
  tema Nevoa + Brasa, marca final, estados, AUTH-001..006 nas pranchas, cascas
  das superficies, limpeza). Pranchas versionadas em `docs/pranchas/`.

- **AUTH-001..004 fechamento formal** — RLS (20) e E2E Auth desktop/OPS (14)
  revalidados; status REVIEW ate `pnpm verify` e o a11y global voltarem a passar
  no worktree compartilhado e a configuracao humana do Supabase Auth ser concluida.
- **I3 estrutura fisica + pessoas** — migration `0007` com `areas`, `unidades`,
  `pontos_recebimento`, `pessoas`, `vinculos` + RLS. Schema Drizzle no repo.
  Migrations `0011` (modelo) e `0012` (importacao) aplicadas; telas de
  importacao IMP-010..015 (enviar, conferir, confirmar, concluir/desfazer) na
  PR #31. Gate local em 06/11: `test:rls` 65/65 em Postgres 16 e e2e "importar
  3 unidades e 2 moradores" verde no Supabase local (`supabase start`, sem tocar
  no PacoteZap-SP). O CI cria os papeis do Supabase antes das migrations.
  Pendente: revisao humana da PR #31 e do visual da `(web)` em 390px (o rail
  lateral do shell ocupa ~100px; a tabela de conferencia rola na horizontal).
- **I1 nuvem** — contas humanas: Supabase x3, GitHub remote, DSN Sentry,
  chaves Inngest. Codigo da fundacao ja esta no repo.

## NEXT

- I3: importacao Excel/CSV de cadastros (IMP-010..015) junto de UNI/PES —
  recomendado em 04/11 (D1), aguarda ok. PDF assistido fica na I10.

- Configurar no dashboard de staging/producao as redirect URLs, templates de
  convite/recuperacao e SMTP do Supabase Auth.
- Habilitar leaked-password protection e tratar os warnings de seguranca do
  advisor antes do piloto.
- I3 application layer: CRUD unidades/pessoas/vinculos.

## BLOCKED

- Logo SVG + licenca da didone do wordmark — bloqueia PWA install/favicon,
  nao bloqueia I2.
- HEX final dos estados vs board Penpot "00 — Foundations" — validar antes
  da wave visual pesada.
- Configuracao humana do Supabase Auth em staging/producao (redirect allowlist,
  templates/SMTP e leaked-password protection). Sem CLI/token de Management API
  neste ambiente para auditar ou aplicar essa configuracao.
- Gate global de qualidade: `pnpm verify` falha so no `format:check` de
  `brand-kit/GUIA.md` e do plano mestre; testes e build passam. A11y da raiz
  falha por contraste do texto "Zap".
- Homologacao Meta/WABA — I7.
- Prazos de retencao — I12 (motor parametrizavel ja e a regra).

## DONE

- **Fase 0 do plano mestre (05/11/2026)** — PRs #27 (resultado padrao, contexto
  validado, `0010` com `audit_log`, trilha, middleware), #28 (paginas de sistema,
  mensagens) e #29 (telas de equipe USR-001..003). `0010` aplicada so no projeto
  de teste PacoteZap-SP; falta o ok do Fernando para os demais ambientes.
  Pendente: detalhe do membro e item Equipe no menu do perfil.

- **04/11/2026 (PRs #12–#14):** journal Drizzle 0003–0008 + `0009` revoga
  seeds; typecheck/Prettier verdes; catalogo de mensagens `src/lib/mensagens.ts`
  - `error/global-error/not-found/loading`; guard de rota por papel
    (`acesso-superficie.ts`, mapeamento aguarda confirmacao do Fernando);
    contexto unico via Route Handler `/contexto/auto` (fim do loop).

- Architecture Freeze (20 ADRs, 13/08/2026).
- Boot Protocol no repo (16–18/08) e **reaplicacao universal `.ai/`** (20/08).
- Design MVP: 77/83 telas APPROVED no Penpot; 53 componentes-mestre.
- **I1 codigo:** Clock, JobScheduler, health, Inngest serve, Sentry com DSN,
  camadas, quality gates, CI.
- **I2.1:** 5 tabelas de tenancy, RLS + GUC `app.current_*`, migration
  `0000_tenancy_i2.sql`, `pnpm test:rls` verde.
- **I2.2:** Supabase SSR, middleware refresh, `app.resolve_auth_claims()`,
  hook Postgres `custom_access_token_hook`, `requestSession()` real.
- **I2.3:** adaptadores auth-rbac reais (migrations `0006`–`0008` aplicadas no
  Supabase remoto; convite, escopo, desativacao, recovery/senha).
- **AUTH-005/006:** frontend + backend + testes DONE. Login, recovery e convite
  ja foram validados no Supabase real em desktop e OPS; 120 unit/UI + 20 RLS +
  14 E2E funcionais + 1 gate a11y sustentam o REVIEW de AUTH-001..004.

## LATER / PHASE 2

- Detalhe de cada fase: plano mestre, secoes 9 a 18.
- I4 cadeia de custodia → I5 recebimento/OCR → I6 offline → I7 WhatsApp →
  I8 saida → I9 correcoes → I10 importacao/relatorios → I11 billing/SaaS →
  I12 retencao/DR → I13 piloto.
- Pos-MVP (6 telas): AUTH-007 MFA · CUS-006 · DASH-002 · SAAS-007 · BIL-001/002.
- iOS nativo so se o gatilho do ADR-012 disparar (PWA insuficiente).

## Dependencias que nao invertem

I2 antes de qualquer tabela de dominio extra. I4 antes de I5. I6 logo apos I5.
I7 depois de I4. I8 depois de I6. I12 antes do piloto.
