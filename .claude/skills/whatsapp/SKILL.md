---
name: whatsapp
description: Use when working on the MessagingProvider port, WhatsApp Cloud API, message templates, notification windows, consolidation, retries, delivery webhooks, or contact cascade in Custelo.
---

# whatsapp

Porta `MessagingProvider`, templates, janelas, consolidacao, retries e webhook.
Modulo 04.

## Desenho (ADR-015)

WhatsApp Cloud API **direta** da Meta, com Embedded Signup para conectar o numero
de cada empreendimento. BSP foi descartado: markup por mensagem sobre uma
politica de repasse que ainda e OPEN QUESTION pioraria uma decisao nao tomada.

Rota de fuga: a porta permite subir o piloto via BSP se a verificacao Meta
atrasar.

## Arquitetura de envio

evento de dominio → job Inngest → **espera ate a janela do empreendimento** →
consolidacao por unidade → envio com chave de idempotencia → webhook de status
atualiza a notificacao → falha dispara retry e, apos a politica, o proximo
contato.

A espera durativa e a razao de existir do Inngest neste projeto (ADR-009): a
regra e literalmente "segure esta notificacao ate o proximo horario permitido".

## Invariantes

> Uma mensagem consolidada por unidade.
> Falha e estado visivel, nunca silencio.
> Nunca enviar foto, CPF, telefone, QR ou tracking completo.
> Envio fora da janela exige permissao elevada.

## Cascata de contatos (F2)

contato principal → proximo contato → nova tentativa posterior → apos duas
tentativas sem sucesso **nao bloquear a encomenda** e gerar alerta para
confirmar/atualizar o contato.

Estados do contato: `VALIDO · FALHA · PRECISA_CONFIRMACAO`. Transicao proibida:
contato em falha usado indefinidamente sem alerta.

## Estados da notificacao

`AGENDADA · ENVIADA · STATUS_PROVIDER · FALHOU · CANCELADA_POR_CORRECAO`

Proibido: falha convertida silenciosamente em sucesso; reenvio sem registro.
Timeout de envio nunca vira sucesso nem falha sem autoridade suficiente — a
incerteza e modelada explicitamente.

## Webhook

Validacao de assinatura · dedup por `message_id` · tolerante a duplicata e a
mensagem fora de ordem. Duplicado e comportamento esperado do provedor.

## Metering

Contagem de conversas/mensagens por empreendimento gravada **desde o primeiro
dia**. Sem isso a decisao comercial de repasse nunca tera dado real.

## Telas

NOT-001 a NOT-004 · CFG-002, CFG-003, CFG-004. Fase I7 — depois de I4.
