# AGENTS.md — Custelo

Contrato unico para **qualquer** agente que trabalhe neste repositorio: Claude
Code, Codex, Cursor (Grok/Composer), Gemini CLI ou humano.

Todos leem a **mesma** fonte. Nao existe memoria paralela por ferramenta.

## Ecossistema de memoria (unico)

| Camada                     | Arquivo              | Quando ler                                         |
| -------------------------- | -------------------- | -------------------------------------------------- |
| Regras fixas + comandos    | `CLAUDE.md`          | sempre, no inicio                                  |
| Contexto de negocio        | `.claude/scope.md`   | sob demanda                                        |
| Decisoes que evoluem       | `.claude/memory.md`  | inicio (bloco `## Summary`) + ao registrar decisao |
| Erros recorrentes          | `.claude/gotchas.md` | quando um erro se repete                           |
| Arquitetura, design, telas | `docs/**`            | conforme a tarefa                                  |
| Regras por stack           | `.claude/rules/*.md` | ao tocar arquivos do tipo                          |

Ferramentas que nao suportam carregamento path-scoped (`.claude/rules/`) devem
ler manualmente o arquivo de regra correspondente antes de editar aquele tipo de
arquivo. A tabela de mapeamento esta em `.claude/rules/README.md`.

**Regra de escrita:** decisao que evolui com o projeto vai para
`.claude/memory.md`. Regra fixa vai para `CLAUDE.md`. Nunca duplicar as duas.

## Precedencia

1. Instrucao atual do humano
2. `AGENTS.md` / `CLAUDE.md` deste repositorio
3. `docs/` do projeto
4. `C:\Users\ferna\.ai-context\` (contexto global compartilhado)
5. Instrucoes globais da ferramenta

## O que este projeto e

SaaS B2B multi-tenant de recebimento e cadeia de custodia para portarias.
O diferencial defensavel do produto e a **evidencia**: se um evento pode ser
apagado ou reescrito, o produto perde a razao de existir.

Leia `CLAUDE.md` antes de escrever qualquer linha. As 12 invariantes listadas la
nao sao negociaveis por preferencia, elegancia ou pressa.

## Stack (LOCKED)

TypeScript strict · Next.js App Router (app unico, route groups `(ops)` `(web)`
`(saas)`) · Tailwind v4 + shadcn/ui · Drizzle + Postgres/Supabase com RLS ·
Supabase Auth + Storage · Inngest · Vercel · Vitest + Playwright.

Decisao congelada no Architecture Freeze (13/08/2026). Nao proponha stack
alternativa; se houver motivo real, escreva um ADR novo em `docs/adr/`.

## Comandos

```bash
pnpm dev
pnpm verify        # typecheck + lint + format + test — obrigatorio antes de "pronto"
pnpm test:rls      # cross-tenant negativo
pnpm test:e2e
```

## Regras de trabalho

- Portugues do Brasil. Direto. Somente o escopo pedido.
- Nao ampliar escopo sem autorizacao. Perguntar antes de: dependencia nova,
  mudanca de assinatura publica, renomeio, exclusao, migration.
- `src/domain` e `src/application` nao importam framework nem SDK. Use as portas
  de `src/ports`.
- Nao declarar entrega pronta sem evidencia observavel (saida de teste, lint,
  build, log, fluxo reproduzido).
- Nunca commitar `.env`. Nunca imprimir segredo. Nunca usar a service_role key
  em codigo de request.
- Commits: Conventional Commits, escopo da lista em `commitlint.config.mjs`.

## Fase atual

Preparacao concluida; implementacao nao comecou. Proxima fase: **I1 — Fundacao
tecnica** (`docs/product/implementation-roadmap.md`).

Nao criar tabela de dominio, migration de dominio, pagina funcional ou API real
antes de **I2 (tenancy + RLS)** estar de pe e com teste negativo cross-tenant
passando.
