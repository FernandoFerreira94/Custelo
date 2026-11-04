# ui-ops-pwa

Shell operacional, camera, assinatura e estados offline. Modulos 06 e 08.

## Contexto de uso real

Porteiro, Android de baixo custo, uma mao, no meio do pico. Cada toque a mais e
segundo a mais no KPI que decide se o produto substitui o caderno.

## Invariantes

> **Nunca forcar navegacao ao dashboard entre recebimentos de lote.**
> Alvo de toque minimo 44px.
> Estado nunca depende so de cor.

## Desenho (ADR-012 / ADR-018)

- Client-side. Server Components nao funcionam offline.
- PWA instalavel: Serwist (Service Worker) + Dexie (IndexedDB).
- Estado de servidor: TanStack Query com persistencia em IndexedDB.
- Camera: `getUserMedia` com fallback `<input capture>`.
- Assinatura: canvas com `signature_pad`, exportada como PNG.
- QR: `BarcodeDetector` nativo com fallback `zxing-js`.

## Principios de UX (Brand & UI Foundation §14)

acao primaria evidente · poucos campos · confirmacao rapida · uso com uma mao ·
acoes criticas na area do polegar · feedback imediato apos foto, confirmacao e
salvamento · erros recuperaveis · fila legivel por status.

## Estados obrigatorios em toda tela do OPS

`offline` · `sync pending` · `partial sync` · `retry`.
Estes sao **variantes**, nao telas separadas.

## Sheet, nao tela

Decisao de 16/08/2026: REC-004, REC-005, REC-006, CUS-005, CUS-004, DEV-002 e
NOT-004 sao **bottom sheets** sobre a tela-base. O operador insere unidade,
pessoa ou registro manual sem sair da tela de confirmacao.

Nao transformar estado em pagina. Nao transformar sheet em rota.

## Superficie e proibicao

Nada de blur, `backdrop-filter` ou superficie translucida — revogado em
15/08/2026 por custo de performance no aparelho real. Profundidade vem de tom
solido + borda 1px + `--shadow-elevation-*`.

## Telas

Todo o route group `(ops)`: AUTH, REC, CUS, RET, DEV, NOT. Fases I5, I6, I8.
