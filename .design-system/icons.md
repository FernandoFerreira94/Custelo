# Iconografia

**Lucide** (`lucide-react`), coerente com shadcn/ui.

Estilo: outline moderno, geometria simples, cantos suavizados, espessura
consistente. Personalizar apenas quando necessario.

## Tamanhos

| Contexto              | Tamanho |
| --------------------- | ------- |
| icone padrao          | 18–20px |
| acao principal mobile | 22–24px |

## Regras

- Stroke visualmente consistente em toda a interface.
- Nao misturar outline, filled e duotone sem regra explicita.
- **Icone nunca substitui label em acao critica.** Retirar, devolver, cancelar e
  corrigir tem texto.
- Todo estado operacional tem um icone proprio, e ele e derivado do estado — nao
  e uma prop opcional que pode vir vazia.

## Container de icone

Quando o icone tiver container, o padrao e fundo arredondado na mesma cor mais
clara e icone na cor forte.
