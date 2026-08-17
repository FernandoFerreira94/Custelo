---
description: Gate 3 (Seguranca) contra o diff atual ou um modulo nomeado
---

Rode o Gate 3 (Seguranca) dos Quality Gates contra o diff atual ou o modulo
indicado em `$ARGUMENTS`.

Verifique explicitamente:

**Isolamento de tenant (prioridade maxima neste produto)**

- toda query que le ou muta escopa por `org_id`/`empreendimento_id`, nao so por id
- o tenant vem do contexto autenticado, nunca de body/query/header/rota
- tabela nova tem RLS habilitada e policy escrita na mesma migration
- service_role key nao aparece em codigo de request nem no cliente
- indice lidera por `empreendimento_id`

**BOLA / IDOR / mass assignment**

- id vindo do request nao e tratado como prova de acesso
- corpo da requisicao nao e espalhado direto em create/update
- apenas campos do schema Zod chegam ao banco

**Evidencia**

- nenhum caminho permite hard delete de evidencia operacional
- `custody_events` nao recebe UPDATE nem DELETE
- correcao gera evento novo e preserva o anterior
- acao de permissao elevada exige motivo e gera trilha

**Entrada, saida e segredo**

- entrada externa validada com Zod antes do caso de uso
- SQL parametrizado; sem interpolacao de string
- upload valida MIME e tamanho no servidor antes de processar
- resposta de erro sem stack trace, id interno ou nome de tabela
- nada de dado pessoal, imagem de etiqueta ou segredo em log
- PostHog sem PII
- `.env` nao commitado; `.env.example` atualizado
- se `package.json` mudou: `pnpm audit --prod`, sinalizar high/critical

Saida: tabela `[arquivo | problema | severidade | correcao]`. Somente achados,
sem prosa. Se nao houver achado, diga em uma linha.

**Gatilho automatico** — rode isto sem ser pedido, antes de marcar tarefa como
pronta, sempre que o diff tocar: rota/Route Handler/Server Action, auth ou
middleware, query Drizzle, schema Zod/DTO, upload, migration ou dependencia.
Diff apenas de estilo, copy ou teste dispensa.

Nunca reporte pronto com High/Critical em aberto.
