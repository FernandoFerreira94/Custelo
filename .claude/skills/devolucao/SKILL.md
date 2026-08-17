---
name: devolucao
description: Use when working on returning a package to the carrier or sender — exit from custody without delivery to the recipient — in Custelo.
---

# devolucao

Saida da custodia sem entrega ao destinatario. Modulo 09.

## Fluxo F5

Registrar motivo, data/hora, operador, transportadora/retirante quando aplicavel,
nome de quem recolheu quando possivel, tracking e observacao/evidencia basica.

## Invariante que nao pode ser violada

> Devolucao **nunca** remove a encomenda do historico.

Devolver e uma transicao de estado com evidencia, nao um cancelamento nem uma
exclusao. `DEVOLVIDA` nao volta para estado ativo.

## Permissao

Recepcionista registra devolucao. **Corrigir** uma devolucao ja registrada e
acao de permissao elevada.

## Depende de

`custodia-eventos`.

## Telas

DEV-001 a DEV-003 (DEV-002 e sheet sobre DEV-001). Fase I8.
