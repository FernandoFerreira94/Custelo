# auditoria

Trilha de acoes criticas, timeline por encomenda e por unidade. Modulo 10.

## Invariantes

> Nada de critico desaparece silenciosamente.
> Acesso cross-tenant de suporte e **sempre** registrado.

## O que entra no audit log

Toda acao de permissao elevada: troca de unidade/destinatario apos notificacao,
cancelamento, alteracao apos retirada, correcao de retirada ou devolucao, envio
fora da janela. Mais: mudanca de papel, desativacao de usuario, exportacao,
offboarding e acesso JIT de suporte.

Cada entrada registra quem, quando, o que mudou (valor anterior e novo), motivo
e origem.

## Separacao que nao pode ser confundida (ADR-017)

O audit log e o event log de custodia vivem **exclusivamente no Postgres** e
nunca sao enviados a ferramenta de analytics.

Confundir os dois seria grave: evidencia juridica nao pode depender de um SaaS
de produto, e telemetria nao pode carregar dado pessoal de morador.

## Timeline

Duas visoes: por encomenda (o que aconteceu com este volume) e por unidade (o
que aconteceu com esta unidade). Legibilidade e requisito — a timeline e o que
resolve disputa.

## Telas

AUD-001, AUD-002. Fase I9.
