# Cores

Valores em `src/app/globals.css`. Este arquivo explica **o que significa cada
token e quando usar**.

## Paleta de marca (LOCKED)

| Token        | HEX       | Uso                                              |
| ------------ | --------- | ------------------------------------------------ |
| Deep Blue    | `#182350` | primary, fundos profundos, navegacao, identidade |
| Powder Blue  | `#AFD2FA` | secondary, selecao, highlights, informacao       |
| Floral White | `#FEFAEF` | background claro, cards, superficies premium     |
| Pale Brown   | `#B9915E` | accent premium, detalhes e destaques controlados |

Contraste validado: Deep Blue sobre Floral White e alto; Deep Blue tambem
contrasta adequadamente sobre Powder Blue e Pale Brown.

> **Pale Brown nao deve ser usado indiscriminadamente como texto pequeno sobre
> fundo claro.** E accent, nao cor de corpo de texto.

## Light Mode

`--background` Floral White · `--foreground` Deep Blue · `--card` branco ·
`--primary` Deep Blue com foreground Floral White · `--secondary` Powder Blue com
foreground Deep Blue · `--accent` Pale Brown · borda neutra e discreta, que nunca
compete com o conteudo.

## Dark Mode

Nao e inversao do Light. Fundo base derivado do Deep Blue, **mais escuro** que
`#182350`. Cards em navy elevado. Powder Blue vira o destaque ativo e o foco.
Floral White vira o texto principal. Pale Brown permanece accent.

Superficies operacionais criticas mantem contraste solido — sem transparencia.

## Estados operacionais

Cores funcionais. **Nao substituem a paleta de marca** e nunca sao usadas como
decoracao.

| Estado                  | Direcao             | Token                      |
| ----------------------- | ------------------- | -------------------------- |
| Recebida / informacao   | azul                | `--state-recebida`         |
| Aguardando notificacao  | ambar suave         | `--state-aguardando`       |
| Nao identificada        | violeta             | `--state-nao-identificada` |
| Falha de comunicacao    | vermelho controlado | `--state-falha`            |
| Urgente / aging critico | laranja-vermelho    | `--state-urgente`          |
| Pronta para retirada    | teal                | `--state-pronta`           |
| Retirada concluida      | verde               | `--state-retirada`         |
| Devolvida / cancelada   | slate               | `--state-devolvida`        |
| Offline / sync pendente | cinza-azulado       | `--state-offline`          |

> **Regra:** nenhum estado depende somente de cor. Sempre cor + label + icone.

### Pendencia conhecida

A fundacao de marca define a **direcao** de cor de cada estado, nao o HEX.
Os valores atuais em `globals.css` foram derivados para atender WCAG AA e estao
marcados como pendentes de validacao contra o board de tokens do Penpot
(pagina "00 — Foundations"). Validar antes da Wave de implementacao visual.

## Gradientes

Elementos de profundidade e branding, **nao** preenchimento padrao de componente.
Restritos a superficies de marca: login, splash, empty state ilustrado e
cabecalho de relatorio. Nunca atras de texto de leitura ou dado operacional.

| Gradiente           | Composicao                                           | Uso                                    |
| ------------------- | ---------------------------------------------------- | -------------------------------------- |
| Custelo Depth       | Deep Blue → navy mais profundo                       | login, headers, navegacao              |
| Custelo Aurora      | Deep Blue → azul digital → violeta, glow ciano local | hero, background premium, KPI, loading |
| Custelo Warm Signal | Deep Blue com iluminacao Pale Brown/champagne        | destaques premium, institucional       |

> Gradiente **nunca** e cor de status operacional.

## Scrim

Overlay de modal e drawer: `#0E1533` a 52%, **solido, sem blur**.
Token: `--scrim`.
