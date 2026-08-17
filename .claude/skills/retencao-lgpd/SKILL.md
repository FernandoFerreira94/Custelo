---
name: retencao-lgpd
description: Use when working on the data retention engine, per-category retention, data export, anonymization, offboarding, or LGPD obligations in Custelo.
---

# retencao-lgpd

Motor de retencao por categoria, exportacao e offboarding. Modulos 10 e 12.

## Invariantes

> Sem hard delete de evidencia.
> Prazo vem de **configuracao**, nunca hardcoded.
> Exclusao gera evidencia do proprio expurgo.

## Regra que define a fase

O **mecanismo** e construido agora, parametrizavel. Os **prazos** entram como
configuracao quando o juridico definir.

> O sistema nao vai a producao com prazo inventado.

## Categorias com politica propria

| Categoria                          | Direcao                 |
| ---------------------------------- | ----------------------- |
| foto da etiqueta                   | prazo curto             |
| assinatura e evidencia de retirada | prazo maior             |
| eventos de custodia                | prazo maior             |
| logs tecnicos                      | prazo reduzido          |
| cadastro                           | enquanto houver vinculo |

## Fluxo F8 — offboarding

bloquear novos lancamentos na data acordada → exportacao estruturada em janela
limitada → aplicar retencao, exclusao ou anonimizacao por categoria → registrar
evidencia do encerramento.

## Conflito conhecido, nao resolvido

Backup versus direito de exclusao. A janela de permanencia em backup precisa ser
documentada e tratada com o juridico — nao inventar resposta no codigo.

## Aberto (OPEN QUESTION JURIDICA)

Controlador x operador · prazos exatos · DPA e lista de subprocessadores ·
transferencia internacional (OCR, storage, PostHog, Meta). Revisao juridica
LGPD/contratual e **obrigatoria antes da producao**.

## Telas

CFG-008. Fase I12 — antes do piloto.
