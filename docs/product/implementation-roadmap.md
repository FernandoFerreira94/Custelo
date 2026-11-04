# Implementation Roadmap

Ordem de construcao **por dependencia arquitetural e risco** — nao por ordem de
tela.

| Fase                              | Entrega                                                                                                                                                        | Skills                                    | Telas habilitadas                                          | Exit criteria                                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **I1** Fundacao tecnica           | repo, Next+TS, Tailwind+shadcn, Drizzle, ambientes dev/staging/prod, CI, Sentry, Inngest conectado                                                             | `observabilidade`                         | —                                                          | deploy reproduzivel nos 3 ambientes e pipeline verde                                          |
| **I2** Tenancy, auth e RLS        | conta, empreendimento, usuario, papel, escopo, claims, RLS em todas as tabelas base, revogacao de sessao                                                       | `tenancy` `auth-rbac`                     | AUTH-001..006 · USR-001..003                               | **testes negativos cross-tenant passando — o gate mais importante do projeto**                |
| **I3** Estrutura fisica e pessoas | areas genericas, unidades, pessoas, vinculos com vigencia, contatos ordenados                                                                                  | `estrutura-fisica` `pessoas-vinculos`     | UNI-001..004 · PES-001..003                                | cadastro manual completo com escopo correto                                                   |
| **I4** Cadeia de custodia         | encomenda, `custody_events` append-only com UPDATE/DELETE revogados, maquina de estados, aging derivado                                                        | `custodia-eventos`                        | CUS-001, 002, 003, 005                                     | teste provando que evento nao pode ser alterado nem pela service role da aplicacao            |
| **I5** Recebimento e OCR          | PWA shell, camera, upload por URL assinada, porta `LabelExtractor`, matching deterministico, fallback manual, QR                                               | `recebimento` `ocr-matching` `ui-ops-pwa` | REC-001..008 · CUS-007, 008                                | lote real registrado dentro da meta de segundos por item, com OCR ligado **e** desligado      |
| **I6** Offline e sincronizacao    | Dexie, fila local, UUIDv7, dois timestamps, idempotencia, deteccao e resolucao de conflito                                                                     | `offline-sync`                            | REC-009, 010                                               | ciclo offline→sync sob conflito sem perda de evidencia; teste de reenvio duplicado            |
| **I7** Comunicacao                | porta `MessagingProvider`, Cloud API, Embedded Signup, templates, janelas com espera duravel, consolidacao, webhook idempotente, cascata de contatos, metering | `whatsapp`                                | NOT-001..004 · CFG-002, 003, 004                           | falha de envio visivel como estado, com retry, alerta e consumo contabilizado                 |
| **I8** Saida da custodia          | retirada 1:N, assinatura, comprovante, devolucao com motivo                                                                                                    | `retirada` `devolucao`                    | RET-001..006 · DEV-001..003                                | retirada funcionando inclusive com item nao sincronizado; teste de dupla retirada concorrente |
| **I9** Correcoes e auditoria      | correcao critica com motivo, mensagem neutra, audit log, timeline                                                                                              | `correcoes` `auditoria`                   | CUS-004 · AUD-001, 002                                     | matriz de permissoes testada: Recepcionista nao corrige, nao cancela, nao altera retirada     |
| **I10** Cadastro em escala        | importacao assistida completa, dashboards e relatorios                                                                                                         | `importacao`                              | IMP-001..004 · DASH-001 · REL-001..005                     | onboarding de um empreendimento real ponta a ponta **sem suporte**                            |
| **I11** Plataforma SaaS           | admin de organizacoes, planos, entitlements, acesso JIT auditado, saude e metering                                                                             | `billing-entitlements`                    | ORG-001..004 · SAAS-001..006 · BIL-003 · CFG-001, 005..007 | custo variavel por empreendimento visivel em producao                                         |
| **I12** Hardening                 | motor de retencao parametrizavel, offboarding, backup/restore testado, DR, runbooks, security scan                                                             | `retencao-lgpd` `observabilidade`         | CFG-008                                                    | **restore real testado e documentado**; retencao aplicando prazos configurados                |
| **I13** Piloto e Go-Live          | operacao real em um empreendimento, sem caderno paralelo                                                                                                       | todas                                     | —                                                          | Stop-Ship completo aprovado                                                                   |

## Dependencias que nao podem ser invertidas

- **I2 antes de qualquer coisa com dado.** Escrever tabela de dominio antes da
  RLS estar de pe significa retrofit de seguranca — o pior tipo de divida neste
  produto.
- **I4 antes de I5.** O recebimento produz eventos; sem o log imutavel pronto,
  o recebimento nasce sem cadeia de custodia.
- **I6 logo apos I5, nao no fim.** A sincronizacao define ids, timestamps e
  idempotencia que atravessam todo o modelo. Deixar para o fim obriga a
  reescrever I4 e I5.
- **I7 depois de I4.** Notificacao e consequencia de evento, nunca a origem dele.
- **I8 depois de I6.** A retirada precisa lidar com item ainda nao sincronizado
  desde o primeiro dia.
- **I12 antes do piloto.** Ir a producao sem restore testado e stop-ship.

## Relacao design → desenvolvimento

| Wave de design | Alimenta |
| -------------- | -------- |
| 01             | I1, I2   |
| 02             | I5, I6   |
| 03             | I4       |
| 04             | I8       |
| 05             | I7, I9   |
| 06 e 07        | I3, I10  |
| 08             | I10, I11 |

O design roda a frente do desenvolvimento em pelo menos uma wave. Design MVP
esta em 77/83; desenvolvimento esta em I2 (AUTH), nao em zero.

## Onde estamos

**04/11/2026: I2 entregue; migracao das telas para a WebCode UI em andamento.**
Execucao pelo plano mestre `docs/superpowers/plans/2026-11-04-plano-mestre-pacotezap.md`
(Parte 1 = migracao de UI → Fase 0 → I3 … I13). Esta pagina continua sendo o mapa
de fases e dependencias; o plano mestre tem as tasks. Contas de nuvem ainda sao
passo humano (`docs/workflow/environments.md`). Fatia operacional: `.ai/roadmap.md`.
