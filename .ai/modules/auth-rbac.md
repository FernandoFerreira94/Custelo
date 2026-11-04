# auth-rbac

Sessao, papeis, escopo por empreendimento e acoes de permissao elevada.
Modulo 01.

## Papeis

| Papel                        | Escopo                    |
| ---------------------------- | ------------------------- |
| Super Admin (Webcodeff)      | plataforma                |
| Administrador da Organizacao | conta                     |
| Gestor do Empreendimento     | empreendimento            |
| Recepcionista / Porteiro     | empreendimento            |
| Auditor / Consulta           | leitura, escopo concedido |

Morador **nao tem login** no MVP.

## Acoes de permissao elevada (DEFINED)

Restritas a Gestor do Empreendimento e Administrador da Organizacao, sempre
auditaveis, nunca apagando o evento original:

- trocar unidade/destinatario **apos** notificacao
- cancelar registro
- alterar registro **apos** a retirada
- corrigir retirada ou devolucao
- enviar notificacao fora da janela

Recepcionista nao faz nenhuma delas. Isso e testado, nao presumido.

## Invariante que nao pode ser violada

> Autorizacao e server-side. Nunca confiar em papel vindo do cliente.

## Revogacao imediata (ADR-005)

JWT e stateless, entao "desativacao imediata" nunca e instantanea sozinha.
O modelo aceito:

- access token de vida curta (15 min);
- revogacao do refresh token no ato;
- checagem de `user_status` no servidor em **toda escrita** e em toda acao
  critica.

Escopo por empreendimento vive em tabela propria, nao apenas no claim — claim
antigo nao pode conceder acesso a empreendimento removido.

## Identidade

Conta compartilhada de portaria e risco alto identificado no discovery.
Identidade individual e obrigatoria: sem ela, nenhuma evidencia aponta para uma
pessoa.

MFA / step-up e **pos-MVP** (AUTH-007), ja identificado como candidato para
correcoes criticas.

## Suporte

Acesso cross-tenant de suporte e JIT, escopado, expiravel e **auditado** —
aparece na auditoria do cliente (SAAS-004).

## Telas

AUTH-001 a AUTH-006 · USR-001 a USR-003. Fase I2.
