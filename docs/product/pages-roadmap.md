# Roadmap de Paginas — Custelo

Controle operacional das **83 telas/sheets** do produto: o que cada uma faz, em
qual fase entra, e o que ja foi entregue.

| Camada                                                 | Onde                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Spec completa (dados, validacoes, permissoes, estados) | Notion — _Roadmap Mestre de Telas & UX/UI_ + 4 paginas de telas |
| **Este roadmap**                                       | status + conteudo resumido + regra de atualizacao               |
| CSV versionado (importar no Notion)                    | `docs/product/screen-tracker.csv`                               |
| Indice e regras de estado                              | `docs/product/screen-map.md`                                    |
| Ordem de fases (nao e ordem de tela)                   | `docs/product/implementation-roadmap.md`                        |

## Alinhamento com o Notion

O Notion _Roadmap Mestre de Telas & UX/UI_ e a fonte canonica de spec. Este
arquivo e a **copia versionada no repo** para controle do que foi feito e do que
falta — espelha o tracker do Notion (`screen-tracker.csv`).

Verificacao em 18/08/2026 (sem MCP Notion autenticado):

- **83 IDs** batem com `screen-map.md` e o CSV.
- **Waves 00–08** (77 telas MVP) com design `APPROVED` no Penpot.
- **Wave 09** (6 pos-MVP) com design `NOT_STARTED` de proposito.
- **Desenvolvimento** de todas as 83: `NOT_STARTED` (nenhuma pagina em codigo).
- Rotas, fases e modulos batem com `implementation-roadmap.md` e skills.

Se o Notion divergir deste arquivo, **decida e registre** em `.claude/memory.md`.
Nunca resolva em silencio.

## Resumo de progresso

Atualizado: **18/08/2026**

| Metrica                  | Feito | Total | Pendente |
| ------------------------ | ----- | ----- | -------- |
| Design MVP (Penpot)      | 77    | 77    | 0        |
| Design pos-MVP           | 0     | 6     | 6        |
| Frontend (codigo)        | 0     | 83    | 83       |
| Backend (API/modulo)     | 0     | 83    | 83       |
| Testes (unit/ui/e2e/rls) | 0     | 83    | 83       |

**Fase atual:** I1 (fundacao tecnica). Nenhuma tela entra em dev antes de I2 + design
`APPROVED` + fase habilitadora entregue.

## Regra obrigatoria — ao finalizar uma pagina

Toda vez que uma tela/sheet for **concluida** (`Frontend` + `API` + `Test` = `DONE`,
com `/verify` verde):

1. Atualize **`docs/product/screen-tracker.csv`** — colunas `Frontend Status`,
   `API Status`, `Test Status` (e `Mobile Status` se OPS).
2. Atualize **este arquivo** — mesma linha, mesmos status.
3. Se houve decisao duradoura, registre em **`.claude/memory.md`**.
4. Quando o MCP Notion estiver autenticado, sincronize o _Roadmap Mestre_ no Notion
   (importar CSV ou editar a database).

Comando de trabalho: `/tela <ID>` (ex.: `/tela REC-003`).

## Legenda de status

Design: `NOT_STARTED` · `IN_PROGRESS` · `REVIEW` · `APPROVED`  
Dev: `NOT_STARTED` · `READY` · `IN_PROGRESS` · `REVIEW` · `DONE` · `BLOCKED`

Colunas abreviadas nas tabelas: **D** = Design · **F** = Frontend · **B** = Backend/API · **T** = Testes

---

## Wave 01 — AUTH · Fase I2

| ID       | Pagina              | Rota                 | D           | F           | B           | T           | Conteudo previsto                                                               |
| -------- | ------------------- | -------------------- | ----------- | ----------- | ----------- | ----------- | ------------------------------------------------------------------------------- |
| AUTH-001 | Entrar              | `/(auth)/entrar`     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Form email/senha; link recuperar; estados validation/network; redirect AUTH-005 |
| AUTH-002 | Convite / 1o acesso | `/(auth)/convite`    | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Token de convite; aceite; redirect definir senha ou entrar                      |
| AUTH-003 | Recuperar senha     | `/(auth)/recuperar`  | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Email; fluxo reset; confirmacao envio; sem vazar se email existe                |
| AUTH-004 | Definir senha       | `/(auth)/senha`      | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Nova senha + confirmacao; politica de senha; redirect AUTH-001                  |
| AUTH-005 | Selecionar contexto | `/(auth)/contexto`   | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista org/empreendimento; escopo na sessao; redirect OPS ou WEB                 |
| AUTH-006 | Sem acesso          | `/(auth)/sem-acesso` | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sessao invalida ou sem escopo; acao sair/contato admin                          |
| AUTH-007 | MFA / step-up       | pos-MVP              | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Segundo fator em acao elevada; pos-piloto                                       |

