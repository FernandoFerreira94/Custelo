# importacao

Importacao assistida com preview, inconsistencias e confirmacao humana.
Modulo 05.

## Fluxo F7

upload → leitura → normalizacao → preview → inconsistencias/duplicidades →
correcao → **confirmacao humana** → importacao.

## Invariantes

> A IA **nunca** grava silenciosamente.
> Importacao so grava apos confirmacao humana.

Nao existe "importar tudo e corrigir depois". O preview e obrigatorio, e a lista
de inconsistencias e parte do produto, nao um log de debug.

## Por que importa

Cadastro desatualizado e uma das causas raiz do problema que o produto resolve.
Onboarding ruim gera cadastro ruim, que gera aviso a ex-morador — a reclamacao
que mais destroi confianca.

## Criterio de sucesso

Onboarding de um empreendimento real de ponta a ponta **sem suporte**
(Implementation Roadmap, I10).

## Formatos

Excel, CSV e PDF, com IA assistiva na leitura e normalizacao. A IA sugere o
mapeamento de colunas; o humano confirma.

## Telas

IMP-001 a IMP-004. Fase I10.
