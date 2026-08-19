# Riscos tecnicos e open questions

Nada aqui bloqueia **comecar I1**. Bloqueia producao ou uma fase posterior,
conforme a coluna.

Fonte dos ADRs: `docs/architecture/adr-index.md`. Fonte de produto: Notion,
_Contexto Inicial Validado_.

## Open questions (freeze)

| Questao                       | Bloqueia                | Fase           |
| ----------------------------- | ----------------------- | -------------- |
| Fornecedor de OCR             | nada — porta ja existe  | I5             |
| Regiao dos dados              | producao                | I12 / juridico |
| Prazos de retencao            | ligar o motor           | I12 / juridico |
| Tech Provider Meta            | onboarding self-service | I7             |
| Volume alvo por portaria/hora | SLOs                    | piloto         |
| Provedor de billing           | BIL-001/002             | pos-MVP        |
| Controlador x operador LGPD   | DPA                     | I12            |

## Riscos aceitos (ADR)

| Risco                        | Mitigacao                                     |
| ---------------------------- | --------------------------------------------- |
| Acoplamento a Supabase       | Postgres padrao; Auth/Storage atras de portas |
| Bundle unico cresce          | `domain/` puro + ESLint                       |
| RLS em toda query            | indice liderando por `empreendimento_id`      |
| iOS sem Background Sync      | sync agressiva, aviso, Android recomendado    |
| Mais um fornecedor (Inngest) | porta `JobScheduler`; fuga pgmq+pg_cron       |

## Riscos de preparacao ainda abertos

| Item                                        | Dono     | Bloqueia I1?                                               |
| ------------------------------------------- | -------- | ---------------------------------------------------------- |
| Logo SVG + favicon 32 + icone 512           | cliente  | nao (bloqueia PWA install / comprovante)                   |
| HEX dos estados vs board Penpot             | design   | nao                                                        |
| MCP Notion autenticado no Cursor            | Fernando | nao (specs ja no Notion; tracker CSV no repo)              |
| Contas Vercel / Supabase / Inngest / Sentry | Fernando | **sim para terminar I1** (nao para comecar o codigo de I1) |
| Cabecalho Notion "AGUARDANDO FREEZE"        | Fernando | nao — freeze ja concluido                                  |

## Gatilhos de revisao ja escritos

- ADR-012: perda de fila no iOS ou latencia de camera → Capacitor.
- Criterio de fracasso de produto: porteiro volta ao caderno.
