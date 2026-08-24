# Testes

Teste nasce com o codigo, nao depois. Minimo: caminho feliz + caminho de erro.

## Fronteiras dos projetos Vitest

- `unit` — dominio e casos de uso. Sem rede, sem banco, sem DOM. Portas entram
  como fake.
- `ui` — componentes em jsdom.
- `rls` — Postgres **real**. Nunca mock, nunca in-memory. Sem `DATABASE_URL` o
  projeto deve falhar alto, nao passar vazio.

## O que precisa de teste, sempre

- Teste negativo cross-tenant para toda tabela nova. O gate mais importante do
  projeto.
- Prova de que evento de custodia nao pode ser alterado nem pela conexao da
  aplicacao.
- Transicao de estado proibida rejeitada em todo caminho.
- Matriz de permissoes: Recepcionista nao corrige, nao cancela e nao altera
  retirada.
- Ciclo offline → sync sob conflito, sem perda de evidencia.
- Reenvio duplicado tratado por idempotencia.
- Retirada concorrente do mesmo volume.
- Janela de notificacao e aging — via `Clock` fake, nunca esperando o relogio.

## E2E e a11y (Playwright)

- Projeto `ops` roda em viewport de celular; o alvo real e Android de baixo
  custo.
- Projeto `a11y` usa axe. Violacao serious/critical quebra o build.
- Nunca apontar E2E para producao nem para numero de WhatsApp real de cliente.

## Fixtures

Fabricas em `src/tests/factories`. Toda fabrica exige tenant explicito — nao
existe entidade "sem empreendimento" nos testes, porque nao existe no produto.
