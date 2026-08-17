# Layout, espacamento, forma e elevacao

## Espacamento

Base 4px. Escala preferencial: **4 / 8 / 12 / 16 / 24 / 32 / 40**.
Tokens `--spacing-1..10` em `globals.css`.

## Raio — padrao de raio fechado (16/08/2026)

| Elemento                     | Raio  | Token              |
| ---------------------------- | ----- | ------------------ |
| botao, pilula, chip de busca | 999px | `--radius-pill`    |
| cartao e superficie          | 16px  | `--radius-surface` |
| campo e caixa                | 12px  | `--radius-field`   |
| chip dentro de cartao        | 8px   | `--radius-chip`    |
| modal e bottom sheet         | 20px  | `--radius-sheet`   |

Esta padronizacao foi aplicada retroativamente no Penpot (45 pilulas em 26 e 12
cartoes em 14 foram corrigidos). Nao reintroduzir valores intermediarios.

## Elevacao — substitui o glass effect

Glass effect **REVOGADO** em 15/08/2026. Nao usar blur, `backdrop-filter`,
superficie translucida nem "frosted" em nenhuma tela, mobile ou web.

Para separar planos, **muda-se o tom, nao a opacidade**.

| Token                  | Sombra                            | Uso                                 |
| ---------------------- | --------------------------------- | ----------------------------------- |
| `--shadow-elevation-0` | nenhuma — so borda                | lista, tabela, formulario           |
| `--shadow-elevation-1` | `0 1px 2px rgb(24 35 80 / .06)`   | card operacional, PackageCard       |
| `--shadow-elevation-2` | `0 4px 12px rgb(24 35 80 / .10)`  | header fixo, dropdown, popover, FAB |
| `--shadow-elevation-3` | `0 12px 32px rgb(24 35 80 / .16)` | modal, drawer, bottom sheet         |

### Substituicao direta do que era glass

- headers e KPIs → navy solido elevado, ou card branco + `elevation-1`
- filtros flutuantes → superficie solida + `elevation-2`
- modais, drawers e overlays → `elevation-3` + scrim solido (`--scrim`)
- areas premium → espacamento, alinhamento e tipografia, nao efeito de superficie

## Molduras

| Superficie | Moldura                                          |
| ---------- | ------------------------------------------------ |
| OPS        | 390 × 908 (mobile), telas a cada 470px no Penpot |
| WEB / SAAS | 1440, sidebar 240, conteudo 1200                 |

O WEB reaproveita `Form/TextField` sem variante compacta — campo mais alto ajuda
tambem no desktop e evita duplicar manutencao.

## Direcao de layout

**Mobile (OPS)** — acao primaria evidente, poucos campos, confirmacao rapida, uso
com uma mao, acoes criticas na area do polegar, feedback imediato, erros
recuperaveis, fila legivel por status. Nunca forcar navegacao ao dashboard entre
recebimentos de lote.

**Desktop (WEB/SAAS)** — sidebar persistente, conteudo central com largura
controlada, filtros visiveis e persistentes quando uteis, tabelas com densidade
moderada, KPIs no topo sem dominar a tela, drill-down progressivo, timeline e
auditoria com excelente legibilidade. Multiempreendimento claramente separado do
contexto operacional atual.

## Referencia de dashboard aprovada

Fundo Deep Blue · cards KPI solidos sobre o fundo, com `elevation-1` e borda de
baixo contraste · areas de acao e listas em tons claros · Powder Blue para
selecao/informacao · Pale Brown como accent · estados funcionais com cores
proprias · gradiente/glow apenas como profundidade de background.