## Wave 02 — OPS Recebimento · Fases I5/I6

| ID      | Pagina             | Rota / tipo                  | D        | F           | B           | T           | Conteudo previsto                                                             |
| ------- | ------------------ | ---------------------------- | -------- | ----------- | ----------- | ----------- | ----------------------------------------------------------------------------- |
| REC-001 | Inicio / atalho    | `/(ops)/receber`             | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Atalho camera; KPI segundos/registro; sem dashboard entre itens de lote       |
| REC-002 | Captura etiqueta   | `/(ops)/receber/captura`     | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | CameraFrame; foto so da etiqueta; upload URL assinada; OCR via LabelExtractor |
| REC-003 | Confirmacao ID     | `/(ops)/receber/confirmar`   | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sugestao unidade (filtro primario) + pessoa; confianca OCR; sheets 004–006    |
| REC-004 | Escolher unidade   | sheet REC-003                | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sheet/UnitPicker; busca unidade; nao cria cadastro automatico                 |
| REC-005 | Escolher pessoa    | sheet REC-003                | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sheet/PersonPicker; pessoas da unidade; humano confirma                       |
| REC-006 | Entrada manual     | sheet REC-003                | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sheet/ManualEntry; fallback sempre presente; campos minimos                   |
| REC-007 | Localizacao fisica | `/(ops)/receber/local`       | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | ShelfPicker/prateleira; evento custodia; opcional rapido                      |
| REC-008 | Conclusao / QR     | `/(ops)/receber/concluir`    | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | QR locator opaco; PackageCard; inicia custodia + fila notificacao             |
| REC-009 | Fila offline       | `/(ops)/pendencias`          | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | OfflineBanner; SyncIndicator; fila Dexie; append-only                         |
| REC-010 | Resolver conflito  | `/(ops)/pendencias/conflito` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Conflito sync; humano decide; sem last-write-wins                             |

## Wave 03/05 — Custodia e correcoes · Fases I4/I5/I9

| ID      | Pagina               | Rota / tipo   | D           | F           | B           | T           | Conteudo previsto                                                              |
| ------- | -------------------- | ------------- | ----------- | ----------- | ----------- | ----------- | ------------------------------------------------------------------------------ |
| CUS-001 | Fila custodia        | OPS+WEB       | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista encomendas; filtros; AgingIndicator; estados lista obrigatorios          |
| CUS-002 | Detalhe encomenda    | OPS+WEB       | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | PackageCard; status; acoes; abre sheets correcao/movimentacao                  |
| CUS-003 | Timeline             | secao detalhe | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | custody_events append-only; ordem cronologica; sem editar evento               |
| CUS-004 | Correcao critica     | sheet CUS-002 | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sheet/CriticalFix; motivo obrigatorio; permissao elevada; msg neutra pos-notif |
| CUS-005 | Movimentacao interna | sheet         | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Sheet/LocationPicker; novo local fisico; evento custodia                       |
| CUS-006 | (pos-MVP)            | —             | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Reservado pos-piloto                                                           |
| CUS-007 | Nao identificadas    | OPS+WEB       | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Fila NAO_IDENTIFICADA; resolver manualmente                                    |
| CUS-008 | Etiqueta / QR        | OPS           | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Reimpressao/visualizacao QR; locator opaco                                     |

## Wave 04 — Retirada e devolucao · Fase I8

