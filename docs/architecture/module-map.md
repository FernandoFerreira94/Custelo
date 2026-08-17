# Superficies e Module Map

## Superficies

**3 superficies logicas, 1 codebase, 1 deploy.**

| ID   | Superficie                    | Route group | Usuarios                                        | Rendering         | Offline                      |
| ---- | ----------------------------- | ----------- | ----------------------------------------------- | ----------------- | ---------------------------- |
| OPS  | Custelo Ops — PWA operacional | `(ops)`     | Recepcionista/Porteiro                          | client-side       | sim, limitado ao recebimento |
| WEB  | Custelo Web — gestao          | `(web)`     | Gestor · Administrador da Organizacao · Auditor | Server Components | nao                          |
| SAAS | Custelo SaaS Admin            | `(saas)`    | Super Admin (Webcodeff)                         | Server Components | nao                          |

**Administradora nao e uma quarta superficie.** E um modo de escopo do painel
web: o contexto passa a ser a organizacao em vez de um empreendimento unico, com
navegacao e dashboard proprios. ORG e SAAS reusam `Shell/WebShell`.

### Nao existem no MVP

App do morador (decisao de produto) · portal publico de consulta · API
publica/webhooks para terceiros (pos-MVP) · ferramenta de suporte separada (o
acesso JIT vive dentro do SAAS).

### Sobreposicao OPS × WEB

Fila de custodia, detalhe da encomenda, retirada e devolucao existem nas duas.
Portaria opera pelo celular; gestao resolve excecao pelo desktop.

> A regra nunca e duplicada — muda apenas o shell e a densidade.

## Module Map — 12 bounded contexts

| #   | Modulo                      | Superficies      | Depende de | MVP          | Skill                                         |
| --- | --------------------------- | ---------------- | ---------- | ------------ | --------------------------------------------- |
| 01  | Tenancy & Identidade        | WEB · SAAS · OPS | —          | sim          | `tenancy`, `auth-rbac`                        |
| 02  | Estrutura Fisica & Unidades | WEB              | 01         | sim          | `estrutura-fisica`                            |
| 03  | Pessoas & Vinculos          | WEB · OPS        | 02         | sim          | `pessoas-vinculos`                            |
| 04  | Contatos & Comunicacao      | WEB              | 03         | sim          | `whatsapp`                                    |
| 05  | Cadastro & Importacao       | WEB              | 02, 03     | sim          | `importacao`                                  |
| 06  | Recebimento & Identificacao | OPS              | 02, 03, 12 | sim          | `recebimento`, `ocr-matching`, `offline-sync` |
| 07  | Correcoes & Custodia        | OPS · WEB        | 06         | sim          | `custodia-eventos`, `correcoes`               |
| 08  | Retirada                    | OPS · WEB        | 07         | sim          | `retirada`                                    |
| 09  | Devolucao                   | OPS · WEB        | 07         | sim          | `devolucao`                                   |
| 10  | Auditoria                   | WEB              | todos      | sim          | `auditoria`, `retencao-lgpd`                  |
| 11  | Relatorios & Operacao       | WEB              | 07, 08, 09 | sim          | `relatorios` (sem skill propria)              |
| 12  | Administracao SaaS & Planos | SAAS             | 01         | sim (minimo) | `billing-entitlements`                        |

Transversais sem numero de modulo: `observabilidade`, `ui-ops-pwa`.

O modulo 07 (Correcoes & Custodia) e o **contexto central e transversal**: e dele
que sai o diferencial defensavel do produto.

## Camadas no codigo

```
src/
  app/(ops) (web) (saas) (auth) api/   adaptadores de entrega
  application/                          casos de uso        ← puro
  domain/                               regras e invariantes ← puro
  ports/                                contratos de fornecedor
  infrastructure/                       implementacoes das portas  ← unico lugar com SDK
  db/                                   schema Drizzle + migrations
  components/ui shell ops web           UI
  lib/                                  utilitarios, env
```

A regra de ESLint em `eslint.config.mjs` bloqueia import de Next, React, Drizzle,
Supabase, Inngest, Dexie, Sentry e PostHog dentro de `domain/` e `application/`.
Nao contorne com `eslint-disable`: essa fronteira e o que o ADR-001 aponta como
principal risco do monorepo de app unico.

## Ordem de nascimento

`tenancy`, `auth-rbac` e `custodia-eventos` sao pre-requisito de qualquer outro
modulo e devem ser os primeiros a existir. Ver
`docs/product/implementation-roadmap.md`.
