# ADRs — indice

**Architecture Freeze concluido em 13/08/2026.** Estas decisoes sao LOCKED.
O agente de implementacao nao as rediscute. Alteracao exige **novo ADR** com
justificativa (`docs/adr/`).

Racional completo de cada ADR: Notion, _Architecture Freeze — ADRs e Technology
Stack_. Aqui fica a decisao e o que ela obriga no codigo.

| ADR | Assunto               | Decisao                                                                 | Consequencia direta no codigo                                              |
| --- | --------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 001 | Arquitetura e repo    | monorepo com **uma** app Next.js, route groups `(ops)` `(web)` `(saas)` | dominio compartilhado; regra nunca duplicada entre superficies             |
| 002 | Backend               | Next.js full-stack; Route Handlers + Server Actions                     | Server Action e adaptador: valida e chama use case, nunca contem regra     |
| 003 | Banco                 | PostgreSQL no Supabase, instancia por ambiente                          | modelo relacional/transacional; evento e estado na mesma transacao         |
| 004 | Multi-tenancy         | banco unico, schema compartilhado, `org_id` + `empreendimento_id`, RLS  | aplicacao decide, banco recusa; indice lidera por `empreendimento_id`      |
| 005 | Auth                  | Supabase Auth + custom claims + checagem server-side                    | token 15 min; revogacao de refresh no ato; escopo em tabela propria        |
| 006 | ORM                   | Drizzle sobre conexao Postgres direta, `SET LOCAL` por transacao        | supabase-js so para Auth e Storage                                         |
| 007 | Event log             | `custody_events` append-only + estado materializado                     | UPDATE/DELETE revogados no Postgres para o role da app                     |
| 008 | Storage               | Supabase Storage, bucket privado, URL assinada                          | porta `EvidenceStorage`; compressao no cliente                             |
| 009 | Jobs                  | Inngest, funcoes duraveis                                               | porta `JobScheduler`; `sleepUntil` para a janela de notificacao            |
| 010 | Realtime              | **nao** no MVP                                                          | revalidacao sob acao + polling leve 30–60s                                 |
| 011 | Cache                 | **sem** camada dedicada; sem Redis                                      | cache mal escopado e vetor de vazamento cross-tenant                       |
| 012 | App operacional       | PWA instalavel no mesmo Next, Serwist + Dexie                           | `(ops)` e client-side; iOS e o ponto fraco assumido                        |
| 013 | Sincronizacao         | UUIDv7 no cliente, dois timestamps, append, sem LWW                     | conflito vai para humano em estado `CONFLITO`                              |
| 014 | OCR/IA                | porta `LabelExtractor`; OCR de texto + matching deterministico local    | timeout 4s, 1 retry, fallback manual; nunca logar imagem nem texto bruto   |
| 015 | WhatsApp              | Cloud API direta + Embedded Signup                                      | porta `MessagingProvider`; metering desde o dia 1                          |
| 016 | Observabilidade       | Sentry · logs estruturados · Inngest dashboard · Better Stack           | erro cross-tenant e sempre alerta                                          |
| 017 | Analytics             | PostHog sem PII, separado do audit log                                  | audit log nunca sai do Postgres                                            |
| 018 | Frontend              | Next + TS + Tailwind + shadcn/ui; TanStack Query; RHF + Zod             | `(web)`/`(saas)` Server Components; `(ops)` client-side                    |
| 019 | Ambientes e CI/CD     | Vercel; Supabase separado por ambiente; migrations por pipeline         | staging jamais aponta para WhatsApp real de cliente                        |
| 020 | Backup e DR           | PITR; RPO 5 min; RTO 4h; restore testado por trimestre                  | motor de retencao parametrizavel; prazos por configuracao                  |
| 021 | Identidade visual     | Nevoa + Brasa; navy na acao principal, brasa em acao pequena; Jakarta   | erro carmim; `variant="brasa"` no Button; sombras navy em camadas          |
| 022 | Vidro na barra mobile | so a `TabBar` do `(ops)` em vidro (`material="glass"`, thick)           | fallback solido sem suporte ou com transparencia reduzida; resto sem vidro |

## Portas obrigatorias

`LabelExtractor` · `MessagingProvider` · `EvidenceStorage` · `JobScheduler` ·
`Clock`.

> Nenhum codigo de dominio importa SDK de fornecedor diretamente.

Detalhe e rota de fuga de cada uma: `src/ports/README.md`.

## Trade-offs aceitos conscientemente

| Aceitamos                     | Porque                                              | Mitigacao                                               |
| ----------------------------- | --------------------------------------------------- | ------------------------------------------------------- |
| acoplamento a Supabase        | reduz superficie de integracao para um dev solo     | e Postgres padrao; Auth e Storage atras de portas       |
| bundle e build unicos crescem | duplicar regra entre apps seria pior                | camada `domain/` pura + regra de ESLint                 |
| RLS custa em toda query       | cross-tenant vira erro estrutural, nao esquecimento | indices liderando por `empreendimento_id`               |
| iOS sem Background Sync       | escopo offline e limitado ao recebimento            | sync agressiva, aviso de pendencia, Android recomendado |
| mais um fornecedor (Inngest)  | espera duravel de horas nao cabe em serverless      | porta `JobScheduler` com pgmq+pg_cron como rota de fuga |

## Open questions tecnicas (nenhuma bloqueia implementar)

| Questao                           | Bloqueia                          | Depende de                                         |
| --------------------------------- | --------------------------------- | -------------------------------------------------- |
| fornecedor de OCR                 | nada — a porta ja existe          | teste de latencia/custo + clausula de nao retencao |
| regiao dos dados                  | producao                          | decisao juridica sobre transferencia internacional |
| prazos de retencao                | ligar o motor de retencao         | juridico                                           |
| verificacao Tech Provider na Meta | onboarding self-service de numero | Meta; rota de fuga via BSP                         |
| volume alvo por portaria/hora     | SLOs de performance               | piloto                                             |
