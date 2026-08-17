# Roadmap de backend

Backend nao tem telas. A unidade de trabalho aqui e **modulo → capacidades**:
endpoints, comandos, consultas, eventos, jobs, webhooks e tabelas.

Nada abaixo esta implementado. Isto e o mapa do que vai existir.

---

## 01 · Tenancy & Identidade — fase I2

**Responsabilidade** conta contratante, plano, empreendimentos, usuarios, papeis,
escopo e isolamento de dados.

|                 |                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Commands        | criar organizacao · criar empreendimento · convidar usuario · atribuir papel e escopo · desativar usuario · revogar sessao                |
| Queries         | contexto do usuario autenticado · empreendimentos acessiveis · usuarios do escopo                                                         |
| Eventos         | `USUARIO_CONVIDADO` `USUARIO_DESATIVADO` `PAPEL_ALTERADO` `ESCOPO_ALTERADO`                                                               |
| Endpoints       | Auth Hook do Supabase (claims) · callbacks de sessao                                                                                      |
| Tabelas         | `organizacoes` `empreendimentos` `usuarios` `papeis` `escopos_usuario`                                                                    |
| Seguranca       | **base de tudo**: RLS lendo claims · escopo em tabela propria, nao so no claim · checagem de `user_status` em toda escrita · token 15 min |
| Observabilidade | erro de autorizacao cross-tenant e **sempre alerta**                                                                                      |
| Testes          | negativos cross-tenant para toda tabela · revogacao imediata · claim antigo nao concede acesso a empreendimento removido                  |

---

## 02 · Estrutura Fisica & Unidades — fase I3

|          |                                                                                |
| -------- | ------------------------------------------------------------------------------ |
| Commands | criar/editar area generica · criar/editar unidade · criar ponto de recebimento |
| Queries  | arvore do empreendimento · unidades para matching · unidades por ponto         |
| Tabelas  | `areas` `unidades` `pontos_recebimento`                                        |
| Regra    | rotulo da camada intermediaria e **configuracao**, nunca codigo                |

---

## 03 · Pessoas & Vinculos — fase I3

|          |                                                                                 |
| -------- | ------------------------------------------------------------------------------- |
| Commands | criar pessoa · vincular a unidade · encerrar vinculo · reativar                 |
| Queries  | pessoas de uma unidade (ordenadas) · unidades de uma pessoa · vinculos vigentes |
| Eventos  | `VINCULO_CRIADO` `VINCULO_ENCERRADO`                                            |
| Tabelas  | `pessoas` `vinculos`                                                            |
| Regra    | vinculo encerrado **nao** recebe notificacao · nunca cadastrar automaticamente  |

---

## 04 · Contatos & Comunicacao — fase I7

|                 |                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Commands        | cadastrar/ordenar contato · marcar contato como falho · confirmar contato · enviar fora da janela (elevado)                                    |
| Queries         | cascata de contatos da unidade · status de notificacao · consumo por empreendimento                                                            |
| Eventos         | `NOTIFICACAO_AGENDADA` `NOTIFICACAO_ENVIADA` `NOTIFICACAO_FALHOU` `NOTIFICACAO_CANCELADA_POR_CORRECAO`                                         |
| Jobs            | `notificacao.agendar` (espera duravel ate a janela) · `notificacao.enviar` (idempotente) · `notificacao.retry` · `notificacao.cascata-contato` |
| Webhooks        | `POST /api/webhooks/whatsapp` — assinatura validada, dedup por `message_id`, tolerante a duplicata e fora de ordem                             |
| Endpoints       | Embedded Signup (conectar numero do empreendimento)                                                                                            |
| Tabelas         | `contatos` `notificacoes` `templates` `janelas_notificacao` `metering_mensagens`                                                               |
| Seguranca       | nunca enviar foto, CPF, telefone, QR ou tracking completo · envio fora da janela exige permissao elevada                                       |
| Observabilidade | job falhando de forma persistente e webhook parando de chegar sao alertas prioritarios                                                         |

---

## 05 · Cadastro & Importacao — fase I10

|          |                                                                          |
| -------- | ------------------------------------------------------------------------ |
| Commands | criar lote · confirmar importacao (unico ponto que grava)                |
| Queries  | preview normalizado · inconsistencias e duplicidades · relatorio do lote |
| Jobs     | `importacao.normalizar` · `importacao.detectar-inconsistencias`          |
| Tabelas  | `importacoes` `lotes` `inconsistencias`                                  |
| Regra    | **a IA nunca grava silenciosamente**; so grava apos confirmacao humana   |

---

## 06 · Recebimento & Identificacao — fase I5

