# Design System — cache de implementacao

Cache compacto. Fonte visual: Penpot "Custelo" (53 componentes-mestre).
Fonte de **valor no codigo:** `src/app/globals.css`. Detalhe: `.design-system/`.
Se este arquivo e o Penpot divergirem, nao resolva no silencio — decida e
registre em `.ai/memory.md`.

## Visual direction

**Confianca Operacional** + **Fluxo Conectado**. Clean B2B + operational
premium. Hierarquia na tela: acao agora → excecoes → status → contexto da
encomenda → metricas → historico.

Evitar: ERP antigo, banco, transportadora, neon/gamer, glassmorphism,
decoracao que compete com o dado.

## Tokens

Marca LOCKED: Deep Blue `#182350` · Powder Blue `#AFD2FA` · Floral White
`#FEFAEF` · Pale Brown `#B9915E` (accent, nao texto pequeno).

Light: background Floral White, foreground Deep Blue, primary Deep Blue.
Dark: **nao e inversao** — base mais escura que `#182350`; Powder Blue no foco.

Estados operacionais (cor + label + icone, sempre): recebida, aguardando,
nao identificada, falha, urgente, pronta, retirada, devolvida, offline.
HEX dos estados ainda pendente de validar no board Penpot "00 — Foundations".

Gradiente so em marca (login, splash, KPI, relatorio) — nunca em status.
Scrim de overlay: `--scrim` solido, sem blur.

## Layout

Base 4px (4/8/12/16/24/32/40). Raios: pill 999 · surface 16 · field 12 ·
chip 8 · sheet 20. Elevacao 0–3 (`--shadow-elevation-*`) + borda 1px.
OPS 390×908. WEB/SAAS 1440 / sidebar 240 / conteudo 1200.

**Proibido:** `blur`, `backdrop-filter`, superficie translucida.

## Typography

Produto: Inter 400/500/600/700 via `next/font`. Minimo operacional 14px.
Numeros da fila em 600. Hierarquia por peso/tamanho/espaco — cor ja significa
estado. Wordmark: Bodoni Moda (`--font-heading`) ate a didone licenciada
chegar; e arte de marca, nao texto de UI.

## Components

shadcn/ui (preset nova, base radix) antes de primitivo novo. Conferir
`components.json` e o inventario Penpot. Sheets no OPS: unidade, pessoa,
registro manual, localizacao, correcao, envio manual — overlay na tela-base.

Cor sempre por token semantico. Nunca hex no componente, nunca `bg-blue-500`.

## Motion

Micro 150–220ms · transicao 200–300ms · `--ease-custelo`. Sem animacao
continua na fila. Toast de sucesso nao bloqueia o proximo item.
`prefers-reduced-motion` e global.

OPS: so CSS / `tw-animate-css`. Sem Framer Motion.
AUTH `/entrar`: GSAP + `@gsap/react` **restritos a essa tela** (intro +
translate de palco). Nao espalhar GSAP para o PWA.

## States

Loading / empty / error / success / disabled / forbidden / offline / sync
pending. Foco visivel. Alvo 44px; CTA primaria 48–56px. WCAG AA.

## Do / Avoid

Do: Server Component default; `"use client"` no menor limite; estado como
variante; confirmar acao elevada com motivo.
Avoid: Lenis, biblioteca de motion no OPS, glass, estado so por cor, hover
magnetico no CTA de login, foto de etiqueta em WhatsApp.
