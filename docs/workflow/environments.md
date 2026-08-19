# Ambientes (ADR-019)

Tres ambientes, **tres projetos Supabase**, um projeto Vercel. Staging jamais
aponta para WhatsApp real de cliente nem para dado de producao.

| Ambiente | Vercel                          | Supabase              | Inngest        | Sentry        |
| -------- | ------------------------------- | --------------------- | -------------- | ------------- |
| dev      | `vercel` local / preview branch | projeto `custelo-dev` | dev server CLI | projeto `dev` |
| staging  | env Preview ou branch `staging` | projeto `custelo-stg` | env staging    | projeto `stg` |
| prod     | Production (`main`)             | projeto `custelo-prd` | env prod       | projeto `prd` |

## O que o codigo ja faz (I1)

- Portas `Clock` e `JobScheduler` + adaptadores (`SystemClock`, Inngest).
- `GET /api/health` — liveness. Sem sessao, sem PII, sem nome de tabela.
- `GET|POST|PUT /api/inngest` — webhook do Inngest (assinatura do provedor).
- Sentry inicializa **so** se `NEXT_PUBLIC_SENTRY_DSN` existir.
- Drizzle conecta **so** se `DATABASE_URL` existir. Schema de dominio continua vazio.

## Contas que o humano cria (nao cabem no git)

1. **GitHub** — `gh auth login` e remoto `origin`. O CI so roda com o repo hospedado.
2. **Supabase** — tres projetos vazios. Sem tabela de dominio ate I2. Copiar
   `DATABASE_URL` (pooler, porta 6543) e as chaves anon para o Vercel Env.
3. **Inngest** — app `custelo`; colar `INNGEST_EVENT_KEY` e `INNGEST_SIGNING_KEY`.
4. **Sentry** — projeto Next.js; colar DSN. `SENTRY_AUTH_TOKEN` so na CI/Vercel
   para sourcemap.
5. **Better Stack** — uptime em `/api/health`. Fora do codigo.

Local sem contas: `pnpm dev` sobe. Health devolve `db: skipped`. Jobs locais:
`pnpm inngest:dev` numa segunda aba.

## Variaveis por ambiente na Vercel

Copiar nomes de `.env.example`. Production, Preview e Development recebem
valores **diferentes**. Service role nunca vai para `NEXT_PUBLIC_*`.
