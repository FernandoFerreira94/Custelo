# Benchmark da leitura da etiqueta (D4)

**Status:** não rodado. Depende do Fernando: 40 fotos reais do condomínio piloto
(com autorização), o gabarito e as chaves dos dois provedores.

## Como rodar

1. Coloque as fotos e `gabarito.csv` (`arquivo;unidade_codigo;nao_deve`) em
   `tests/evals/etiquetas/` (fora do git).
2. Preencha `LEITURA_OCR_CHAVE` e `LEITURA_LLM_CHAVE` no arquivo de ambiente
   local e confira, na doc oficial do dia, modelo e preço em
   `src/infrastructure/leitura/config.ts` (`CONFERIDO_EM`).
3. Rode `scripts/benchmark-leitura.mjs` com Node 22 carregando esse arquivo de
   ambiente (`--env-file`) e `--experimental-strip-types`.

O script imprime, por adaptador: falhas, latência p50 e p95 e custo médio. Nenhuma
imagem nem texto lido vai para o console.

## Metas (decidem o adaptador)

| Métrica                      | Meta      |
| ---------------------------- | --------- |
| Precisão da confiança "alta" | ≥ 98%     |
| Latência p95                 | ≤ 2 s     |
| Custo por etiqueta           | ≤ R$ 0,02 |

Ganha o adaptador com mais acertos no topo entre os que batem as três metas;
empate, o mais barato. Se ganhar o `llm-visao`, escrever o ADR-023 e pedir o OK
antes de mudar `LEITURA_ETIQUETA`.

## Resultado

(preencher)
