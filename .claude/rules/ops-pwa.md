---
paths: ["src/app/(ops)/**", "src/components/ops/**", "src/lib/offline/**"]
---

# OPS — PWA operacional

Superficie do porteiro. Aparelho alvo: Android de baixo custo, uso com uma mao,
no meio do pico. Cada decisao aqui e julgada por segundos por registro.

- Client-side. Server Components nao funcionam offline — consequencia direta do
  ADR-012, nao preferencia estetica.
- **Recebimento nunca bloqueia.** Sem rede, sem OCR, sem WhatsApp: o registro
  acontece. Fallback manual sempre presente e sempre alcancavel.
- **Nunca forcar navegacao ao dashboard entre recebimentos de lote.** Esta e a
  regra que separa "substitui o caderno" de "porteiro volta ao caderno".
- Feedback imediato apos foto, confirmacao e salvamento. Sucesso e breve e nao
  bloqueia o proximo recebimento.
- Estados obrigatorios em toda tela: offline · sync pending · partial sync ·
  retry.
- Erro sempre recuperavel. Nada de beco sem saida no meio de um lote.

## Sincronizacao (ADR-013)

- Id gerado no cliente com UUIDv7, no momento do registro — serve como chave
  natural e como chave de idempotencia do envio.
- Dois carimbos preservados: `occurred_at` (relogio do dispositivo, com fuso) e
  `recorded_at` (relogio do servidor). Nenhum sobrescreve o outro.
- Todo registro carrega `origin = online | offline`.
- Sincronizacao e **append de eventos**, nunca merge de estado. Nao existe
  last-write-wins.
- Conflito logico vai para estado `CONFLITO` e resolucao humana, com os dois
  lados visiveis. Nunca descartado.
- Foto vai para a fila local como Blob e sobe com upload idempotente por hash.
- Sincronizar de forma agressiva na volta da conectividade — nunca acumular fila
  por dias. Pendencia nao sincronizada tem aviso visivel.
- Guardar o desvio entre relogio do dispositivo e do servidor; sinalizar
  divergencia grande.

## Camera, QR e assinatura

- Camera: `getUserMedia` com fallback para `<input capture>`.
- QR: `BarcodeDetector` nativo com fallback `zxing-js`. QR e locator opaco —
  **nunca autoriza retirada, nunca reativa encomenda**.
- Assinatura: canvas com `signature_pad`, exportada como PNG.

## iOS

Ponto fraco assumido: sem Background Sync, risco de ejecao de storage. Nao
escrever codigo que assuma persistencia garantida. Android e o dispositivo
recomendado para a portaria.
