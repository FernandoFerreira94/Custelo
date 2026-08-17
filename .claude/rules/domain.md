---
paths: ["src/domain/**", "src/application/**"]
---

# Dominio e aplicacao

Esta camada e pura. E a fronteira que o ADR-001 aponta como principal risco do
monorepo de app unico — se ela vazar, o produto perde a propriedade que o
justifica.

- Sem import de Next, React, Drizzle, Supabase, Inngest, Dexie, Sentry ou
  PostHog. O ESLint bloqueia; nao contorne com `eslint-disable`.
- Dependencia externa entra por porta (`src/ports`), injetada pelo chamador.
- Tempo entra pela porta `Clock`. Nunca `new Date()` direto — janela de
  notificacao e aging precisam ser testaveis sem esperar o relogio.
- Regra de negocio mora aqui. Server Action e Route Handler sao adaptadores: se
  ha `if` de regra num deles, esta no lugar errado.
- Erro de dominio e valor de retorno tipado, nao excecao solta para o cliente.
- Transicao de estado proibida e proibida em todo caminho — nao existe atalho
  "so neste caso".
- Estado e evento mudam na **mesma transacao**. Escrever estado sem o evento
  correspondente e uma divergencia silenciosa que o produto nao detecta depois.

Maquinas de estado, invariantes e autoridade de cada transicao:
`docs/product/invariantes.md`.
