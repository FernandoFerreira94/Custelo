# Responsividade

## Duas experiencias, nao uma escalada

**OPS** e mobile-first de verdade: o aparelho e um Android de baixo custo, e o
uso e com uma mao, em pe, sob pressao de fila. Nao e o layout desktop encolhido.

**WEB/SAAS** e desktop-first responsivo: gestao, busca, analise e administracao.
Responsivo o suficiente para o gestor consultar no celular, mas otimizado para 1440.

## Alvos de toque

| Elemento               | Minimo  | Token                  |
| ---------------------- | ------- | ---------------------- |
| qualquer alvo tocavel  | 44×44px | `--size-touch-min`     |
| acao primaria          | 48px    | `--size-touch-primary` |
| acao principal de tela | 56px    | `--size-touch-hero`    |

A acao central do `BottomNav` tem 64px por decisao de design (AD-011).

## Sobreposicao OPS × WEB

Fila de custodia, detalhe da encomenda, retirada e devolucao existem nas duas
superficies. **A regra de dominio nunca e duplicada** — muda o shell e a
densidade, nao o comportamento.

Portaria opera pelo celular; gestao resolve excecao pelo desktop.

## Densidade

OPS: alta legibilidade, poucos itens visiveis por vez, cartao com area de toque
generosa.
WEB: densidade moderada — tabela precisa caber informacao, mas linha apertada
demais atrapalha auditoria, que e leitura cuidadosa.

## Safe area

O PWA roda instalado, com `viewport-fit=cover`. Respeitar
`env(safe-area-inset-*)` em header, bottom nav e sheets.
