# recebimento

Fluxo de captura, criacao da encomenda, QR, condicao e recebimento excepcional.
Modulo 06. A tela mais usada do produto.

## KPI que este modulo define

Segundos por registro. Se o porteiro achar lento, ele volta ao caderno — e esse
e o criterio de fracasso declarado do MVP.

## Fluxo F1 — recebimento por foto

Abrir camera → fotografar **somente a etiqueta** → OCR extrai o minimo → sistema
identifica unidade/endereco, nome e tracking → **unidade recebe maior peso** →
sistema lista pessoas daquela unidade → operador confirma → registro criado →
QR digital gerado → custodia iniciada → notificacao automatica ou em fila
conforme configuracao.

## Excecoes que sao caminho normal, nao erro

| Situacao                  | Comportamento                            |
| ------------------------- | ---------------------------------------- |
| OCR indisponivel/ilegivel | fallback manual, sempre disponivel       |
| pessoa nao cadastrada     | associar a unidade, sem criar cadastro   |
| nenhum match              | estado `NAO_IDENTIFICADA`                |
| sem internet              | registro local + sincronizacao posterior |

## Invariantes

> Recebimento nunca bloqueia por falha de OCR, rede ou WhatsApp.
> Fallback manual sempre presente.
> Identificador interno proprio sempre gerado.

QR Code e **locator opaco**: nunca autoriza retirada, nunca reativa encomenda
ja retirada.

A foto da etiqueta permanece privada e nao e enviada por WhatsApp no MVP.

## Evidencia gerada

`RECEBIMENTO_REGISTRADO` + foto privada + `origin` (online/offline).

## Depende de

`estrutura-fisica`, `pessoas-vinculos`, `custodia-eventos`, `ocr-matching`,
`offline-sync`.

## Telas

REC-001 a REC-010 · CUS-007, CUS-008. Fase I5 — **depois** de I4.
