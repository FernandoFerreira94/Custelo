# Boot Protocol — Status

Reaplicacao: **20/08/2026**, a partir do Boot Protocol universal (Notion, ago/2026)
e dos Boot Assets. Sessao original de preparacao: 16–18/08/2026.

Nenhuma stack LOCKED foi reaberta. A pagina-mae do Custelo no Notion (19/08)
ainda cita React Native/Expo e monorepo `web`+`mobile` — **ignorada** em favor
de ADR-001 e ADR-012 no repo.

## O que mudou nesta reaplicacao

O protocolo deixou de tratar `.claude/` como fonte de produto. Canonico agora:

```
AGENTS.md          # roteador universal, curto
CLAUDE.md          # adapter Claude (`@AGENTS.md`)
DESIGN.md          # cache de UI (projeto UI-heavy)
.ai/scope.md
.ai/architecture.md
.ai/roadmap.md
.ai/page-map.md
.ai/memory.md
.ai/gotchas.md
.ai/rules/         # 10 arquivos (9 originais + ai.md)
.ai/modules/       # 19 bounded contexts
```

`.claude/` e `.cursor/` continuam: hooks, settings, commands, agents, skills
como **ponte de descoberta**, rules como `paths:`/`globs` + `@.ai/rules/…`.

Politica de confirmacao nova: nao parar em tarefa escopada e nao destrutiva.

## Preservado (nao rediscutir)

- Architecture Freeze 13/08/2026 — 20 ADRs
- Uma app Next.js, PWA, Drizzle, RLS, Inngest, shadcn, tokens em `globals.css`
- 12 invariantes, quality gates do produto, 5 subagentes
- Graphify local; Serena como opt-in (nao forçado no `.mcp.json`)
- I1 codigo + I2.1/I2.2 ja no repo — o boot **nao** voltou o relogio para
  "implementacao nao comecou"

## Skills / MCP / plugins

Sem `skill audit` completo nesta sessao (o protocolo manda auditar na criacao,
falha, ~mensal ou upgrade — nao a cada boot). Tabelas: `docs/workflow/agent-workflow.md`.

Ainda nao adotados: Graphiti, ui-ux-pro-max, Emotion, Caveman, Figma MCP.
GSAP permanece **excecao** em AUTH `/entrar`, nao no OPS.

## Falta (nao bloqueia I2)

- [ ] Contas humanas de nuvem (Supabase x3, GitHub, Sentry, Inngest)
- [ ] Seed de usuario de teste + E2E `/entrar` → `/contexto`
- [ ] Logo SVG + licenca da didone
- [ ] Validar HEX dos estados no Penpot "00 — Foundations"
- [ ] Importar `screen-tracker.csv` no Roadmap Mestre (Notion)

## Proximo passo de produto

`.ai/roadmap.md` — seed + E2E + I2.3. Nao e I1 do zero.
