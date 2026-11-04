# PacoteZap · Guia de marca (1 página)

**Símbolo:** um pino de mapa em forma de caixa (o pacote e onde ele está), o brilho de IA dentro (quem sugere o registro) e o raio do Zap no canto (o aviso). Cada elemento tem um significado só.
**Prancha final com os testes:** https://claude.ai/artifact/VJSQBVpHXncNwqJyrEuNr8 (cópia em `prancha-teste.html`).
**Splash escolhido:** "IA primeiro" (todas as opções: https://claude.ai/artifact/QJnMYt1aZvDNnTth3TpFMc).
**Status (03/11/2026):** rascunho vetorial de produção, fechado em 7 rodadas. Refinar com designer antes do registro no INPI.

## Versões
| Versão | Uso | Arquivo |
| --- | --- | --- |
| Completa (≥ 240 px) | site, proposta, splash | `svg/pacotezap-completo-*.svg` (assinatura "Encomendas com prova" é proposta) |
| Padrão (120–240 px) | cabeçalho da gestão, e-mail | `svg/pacotezap-horizontal-*.svg`, `svg/pacotezap-vertical-*.svg` |
| Compacta (48–120 px) | barra do app, avatar | `svg/pacotezap-simbolo-*.svg` |
| Mínima (16–47 px, redesenhada) | favicon, badges | `svg/pacotezap-simbolo-mini-*.svg` (um brilho só, raio maior) |

Variantes: `cor` (fundo claro: pino navy, raio brasa) · `invertido` (fundo navy/grafite: pino branco, raio brasa clara) · `mono-navy` · `mono-preto` · `mono-branco`.

## Cores (tokens, nunca hex solto no app)
- `--pz-navy` #0C2C55: pino, "Pacote" e fundo escuro.
- `--pz-brasa` #D23B26: raio e "Zap" sobre fundo claro.
- `--pz-brasa-clara` #FF6B4F: raio e "Zap" sobre fundo escuro (brasa sobre navy dá 2,92:1 e é proibida).
- `--pz-prata` #C9CED6 e `--pz-grafite` #2A2D33: assinatura e fundos neutros.

## Tipografia
Plus Jakarta Sans ExtraBold (OFL), convertida em contorno. Assinatura em Bold, tracking +10.

## Espaço livre e mínimos
X = 1/4 da altura do símbolo (12 de 48). Espaço livre = X em volta; símbolo↔nome = X.
Mínimos: horizontal 96 px de largura (24 px de altura) / 25 mm; símbolo 16 px / 5 mm.

## Pode / não pode
- Pode: cor em fundo claro ou Névoa; invertido em navy ou grafite; mono quando só há uma cor.
- Pode: sobre foto, só invertido, em camada navy a 70% ou faixa navy.
- Não pode: brasa sobre navy, degradê, sombra, contorno, girar, esticar, trocar a fonte, tirar o recorte entre raio e pino, usar o símbolo principal abaixo de 48 px, usar o brilho sozinho (vira estrela).

## Ícones e favicon
`favicon/favicon.svg` (troca de cor em tema escuro), `favicon.ico` (16/32/48), `favicon-16/32.png`, `apple-touch-icon.png` (180),
`icon-192/512.png` (any, transparente) e `icon-maskable-192/512.png` (fundo navy, zona segura 80%).

## Splash (`splash/`)
`PacoteZapSplash.tsx` + `pacotezap-splash.css` (React/Next), `pacotezap-splash.svg` (markup) e `pacotezap-splash.html` (demo).
Props: `fundo` ("escuro" | "claro"), `nome` (mostra o nome), `pronto` (pula para o estado final quando o app carregar). Respeita `prefers-reduced-motion`.

## Pendências
- Teste de 5 segundos com 3 pessoas (passa com 2 de 3 citando entrega, pacote ou aviso).
- Busca no INPI (classes 9 e 42), domínio e @; atenção a "Zap" (gíria do WhatsApp) e à Zapier.
- PDF vetorial CMYK para impresso; ligar favicon/manifest/splash no app.
