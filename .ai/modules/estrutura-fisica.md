# estrutura-fisica

Empreendimento, areas genericas, unidades e pontos de recebimento. Modulo 02.

## O problema que resolve

O mesmo modelo precisa servir condominio vertical, horizontal, torre comercial e
shopping. Cada um chama a camada intermediaria de um jeito: bloco, torre, quadra,
ala, piso.

## Invariante que nao pode ser violada

> Unidade e o destino operacional obrigatorio. A camada intermediaria e
> **generica** — nunca hardcodar "bloco" ou "torre".

O rotulo da camada intermediaria e configuracao do empreendimento, nao codigo.

## Pontos de recebimento

Um empreendimento pode ter mais de um ponto de recebimento (portaria social,
doca, recepcao comercial). O escopo do porteiro pode ser o ponto, nao o
empreendimento inteiro.

## Depende de / e usado por

Depende de: `tenancy`. E usado por: `pessoas-vinculos`, `recebimento`,
`ocr-matching`, `importacao`.

## Telas

UNI-001 a UNI-004. Fase I3.
