# Motion

> Movimento deve comunicar estado, nao decorar.

## Duracoes

| Tipo                         | Duracao   | Token                   |
| ---------------------------- | --------- | ----------------------- |
| microinteracao               | 150–220ms | `--duration-micro`      |
| transicao de pagina/contexto | 200–300ms | `--duration-transition` |

Easing padrao: `--ease-custelo` (`cubic-bezier(.2, 0, 0, 1)`).

## Regras

- **Evitar animacao continua em tela operacional.** O porteiro esta lendo uma
  fila sob pressao; movimento constante e ruido.
- Feedback de sucesso e **breve** e nao bloqueia o proximo recebimento. Um toast
  que exige dispensa manual entre itens de um lote e um bug de operacao.
- Loading pode usar o simbolo Custelo com pulsacao/fluxo discreto.
- Respeitar `prefers-reduced-motion` — ja tratado globalmente em `globals.css`.

## Sem biblioteca de animacao

Tailwind + `tw-animate-css` cobrem o necessario. Nao adicionar Framer Motion,
GSAP ou similar sem justificativa registrada — o alvo e Android de baixo custo.
