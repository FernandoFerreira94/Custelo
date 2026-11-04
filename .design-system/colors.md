# Cores

Valores em `src/app/globals.css`. Este arquivo explica **o que significa cada
token e quando usar**.

## Paleta de marca (LOCKED — ADR-021, 04/11/2026)

| Token  | HEX       | Uso                                              |
| ------ | --------- | ------------------------------------------------ |
| Navy   | `#0C2C55` | texto, navegacao, botao grande, card de destaque |
| Brasa  | `#D23B26` | marca ("Zap", simbolo) e botao pequeno de acao   |
| Nevoa  | `#EEF1F5` | fundo da aplicacao (cards ficam brancos)         |
| Ocean  | `#629FAD` | apoio em graficos e informacao                   |
| Carmim | `#B4123F` | erro e falha (`--destructive`, `--state-falha`)  |

Regras:

- Botao grande e acao primaria da tela: navy (`variant="default"`, size `lg`).
- Botao pequeno de acao: brasa (`variant="brasa"`). Nunca brasa em todos.
- Brasa sobre navy da 2,9:1: sobre navy use a brasa clara (`#F4826D`).
- Erro e carmim, nunca vermelho, para nao parecer a cor da marca.

## Light Mode

`--background` Nevoa · `--foreground` navy · `--card` branco · `--primary` navy
com foreground branco · `--brasa` com hover `#B9321F` · borda `#DDE3EA` · input
`#C6CFDA` (delimitado tambem pela sombra `elevation-1`).

## Dark Mode

Derivado, **ainda nao revisado em prancha**. Fundo `#0A1B33`, cards `#10294A`,
primary `#8CC3CF`, brasa clara `#F4826D`, erro `#FF8FA6`.

Superficies operacionais criticas mantem contraste solido — sem transparencia.

## Sombras

Navy em camadas, sem blur de superficie: `--shadow-elevation-1` (controles),
`-2` (cards), `-3` (overlay), `--shadow-primary` (botao navy) e
`--shadow-brasa` (botao brasa).

## Estados operacionais

Cores funcionais. **Nao substituem a paleta de marca** e nunca sao usadas como
decoracao.

| Estado                  | Direcao         | Token                      |
| ----------------------- | --------------- | -------------------------- |
| Recebida / informacao   | azul            | `--state-recebida`         |
| Aguardando notificacao  | ambar suave     | `--state-aguardando`       |
| Nao identificada        | violeta         | `--state-nao-identificada` |
| Falha de comunicacao    | carmim          | `--state-falha`            |
| Urgente / aging critico | vinho (ADR-021) | `--state-urgente`          |
| Pronta para retirada    | teal            | `--state-pronta`           |
| Retirada concluida      | verde           | `--state-retirada`         |
| Devolvida / cancelada   | slate           | `--state-devolvida`        |
| Offline / sync pendente | cinza-azulado   | `--state-offline`          |

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
| Custelo Depth       | Navy → navy mais profundo                            | login, headers, navegacao              |
| Custelo Aurora      | Deep Blue → azul digital → violeta, glow ciano local | hero, background premium, KPI, loading |
| Custelo Warm Signal | Deep Blue com iluminacao Pale Brown/champagne        | destaques premium, institucional       |

> Gradiente **nunca** e cor de status operacional.

## Scrim

Overlay de modal e drawer: `#0E1533` a 52%, **solido, sem blur**.
Token: `--scrim`.
