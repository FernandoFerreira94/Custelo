# correcoes

Correcao auditavel, motivo, permissao elevada e efeito sobre notificacao.
Modulo 07.

## Fluxo F3 — correcao apos notificacao incorreta

Corrigir registro → preservar historico → **avisar o operador** de que houve
notificacao anterior → oferecer mensagem neutra de correcao ao contato que
recebeu por engano.

## Invariantes

> Correcao gera novo evento e preserva valor anterior.
> Correcao pos-notificacao **nunca revela** o destinatario correto ao contato
> errado.

A segunda invariante e de privacidade, nao de UX. O vizinho que recebeu o aviso
por engano nao pode descobrir para quem era a encomenda.

## Permissao

Acao de permissao elevada: apenas Gestor do Empreendimento e Administrador da
Organizacao. Recepcionista nao corrige — isso e testado.

Toda correcao exige **motivo** e gera `ASSOCIACAO_CORRIGIDA` sem apagar o evento
original.

## Por que este modulo existe

Correcao para encobrir erro e um vetor de fraude identificado no discovery.
A resposta do produto nao e impedir a correcao — e torna-la impossivel de
esconder.

## Telas

CUS-004 (sheet sobre CUS-002). Fase I9.
