# Memory — Custelo

## Summary

- Arquitetura: 1 app Next.js, route groups `(ops)` `(web)` `(saas)` `(auth)` —
  nao ha apps separados nem React Native (ADR-001, ADR-012)
- Dados: Postgres/Supabase + Drizzle + RLS; `custody_events` append-only
- Auth: Supabase Auth + claims; hook Postgres `custom_access_token_hook`;
  token 15 min; autorizacao server-side
- Jobs: Inngest (`JobScheduler`); WhatsApp Cloud API (`MessagingProvider`)
- Offline: PWA (Serwist + Dexie), sync append, UUIDv7, sem last-write-wins
- Design: glass REVOGADO; cache em `DESIGN.md`; tokens em `globals.css`
- Identidade Nevoa + Brasa (ADR-021, 04/11/2026): navy na acao principal,
  `variant="brasa"` em botao pequeno, erro carmim, Plus Jakarta Sans nos
  titulos e wordmark (Poppins e Bodoni aposentadas). Escuro nao revisado.
- Contexto de agentes: `.ai/` e canonico (Boot Protocol ago/2026). `CLAUDE.md`
  e `.cursor/` so adaptam. Nao ha memoria paralela por ferramenta.
- Fase: I1 codigo feito. I2 (tenancy+RLS+auth) fechado no repo (commit `30b5379`).
  **I3 iniciado:** migration `0007` + schema `areas`/`unidades`/`pessoas`/`vinculos`.
- AUTH `/entrar`: convite, recuperacao e senha reais via Supabase.
- AUTH-001..004: REVIEW com callbacks SSR token-hash/PKCE e E2E real desktop +
  OPS verdes. AUTH-005/006: DONE. Configuracao de e-mail/redirects de
  staging/producao continua humana e o `pnpm verify` global esta bloqueado por
  arquivos paralelos de I3/config de testes.
- Roadmap de paginas: `docs/product/pages-roadmap.md` + CSV.
- Notion pagina-mae alinhada ao repo em 21/08 (PWA; RN/Expo 17/08 SUPERSEDED).

---

## Log

[2026-09-01] Fechamento formal AUTH-001..004 revalidado sem alterar codigo:
`pnpm test:rls` passou (20 testes) e o E2E Auth passou (14 testes reais em
desktop e OPS, incluindo login, recovery/callback e convite/ativacao). O a11y
de `/entrar` passou, mas o gate global falhou na raiz por contraste serio do
texto "Zap" (1.5:1, minimo 3:1). `pnpm verify` continua bloqueado por mudancas
paralelas: tipo de `TransactionSql` em `src/infrastructure/db/tenant-db.ts:21`
e `fileParallelism` invalido em `vitest.config.ts:55`. Advisor remoto consultado
sem DDL: 5 avisos de `search_path` mutavel em funcoes `app`, 2 de
`public.rls_auto_enable()` SECURITY DEFINER executavel e leaked-password
protection desabilitada. O projeto esta saudavel, mas nao havia CLI do Supabase,
token de Management API nem acesso ao dashboard para conferir/aplicar Site URL,
allowlist, templates, SMTP ou essa protecao. AUTH-001..004 permanecem REVIEW.

[2026-09-01] AUTH-001..004 implementado e validado em escopo Auth —
`/auth/confirm` valida convite e recovery por token hash ou PKCE antes de abrir
o card correto em `/entrar`.
Recovery troca senha e encerra outras sessoes sem `service_role` em request.
Convite mostra papel/escopo server-side, valida pendencia antes de alterar Auth,
ativa `usuarios` via `app.aceitar_convite()` e entra em `/receber`. O caso de uso
de gestao foi centralizado em `sendInviteByEmail()` com `NEXT_PUBLIC_SITE_URL`.
Intro GSAP deixa o palco `inert` ate concluir para impedir preenchimento antes
da hidratacao. Evidencia: 120 unit/UI, 20 RLS, 14 E2E desktop+OPS e 1 a11y.
Status formal REVIEW: pendem redirects/templates/SMTP, leaked-password
protection, warnings do advisor e o `pnpm verify` global (bloqueado por arquivos
paralelos fora de Auth).

[2026-08-21] Notion alinhado ao repo — pagina-mae Custelo deixou de citar
React Native/Expo e monorepo `web`+`mobile`. Fonte operacional = repo
(`AGENTS.md` + `.ai/`). Callouts de precedencia em Architecture Freeze,
System Surfaces e Handoff 17/08 marcam o amendment RN como SUPERSEDED.
Comercial/billing/WABA do handoff 17/08 continuam hipotese vigente.

[2026-08-20] Boot Protocol universal reaplicado — contexto canonico moveu de
`.claude/{scope,memory,gotchas,rules,skills}` para `.ai/` (scope, architecture,
roadmap, page-map, memory, gotchas, rules, modules). `AGENTS.md` virou roteador
(<=120 linhas). `CLAUDE.md` e thin adapter (`@AGENTS.md`). `DESIGN.md` e cache
de UI. Notion do projeto **nao** foi usado para stack: continua PWA + uma Next.
Adaptadores `.claude/` e `.cursor/` apontam para `.ai/`. Skills Claude Code
permanecem como ponte de descoberta.

