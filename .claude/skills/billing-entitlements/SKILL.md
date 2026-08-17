---
name: billing-entitlements
description: Use when working on SaaS plans, entitlements, usage limits, metering, account suspension, or the SaaS admin surface in Custelo.
---

# billing-entitlements

Planos, limites e metering de consumo. Modulo 12.

## Invariantes

> Entitlement nunca e derivado do nome comercial do plano.
> Recurso de seguranca e evidencia **nunca** e gated por plano.

A segunda e uma decisao de produto, nao tecnica: audit log, RLS, imutabilidade de
evento e exportacao de evidencia existem em todo plano. Vender seguranca como
upgrade seria vender um produto quebrado no plano de baixo.

## Metering

Consumo de WhatsApp por empreendimento contado desde o primeiro dia. Custo
variavel por empreendimento precisa ser visivel em producao antes de qualquer
decisao de repasse.

## Aberto

Modelo de cobranca e DEFINED como direcao; preco final e custo Meta permanecem
hipotese (G6 — OPEN QUESTION). Provedor de billing ainda nao decidido.
Nenhum dado de cartao e armazenado pela plataforma.

## Acesso de suporte

Super Admin ve **metadados** de contrato. O caminho para dado operacional de um
cliente passa obrigatoriamente por acesso JIT (SAAS-004), que aparece na
auditoria daquele cliente.

Super Admin nunca faz hard delete de evidencia operacional.

## Telas

SAAS-001 a SAAS-006 · BIL-003 · ORG-001 a ORG-004. Fase I11.
Pos-MVP: SAAS-007, BIL-001, BIL-002.
