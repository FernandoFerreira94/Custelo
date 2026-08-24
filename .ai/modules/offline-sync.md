# offline-sync

Fila local, UUIDv7, dois timestamps, idempotencia e conflito. Modulos 06 e 07.

## Escopo real

Offline **limitado ao recebimento** — nao e operacao offline completa. OCR,
WhatsApp e servicos externos aguardam reconexao.

## Desenho (ADR-013)

- **Id gerado no cliente** (UUIDv7) no momento do registro. Serve como chave
  natural e como chave de idempotencia do envio.
- **Dois carimbos preservados**: `occurred_at` (relogio do dispositivo, com fuso)
  e `recorded_at` (relogio do servidor na chegada). Nenhum sobrescreve o outro.
- Todo registro carrega `origin = online | offline`.
- Foto vai para a fila local como Blob e sobe com upload idempotente por hash.

## Invariantes

> Sincronizacao e **append**, nunca merge de estado. Nao existe last-write-wins.
> Conflito vai para humano, nunca e descartado.
> `origin` sempre registrado.
> Sincronizacao nunca sobrescreve nem apaga evidencia.

## Conflito

Conflito logico — por exemplo, encomenda ja retirada quando o registro offline
chega — entra em estado `CONFLITO` e vai para resolucao humana, com **os dois
lados visiveis**.

CRDT foi descartado: resolveria conflito de texto, nao de semantica de custodia.
Aqui o conflito e uma excecao operacional real que merece decisao humana.

## Estados do registro offline

`LOCAL · SINCRONIZANDO · SINCRONIZADO · CONFLITO`

## Riscos

- Relogio do dispositivo errado distorce `occurred_at`. Mitigacao: guardar o
  desvio entre os dois relogios e sinalizar divergencia grande.
- iOS pode ejetar armazenamento sob pressao e nao tem Background Sync.
  Mitigacao: sincronizacao agressiva na volta da conectividade, aviso visivel de
  pendencia, e Android recomendado para o aparelho de portaria.

## Por que vem cedo (I6, nao no fim)

A sincronizacao define ids, timestamps e idempotencia que atravessam todo o
modelo. Deixar para o fim obriga a reescrever I4 e I5.

## Telas

REC-009, REC-010. Fase I6.