| ID      | Pagina              | Rota / tipo                    | D        | F           | B           | T           | Conteudo previsto                                      |
| ------- | ------------------- | ------------------------------ | -------- | ----------- | ----------- | ----------- | ------------------------------------------------------ |
| RET-001 | Selecionar 1:N      | `/(ops)/retirada`              | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Multi-select encomendas; mesma retirada                |
| RET-002 | Quem recebeu        | `/(ops)/retirada/destinatario` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Identificacao retirante; vinculo unidade               |
| RET-003 | Assinatura          | `/(ops)/retirada/assinatura`   | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | SignaturePad; captura assinatura; offline ok           |
| RET-004 | Comprovante         | `/(ops)/retirada/comprovante`  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | ReceiptSummary; resumo retirada; compartilhar/imprimir |
| RET-005 | Historico           | WEB+OPS                        | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista retiradas; filtros periodo                       |
| RET-006 | Corrigir retirada   | elevado                        | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Permissao elevada; motivo; auditoria                   |
| DEV-001 | Registrar devolucao | `/(ops)/devolucao`             | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Selecionar encomenda; inicia fluxo devolucao           |
| DEV-002 | Motivo e evidencia  | sheet DEV-001                  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Motivo obrigatorio; foto/evidencia opcional            |
| DEV-003 | Confirmacao         | `/(ops)/devolucao/confirmar`   | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Confirmacao final; nao apaga historico                 |

## Wave 05 — Notificacoes · Fase I7

| ID      | Pagina               | Rota / tipo                   | D        | F           | B           | T           | Conteudo previsto                                        |
| ------- | -------------------- | ----------------------------- | -------- | ----------- | ----------- | ----------- | -------------------------------------------------------- |
| NOT-001 | Lista                | `/(web)/notificacoes`         | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Historico envios; status visivel; falha nunca silenciosa |
| NOT-002 | Detalhe / tentativas | `/(web)/notificacoes/[id]`    | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Tentativas; erros; retry                                 |
| NOT-003 | Falhas e alertas     | `/(web)/notificacoes/alertas` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Alertas operacionais; fila falhas                        |
| NOT-004 | Envio manual         | sheet NOT-001                 | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Fora da janela; permissao elevada; Sheet/ManualSend      |

## Wave 06 — WEB Cadastro · Fases I3/I10

| ID      | Pagina             | Rota                             | D        | F           | B           | T           | Conteudo previsto                                 |
| ------- | ------------------ | -------------------------------- | -------- | ----------- | ----------- | ----------- | ------------------------------------------------- |
| UNI-001 | Estrutura          | `/(web)/estrutura`               | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Arvore empreendimento; areas genericas            |
| UNI-002 | Unidades           | `/(web)/unidades`                | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | CRUD unidades; camada intermediaria               |
| UNI-003 | Areas genericas    | `/(web)/estrutura/areas`         | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Areas nao-unidade; vinculo estrutura              |
| UNI-004 | Pontos recebimento | `/(web)/pontos`                  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Pontos fisicos de recebimento                     |
| PES-001 | Pessoas            | `/(web)/pessoas`                 | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista/cadastro pessoas; LGPD minimo               |
| PES-002 | Vinculos           | `/(web)/pessoas/[id]/vinculos`   | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Vinculo pessoa-unidade; vigencia                  |
| PES-003 | Detalhe / contatos | `/(web)/pessoas/[id]`            | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Contatos ordenados; preferencia WhatsApp          |
| IMP-001 | Upload planilha    | `/(web)/importacao`              | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Upload; inicia lote importacao                    |
| IMP-002 | Preview            | `/(web)/importacao/[lote]`       | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Normalizacao; preview; IA sugere, humano confirma |
| IMP-003 | Inconsistencias    | `/(web)/importacao/[lote]/erros` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Erros por linha; correcao assistida               |
| IMP-004 | Relatorio lote     | `/(web)/importacao/[lote]/ok`    | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Resumo importacao; estatisticas                   |

## Wave 07 — WEB Gestao e config · Fases I2/I7/I11/I12

| ID      | Pagina              | Rota                      | D        | F           | B           | T           | Conteudo previsto                       |
| ------- | ------------------- | ------------------------- | -------- | ----------- | ----------- | ----------- | --------------------------------------- |
| USR-001 | Usuarios            | `/(web)/usuarios`         | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista usuarios; convite; papeis         |
| USR-002 | Papeis e escopo     | `/(web)/usuarios/papeis`  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | RBAC; escopo org/empreendimento         |
| USR-003 | Convite             | `/(web)/usuarios/convite` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Form convite; email; papel inicial      |
| CFG-001 | Empreendimento      | `/(web)/config`           | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Dados gerais empreendimento             |
| CFG-002 | Janelas notificacao | `/(web)/config/janelas`   | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Horarios permitidos WhatsApp            |
| CFG-003 | Templates           | `/(web)/config/templates` | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Templates aprovados Meta                |
| CFG-004 | Conexao WhatsApp    | `/(web)/config/whatsapp`  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Embedded Signup; status conexao         |
| CFG-005 | Aging               | `/(web)/config/aging`     | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Regras aging derivado custodia          |
| CFG-006 | Preferencias ops    | `/(web)/config/operacao`  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Preferencias operacionais tenant        |
| CFG-007 | Entitlements        | `/(web)/config/plano`     | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Limites visiveis; seguranca nunca gated |
| CFG-008 | Retencao            | `/(web)/config/retencao`  | APPROVED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Prazos LGPD; offboarding parametrizavel |