|           |                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Commands  | registrar recebimento (idempotente por UUIDv7 do cliente) · confirmar identificacao · registrar manualmente · marcar nao identificada |
| Queries   | sugestao de match (unidade primeiro, nome depois) · pessoas da unidade · fila do dia                                                  |
| Eventos   | `RECEBIMENTO_REGISTRADO` `IDENTIFICACAO_CONFIRMADA` `MARCADA_NAO_IDENTIFICADA`                                                        |
| Endpoints | `POST /api/uploads/assinar` (URL assinada) · porta `LabelExtractor`                                                                   |
| Tabelas   | `encomendas` `fotos_etiqueta` `sugestoes_match`                                                                                       |
| Seguranca | foto em bucket privado · nunca logar imagem nem texto bruto de OCR                                                                    |
| Regra     | **nunca bloqueia** por falha de OCR, rede ou WhatsApp · timeout 4s + 1 retry + fallback manual                                        |

---

## 07 · Correcoes & Custodia — fase I4 (custodia) e I9 (correcoes)

**O contexto central do produto.**

|           |                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commands  | registrar evento · mover internamente · definir localizacao fisica · corrigir associacao (elevado) · cancelar (elevado)                             |
| Queries   | fila por status · detalhe · timeline · aging derivado · nao identificadas                                                                           |
| Eventos   | `custody_events` **append-only** — `ASSOCIACAO_CORRIGIDA` preserva valor anterior e novo                                                            |
| Jobs      | `aging.derivar` (recorrente)                                                                                                                        |
| Tabelas   | `custody_events` (append-only) · `encomendas` (estado materializado) · `localizacoes`                                                               |
| Seguranca | **UPDATE e DELETE revogados no Postgres** para o role da aplicacao · sem hard delete · correcao pos-notificacao nunca revela o destinatario correto |
| Testes    | evento inalteravel · transicao proibida rejeitada em todo caminho · estado e evento na mesma transacao                                              |

---

## 08 · Retirada — fase I8 · 09 · Devolucao — fase I8

|          | Retirada                                                                                                    | Devolucao                                |
| -------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Commands | registrar retirada 1:N com assinatura · corrigir retirada (elevado)                                         | registrar devolucao · corrigir (elevado) |
| Queries  | encomendas retiraveis da unidade · comprovante                                                              | historico                                |
| Eventos  | `RETIRADA_REGISTRADA` `RETIRADA_CORRIGIDA`                                                                  | `DEVOLUCAO_REGISTRADA`                   |
| Tabelas  | `retiradas` `assinaturas` `retirada_encomendas`                                                             | `devolucoes`                             |
| Regra    | nome + assinatura + operador + data/hora + lista explicita · QR nunca autoriza · retirada nao volta a ativo | nunca remove do historico                |
| Testes   | retirada concorrente do mesmo volume · item nao sincronizado                                                | —                                        |

---

## 10 · Auditoria & Retencao — fases I9 e I12

|          |                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Commands | registrar acao critica · abrir acesso JIT · exportar · executar offboarding                                                     |
| Queries  | trilha por escopo · timeline por encomenda e por unidade · acessos de suporte                                                   |
| Jobs     | `retencao.aplicar` (parametrizavel por categoria) · `exportacao.gerar`                                                          |
| Tabelas  | `audit_log` `acessos_suporte` `exportacoes` `politicas_retencao`                                                                |
| Regra    | prazo vem de **configuracao**, nunca hardcoded · exclusao gera evidencia do proprio expurgo · o audit log nunca sai do Postgres |

---

## 11 · Relatorios & Operacao — fase I10

|         |                                                                                     |
| ------- | ----------------------------------------------------------------------------------- |
| Queries | fila · busca · filtros · KPIs do dashboard · relatorios por periodo                 |
| Jobs    | `relatorio.exportar`                                                                |
| Regra   | paginacao obrigatoria; cursor preferido · indices liderando por `empreendimento_id` |

---

## 12 · Administracao SaaS & Planos — fase I11

|           |                                                                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commands  | criar conta · definir plano e entitlements · suspender/reativar · abrir acesso JIT                                                                                    |
| Queries   | metadados de contrato · limites · consumo por empreendimento · saude das integracoes                                                                                  |
| Endpoints | `GET /api/health` (estado de Meta, OCR, storage)                                                                                                                      |
| Tabelas   | `planos` `entitlements` `limites` `metering`                                                                                                                          |
| Regra     | entitlement nunca derivado do nome comercial do plano · **recurso de seguranca e evidencia nunca e gated por plano** · Super Admin nunca faz hard delete de evidencia |

---

## Transversal · Portas e jobs

| Porta               | Fase | Fallback documentado     |
| ------------------- | ---- | ------------------------ |
| `Clock`             | I1   | —                        |
| `EvidenceStorage`   | I5   | Cloudflare R2            |
| `LabelExtractor`    | I5   | fallback manual (sempre) |
| `JobScheduler`      | I1   | pgmq + pg_cron           |
| `MessagingProvider` | I7   | BSP                      |

## Integracoes externas (API/webhooks/ERP)

**Fora do MVP.** Pos-MVP: sincronizacao de cadastro com ERP condominial e
devolucao de eventos. A API publica nao existe no MVP.
