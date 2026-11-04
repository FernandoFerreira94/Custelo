# Roadmap mobile — OPS (PWA operacional)

O produto e uma PWA instalavel dentro do mesmo Next.js, route group `(ops)`.
**Nao ha app nativo** (ADR-012).

Alvo real: Android de baixo custo, uma mao, em pe, com fila na frente.

## Criterio que governa tudo

**Segundos por registro.** Se o fluxo ficar lento, o porteiro volta ao caderno —
esse e o criterio de fracasso declarado do MVP. Toda decisao de UI aqui e julgada
por isso antes de qualquer coisa.

## Principios (Brand & UI Foundation §14)

acao primaria evidente · poucos campos · confirmacao rapida · uso com uma mao
quando possivel · acoes criticas na area de alcance do polegar · feedback
imediato apos foto, confirmacao e salvamento · erros recuperaveis · fila legivel
por status · **nunca forcar navegacao ao dashboard entre recebimentos de lote**.

## O que e tela, o que nao e

Esta e a distincao que evita transformar 10 telas em 40.

| Tipo               | Quando                                  | Exemplos                                                                                                                                                                              |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tela**           | destino de navegacao, tem rota propria  | REC-002 captura · REC-003 confirmacao · CUS-001 fila · CUS-002 detalhe · RET-001..004                                                                                                 |
| **Bottom sheet**   | entrada de dado sem sair do contexto    | `Sheet/UnitPicker` (REC-004) · `Sheet/PersonPicker` (REC-005) · `Sheet/ManualEntry` (REC-006) · `Sheet/LocationPicker` · `Sheet/CriticalFix` (CUS-004) · `Sheet/ManualSend` (NOT-004) |
| **Dialog**         | acao critica que exige decisao e motivo | `Feedback/CriticalActionDialog`                                                                                                                                                       |
| **Drawer**         | navegacao secundaria e filtros          | filtros da fila                                                                                                                                                                       |
| **Estado da tela** | variante, nunca rota                    | offline · sync pending · partial sync · retry · loading · empty · no results · forbidden                                                                                              |
| **Componente**     | reuso dentro de telas                   | `PackageCard` · `StatusBadge` · `OfflineBanner` · `AgingIndicator` · `SyncIndicator`                                                                                                  |

> Decisao de 16/08/2026: REC-004, REC-005, REC-006, CUS-005, CUS-004, DEV-002 e
> NOT-004 deixaram de ser telas e viraram sheets sobre a tela-base. Cada tela-base
> virou componente, e a tela com sheet e instancia da base + instancia do sheet.

## Shell

`MobileOperationalShell` com `BottomNav` de 5 posicoes: 4 abas + **acao central
de captura de 64px** (AD-011).

```
Fila       →  CUS-001 · CUS-002 · CUS-003 · CUS-005 · CUS-008
Capturar   →  REC-002 → REC-003 → REC-007 → REC-008
Retirada   →  RET-001 → RET-002 → RET-003 → RET-004
Pendencias →  REC-009 fila local · REC-010 conflito · CUS-007 nao identificadas
```

## Capacidades por fase

| Fase | Capacidade                                                                                     | Componentes-chave                                                                         |
| ---- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| I5   | shell, camera, upload por URL assinada, OCR, matching, fallback manual, QR, localizacao fisica | `CameraFrame` `OCRConfidence` `UnitSelector` `PersonSelector` `ShelfPicker` `PackageCard` |
| I6   | fila local, UUIDv7, dois timestamps, idempotencia, deteccao e resolucao de conflito            | `OfflineBanner` `SyncIndicator` tela de conflito                                          |
| I8   | retirada 1:N, assinatura, comprovante, devolucao                                               | `SignaturePad` `ReceiptSummary`                                                           |

## Ergonomia

- Alvo de toque minimo 44×44px; acao primaria 48–56px; acao central 64px.
- Acoes criticas na metade inferior da tela.
- Confirmacao de sucesso **breve**, que nao bloqueia o proximo recebimento.
  Modal de sucesso entre itens de um lote de 30 e um bug de operacao.
- Sem blur nem superficie translucida — proibido por custo de performance no
  aparelho real.
- Sem animacao continua em tela operacional.

## Offline — escopo e limites

Offline e **limitado ao recebimento**, nao operacao offline completa. OCR,
WhatsApp e servicos externos aguardam reconexao.

Regras em `.ai/rules/ops-pwa.md` e no modulo `offline-sync`.

### Risco iOS assumido

Instalacao por "Adicionar a Tela de Inicio", **sem Background Sync**, com risco de
ejecao de armazenamento sob pressao. Push para o operador fica limitado.

Mitigacao: sincronizacao agressiva na volta da conectividade (nunca acumular fila
por dias), aviso visivel de pendencia nao sincronizada e **recomendacao de
Android** para o dispositivo de portaria.

Gatilho de revisao explicito: se o piloto mostrar perda de fila no iOS ou
latencia de camera inaceitavel, a rota de fuga e Capacitor sobre a mesma PWA.
So se isso tambem falhar, um app Flutter dedicado se justifica.

## Instalacao

`APP-01` (icone do app / PWA) esta **BLOQUEADO**: depende do SVG do logo, favicon
32 e app icon 512 exportados do vetor. Geometria ja reservada (512 any, 512
maskable, 192, 32).