## Wave 08 — Relatorios, org, SaaS · Fases I9–I11

| ID       | Pagina                 | Rota                             | D           | F           | B           | T           | Conteudo previsto                       |
| -------- | ---------------------- | -------------------------------- | ----------- | ----------- | ----------- | ----------- | --------------------------------------- |
| DASH-001 | Dashboard gestor       | `/(web)`                         | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | KPIs operacionais; tiles resumo         |
| DASH-002 | Dashboard avancado     | pos-MVP                          | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Pos-piloto                              |
| AUD-001  | Trilha auditoria       | `/(web)/auditoria`               | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Log acoes criticas; filtros             |
| AUD-002  | Acessos / export       | `/(web)/auditoria/acessos`       | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | JIT; exportacoes; quem acessou o que    |
| REL-001  | Relatorio operacional  | `/(web)/relatorios/operacao`     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Volume recebimento/retirada             |
| REL-002  | Relatorio notificacoes | `/(web)/relatorios/notificacoes` | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Taxa entrega/falha                      |
| REL-003  | Relatorio retiradas    | `/(web)/relatorios/retiradas`    | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Retiradas por periodo                   |
| REL-004  | Relatorio excecoes     | `/(web)/relatorios/excecoes`     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Nao identificadas, correcoes            |
| REL-005  | Exportacao periodo     | `/(web)/relatorios/exportar`     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Job assincrono; nao download sincrono   |
| ORG-001  | Home organizacao       | `/(web)/org`                     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Escopo org; multi-empreendimento        |
| ORG-002  | Empreendimentos        | `/(web)/org/empreendimentos`     | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Lista empreendimentos da conta          |
| ORG-003  | Usuarios org           | `/(web)/org/usuarios`            | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Usuarios cross-empreendimento           |
| ORG-004  | Offboarding            | `/(web)/org/offboarding`         | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Encerramento conta; retencao            |
| SAAS-001 | Contas                 | `/(saas)/contas`                 | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Admin plataforma; contas clientes       |
| SAAS-002 | Planos                 | `/(saas)/planos`                 | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Planos e precos                         |
| SAAS-003 | Limites                | `/(saas)/limites`                | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Entitlements por plano                  |
| SAAS-004 | Acesso JIT             | `/(saas)/acesso`                 | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Suporte temporario; auditado no cliente |
| SAAS-005 | Saude integracoes      | `/(saas)/saude`                  | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Health checks; GET /api/health          |
| SAAS-006 | Metering               | `/(saas)/metering`               | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Consumo WhatsApp desde dia 1            |
| SAAS-007 | (pos-MVP)              | —                                | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Pos-piloto                              |
| BIL-001  | Billing self-service   | pos-MVP                          | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Provedor billing TBD                    |
| BIL-002  | Invoices               | pos-MVP                          | NOT_STARTED | NOT_STARTED | NOT_STARTED | NOT_STARTED | Portal faturas TBD                      |
| BIL-003  | Consumo admin          | `/(saas)/consumo`                | APPROVED    | NOT_STARTED | NOT_STARTED | NOT_STARTED | Visao consumo por conta                 |

## Wave 09 — Pos-MVP (6 telas)

Nao desenhar nem implementar antes do piloto: `AUTH-007` · `CUS-006` ·
`DASH-002` · `SAAS-007` · `BIL-001` · `BIL-002`.

---

## Contrato de spec (Notion)

Antes de codar, a spec no Notion deve responder: ID · nome · superficie · modulo ·
rota · objetivo · usuario · dados · componentes · acoes · validacoes · regras ·
permissoes · estados · dependencias · API · origem/destino · MVP · prioridade.

Estados **nao** viram rota. Ver `docs/product/screen-map.md`.
