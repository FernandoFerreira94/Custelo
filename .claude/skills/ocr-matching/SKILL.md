---
name: ocr-matching
description: Use when working on the LabelExtractor port, OCR text extraction, unit/person matching, normalization, similarity scoring, or confidence levels in Custelo.
---

# ocr-matching

Porta `LabelExtractor`, normalizacao, similaridade e niveis de confianca.
Modulo 06.

## Desenho (ADR-014)

O provedor devolve **texto**. Quem interpreta e o nosso codigo.

Matching deterministico local contra a lista de unidades e pessoas **daquele
empreendimento** — normalizacao + similaridade. Modelo multimodal extraindo
campos estruturados foi descartado: custo, latencia, privacidade e — decisivo —
impossibilidade de explicar por que errou.

Matching contra o cadastro do proprio empreendimento e mais preciso que um
modelo generalista, e e auditavel.

## Invariante que nao pode ser violada

> Unidade/endereco e filtro primario; o nome e o segundo sinal.
> IA sugere, humano confirma. IA nunca decide custodia ou retirada.

## Politica operacional

- timeout 4s, 1 retry, depois cai direto no fallback manual **sem travar a tela**
- confianca alta / media / baixa mapeada para o comportamento de UI ja definido
- a tela `Capture/OCRConfidence` existe justamente para que o OCR nao vire
  armadilha: mostra o que a maquina leu e o quanto ela confia

## Privacidade

- exigir do fornecedor **nao retencao** da imagem
- nunca logar a imagem nem o texto extraido bruto
- registrar apenas campos extraidos e nivel de confianca

A etiqueta pode conter CPF, telefone, e-mail, barcode e numero de pedido. Ela e
dado sensivel, nao metadado.

## Aberto

Fornecedor especifico e OPEN QUESTION. Criterio: nao retencao · latencia < 2s
p95 · custo por imagem · regiao de processamento. A porta ja existe, entao isso
nao bloqueia implementacao.

## Telas

REC-002, REC-003. Fase I5.
