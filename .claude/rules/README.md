# Rules

Regras tecnicas por topico. Carregam automaticamente quando um arquivo que casa
com `paths:` entra em contexto — custo zero de token ate serem relevantes.

| Arquivo          | Escopo                                     |
| ---------------- | ------------------------------------------ |
| `domain.md`      | `src/domain/**`, `src/application/**`      |
| `drizzle-rls.md` | `src/db/**`, `drizzle.config.ts`           |
| `api-actions.md` | Route Handlers e Server Actions            |
| `zod.md`         | schemas de validacao                       |
| `ui.md`          | componentes e telas                        |
| `ops-pwa.md`     | superficie `(ops)` — offline, camera, sync |
| `ports.md`       | portas e adaptadores de fornecedor         |
| `testing.md`     | testes                                     |
| `security.md`    | **sem `paths:`** — sempre ativo            |

## Limitacoes conhecidas do carregamento

1. Regra com `paths:` injeta apenas em **Read**, nao em Write/criacao de
   arquivo. Por isso `security.md` nao tem `paths:` — regra critica de momento
   de criacao precisa estar sempre ativa.
2. Regras **nao** sao reinjetadas apos `/compact`; voltam no proximo Read que
   casar.
3. Ha relato de bug em que todas as regras carregam ignorando `paths:`. Verifique
   com `/memory` no boot se houver divergencia.

Ferramentas que nao suportam path-scoping (Cursor, Codex) usam a tabela de
`.cursor/rules/custelo.mdc` e leem o arquivo manualmente.
