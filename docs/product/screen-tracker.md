# Screen & Execution Tracker

Indice operacional das **83 telas**. Spec completa (dados, validacoes, regras,
permissoes, estados) vive no Notion — duplicar aqui diverge.

> **Roadmap operacional (conteudo + status + regra de atualizacao):**
> `docs/product/pages-roadmap.md`

| Camada                 | Onde                                                              |
| ---------------------- | ----------------------------------------------------------------- |
| Spec tela a tela       | Notion, quatro paginas de telas (`docs/workflow/notion-pages.md`) |
| Roadmap + conteudo     | `docs/product/pages-roadmap.md`                                   |
| Status (CSV)           | `docs/product/screen-tracker.csv`                                 |
| Este arquivo           | inventario detalhado por wave (rotas, backend, tipos)             |
| Importar para o Notion | CSV acima → _Roadmap Mestre de Telas_                             |
| Comando de trabalho    | `/tela <ID>`                                                      |

## Como acompanhar

1. Design (Penpot, nao Figma) chega a `APPROVED`.
2. A fase do Implementation Roadmap que habilita a tela esta **entregue**.
3. Frontend marca `READY` → `IN_PROGRESS` → `REVIEW` → `DONE`.
4. Backend da dependencia correspondente precisa estar `DONE` (ou a tela e so leitura de algo ja existente).
5. Testes: unit/ui com o codigo; `test:rls` se toca dado; e2e/a11y se toca UI.

Nenhuma tela entra em `READY` de frontend antes de `APPROVED` no design **e** da
fase habilitadora.

## Legenda de status

Design: `NOT_STARTED` · `IN_PROGRESS` · `REVIEW` · `APPROVED`  
Desenvolvimento: `NOT_STARTED` · `READY` · `IN_PROGRESS` · `REVIEW` · `DONE` · `BLOCKED`

Em 18/08/2026: design MVP `APPROVED` (77/83 no Penpot); desenvolvimento **todas**
`NOT_STARTED`. Pos-MVP (`AUTH-007` `CUS-006` `DASH-002` `SAAS-007` `BIL-001`
`BIL-002`) permanece `NOT_STARTED` no design de proposito.

## Contrato de spec (o que `/tela` exige antes de codigo)

Para cada ID, a spec no Notion precisa responder:

ID · nome · superficie · modulo · rota · objetivo · usuario · dados ·
componentes · acoes · validacoes · regras · permissoes · estados (loading,
empty, error, offline, sucesso) · dependencias · API/modulo backend · origem ·
destino · MVP · prioridade · status Design · status Development.

Estados **nao** viram rota. Ver `docs/product/screen-map.md`.

## Waves (Penpot — nao ha Figma)

AD-010: o arquivo de design e o Penpot "Custelo". Waves abaixo sao a ordem de
desenho, ja concluida no MVP.

| Wave | Tema                   | IDs                                                                             | Qtde |
| ---- | ---------------------- | ------------------------------------------------------------------------------- | ---- |
| 00   | Foundations            | tokens, shells, 53 componentes-mestre                                           | —    |
| 01   | Auth + shells          | AUTH-001..006                                                                   | 6    |
| 02   | Recebimento            | REC-001..010                                                                    | 10   |
| 03   | Custodia               | CUS-001, 002, 003, 005, 007, 008                                                | 6    |
| 04   | Retirada e devolucao   | RET-001..006 · DEV-001..003                                                     | 9    |
| 05   | Notificacao e correcao | NOT-001..004 · CUS-004                                                          | 5    |
| 06   | Cadastro               | UNI-001..004 · PES-001..003 · IMP-001..004                                      | 11   |
| 07   | Gestao e config        | CFG-001..008 · USR-001..003                                                     | 11   |
| 08   | Relatorios, org, SaaS  | DASH-001 · AUD-001..002 · REL-001..005 · ORG-001..004 · SAAS-001..006 · BIL-003 | 19   |
| 09   | Pos-MVP                | AUTH-007 · CUS-006 · DASH-002 · SAAS-007 · BIL-001 · BIL-002                    | 6    |

Wave 00 + 01–08 = foundations + 77 telas MVP. Wave 09 = 6 pos-MVP. Total 83.

## Inventario compacto

Tipo: `tela` tem rota; `sheet` e bottom sheet sobre a base; `dialog` e confirmacao.

Nomes abaixo vem dos fluxos e skills do repo. Onde a spec Notion for mais
precisa, a spec Notion vence.

### AUTH — I2 · Wave 01

