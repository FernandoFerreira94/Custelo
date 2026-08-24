# pessoas-vinculos

Pessoas, vinculo com unidade, vigencia e encerramento. Modulo 03.

## Por que vinculo tem vigencia

"Nao moro mais la" e uma das reclamacoes recorrentes do mercado que viraram
requisito. Notificar ex-morador e uma falha de privacidade, nao um detalhe.

## Invariantes

> Pessoa pode pertencer a varias unidades.
> Vinculo encerrado nao recebe notificacao.
> Nunca cadastrar pessoa automaticamente.

O cadastro automatico a partir de OCR e proibido em todo o produto. Quando o
vinculo e confirmado na retirada, o sistema **sugere** cadastro — nunca cria.

## Vinculo lido na etiqueta

Uma pessoa pode aparecer na etiqueta sem estar cadastrada. Nesse caso a
encomenda e associada **a unidade**, sem criar cadastro. O selo de vinculo
distingue Titular / Morador / Dependente / Vinculo encerrado / lido na etiqueta.

## Estados do vinculo

`ATIVO · ENCERRADO`. Transicao proibida: vinculo encerrado continuar recebendo
notificacao. Autoridade: Gestor ou Administrador.

## Depende de / e usado por

Depende de: `estrutura-fisica`. E usado por: `recebimento`, `ocr-matching`,
`whatsapp`, `retirada`.

## Telas

PES-001 a PES-003. Fase I3.
