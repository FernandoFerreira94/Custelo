# tenancy

Escopo de conta e empreendimento, RLS, claims e resolucao de contexto.
Modulo 01. Pre-requisito de **todos** os outros.

## O que o modulo faz

Define a hierarquia `Organizacao (conta contratante) → Empreendimento → dados`.
Toda leitura e escrita do produto acontece dentro de um empreendimento, que por
sua vez pertence a uma organizacao.

A administradora **nao** e uma superficie separada: e um modo de escopo do
painel web, em que o contexto passa a ser a organizacao inteira em vez de um
empreendimento unico.

## Invariante que nao pode ser violada

> Tenant vem **sempre** do contexto autenticado; nunca de parametro do cliente.
> Toda tabela de dominio carrega `org_id` e `empreendimento_id`.

## Modelo de defesa (ADR-004)

Duas camadas, e as duas sao obrigatorias:

1. **A aplicacao decide** — o caso de uso resolve o escopo e filtra.
2. **O banco recusa** — RLS bloqueia o que passar.

Banco unico, schema compartilhado. Schema-por-tenant foi descartado: milhares de
empreendimentos pequenos tornariam migration um pesadelo para um dev solo.

## Riscos conhecidos

- Uso da service_role key em codigo de request ignora RLS por completo. Ela e
  restrita a jobs especificos e nunca aparece no caminho de uma requisicao.
- Cache mal escopado e vetor de vazamento cross-tenant — por isso nao ha cache
  distribuido no MVP (ADR-011).
- Indice que nao lidera por `empreendimento_id` faz a policy custar caro.

## Depende de / e usado por

Depende de: nada. E usado por: todos os modulos.

## Como validar

Teste negativo cross-tenant em `tests/rls/`, contra Postgres real. Gate de merge.
Este e o gate mais importante do projeto (Implementation Roadmap, I2).