| ID       | Nome                | Superficie | Tipo | Rota planejada       | Usuario           | Origem → destino             |
| -------- | ------------------- | ---------- | ---- | -------------------- | ----------------- | ---------------------------- |
| AUTH-001 | Entrar              | AUTH       | tela | `/(auth)/entrar`     | operador / gestor | → AUTH-005                   |
| AUTH-002 | Convite / 1o acesso | AUTH       | tela | `/(auth)/convite`    | convidado         | e-mail → AUTH-001            |
| AUTH-003 | Recuperar senha     | AUTH       | tela | `/(auth)/recuperar`  | operador / gestor | AUTH-001 → e-mail            |
| AUTH-004 | Definir senha       | AUTH       | tela | `/(auth)/senha`      | convidado         | convite → AUTH-001           |
| AUTH-005 | Selecionar contexto | AUTH       | tela | `/(auth)/contexto`   | multi-empreend.   | AUTH-001 → OPS ou WEB        |
| AUTH-006 | Sem acesso          | AUTH       | tela | `/(auth)/sem-acesso` | qualquer          | sessao invalida / sem escopo |
| AUTH-007 | MFA / step-up       | AUTH       | tela | pos-MVP              | acao elevada      | —                            |

### OPS — Recebimento · I5/I6 · Wave 02

| ID      | Nome                         | Tipo  | Rota planejada               | Backend                          |
| ------- | ---------------------------- | ----- | ---------------------------- | -------------------------------- |
| REC-001 | Inicio / atalho de captura   | tela  | `/(ops)/receber`             | recebimento                      |
| REC-002 | Captura da etiqueta          | tela  | `/(ops)/receber/captura`     | upload assinado + LabelExtractor |
| REC-003 | Confirmacao de identificacao | tela  | `/(ops)/receber/confirmar`   | matching                         |
| REC-004 | Escolher unidade             | sheet | sobre REC-003                | estrutura-fisica                 |
| REC-005 | Escolher pessoa              | sheet | sobre REC-003                | pessoas-vinculos                 |
| REC-006 | Entrada manual               | sheet | sobre REC-003                | recebimento                      |
| REC-007 | Localizacao fisica           | tela  | `/(ops)/receber/local`       | custodia                         |
| REC-008 | Conclusao / QR               | tela  | `/(ops)/receber/concluir`    | custodia + QR                    |
| REC-009 | Fila local (offline)         | tela  | `/(ops)/pendencias`          | offline-sync                     |
| REC-010 | Resolver conflito            | tela  | `/(ops)/pendencias/conflito` | offline-sync                     |

### Custodia · I4/I5/I9 · Waves 03 e 05

| ID      | Nome                 | Superficie | Tipo  | Rota OPS / WEB                                      |
| ------- | -------------------- | ---------- | ----- | --------------------------------------------------- |
| CUS-001 | Fila de custodia     | OPS + WEB  | tela  | `/(ops)/fila` · `/(web)/custodia`                   |
| CUS-002 | Detalhe da encomenda | OPS + WEB  | tela  | `/(ops)/encomendas/[id]` · `/(web)/encomendas/[id]` |
| CUS-003 | Timeline             | OPS + WEB  | tela  | detalhe, aba/secao                                  |
| CUS-004 | Correcao critica     | OPS + WEB  | sheet | sobre CUS-002                                       |
| CUS-005 | Movimentacao interna | OPS + WEB  | sheet | sobre CUS-001/002                                   |
| CUS-006 | (pos-MVP)            | —          | tela  | Wave 09                                             |
| CUS-007 | Nao identificadas    | OPS + WEB  | tela  | `/(ops)/pendencias/nao-identificadas`               |
| CUS-008 | Etiqueta / QR        | OPS        | tela  | a partir de CUS-002                                 |

### Retirada e devolucao · I8 · Wave 04

| ID      | Nome                        | Tipo  | Rota OPS                       |
| ------- | --------------------------- | ----- | ------------------------------ |
| RET-001 | Selecionar encomendas (1:N) | tela  | `/(ops)/retirada`              |
| RET-002 | Quem recebeu                | tela  | `/(ops)/retirada/destinatario` |
| RET-003 | Assinatura                  | tela  | `/(ops)/retirada/assinatura`   |
| RET-004 | Comprovante                 | tela  | `/(ops)/retirada/comprovante`  |
| RET-005 | Historico de retiradas      | tela  | WEB + OPS                      |
| RET-006 | Corrigir retirada (elevado) | tela  | sobre RET-005 / CUS-002        |
| DEV-001 | Registrar devolucao         | tela  | `/(ops)/devolucao`             |
| DEV-002 | Motivo e evidencia          | sheet | sobre DEV-001                  |
| DEV-003 | Confirmacao de devolucao    | tela  | `/(ops)/devolucao/confirmar`   |

### Notificacoes · I7 · Wave 05

