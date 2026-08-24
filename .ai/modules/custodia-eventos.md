# custodia-eventos

Event log append-only, estados, transicoes e aging derivado.
Modulo 07 — o contexto central e transversal do produto.

## Por que este modulo existe

A evidencia e o unico diferencial defensavel do Custelo. Se um evento pode ser
apagado ou reescrito, o produto perde a razao de existir.

## Desenho (ADR-007)

Tabela `custody_events` **append-only** + tabela de estado da encomenda, escritas
na **mesma transacao**.

`UPDATE` e `DELETE` sao revogados no nivel do Postgres para o role da aplicacao.
A imutabilidade e garantida pelo banco, nao pela disciplina de quem escreve.

Nao e event sourcing puro: replay, versionamento de evento e projecoes seriam
complexidade desproporcional, e a fila de portaria consulta o estado atual o
tempo todo.

## Maquina de estados da encomenda

`RECEBIDA · IDENTIFICADA · NAO_IDENTIFICADA · AGUARDANDO_NOTIFICACAO ·
NOTIFICADA · FALHA_NOTIFICACAO · RETIRADA · DEVOLVIDA · CANCELADA`

`URGENTE` e `AGING` sao **derivados por regra de tempo**, nao estados
persistidos.

### Transicoes proibidas

- `RETIRADA` → qualquer estado ativo
- `DEVOLVIDA` → ativo
- `CANCELADA` → ativo
- reativacao por leitura de QR
- exclusao, em qualquer estado

## Invariantes

> Evento e imutavel. Estado e evento na mesma transacao. Sem UPDATE/DELETE.
> Transicao proibida nunca e permitida por atalho.

> Toda encomenda pertence a exatamente um empreendimento e tem uma unidade
> destino, ou esta explicitamente em `NAO_IDENTIFICADA`.

Cada evento registra: valor anterior, valor novo, operador, data/hora, motivo,
`origin` (online/offline) e efeito sobre notificacoes.

## Risco conhecido

Estado e eventos podem divergir se alguem escrever estado fora do caso de uso.
Mitigacao: escrita de estado apenas pela camada de aplicacao + teste de
invariante. Crescimento da tabela: particionar por periodo quando o volume
justificar.

## Telas

CUS-001, CUS-002, CUS-003, CUS-005. Fase I4 — **antes** de I5 (recebimento).
