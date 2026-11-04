# Drizzle, Postgres e RLS

- Toda tabela de dominio: `org_id` + `empreendimento_id`, ambos NOT NULL.
- RLS habilitada em toda tabela de dominio, sem excecao. Policy escrita junto com
  a tabela, na mesma migration — nunca "depois".
- Indice lidera por `empreendimento_id`. Filtro em coluna nao indexada em
  endpoint de lista e problema de performance conhecido, nao surpresa.
- Claims aplicadas por transacao com `SET LOCAL`. Conexao Postgres direta, nao
  PostgREST — o dominio precisa de controle transacional real.
- `custody_events` e append-only: UPDATE e DELETE revogados no nivel do Postgres
  para o role da aplicacao. A imutabilidade e do banco, nao da disciplina do
  codigo.
- Paginacao obrigatoria em endpoint de lista; cursor preferido.
- Nunca consultar dentro de laco. Use `inArray`.
- Selecionar apenas as colunas necessarias.
- Escrita multipla usa transacao.

## Migrations

- Versionadas no repositorio, aplicadas por pipeline (ADR-019).
- Nunca `drizzle-kit push` nem `drop` contra ambiente compartilhado.
- Migration que cria tabela de dominio sem policy RLS nao passa no review.
- **Nenhuma migration de dominio antes da fase I2.**

## Teste

Toda tabela nova ganha teste negativo cross-tenant em `tests/rls/`, contra
Postgres real. Sem mock. Este e o gate mais importante do projeto.
