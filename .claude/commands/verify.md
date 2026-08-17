---
description: Gate deterministico completo antes de declarar tarefa pronta
---

Execute e reporte a saida real de cada passo. Nao declare nada pronto sem a
evidencia colada.

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

Se o diff tocou banco, tenancy ou auth, adicione:

```bash
pnpm test:rls
```

Se o diff tocou UI:

```bash
pnpm test:e2e
```

Depois confira o Definition of Done (Gate 1):

- sem `any`, sem cast desnecessario
- toda entrada externa validada com Zod
- erro tratado como resultado tipado, nunca throw cru para o cliente
- sem `console.log` esquecido
- sem segredo hardcoded; `.env.example` atualizado
- rota autenticada por padrao
- teste escrito junto com o codigo (caminho feliz + caminho de erro)
- loading, erro e sucesso em toda acao do usuario

Se o diff tocou rota, auth, query, schema, upload ou dependencia, rode
`/security-review` **antes** de reportar.

Reporte em uma linha o resultado de cada comando. Falhou = tarefa nao esta
pronta; nao contorne, corrija.
