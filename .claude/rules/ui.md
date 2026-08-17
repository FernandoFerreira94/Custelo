---
paths: ["src/components/**", "src/app/**/*.tsx", "src/app/globals.css"]
---

# UI

Tokens sao LOCKED. `src/app/globals.css` e a fonte canonica; o Penpot e
referencia visual, nao fonte de valor.

- **Proibido** `blur`, `backdrop-filter`, superficie translucida e "frosted".
  Glass effect revogado em 15/08/2026 por custo de performance no Android real
  do porteiro. Profundidade vem de tom solido + borda 1px + `--shadow-elevation-*`.
- Cor sempre por token semantico. Nunca hex literal, nunca `bg-blue-500`.
- Estado operacional **nunca** depende so de cor: cor + label + icone.
- Raio: pill/botao `--radius-pill` · card/superficie `--radius-surface` · campo
  `--radius-field` · chip dentro de card `--radius-chip`.
- Espacamento em multiplos de 4.
- Server Component por padrao em `(web)` e `(saas)`. `"use client"` so onde ha
  interacao — e com motivo visivel no arquivo.
- Dado de servidor via TanStack Query. Nunca `useEffect` + `fetch`.
- Toda rota que busca dado tem limite de Suspense/skeleton.
- Toda acao do usuario tem os tres estados: loading, erro, sucesso.
- Componente pesado entra por `dynamic()`.
- Imagem por `next/image` com `width`/`height`.

## Acessibilidade (WCAG AA, requisito interno DEFINED)

- Elemento interativo tem texto visivel ou `aria-label`.
- `<label htmlFor>` associado em todo input.
- Contraste 4.5:1 texto normal, 3:1 texto grande.
- Foco visivel — nunca remover outline sem substituto visivel.
- Alvo de toque minimo 44px; acao primaria 48–56px.
- Respeitar `prefers-reduced-motion` (ja tratado em `globals.css`).

## Antes de criar componente novo

Consultar o Component Inventory (53 componentes-mestre no Penpot) e a skill
`frontend-design`. Componente que ja existe no design nao nasce diferente aqui.
Hierarquia visual e ordem de prioridade: `docs/design-system/foundations.md`.
