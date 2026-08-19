# Decisoes de tooling (preparacao)

Auditoria de Principal Engineer sobre o que **nao** entra agora. Cada item foi
pesado contra ADR-001 (uma app), um dev solo, e o custo de contexto dos agentes.

| Ferramenta                                     | Decisao                     | Motivo                                                                                 |
| ---------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------- |
| Apps separados / Turborepo                     | **nao**                     | ADR-001: uma Next.js. `pnpm-workspace.yaml` so ignora bins, nao e monorepo de packages |
| Changesets                                     | **nao**                     | um pacote, um deploy                                                                   |
| Storybook                                      | **nao no MVP**              | Penpot e a referencia visual; 53 mestres ja existem. Storybook vira custo de sync      |
| Design tokens automatizados (Style Dictionary) | **nao**                     | tokens cabem em `globals.css`; mais um pipeline nao paga                               |
| Figma MCP                                      | **nao**                     | AD-010: Penpot                                                                         |
| ui-ux-pro-max / Emotion / Impeccable           | **nao**                     | design LOCKED; direcao generica e ruido. Emotion CSS conflita com Tailwind             |
| Graphiti                                       | **nao**                     | Graphify ja e o grafo deste repo                                                       |
| GapSkill                                       | **nao encontrado**          | nada no catalogo com esse nome que agregue sem sobrepor quality-gates                  |
| Serena MCP                                     | **I1, sob demanda**         | `.serena/` ja existe; ligar MCP quando houver codigo real para navegar                 |
| GitHub / Vercel MCP                            | **nao**                     | `gh` CLI e CI cobrem; MCP de Vercel e risco de acao em producao                        |
| Playwright MCP / browser                       | **nao no loop de dev**      | Playwright e teste; browser e exploracao                                               |
| OpenTelemetry                                  | **nao no MVP**              | ADR-016: Sentry + logs + Inngest + Better Stack                                        |
| Feature flags                                  | **nao no MVP**              | um piloto, um codigo. Flags viram ramificacao de evidencia                             |
| MSW / contract testing                         | **nao no MVP**              | sem API publica. Zod no boundary interno chega                                         |
| Redis / cache dedicado                         | **proibido no MVP**         | ADR-011                                                                                |
| commitlint + Husky + lint-staged               | **sim** (ja ativo)          | Gate 6                                                                                 |
| Dependabot                                     | **sim** (esta sessao)       | PRs semanais; humano revisa. Nunca `audit fix --force`                                 |
| Sentry / PostHog / Inngest deps                | **instalados, nao ligados** | ligar contas e DSN e trabalho de **I1**, nao de preparacao                             |
| Env validation (`@t3-oss/env-nextjs`)          | **sim**                     | falha no build                                                                         |
| Bundle analyzer                                | **sim** (`pnpm analyze`)    | Gate 2 OPS                                                                             |
| axe-core Playwright                            | **sim**                     | Gate 5                                                                                 |
| vercel-labs/agent-skills (React)               | **avaliar em I5**           | util quando houver UI real; instalar cedo e contexto sem retorno                       |
| code-review-graph                              | **avaliar em I5**           | mesmo motivo                                                                           |

Husky/Lefthook: Husky ja esta. Lefthook nao substitui.

Renovate: Dependabot basta para um repo. Nao operar os dois.
