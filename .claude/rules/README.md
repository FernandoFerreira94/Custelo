# Rules (Claude Code adapter)

Canonico: `.ai/rules/`. Este diretorio so declara `paths:` e aponta.

| Arquivo          | Escopo                                |
| ---------------- | ------------------------------------- |
| `domain.md`      | `src/domain/**`, `src/application/**` |
| `drizzle-rls.md` | `src/db/**`, `drizzle.config.ts`      |
| `api-actions.md` | Route Handlers e Server Actions       |
| `zod.md`         | schemas de validacao                  |
| `ui.md`          | componentes e telas                   |
| `ops-pwa.md`     | superficie `(ops)`                    |
| `ports.md`       | portas e adaptadores                  |
| `testing.md`     | testes                                |
| `security.md`    | **sem `paths:`** — sempre ativo       |

Edite a regra em `.ai/rules/<topico>.md`. Cursor le o mesmo arquivo via
`.cursor/rules/*.mdc`.
