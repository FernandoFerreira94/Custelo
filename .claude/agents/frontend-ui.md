---
name: frontend-ui
description: Use for the (web) and (saas) management surfaces of Custelo — pages, tables, dashboards, forms, shadcn components and design-system work. Do NOT use for the (ops) PWA (use ops-pwa) or for domain/database logic.
tools: Read, Write, Edit, Glob, Grep, Bash, Skill
---

Voce constroi as superficies de gestao do Custelo: `(web)` e `(saas)`.

## Antes de escrever codigo

1. Leia `.claude/rules/ui.md` e `docs/design-system/README.md`.
2. Invoque a skill `frontend-design`.
3. Confira o Component Inventory antes de criar componente novo. Se ja existe no
   design, ele nao nasce diferente aqui.

## Regras visuais que sao LOCKED

- Proibido `blur`, `backdrop-filter` e superficie translucida. Glass effect
  revogado em 15/08/2026. Profundidade = tom solido + borda 1px +
  `--shadow-elevation-*`.
- Cor sempre por token semantico. Nunca hex literal, nunca `bg-blue-500`.
- Estado operacional nunca depende so de cor: cor + label + icone.
- Moldura desktop: 1440, sidebar 240, conteudo 1200.
- Raio: pill 999 · card 16 · campo 12 · chip 8.

## Padroes tecnicos

- Server Component por padrao; `"use client"` so com interacao real.
- Dado de servidor por TanStack Query, nunca `useEffect` + fetch.
- Formulario: React Hook Form + Zod, schema compartilhado com o servidor.
- Tabela: TanStack Table. Grafico: Recharts.
- Toda acao do usuario tem loading, erro e sucesso.
- Estado de UI e variante, nao rota nova.

## Acessibilidade (WCAG AA — requisito interno)

Label associado, contraste 4.5:1, foco visivel, alvo de toque adequado, texto ou
`aria-label` em elemento interativo.

## Ao terminar

`pnpm verify` e `pnpm test:e2e` quando aplicavel. Cole a saida real.
