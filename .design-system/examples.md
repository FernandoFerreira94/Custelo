# Padroes de uso

## Superficie e profundidade

**Certo** — card operacional: fundo solido (`bg-card`), borda 1px
(`border-border`), `shadow-[var(--shadow-elevation-1)]`, raio
`rounded-[var(--radius-surface)]`.

**Errado** — qualquer coisa com `backdrop-blur`, `bg-white/60`,
`supports-[backdrop-filter]`. Revogado em 15/08/2026, sem excecao.

## Cor

**Certo** — `bg-primary text-primary-foreground`, `text-state-falha`,
`bg-secondary`.

**Errado** — `bg-[#182350]`, `text-blue-600`, `bg-blue-500/10`. Se falta um
token, o token e que precisa nascer; nao contorne com valor literal.

## Estado operacional

**Certo** — badge com as tres camadas: cor de fundo do estado, icone proprio do
estado e label textual.

**Errado** — ponto colorido sozinho; badge que perde o icone quando o rotulo e
sobrescrito; depender de o operador saber que "laranja = urgente".

## Estado de tela

**Certo** — `loading`, `empty`, `no results`, `network error`, `forbidden`,
`offline`, `sync pending` como **variantes** do mesmo componente ou pagina.

**Errado** — criar rota `/encomendas/vazio`. Estado nao e pagina.

## Interacao no OPS

**Certo** — escolher unidade abre `Sheet/UnitPicker` sobre a tela de
confirmacao; o operador conclui e continua no lote.

**Errado** — navegar para uma rota de selecao e voltar. Cada navegacao e tempo,
e tempo e o KPI que decide se o produto substitui o caderno.

## Acao critica

**Certo** — `Feedback/CriticalActionDialog` com **motivo obrigatorio**, texto
que diz o que vai acontecer, e trilha gerada.

**Errado** — `confirm()`; dialogo com "Tem certeza?" sem motivo; acao critica
disponivel para Recepcionista.

## Feedback de sucesso

**Certo** — confirmacao breve que nao bloqueia o proximo recebimento.

**Errado** — modal de sucesso que exige clique entre cada item de um lote de 30.

## Gradiente

**Certo** — `Custelo Depth` no fundo da tela de login.

**Errado** — gradiente atras da fila de encomendas, em KPI de operacao, ou como
cor de status.