[2026-08-19] AUTH palco `/entrar` — quatro cards no `AuthCardStage` (translate
so do card, hero igual): Entrar, Recuperar acesso, Definir nova senha,
Aceitar convite. Preview de visualizacao: enviar recuperacao → senha;
botao no login → convite (Fernanda Alves / Porteiro / Vila Verde · Colinas
II). Sem pagina nova. `AuthPasswordField` compartilhado. Politica nova senha
= 10 caracteres. Frontend IN_PROGRESS; API/token NOT_STARTED.

[2026-08-19] AUTH — **proximo passo de tela:** AUTH-005 `/contexto` (lista
org/empreendimento; hoje o login real ja aponta pra essa rota). Depois:
tirar botoes/atalhos de preview quando o e-mail/token real existir.

[2026-08-19] I2.2 hook Postgres — Fernando habilitou Custom Access Token no
dashboard Supabase com funcao **`public.custom_access_token_hook`** (migration
`0002_custom_access_token_hook.sql`). Claims vêm de `app.resolve_auth_claims()`.
Nao usa HTTP hook nem `SUPABASE_AUTH_HOOK_SECRET`. Menu: Authentication → Auth
Hooks (link direto `/auth/hooks`).

[2026-08-19] I2 — **proximo passo operacional:** (1) seed org + empreendimento +
usuario Auth + linhas `usuarios`/`escopos_usuario`; (2) testar login em
`/entrar` (redirect `/contexto`); (3) I2.3 application/auth-rbac (convite,
papel, escopo, revogacao reais). Front AUTH-001..004 ja esta em preview no card
de `/entrar`.

[2026-08-19] AUTH-001 — bola `primary` do canto do card fica **atras**
(`-z-10` + `isolate`); o card (`z-10`) cobre a parte sobreposta. Troca
entrar/recuperar continua so o translate do `AuthCardStage`.

[2026-08-19] AUTH-003 — `RecoverAccessForm` no mesmo card de `/entrar`.
`AuthCardStage` troca entrar/recuperar com translate GSAP (reduced-motion
pula). Sem pagina nova. `requestRecovery` sempre devolve `RECOVERY_ACCEPTED`.

[2026-08-19] AUTH-001 — senha usa `InputGroup` + icone Eye/EyeOff
(`Mostrar senha` / `Ocultar senha`). "Esqueci minha senha" e botao, nao
link para outra rota.

[2026-08-18] AUTH-001 — intro GSAP monta uma caixa isometrica com QR
decorativo (nao e locator; invariante 8). Depois o wordmark e o veu.

[2026-08-18] AUTH-001 — form no Card shadcn (`Field`, `Alert`, `Spinner`).
Tipografia do card e **Inter** (`font-sans`); Bodoni fica so no hero e na
wordmark. Superficie solida (`bg-muted` no footer, sem `/50`).

[2026-08-18] AUTH-001 — foto `img02` + overlay primary de volta. Divisor
ondulado fica **sutil e estatico** (sem GSAP no meio, sem traco dourado,
borda `black/40` 1px). Sombra fixa: card elevation-3, input elevation-1,
botao elevation-2. Sem hover magnetico no CTA.

[2026-08-18] AUTH-001 — foto de fundo revogada. Wordmark e titulos da tela
Entrar passam a texto em **Bodoni Moda** (`--font-heading` ← `--font-display`),
aproximacao da didone da logo ate a fonte original e a licenca serem
confirmadas. Card do form sobe para `--shadow-elevation-3`.

[2026-08-18] AUTH-001 desktop — superficie de login em `/(auth)/entrar` com
split (foto `Imagen/Penot-referencia/img02.png` + overlay `primary`), divisor
**ondulado** (desvio consciente do Penpot reto, pedido do PO) e intro GSAP.
GSAP + `@gsap/react` ficam restritos a essa tela: o design system continua
sem biblioteca de motion no OPS. Sem `blur` / Lenis. `prefers-reduced-motion`
pula a intro. Logos de `Imagen/logo` foram recortados (fundo branco opaco) para
`public/brand`. Form valida no cliente; `requestSession` e stub ate I2.

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

[2026-08-18] I2.2 auth + claims — Supabase SSR (`infrastructure/auth`), middleware
de refresh, funcao `app.resolve_auth_claims()` (`0001_auth_claims.sql`),
`public.custom_access_token_hook()` (`0002`), `requestSession()` com
`signInWithPassword` e redirect `/contexto`. Rota HTTP `/api/auth/hook` legada
(Bearer) — substituida por hook Postgres no dashboard. Multi-empreendimento
deixa `empreendimento_id`/`papel_codigo` nulos no JWT ate AUTH-005.

[2026-08-16] Cores de estado operacional: a fundacao de marca define a **direcao**
(azul, ambar, violeta, vermelho, laranja-vermelho, teal, verde, slate,
cinza-azulado) mas nao os HEX. Os valores em `globals.css` foram derivados para
atender WCAG AA e estao marcados como pendentes de validacao contra o board de
tokens do Penpot (pagina "00 — Foundations").
