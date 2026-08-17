# Acessibilidade

WCAG **AA** como baseline. Requisito interno DEFINED — nao ha obrigacao
regulatoria especifica identificada, e isso nao muda nada: o produto e usado
por turnos inteiros, todo dia.

## Obrigatorio

- Contraste minimo 4.5:1 para texto normal, 3:1 para texto grande e controles.
- Foco visivel na navegacao por teclado. **Nunca** remover outline sem
  substituto visivel.
- **Estados nunca dependem exclusivamente de cor** — sempre cor + label + icone.
- Alvo de toque adequado no mobile (minimo 44×44px).
- Labels explicitos em acoes criticas. Icone sozinho nao serve para retirar,
  devolver, cancelar ou corrigir.
- `<label htmlFor>` associado a todo input.
- Elemento interativo com texto visivel ou `aria-label`.
- Imagem informativa com `alt` descritivo.
- Respeitar `prefers-reduced-motion`.

## Consequencia direta da revogacao do glass

Todas as superficies sao solidas. A transparencia era, alem de custo de
performance, uma fonte de perda de contraste sobre conteudo variavel — o
contraste de um texto sobre superficie translucida depende do que estiver
atras dele, o que torna a conformidade impossivel de garantir.

## Verificacao

`pnpm a11y` roda Playwright + axe. Violacao `serious` ou `critical` quebra o
build — nao e aviso.

Contraste de token novo deve ser verificado no momento em que o token nasce, nao
depois. Ver a pendencia de validacao das cores de estado em `colors.md`.
