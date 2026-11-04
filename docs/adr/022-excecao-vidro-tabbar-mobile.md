# ADR-022 — Excecao de vidro na barra inferior do mobile

- **Status:** ACEITO
- **Data:** 2026-11-04
- **Supera:** em parte a regra "sem vidro" da _Brand & UI Foundation_ (rev.
  15/08/2026), **so** para a barra inferior da superficie `(ops)`.

## Problema

O vidro foi revogado em 15/08/2026 por custo de performance no Android real do
porteiro. Nas pranchas aprovadas (03 e 04/11/2026), o Fernando escolheu para o
celular da portaria uma barra inferior flutuante em vidro: 4 abas (Receber,
Fila, Entregar, Mais) e o leitor de QR separado. A regra atual proibe isso.

## Escolha

Liberar vidro **apenas** na barra inferior do `(ops)`: componente `TabBar` do
`@webcode` com `material="glass"` e os tokens de vidro do tema `custelo`. O
resto do produto continua sem vidro: cards, sheets, dialogs, cabecalhos, web e
admin.

## Alternativas

- **Barra solida (`bg-card` + sombra):** cumpre o LOCK, mas o Fernando quer o
  efeito na barra; continua sendo o fallback desta decisao.
- **Liberar vidro no app inteiro:** volta o problema de performance que motivou
  a revogacao.

## Motivo

A barra e uma unica camada pequena e fixa. O custo do `backdrop-filter` numa
area dessas e bem menor que em sheets e cards. O efeito ajuda a mostrar que o
conteudo continua por baixo da barra, que flutua sobre a lista.

## Trade-offs

- Uma excecao a regra que agentes e revisores precisam conhecer.
- Contraste do rotulo depende do que passa por baixo. Por isso a espessura e
  `thick`, a mais opaca do tema.

## Riscos e mitigacao

- **Queda de quadros em Android fraco.** A barra cai para solida com
  `@supports not (backdrop-filter: blur(1px))` e quando
  `prefers-reduced-transparency: reduce`. Medir no aparelho de referencia antes
  do piloto; se cair, ligar o fallback solido para todos.
- **Contraste:** rotulo e icone ativos precisam de 4,5:1 sobre o pior conteudo
  (lista com card branco). A aba ativa usa a lente solida do componente
  (`bg-card`), nao vidro.
- **Vidro se espalhar:** a regra de UI continua proibindo vidro em qualquer outro
  lugar; revisao de design reprova `material="glass"` fora da `TabBar` do
  `(ops)`.

## Gatilho de revisao

Medicao no aparelho de referencia abaixo de 55 fps ao rolar a fila com a barra
visivel, ou reclamacao de leitura da barra no piloto: a barra volta a ser
solida e este ADR passa a SUPERADO.
