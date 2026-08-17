# Screen Map — indice das 83 telas

**A especificacao tela a tela vive no Notion**, nas quatro subpaginas de telas do
projeto Custelo. Este arquivo e o **indice de execucao**: ID, modulo, superficie,
wave, fase e status. Nao duplicamos as 83 specs aqui de proposito — spec
duplicada diverge, e a que diverge e sempre a que alguem le.

| Fonte             | Onde                                                                                                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spec de cada tela | Notion — _Telas — Autenticacao & OPS_, _Telas — Custodia, Notificacoes, Retirada e Devolucao_, _Telas — WEB (Gestao do Empreendimento)_, _Telas — Organizacao & SaaS Admin_ |
| Tracker de status | Notion — _Roadmap Mestre de Telas & UX/UI_                                                                                                                                  |
| Referencia visual | Penpot, arquivo "Custelo"                                                                                                                                                   |

## Numeros

| Metrica            | Valor                |
| ------------------ | -------------------- |
| Superficies        | 3 (OPS · WEB · SAAS) |
| Modulos            | 12                   |
| **Total de telas** | **83**               |
| MVP                | 77                   |
| Pos-MVP            | 6                    |
| Waves de design    | 8 + 1 de pos-MVP     |
| Componentes-mestre | 53                   |

## Convencao de IDs

`AUTH` autenticacao · `DASH` dashboards · `REC` recebimento · `CUS` custodia ·
`NOT` notificacoes · `RET` retirada · `DEV` devolucao · `UNI` unidades e
estrutura · `PES` pessoas · `IMP` importacao · `USR` usuarios · `AUD` auditoria ·
`REL` relatorios · `CFG` configuracoes · `ORG` organizacao · `SAAS` plataforma ·
`BIL` billing.

> O mesmo ID acompanha o frame no Penpot, a branch no Git e a task de
> desenvolvimento.

## Inventario por bloco

| Bloco | IDs                   | Telas | Superficie       | Modulo                | Wave | Fase de dev  |
| ----- | --------------------- | ----- | ---------------- | --------------------- | ---- | ------------ |
| AUTH  | 001–006               | 6     | OPS + WEB        | 01 Tenancy/Identidade | 01   | I2           |
| AUTH  | 007 (MFA)             | 1     | —                | 01                    | 09   | pos-MVP      |
| REC   | 001–010               | 10    | OPS              | 06 Recebimento        | 02   | I5, I6       |
| CUS   | 001–003, 005, 007–008 | 6     | OPS + WEB        | 07 Custodia           | 03   | I4, I5       |
| CUS   | 004                   | 1     | OPS + WEB        | 07 Correcoes          | 05   | I9           |
| CUS   | 006                   | 1     | —                | 07                    | 09   | pos-MVP      |
| RET   | 001–006               | 6     | OPS + WEB        | 08 Retirada           | 04   | I8           |
| DEV   | 001–003               | 3     | OPS + WEB        | 09 Devolucao          | 04   | I8           |
| NOT   | 001–004               | 4     | WEB              | 04 Comunicacao        | 05   | I7           |
| UNI   | 001–004               | 4     | WEB              | 02 Estrutura Fisica   | 06   | I3           |
| PES   | 001–003               | 3     | WEB              | 03 Pessoas/Vinculos   | 06   | I3           |
| IMP   | 001–004               | 4     | WEB              | 05 Importacao         | 06   | I10          |
| CFG   | 001–008               | 8     | WEB              | 01, 04, 10, 12        | 07   | I7, I11, I12 |
| USR   | 001–003               | 3     | WEB              | 01 Tenancy/Identidade | 07   | I2           |
| DASH  | 001                   | 1     | WEB              | 11 Relatorios         | 08   | I10          |
| DASH  | 002                   | 1     | —                | 11                    | 09   | pos-MVP      |
| AUD   | 001–002               | 2     | WEB              | 10 Auditoria          | 08   | I9           |
| REL   | 001–005               | 5     | WEB              | 11 Relatorios         | 08   | I10          |
| ORG   | 001–004               | 4     | WEB (escopo org) | 01, 12                | 08   | I11          |
| SAAS  | 001–006               | 6     | SAAS             | 12 Administracao SaaS | 08   | I11          |
| SAAS  | 007                   | 1     | —                | 12                    | 09   | pos-MVP      |
| BIL   | 003                   | 1     | SAAS             | 12 Billing            | 08   | I11          |
| BIL   | 001–002               | 2     | —                | 12                    | 09   | pos-MVP      |

**Total: 83.** Pos-MVP (6): `AUTH-007` · `CUS-006` · `DASH-002` · `SAAS-007` ·
`BIL-001` · `BIL-002`.

## Distribuicao por grupo

| Grupo                                                  | Telas | MVP | Pos-MVP |
| ------------------------------------------------------ | ----- | --- | ------- |
| Autenticacao (compartilhada)                           | 7     | 6   | 1       |
| OPS — Recebimento                                      | 10    | 10  | 0       |
| OPS + WEB — Custodia, Notificacao, Retirada, Devolucao | 21    | 20  | 1       |
| WEB — Cadastro, Gestao, Auditoria, Relatorios, Config  | 30    | 30  | 0       |
| Organizacao / Administradora                           | 5     | 4   | 1       |
| SaaS Admin + Billing                                   | 10    | 7   | 3       |

## Regra de estados — leia antes de criar tela

Estados de UI **nao viram telas separadas**. `loading`, `skeleton`, `empty`,
`first-use`, `success`, `validation error`, `network error`, `unauthorized`,
`forbidden`, `offline`, `sync pending`, `partial sync`, `retry`, `destructive
confirmation`, `stale data` e `no results` sao **variantes** da mesma pagina ou
componente.

Obrigatorios por natureza de tela:

| Natureza     | Estados obrigatorios                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| lista        | loading/skeleton · empty · first-use · no results · network error · forbidden |
| formulario   | validation error · success · network error · double-submit bloqueado          |
| qualquer OPS | offline · sync pending · partial sync · retry                                 |
| acao critica | confirmacao destrutiva **com motivo obrigatorio**                             |

## Status de design (16/08/2026)

| Item                               | Status                                     |
| ---------------------------------- | ------------------------------------------ |
| Wave 00 — Foundations              | DONE                                       |
| Wave 01 — Fundacao (AUTH + shells) | DONE                                       |
| Waves 02–08 (MVP)                  | DONE — 77/83 desenhadas                    |
| Wave 09 — Pos-MVP (6 telas)        | NOT_STARTED (nao desenhar antes do piloto) |
| Implementacao em codigo            | **NOT_STARTED — todas as 83**              |

Pendencia de design conhecida: componentes-mestre estao na pagina "02 — OPS" em
vez de "01 — Components"; `Auth/Hero` fora de sincronia com AUTH-001;
`Status/StatusBadge` perde o icone quando sobrescrito.

## Regra de entrada em desenvolvimento

> Nenhuma tela entra em `READY` para dev antes de `APPROVED` no design, e o
> design roda a frente do desenvolvimento em pelo menos uma wave.

Alem disso, a tela so comeca quando a **fase** do Implementation Roadmap que a
habilita estiver entregue. Ver `docs/product/implementation-roadmap.md`.

Use `/tela <ID>` para iniciar o trabalho em uma tela com essas checagens.
