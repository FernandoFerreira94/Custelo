---
paths:
  [
    "src/app/**/route.ts",
    "src/app/**/actions.ts",
    "src/app/**/*.action.ts",
    "src/app/api/**",
  ]
---

# Route Handlers e Server Actions

Ambos sao **adaptadores**. Responsabilidade: resolver contexto, validar entrada,
chamar um caso de uso, mapear o resultado. Nada alem disso.

- Sem regra de negocio. Se ha decisao de dominio no arquivo, ela pertence a
  `src/application`.
- Contexto de tenant resolvido a partir da sessao autenticada, no servidor.
  Nunca a partir de parametro recebido.
- Entrada validada com Zod na primeira linha util. Schema compartilhado com o
  cliente e com o dominio.
- Rota e autenticada por padrao. Publica exige comentario explicando por que.
- Resposta de erro sem stack trace, sem id interno, sem nome de tabela.
- Nunca retornar entidade crua do banco — mapear para o formato da resposta.

## Webhooks

- Validar assinatura antes de qualquer processamento.
- Deduplicar por id da mensagem: o provedor entrega duplicado e fora de ordem, e
  isso e comportamento esperado, nao falha.
- Responder rapido; trabalho pesado vai para job.

## Jobs

Espera duravel, retry, janela de disparo e concorrencia sao do `JobScheduler`,
nunca do request. Toda emissao carrega chave de idempotencia.
