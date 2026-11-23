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

<!-- BEGIN:webcode-regras (bloco padrão WebCode; não editar aqui, editar na fonte e propagar) -->
## Regras da casa WebCode (valem para Claude Code, Cursor, Codex e humano)

Em conflito com qualquer outra seção deste arquivo, este bloco vence, salvo pedido explícito e registrado do Fernando.

1. **Idioma:** respostas, PRs, commits descritivos e textos de UI em pt-BR.
2. **Cursor:** toda janela, sessão e agente (local ou Cloud) no modelo **Auto**. Nunca fixar modelo.
3. **Claude Code:** esforço **medium** em toda task e modelo. Qualquer outro nível (low, high, xhigh, max) só com autorização prévia do Fernando, registrada na task. Plano com Superpowers (brainstorming, writing-plans): `opus` com esforço medium. Créditos extras, chave de API ou modelo pago extra: só com OK do Fernando.
4. **Linha `Modelo:`** em toda task e todo PR: `Modelo: <modelo> / esforço medium / subiu: <motivo ou não>`.
5. **Memória:** `.ai/memory.md` **não é editado em PR nem em branch**. Só é atualizado na `main`, depois do merge, por quem fez o merge.
6. **Mapa de features:** todo PR cita o mapa de features do repo (linha abaixo). Se criou, renomeou ou removeu rota, tela ou fluxo, atualiza o mapa no mesmo PR.
   Mapa de features deste repo: `.ai/page-map.md`
7. **Padronização total:** procure e reuse componente, token, ícone e fonte existentes (design system `@webcode` e pastas de componentes do repo). Nunca recrie.
8. **Testes:** só dados fictícios. Nunca dado real de cliente, nunca CPF real (use gerador de CPF válido fictício).
9. **CI:** nenhum merge com check vermelho, pendente ou pulado. CI sem minutos conta como vermelho.
10. **Só com OK do Fernando, a cada vez:** merge, deploy, migration aplicada em qualquer banco remoto, rollback, secrets e `.env`, mudança de visibilidade do repo. PR sempre em rascunho até esse OK. Sem auto-merge.
11. **Skills:** não copie skills do box, do `webcode-design` ou de plugins (Superpowers e outros) para `.claude/` deste repo. Aponte para a fonte. Skill **própria do módulo deste repo** em `.claude/skills/<modulo>/` continua permitida.
<!-- END:webcode-regras -->

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
| Decisao que evolui               | `.ai/memory.md` (leitura; escrita so na main) |
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

Atualize so o que mudou, no proprio PR: `.ai/roadmap.md` · `.ai/page-map.md`
· Graphify (`graphify update .`) · CSV/pages-roadmap se for tela.
`.ai/memory.md` NAO e editado em PR nem em branch: so na `main`, depois do merge,
por quem fez o merge. Decisao nova vai no corpo do PR em "Memoria (aplicar apos merge)".
Relatorio: `Done — … / Validation: … / Context updated: … / Blocked: …`
