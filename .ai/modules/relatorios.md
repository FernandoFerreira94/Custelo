# relatorios

Dashboards e relatorios de operacao. Modulo 11. Nao tem invariante propria —
consome a cadeia de custodia. Leitura, nunca mutacao de evidencia.

## O que o modulo faz

Fila, busca, filtros, KPIs do DASH-001 e REL-001 a REL-005. Exportacao e job
(`relatorio.exportar`), nao download sincronico de lista grande.

## Invariante herdada

> Paginacao obrigatoria; cursor preferido. Indice lidera por `empreendimento_id`.
> Audit log e evidencias **nunca** saem do Postgres para analytics (ADR-017).

## O que este modulo NAO faz

Nao corrige, nao cancela, nao altera retirada. Se a tela precisa mutar
encomenda, a skill correta e `custodia-eventos`, `correcoes`, `retirada` ou
`devolucao`.

## Telas

DASH-001 · REL-001 a REL-005. Fase I10.
Pos-MVP: DASH-002.

## Depende de

`tenancy` · `custodia-eventos` · `retirada` · `devolucao`.
