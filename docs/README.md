# Documentacao — Custelo

Leia o que a tarefa exige. Nao leia tudo.

## Por onde comecar

| Voce e / quer                | Comece por                             |
| ---------------------------- | -------------------------------------- |
| agente entrando no projeto   | `../CLAUDE.md` e depois `../AGENTS.md` |
| entender o produto           | `../.claude/scope.md`                  |
| saber o que nao pode mudar   | `product/invariantes.md`               |
| entender a arquitetura       | `architecture/adr-index.md`            |
| comecar uma tarefa           | `workflow/task-lifecycle.md`           |
| saber o estado da preparacao | `boot-protocol-status.md`              |

## Indice

### Arquitetura

- `architecture/adr-index.md` — 20 ADRs congelados, trade-offs aceitos, open questions
- `architecture/module-map.md` — 3 superficies, 12 bounded contexts, camadas no codigo

### Produto

- `product/invariantes.md` — invariantes, maquinas de estado, permissoes elevadas
- `product/screen-map.md` — indice das 83 telas, waves, status
- `product/pages-roadmap.md` — **roadmap operacional**: conteudo por pagina, status, regra de atualizacao
- `product/screen-tracker.md` — inventario detalhado por wave; CSV para Notion
- `product/user-flows.md` — 8 fluxos criticos e mapas de navegacao
- `product/implementation-roadmap.md` — I1 a I13, dependencias que nao se invertem
- `product/backend-roadmap.md` — modulos, comandos, queries, eventos, jobs, tabelas
- `product/mobile-roadmap.md` — OPS: o que e tela, sheet, dialog, estado e componente
- `product/risks.md` — open questions e riscos que nao bloqueiam I1

### Workflow

- `workflow/quality-gates.md` — 7 gates, incluindo o Gate 7 proprio deste dominio
- `workflow/task-lifecycle.md` — como comecar e como encerrar
- `workflow/agent-workflow.md` — agentes, skills, MCPs, plugins, always/on-demand
- `workflow/dev-environment.md` — como subir a maquina; o que e I1 vs preparacao
- `workflow/environments.md` — tres ambientes, contas e o que o codigo ja faz
- `workflow/tooling-decisions.md` — o que foi avaliado e recusado
- `workflow/notion-pages.md` — slugs canonicos e o que falta atualizar no Notion

### Decisoes

- `adr/README.md` — quando e como escrever um ADR novo

### Design System

Fica em `../.design-system/` (convencao do ambiente). Valores canonicos em
`../src/app/globals.css`.

## Fontes canonicas fora do repo

| O que               | Onde                                                             | Regra                                        |
| ------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| produto e dominio   | Notion — _Contexto Inicial Validado 13/08/2026_                  | precedencia maxima; `DEFINED` nao se reabre  |
| arquitetura         | Notion — _Architecture Freeze_                                   | LOCKED; mudanca exige ADR                    |
| marca e UI          | Notion — _Brand & UI Foundation_                                 | LOCKED                                       |
| spec das 83 telas   | Notion — 4 subpaginas de telas                                   | canonica; nao duplicada aqui                 |
| tracker de execucao | repo `docs/product/screen-tracker.csv` + Notion _Roadmap Mestre_ | CSV e a copia versionada; importar no Notion |
| referencia visual   | Penpot — arquivo "Custelo"                                       | referencia; o repo e a fonte de **valor**    |

Divergiu entre repo e Notion? Decida e registre. Nunca resolva em silencio no
codigo.
