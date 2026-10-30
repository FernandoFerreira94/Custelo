# WebCode Design System no Custelo

Este projeto usa o design system da WebCodeFF (repo `FernandoFerreira94/webcode-design`, registry `@webcode`) como biblioteca de componentes e padrões de tela (decisão do Fernando, 30/10/2026). Se as skills `webcode-design-language`, `webcode-ui-patterns`, `webcode-components`, `webcode-interface-craft` e `webcode-design-review` estiverem em `~/.claude/skills`, use-as: elas têm os detalhes.

## Projeto

- Tipo de produto (blueprint): `field-service` na superfície `(ops)` (PWA da portaria), `saas` na `(web)` (gestão) e `admin` na `(saas)` → siga `blueprints/<id>.md` pela skill `webcode-ui-patterns`.
- Tema: próprio do Custelo (Brand & UI Foundation rev. 15/08/2026, tokens em `src/app/globals.css`). Ainda não existe tema `custelo` no DS: até ele existir, os tokens `--wc-*` que os componentes `@webcode` usam precisam vir do tema exportado pelo Estúdio do DS a partir das cores do Custelo. Não instale componente `@webcode` antes disso.
- Stack: Next.js App Router + Tailwind v4 + shadcn (`radix-nova`). Componentes em `src/components/ui/`, import por `@/components/ui/<nome>`.

## O que continua valendo do Custelo (LOCK)

- **Sem vidro**: nada de blur, `backdrop-filter`, superfície translúcida nem `variant="glass"`/`material="glass"` dos componentes `@webcode`. Profundidade = tom sólido + borda 1px + `--shadow-elevation-0..3`.
- Estado nunca só por cor: cor + label + ícone. Alvo de toque ≥ 44px; ação primária 48–56px.
- Conflito entre o DS WebCode e o LOCK do Custelo: o LOCK vence até um ADR novo.

## Componentes

1. Existe em `@webcode`? Instale: `npx shadcn@latest add @webcode/<nome>` (namespace registrado no `components.json`; `GITHUB_TOKEN` no `.env`, nunca no git).
2. Não existe? Use `@shadcn/<nome>`: herda o tema pela ponte de tokens. Anote a falta em `DESIGN-NOTAS.md`.
3. Tela inteira (hero, checkout, kanban, dashboard…)? Parta do padrão da skill `webcode-ui-patterns`.
4. Não edite a API dos componentes; acrescente props. Não crie uma segunda versão de um componente que já existe.

- Catálogo: página **Componentes** do site do DS ou `skills/webcode-components/SKILL.md`.
- Dados brasileiros: `input-document` (CPF/CNPJ), `input-cep`, `input-currency` (R$ em centavos), `input-date`, `price-tag` (Pix e parcelas), formatação em `@/lib/br`.

## Regras fixas

- Cor só por token: classes Tailwind do tema (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `text-brand`, `border`). Nada de hex, rgb ou cor nomeada do Tailwind (`bg-blue-500`).
- Sem `dark:`: os tokens já trocam no escuro.
- `accent` é fundo de hover do shadcn; a cor da marca é `brand`.
- Altura de controle e texto pelos tokens do tema (`h-(--wc-density-control-*)`, `text-*`); não fixe `h-10` nem px.
- Foco visível: `focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring`.
- Contraste WCAG AA, alvo de toque ≥ 44px no celular, estado nunca só por cor.
- Movimento só em `transform`/`opacity`, durações e curvas do tema, desligado com movimento reduzido. Motion (lib) só quando o componente `@webcode` já usa.
- Textos da interface em pt-BR.

## Ao terminar uma tela

- Confira largura de celular (sem rolagem horizontal) e os modos de cor que o projeto usa.
- Revise com a skill `webcode-design-review` quando ela estiver instalada.
- Faltou componente/padrão ou algo do sistema atrapalhou? Anote em `DESIGN-NOTAS.md` para levar ao repo do design system.

## Instalação (uma vez)

- Skills (por computador): `git clone https://github.com/FernandoFerreira94/webcode-design && cd webcode-design && npm run skills:install:win` (Windows) ou `npm run skills:install`.
- No `components.json` do app:
  ```json
  "registries": {
    "@webcode": {
      "url": "https://raw.githubusercontent.com/FernandoFerreira94/webcode-design/main/site/public/r/{name}.json",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
  ```
- O repo do DS é privado: token fine-grained do GitHub, só leitura de Contents do `webcode-design`, em `GITHUB_TOKEN=` no `.env` local.
- Guia completo: `docs/usar-em-projeto.md` no repo do DS.
