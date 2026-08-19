# Memory — Custelo

## Summary

- Arquitetura: 1 app Next.js, route groups `(ops)` `(web)` `(saas)` — nao ha apps separados
- Dados: Postgres/Supabase + Drizzle + RLS obrigatoria; `custody_events` append-only
- Auth: Supabase Auth com claims; autorizacao server-side; token 15 min
- Jobs: Inngest (porta `JobScheduler`); WhatsApp Cloud API direta (porta `MessagingProvider`)
- Offline: PWA (Serwist + Dexie), sync por append, UUIDv7, sem last-write-wins
- Design: glass effect REVOGADO em 15/08/2026 — profundidade por tom solido + 3 sombras
- Fase: I1 em codigo (Clock, JobScheduler, health, Inngest, Sentry). Sem tabela
  de dominio. Tres ambientes de nuvem ainda dependem de contas (Supabase/GitHub).
- Roadmap de paginas: `docs/product/pages-roadmap.md` + CSV; atualizar ao
  concluir cada tela (regra `.cursor/rules/pages-roadmap.mdc`).

---

## Entradas

[2026-08-18] Roadmap de paginas — `docs/product/pages-roadmap.md` como controle
versionado no repo (conteudo + status das 83 telas), alinhado ao Notion _Roadmap
Mestre_. Ao finalizar tela: atualizar CSV + pages-roadmap; sync Notion quando MCP
autenticado.

[2026-08-13] Architecture Freeze — 20 ADRs congelados. Vercel + Supabase confirmados
como adequados, com duas ressalvas que viraram decisao propria: jobs duraveis nao
cabem em funcao serverless de request (ADR-009, Inngest) e revogacao imediata de
acesso exige reforco sobre o Supabase Auth (ADR-005, checagem server-side).

[2026-08-13] ADR-001 — monorepo com **uma** aplicacao Next.js em vez de apps
separados por superficie. Motivo: as tres superficies compartilham o mesmo modelo
de dominio e as mesmas regras de custodia; duplicar regra entre apps e o erro mais
caro possivel neste produto. Risco aceito: diluicao de fronteiras — mitigado por
camada `domain/` pura e regra de ESLint que bloqueia import de framework.

[2026-08-13] ADR-007 — event log append-only em vez de event sourcing puro. A
imutabilidade e garantida pelo **banco** (UPDATE/DELETE revogados para o role da
aplicacao), nao pela disciplina do codigo.

[2026-08-13] ADR-012 — PWA em vez de app nativo. Trade-off assumido: iOS e o ponto
fraco (sem Background Sync, risco de ejecao de storage). Gatilho de revisao
explicito: se o piloto mostrar perda de fila no iOS ou latencia de camera
inaceitavel, a rota de fuga e Capacitor sobre a mesma PWA.

[2026-08-13] ADR-014 — OCR de texto puro + matching deterministico local, nao
modelo multimodal. Motivo: custo, latencia, privacidade e — decisivo —
auditabilidade: da para explicar por que uma unidade foi sugerida.

[2026-08-15] Glass effect revogado pelo product owner. Motivo: custo de
performance no Android de baixo custo que o porteiro realmente usa, perda de
contraste sobre conteudo variavel e manutencao desproporcional. Substituido por
superficie solida + borda 1px + escala fixa de 3 sombras.

[2026-08-16] Design — 77 das 83 telas desenhadas no Penpot; as 6 restantes sao
exatamente as pos-MVP. Biblioteca fechou com 53 componentes-mestre.

[2026-08-16] Design — sheet em vez de tela de navegacao: REC-004/005/006, CUS-005,
DEV-002, CUS-004 e NOT-004 viraram bottom sheets sobre a tela-base. Cada tela-base
virou componente, e a tela com sheet e instancia da base + instancia do sheet.

[2026-08-16] Preparacao do repositorio executada. Boot Protocol aplicado: rules,
skills, commands, agents, hooks, settings, quality gates, design tokens, docs.
Nenhuma funcionalidade implementada — por instrucao explicita.

[2026-08-18] I1 — portas Clock e JobScheduler, health publico, serve Inngest,
Sentry so com DSN, schema Drizzle ainda vazio. DATABASE_URL/Supabase opcionais
ate I2. Tres ambientes de nuvem documentados; criacao das contas e humana.

[2026-08-18] Fechamento do Boot Protocol no Cursor: docs de tracker/CSV, camadas
com README, skill `relatorios`, Dependabot, placeholders de teste do scaffold,
mapa de paginas Notion. MCP Notion nesta sessao nao autenticado — atualizacao
do cabecalho G3 e import do CSV ficam manuais. ADR-001 preservado: sem
`apps/web|api|mobile`.

[2026-08-16] Cores de estado operacional: a fundacao de marca define a **direcao**
(azul, ambar, violeta, vermelho, laranja-vermelho, teal, verde, slate,
cinza-azulado) mas nao os HEX. Os valores em `globals.css` foram derivados para
atender WCAG AA e estao marcados como pendentes de validacao contra o board de
tokens do Penpot (pagina "00 — Foundations").
