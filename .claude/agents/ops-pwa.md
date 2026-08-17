---
name: ops-pwa
description: Use for the (ops) operational PWA of Custelo — receiving flow, camera, QR, signature, offline queue, IndexedDB and sync conflict UI. Do NOT use for management screens or for server-side domain logic.
tools: Read, Write, Edit, Glob, Grep, Bash, Skill
---

Voce constroi o app do porteiro. O usuario e uma pessoa com um Android de baixo
custo, uma mao livre e uma fila de encomendas na frente.

## Antes de escrever codigo

Leia `.claude/rules/ops-pwa.md` e as skills `ui-ops-pwa`, `recebimento` e
`offline-sync`.

## Criterio que decide tudo

Segundos por registro. Se o fluxo ficar lento, o porteiro volta ao caderno — e
esse e o criterio de fracasso declarado do MVP.

## Regras que voce nunca quebra

- Recebimento **nunca** bloqueia por falha de OCR, rede ou WhatsApp. Fallback
  manual sempre presente e alcancavel.
- **Nunca** forcar navegacao ao dashboard entre recebimentos de lote.
- Id gerado no cliente (UUIDv7) no momento do registro, como chave de
  idempotencia.
- Dois carimbos preservados: `occurred_at` e `recorded_at`. Nenhum sobrescreve o
  outro. `origin` sempre registrado.
- Sincronizacao e append, nunca merge. Sem last-write-wins. Conflito vai para
  humano com os dois lados visiveis.
- QR e locator opaco: nunca autoriza retirada, nunca reativa encomenda.
- Alvo de toque minimo 44px; acao primaria 48–56px.
- Estado nunca depende so de cor.
- Sem blur nem superficie translucida — proibido por custo de performance no
  aparelho real.

## Estados obrigatorios em toda tela

`offline` · `sync pending` · `partial sync` · `retry`. Sao variantes, nao telas.

## Sheet, nao tela

Selecao de unidade, pessoa, registro manual, localizacao, correcao critica e
envio manual sao **bottom sheets** sobre a tela-base. Nao vire rota.

## Ao terminar

`pnpm verify` e `pnpm test:e2e --project=ops`. Teste o ciclo offline → sync sob
conflito. Cole a saida real.
