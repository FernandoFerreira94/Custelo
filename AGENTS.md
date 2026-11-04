# AGENTS.md — Custelo

Contrato unico para qualquer agente (Claude Code, Cursor/Grok, Codex, humano).
Este arquivo e um **roteador**. Detalhe vive em `.ai/` e `docs/`.

## Identity

- **Produto:** Custelo — SaaS B2B de recebimento e cadeia de custodia para portarias.
- **Dono:** Webcodeff. Brasil, LGPD.
- **Status:** I2 entregue (tenancy, auth, RLS, contexto, guard). Em andamento:
  migracao das telas para a WebCode UI
  (`docs/superpowers/plans/2026-11-04-webcode-ui-migracao.md`).
- **Fonte canonica de produto:** este repo (`.ai/` + `docs/` + codigo). A pagina
  Notion do projeto pode estar atras do Architecture Freeze — nao reabrir
  React Native/Expo nem monorepo multi-app.

## Locked stack

Uma app Next.js (App Router) com route groups `(ops)` `(web)` `(saas)` `(auth)`.
Postgres/Supabase + Drizzle + RLS · Supabase Auth (claims) · Storage privado ·
Inngest · PWA (Serwist + Dexie) · Tailwind v4 + shadcn/ui · TanStack Query ·
Vercel. Detalhe e ADR: `.ai/architecture.md`.

## Commands

```bash
pnpm dev            # desenvolvimento
pnpm verify         # typecheck + lint + format:check + test — antes de "pronto"
pnpm test:rls       # negativo cross-tenant (banco/tenancy/auth)
pnpm test:e2e       # Playwright (web + ops + a11y)
pnpm db:generate    # migration a partir do schema Drizzle
```

## Context router

| Preciso de                       | Leia                                        |
| -------------------------------- | ------------------------------------------- |
| Produto, atores, nao-objetivos   | `.ai/scope.md` e `.ai/modules/<modulo>.md`  |
| ADR / Freeze                     | `.ai/architecture.md`                       |
| Done / now / next / blocked      | `.ai/roadmap.md`                            |
| Telas, rotas, estados            | `.ai/page-map.md`                           |
| Linguagem visual aprovada        | `DESIGN.md` (so tarefa de UI)               |
| Biblioteca de UI (@webcode)      | `WEBCODE-DS.md` (antes de criar componente) |
| Pranchas aprovadas (visual)      | `docs/pranchas/README.md` (fonte + fotos)   |
| Plano de execucao (superpowers)  | `docs/superpowers/plans/`                   |
| Regra de stack                   | `.ai/rules/`                                |
| Feature complexa                 | `.ai/specs/<feature>.md`                    |
| Decisao que evolui               | `.ai/memory.md` (Summary no boot)           |
| Erro ja diagnosticado 2x         | `.ai/gotchas.md`                            |
| Spec tela a tela / ADR estendido | `docs/` — nunca a pagina Notion inteira     |

## Invariantes (stop-ship)

Lista completa: `docs/product/invariantes.md`. Violar qualquer uma e bug.

1. Tenant vem do contexto autenticado — nunca de id do cliente.
2. Autorizacao e server-side; o banco recusa (RLS).
3. `custody_events` e append-only. Correcao gera evento novo.
4. Nao existe hard delete de evidencia operacional.
5. Sem internet, OCR ou WhatsApp **nunca** bloqueiam o recebimento fisico.
6. IA sugere; humano confirma. Ninguem e cadastrado automaticamente.
7. Matching: unidade/endereco primeiro; nome e segundo sinal.
8. QR e locator opaco: nao autoriza retirada nem reativa encomenda.
9. Sync offline e append, nunca merge. Sem last-write-wins.
10. Correcao pos-notificacao nao revela o destinatario certo ao contato errado.
11. Falha de notificacao e estado visivel, nunca silencio.
12. Nunca logar dado pessoal, imagem de etiqueta ou segredo.

## Operating rules

- Portugues do Brasil. So o escopo pedido.
- Carregue **somente** o contexto da tarefa. Graphify para estrutura/blast
  radius; Serena (se ativo) para simbolo/referencia; fonte bruta por ultimo.
- Nao pare para confirmar tarefa ja escopada e nao destrutiva.
- Pergunte antes de: dependencia nova, schema/migration, auth/segredo, decisao
  LOCKED, comando destrutivo, refactor amplo.
- Escolha tecnica em aberto: 1 recomendacao + 1 alternativa real + trade-off.
- Nativo do framework antes de dependencia. shadcn antes de primitivo novo.
- `src/domain` e `src/application` nao importam Next, React nem SDK.
- Nao declare pronto sem evidencia (`pnpm verify` + gates aplicaveis).
- Commits: Conventional Commits, escopos em `commitlint.config.mjs`.
- Nunca commitar `.env`. Nunca imprimir segredo. Nunca service_role em request.

## Precedence

1. Pedido explicito e aprovado do Fernando
2. Architecture Freeze / ADR aceito + este `AGENTS.md`
3. `.ai/architecture.md`, modulo, spec ou regra da tarefa
4. Dev Hub (Quality Gates, Padroes de Codigo)
5. Exemplos de skill/plugin
6. Default de framework

Adaptadores (CLAUDE.md, `.cursor/`, hooks) **exigem** regras; nao as redefinem.

## Chat triggers

`boot` diagnostico · `scope` · `roadmap` · `page map` · `graph refresh` ·
`graph deps <alvo>` · `mem add:` / `mem read` · `gotchas` · `/security-review` ·
`/performance-review` · `/tela <ID>` · `skill audit` (nunca a cada boot)

## End of task

Atualize so o que mudou: `.ai/roadmap.md` · `.ai/page-map.md` · `.ai/memory.md`
· Graphify (`graphify update .`) · CSV/pages-roadmap se for tela.
Relatorio: `Done — … / Validation: … / Context updated: … / Blocked: …`
