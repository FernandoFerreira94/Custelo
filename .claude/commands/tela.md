---
description: Iniciar trabalho em uma tela pelo ID do roadmap (ex. /tela REC-003)
---

Trabalhe na tela `$ARGUMENTS` (ID do Roadmap Mestre de Telas).

Antes de escrever qualquer codigo:

1. Localize a tela em `docs/product/pages-roadmap.md` (conteudo, status, rota,
   fase) e `docs/product/screen-tracker.csv`. Spec completa no Notion
   (`docs/workflow/notion-pages.md`). `docs/product/screen-map.md` e so o indice.
2. Confirme o **status de design**. Nenhuma tela entra em desenvolvimento antes
   de `APPROVED` no design. Se estiver `NOT_STARTED` ou `IN_PROGRESS`, pare e
   avise.
3. Confirme que a **fase** do Implementation Roadmap que habilita esta tela ja
   foi entregue. Tela cuja dependencia de backend nao existe nao comeca.
4. Carregue o modulo correspondente (`.ai/modules/<modulo>.md`).
5. Se a tela e do route group `(ops)`, leia tambem a skill `ui-ops-pwa`.

Ao implementar:

- reutilize componente que ja existe no Component Inventory; nao crie paralelo
- implemente **todos** os estados obrigatorios da natureza da tela
  (lista: loading/empty/first-use/no results/network error/forbidden ·
  formulario: validation error/success/network error/double-submit bloqueado ·
  OPS: offline/sync pending/partial sync/retry ·
  acao critica: confirmacao destrutiva com motivo obrigatorio)
- estado e variante, nao rota nova
- use tokens semanticos, nunca hex literal

Ao terminar: `/verify` e, se aplicavel, `/security-review`. Depois atualize
**obrigatoriamente** `docs/product/screen-tracker.csv` e
`docs/product/pages-roadmap.md`. Sincronize o Notion (_Roadmap Mestre_) quando
o MCP estiver autenticado.
