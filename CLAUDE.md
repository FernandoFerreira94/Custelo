# Custelo — CLAUDE.md

SaaS B2B multi-tenant de recebimento e **cadeia de custodia** para portarias e
operacoes prediais. Produto proprio da Webcodeff. Brasil, LGPD.

> Este arquivo e curto de proposito. Ele guarda o que e **fixo** e aponta para o
> resto. Nao duplique arquitetura aqui — ela vive em `docs/`.

## Comandos

```bash
pnpm dev            # servidor de desenvolvimento
pnpm verify         # typecheck + lint + format:check + test  (rode antes de "pronto")
pnpm test:rls       # testes negativos cross-tenant — o gate mais importante do projeto
pnpm test:e2e       # Playwright (web + ops + a11y)
pnpm db:generate    # gerar migration a partir do schema Drizzle
```

## Arquitetura (LOCKED — Architecture Freeze, 13/08/2026)

Nao rediscuta estas decisoes. Alteracao exige novo ADR.

- **Uma** aplicacao Next.js (App Router), tres superficies por route group:
  `(ops)` PWA operacional client-side · `(web)` gestao em Server Components ·
  `(saas)` admin da plataforma. Um repo, um deploy, um pipeline.
- Backend dentro do Next: Route Handlers (APIs/webhooks) + Server Actions
  (mutacoes). **Server Action e adaptador**: valida e chama um caso de uso —
  nunca contem regra.
- `src/domain` e `src/application` sao puros: sem Next, sem React, sem SDK de
  fornecedor. O ESLint bloqueia esses imports.
- Postgres no Supabase · Drizzle ORM · RLS obrigatoria · Supabase Auth
  (claims) · Supabase Storage · Inngest para jobs duraveis · Vercel.
- Toda integracao externa passa por uma porta: `LabelExtractor`,
  `MessagingProvider`, `EvidenceStorage`, `JobScheduler`, `Clock`.
  Ver `src/ports/README.md`.

Detalhe completo: **`docs/architecture/adr-index.md`**.

## Invariantes que nenhum codigo pode violar

Estas nao sao preferencias. Violar qualquer uma e um bug de produto.

1. Tenant vem **sempre** do contexto autenticado — nunca de id enviado pelo
   cliente. Toda tabela de dominio carrega `org_id` e `empreendimento_id`.
2. Autorizacao e **server-side**. A aplicacao decide, o banco recusa (RLS).
3. `custody_events` e **append-only**. Correcao gera evento novo e preserva o
   anterior. UPDATE/DELETE revogados no Postgres para o role da aplicacao.
4. **Nao existe hard delete de evidencia operacional** — em nenhuma superficie,
   por nenhum papel.
5. Falta de internet, falha de OCR ou WhatsApp fora do ar **nunca** bloqueiam o
   recebimento fisico. Fallback manual sempre presente.
6. IA **sugere**, humano confirma. Nenhuma pessoa e cadastrada automaticamente.
7. No matching, **unidade/endereco e o filtro primario**; o nome e o segundo
   sinal.
8. QR Code e locator opaco: nunca autoriza retirada, nunca reativa encomenda.
9. Sincronizacao offline e **append**, nunca merge. Sem last-write-wins.
   Conflito vai para humano — jamais e descartado.
10. Correcao pos-notificacao **nunca revela** o destinatario correto ao contato
    errado.
11. Falha de notificacao e **estado visivel**, nunca silencio.
12. Nunca logar dado pessoal, imagem de etiqueta ou segredo.

Lista completa com origem: `docs/product/invariantes.md`.

## Design System (LOCKED — Brand & UI Foundation, rev. 15/08/2026)

- Tokens materializados em `src/app/globals.css`. **Fonte canonica = repo.**
- **Proibido** blur, `backdrop-filter` e superficie translucida. O glass effect
  foi revogado em 15/08/2026. Profundidade = tom solido + borda 1px + escala de
  3 sombras (`--shadow-elevation-0..3`).
- Estado **nunca** depende so de cor: sempre cor + label + icone.
- Alvo de toque minimo 44px; acao primaria 48–56px.
- Antes de qualquer UI nova: `docs/design-system/README.md` + a skill
  `frontend-design`.

## Onde esta cada coisa

| Preciso de                       | Leia                                               |
| -------------------------------- | -------------------------------------------------- |
| decisao arquitetural e por que   | `docs/architecture/adr-index.md`                   |
| modulos, dependencias, ordem     | `docs/architecture/module-map.md`                  |
| telas, IDs, rotas, prioridade    | `docs/product/screen-map.md` + `screen-tracker.md` |
| tokens, componentes, estados     | `.design-system/` + `src/app/globals.css`          |
| contexto de negocio              | `.claude/scope.md` (comando `scope`)               |
| decisoes que evoluem             | `.claude/memory.md`                                |
| erro recorrente ja diagnosticado | `.claude/gotchas.md` (comando `gotchas`)           |
| como comecar/encerrar tarefa     | `docs/workflow/task-lifecycle.md`                  |
| skills, MCPs, plugins, agentes   | `docs/workflow/agent-workflow.md`                  |

Regras tecnicas por stack carregam sozinhas via `.claude/rules/` quando um
arquivo do tipo entra em contexto. Nao as leia manualmente.

## Qualidade

Gates completos: `docs/workflow/quality-gates.md`.

Nao reporte tarefa como pronta sem `pnpm verify` verde. Se o diff tocou rota,
auth, query, DTO, upload ou dependencia, rode `/security-review` **antes** de
dizer que acabou.

## Fase atual

**Preparacao concluida — implementacao ainda nao comecou.** A ordem de
construcao e por dependencia arquitetural, nao por tela:
`docs/product/implementation-roadmap.md`. A proxima fase e **I1 — Fundacao
tecnica**; nada de dominio antes de **I2 (tenancy + RLS)** estar de pe.
