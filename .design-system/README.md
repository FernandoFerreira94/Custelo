# Design System — Custelo

Fundacao aprovada em 13/08/2026, revisada em 15/08/2026 (glass effect revogado).
Status: **DEFINED**.

## Fonte da verdade

| Camada                      | Onde                                              |
| --------------------------- | ------------------------------------------------- |
| Valores dos tokens (codigo) | `src/app/globals.css` — **canonico para o repo**  |
| Decisao e racional          | Notion "Custelo — Brand & UI Foundation"          |
| Referencia visual           | Penpot, arquivo "Custelo" (53 componentes-mestre) |

O Penpot e referencia visual; o repo e a fonte de valor. Divergiu? O repo esta
certo e o Penpot precisa alinhar — ou o contrario precisa ser decidido e
registrado, nunca resolvido no codigo em silencio.

## Arquivos

| Arquivo            | Conteudo                                         |
| ------------------ | ------------------------------------------------ |
| `colors.md`        | paleta, tokens semanticos, estados operacionais  |
| `typography.md`    | Inter, pesos, tamanhos minimos, hierarquia       |
| `layouts.md`       | espacamento, raio, densidade, molduras, elevacao |
| `components.md`    | inventario dos 53 componentes-mestre             |
| `icons.md`         | estilo, tamanhos, regra de uso                   |
| `animations.md`    | duracoes, easing, o que nao animar               |
| `responsive.md`    | mobile-first, breakpoints, alvos de toque        |
| `accessibility.md` | WCAG AA, foco, contraste, estados                |
| `examples.md`      | padroes de uso corretos e incorretos             |

## As tres regras que nao se negocia

1. **Sem blur, sem `backdrop-filter`, sem superficie translucida.**
   O glass effect foi revogado em 15/08/2026 por custo de performance no Android
   de baixo custo que o porteiro realmente usa, perda de contraste sobre conteudo
   variavel e manutencao desproporcional ao ganho.
   Profundidade vem de: tom solido + borda 1px de baixo contraste + escala fixa
   de 3 sombras.

2. **Estado nunca depende so de cor.** Sempre cor + label + icone.
   Isso e acessibilidade e tambem operacao: o porteiro le a fila de relance.

3. **Cor sempre por token semantico.** Nunca hex literal no componente, nunca
   `bg-blue-500`. Se falta um token, o token e que precisa nascer.

## Hierarquia visual

Ordem de prioridade na tela — nesta ordem, sempre:

1. acao necessaria agora
2. excecoes e falhas
3. status da operacao
4. contexto da encomenda/unidade
5. metricas
6. informacao historica e secundaria

> A interface nao deve transformar todos os elementos em destaque simultaneamente.

## Personalidade

Direcao principal: **Confianca Operacional**. Complementar: **Fluxo Conectado**.
Estilo: Clean B2B SaaS + Operational Premium.

Evitar: estetica de ERP antigo, banco tradicional, transportadora, neon/gamer,
glassmorphism (revogado) e interface excessivamente decorativa.

## Pendencia bloqueante (cliente)

Logo em SVG — simbolo + lockup, positivo e invertido — favicon 32, icone de app
512 exportado do vetor, e confirmacao da fonte serifada do wordmark com licenca.

Sem isso nao ha marca nitida em splash, favicon, icone de instalacao do PWA, PDF
de relatorio e comprovante de retirada. A geometria ja esta reservada no board
APP-01 do Penpot.

Existem PNGs em `Imagen/` (`logo-custelo-escrita.png`, `logo-custelo-icon.png`)
que servem de referencia, mas **nao substituem o vetor**.
