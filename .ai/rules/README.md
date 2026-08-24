# Rules

Regras tecnicas **deste produto**. Nao recopiar Padroes de Codigo do Dev Hub;
aqui so constraint e desvio.

Canonico: estes arquivos. Adaptadores apontam para ca:

- Claude Code: `.claude/rules/` (frontmatter `paths:` + `@.ai/rules/…`)
- Cursor: `.cursor/rules/*.mdc` (`globs` + `@.ai/rules/…`)

| Arquivo          | Escopo                                  |
| ---------------- | --------------------------------------- |
| `security.md`    | sempre — vale na **criacao** do arquivo |
| `domain.md`      | `src/domain/**`, `src/application/**`   |
| `drizzle-rls.md` | `src/db/**`, `drizzle.config.ts`, RLS   |
| `api-actions.md` | Route Handlers e Server Actions         |
| `zod.md`         | schemas de validacao                    |
| `ui.md`          | componentes e telas                     |
| `ops-pwa.md`     | superficie `(ops)`                      |
| `ports.md`       | portas e adaptadores                    |
| `testing.md`     | testes                                  |
| `ai.md`          | OCR / modelo / matching (Gate 10 local) |

`security.md` no Claude adapter **espelha** o canonico (sempre ativo; nao
depende de `@` expandir). Demais rules Claude sao ponte + `@.ai/rules/…`.