| ID      | Nome                        | Superficie | Tipo  |
| ------- | --------------------------- | ---------- | ----- |
| NOT-001 | Lista de notificacoes       | WEB        | tela  |
| NOT-002 | Detalhe / tentativas        | WEB        | tela  |
| NOT-003 | Falhas e alertas            | WEB        | tela  |
| NOT-004 | Envio manual fora da janela | WEB        | sheet |

### WEB cadastro · I3/I10 · Wave 06

| ID      | Nome                         | Rota planejada                   |
| ------- | ---------------------------- | -------------------------------- |
| UNI-001 | Estrutura do empreendimento  | `/(web)/estrutura`               |
| UNI-002 | Unidades                     | `/(web)/unidades`                |
| UNI-003 | Area generica                | `/(web)/estrutura/areas`         |
| UNI-004 | Pontos de recebimento        | `/(web)/pontos`                  |
| PES-001 | Pessoas                      | `/(web)/pessoas`                 |
| PES-002 | Vinculos                     | `/(web)/pessoas/[id]/vinculos`   |
| PES-003 | Detalhe da pessoa / contatos | `/(web)/pessoas/[id]`            |
| IMP-001 | Upload da planilha           | `/(web)/importacao`              |
| IMP-002 | Preview e normalizacao       | `/(web)/importacao/[lote]`       |
| IMP-003 | Inconsistencias              | `/(web)/importacao/[lote]/erros` |
| IMP-004 | Relatorio do lote            | `/(web)/importacao/[lote]/ok`    |

### WEB gestao · I2/I7/I11/I12 · Wave 07

| ID      | Nome                      | Fase | Backend       |
| ------- | ------------------------- | ---- | ------------- |
| USR-001 | Usuarios                  | I2   | auth-rbac     |
| USR-002 | Papeis e escopo           | I2   | auth-rbac     |
| USR-003 | Convite                   | I2   | auth-rbac     |
| CFG-001 | Empreendimento / geral    | I11  | tenancy       |
| CFG-002 | Janelas de notificacao    | I7   | whatsapp      |
| CFG-003 | Templates                 | I7   | whatsapp      |
| CFG-004 | Conexao WhatsApp          | I7   | whatsapp      |
| CFG-005 | Aging                     | I11  | custodia      |
| CFG-006 | Preferencias operacionais | I11  | tenancy       |
| CFG-007 | Entitlements visiveis     | I11  | billing       |
| CFG-008 | Retencao e offboarding    | I12  | retencao-lgpd |

### Relatorios, auditoria, org, SaaS · I9–I11 · Wave 08

| ID       | Nome                      | Superficie | Fase |
| -------- | ------------------------- | ---------- | ---- |
| DASH-001 | Dashboard do gestor       | WEB        | I10  |
| DASH-002 | Dashboard avancado        | WEB        | pos  |
| AUD-001  | Trilha de auditoria       | WEB        | I9   |
| AUD-002  | Acessos e exportacoes     | WEB        | I9   |
| REL-001  | Relatorio operacional     | WEB        | I10  |
| REL-002  | Relatorio de notificacoes | WEB        | I10  |
| REL-003  | Relatorio de retiradas    | WEB        | I10  |
| REL-004  | Relatorio de excecoes     | WEB        | I10  |
| REL-005  | Exportacao por periodo    | WEB        | I10  |
| ORG-001  | Home da organizacao       | WEB (org)  | I11  |
| ORG-002  | Empreendimentos da conta  | WEB (org)  | I11  |
| ORG-003  | Usuarios da organizacao   | WEB (org)  | I11  |
| ORG-004  | Offboarding da conta      | WEB (org)  | I11  |
| SAAS-001 | Contas                    | SAAS       | I11  |
| SAAS-002 | Planos                    | SAAS       | I11  |
| SAAS-003 | Limites / entitlements    | SAAS       | I11  |
| SAAS-004 | Acesso JIT                | SAAS       | I11  |
| SAAS-005 | Saude de integracoes      | SAAS       | I11  |
| SAAS-006 | Metering                  | SAAS       | I11  |
| SAAS-007 | (pos-MVP)                 | SAAS       | pos  |
| BIL-001  | Billing self-service      | SAAS       | pos  |
| BIL-002  | Invoices / portal         | SAAS       | pos  |
| BIL-003  | Consumo (admin)           | SAAS       | I11  |

## Contagem

| Superficie                        | Telas (incl. sheets)       | MVP | Pos-MVP |
| --------------------------------- | -------------------------- | --- | ------- |
| AUTH compartilhada                | 7                          | 6   | 1       |
| OPS (recebimento + sheets + fila) | 10 REC + parte CUS/RET/DEV | —   | —       |
| OPS + WEB sobrepostas             | ver module-map             | —   | —       |
| WEB gestao                        | ver inventario             | 30+ | —       |
| SAAS                              | 10                         | 7   | 3       |
| **Total**                         | **83**                     | 77  | 6       |
