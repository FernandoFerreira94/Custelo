# Componentes

53 componentes-mestre existem no Penpot (arquivo "Custelo"). Nenhum foi
implementado em codigo ainda — a implementacao comeca na fase I1/I2.

> Antes de criar componente novo, procure aqui. Componente que ja existe no
> design nao nasce diferente no codigo.

## Shell e navegacao

| Componente              | Superficie | Nota                                            |
| ----------------------- | ---------- | ----------------------------------------------- |
| `Shell/AppShell`        | todas      | —                                               |
| `Shell/WebShell`        | WEB/SAAS   | sidebar navy 240 + 13 entradas + barra superior |
| `Shell/ContextSwitcher` | todas      | troca de empreendimento / escopo de organizacao |
| `Shell/OfflineBanner`   | OPS        | faixa persistente "sem conexao / N na fila"     |
| `OPS/BottomNav`         | OPS        | 5 posicoes — 4 abas + acao central de 64px      |
| `OPS/Header`            | OPS        | titulo, voltar, acao, chip de contexto, busca   |
| `OPS/StatusBar`         | OPS        | chrome do sistema, variante clara e escura      |

ORG e SAAS **nao** tem shell proprio: reusam `Shell/WebShell` com nav e bloco de
contexto sobrescritos. Administradora e modo de escopo, nao quarta superficie.

## Formulario

`Form/Button` (solido, contorno, fantasma) · `Form/TextField` ·
`Form/SearchField` (pilula 52px, icone a esquerda, acao encaixada a direita) ·
`Form/FilterChip` · `Form/RoleBadge` · `Form/UnitSelector` ·
`Form/PersonSelector` · `Form/ShelfPicker` · `Form/Toggle` · `Form/SettingRow` ·
`Form/ImportStepper` · `Form/MessagePreview` · `Form/DateRangePicker`

Todo botao e instancia de `Form/Button` com override de rotulo e variante.

## Cartoes e listas

`OPS/PackageCard` (contem instancia de StatusBadge) · `Cards/TimelineItem` ·
`Cards/ReceiptSummary` · `Cards/NotificationItem` · `Cards/DataTable` ·
`Cards/UserRow` · `Cards/MetricTile` · `Cards/ChartFrame` · `Cards/AuditRow`

## Status

`OPS/StatusBadge` — **9 estados, cada um com icone proprio**. E o componente que
cumpre a regra "cor + label + icone".
`Status/AgingIndicator` · `Status/ChannelBadge` · `Status/RoleBadge`

> Bug conhecido no Penpot: instancia de `StatusBadge` com override perde o icone,
> quebrando a regra (visivel em CUS-002). Ao implementar em codigo, o icone deve
> ser derivado do estado, nao passado por prop opcional.

## Captura

`Capture/CameraFrame` (visor com guia de enquadramento) ·
`Capture/OCRConfidence` (o que a maquina leu + quanto confia) ·
`Capture/SignaturePad` (prova juridica da entrega)

`OCRConfidence` e o componente que decide se o porteiro confere ou aceita — sem
ele, o OCR vira armadilha.

## Feedback

`Feedback/StatePanel` (unifica empty state e error state, 4 estados) ·
`Feedback/ConfirmationSheet` · `Feedback/CriticalActionDialog` ·
`Feedback/PhotoViewer` · `Feedback/ImportReport` · `Feedback/PermissionMatrix`

`CriticalActionDialog` exige **motivo obrigatorio**. Toda acao de permissao
elevada passa por ele.

## Bottom sheets (OPS)

`Sheet/UnitPicker` · `Sheet/PersonPicker` · `Sheet/ManualEntry` ·
`Sheet/LocationPicker` · `Sheet/CriticalFix` · `Sheet/ManualSend`

Decisao de 16/08/2026: estas interacoes sao sheets sobre a tela-base, nao telas
separadas. A tela-base virou componente (`Screens/REC-003 base`,
`Screens/CUS-002 base`, `Screens/DEV-001 base`, `Screens/NOT-001 base`) e a tela
com sheet e instancia da base + instancia do sheet, sem copia de conteudo.

## Ordem de nascimento em codigo

Componente **antes** da tela — sempre. A regra existe porque o custo de inverter
ja foi pago uma vez: a navegacao inferior foi desenhada dentro do CUS-001 sem o
`MobileOperationalShell` existir e precisou ser refeita.
