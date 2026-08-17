---
name: observabilidade
description: Use when working on structured logging, Sentry, integration health checks, alerts, analytics events, or diagnosing production issues in Custelo.
---

# observabilidade

Log estruturado, Sentry, saude de integracao e alertas. Transversal.

## Invariantes

> Nunca logar dado pessoal, imagem de etiqueta, texto bruto de OCR ou segredo.
> Erro de autorizacao cross-tenant e **sempre** alerta, nunca ruido.

## Stack (ADR-016)

- **Sentry** — erro e performance (web + PWA + servidor)
- **Logs estruturados** — com `request_id`, `org_id` e `empreendimento_id`, sem
  dado pessoal
- **Dashboard do Inngest** — jobs, retries e falhas
- **Better Stack** — uptime e alerta
- **Health check proprio** — estado das integracoes (Meta, OCR, storage)

## Alertas prioritarios

1. job de notificacao falhando de forma persistente
2. webhook da Meta parando de chegar
3. fila de sincronizacao crescendo
4. erro de autorizacao cross-tenant

O quarto merece atencao especial: se virar ruido de log, o produto perde o unico
sinal que denuncia vazamento entre clientes.

## Analytics e separado (ADR-017)

PostHog recebe evento **anonimo e sem PII** — nunca nome, telefone, unidade ou
conteudo de etiqueta. O audit log e o event log de custodia nunca saem do
Postgres.

## Fase

I1 (Sentry e pipeline) e I12 (runbooks, DR, security scan).
