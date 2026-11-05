# WebCode Design System no Custelo

Este projeto usa o design system da WebCodeFF (repo `FernandoFerreira94/webcode-design`, registry `@webcode`) como biblioteca de componentes e padrões de tela (decisão do Fernando, 30/10/2026). Se as skills `webcode-design-language`, `webcode-ui-patterns`, `webcode-components`, `webcode-interface-craft` e `webcode-design-review` estiverem em `~/.claude/skills`, use-as: elas têm os detalhes.

## Projeto

- Tipo de produto (blueprint): `field-service` na superfície `(ops)` (PWA da portaria), `saas` na `(web)` (gestão) e `admin` na `(saas)` → siga `blueprints/<id>.md` pela skill `webcode-ui-patterns`.
- Tema: `custelo` no DS (`@webcode/theme-custelo`), feito a partir do `src/app/globals.css` (Névoa + Brasa, ADR-021: navy, fundo Névoa, brasa nas ações pequenas, erro carmim, Plus Jakarta Sans nos títulos, Inter no corpo). O `globals.css` continua sendo a fonte canônica: antes de instalar o tema, compare os dois e mantenha os estados de encomenda (`--state-*`) e a elevação sólida do projeto.
- Stack: Next.js App Router + Tailwind v4 + shadcn (`radix-nova`). Componentes em `src/components/ui/`, import por `@/components/ui/<nome>`.

## O que continua valendo do Custelo (LOCK)

- **Sem vidro**: nada de blur, `backdrop-filter`, superfície translúcida nem `variant="glass"`/`material="glass"` dos componentes `@webcode` (única exceção: `TabBar` inferior do `(ops)` com `material="glass"`, ADR-022). Profundidade = tom sólido + borda 1px + `--shadow-elevation-0..3`.
- Estado nunca só por cor: cor + label + ícone. Alvo de toque ≥ 44px; ação primária 48–56px.
- Conflito entre o DS WebCode e o LOCK do Custelo: o LOCK vence até um ADR novo.

## Tema, plano B e avisos

- Tema = `theme-custelo` + override Nevoa no `globals.css` (o `globals.css` e a fonte canonica).
- Plano B quando o registry nao responde: `scripts/webcode-add.mjs`.
- Toast x `notify()`: `notify()` para o resultado de uma acao do usuario (some sozinho);
  alerta/banner na tela para estado que precisa continuar visivel (erro de login, bloqueio).

## Componentes

1. Existe em `@webcode`? Instale: `npx shadcn@latest add @webcode/<nome>` (namespace `@webcode` no `components.json`, registry público, sem token).
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
    "@webcode": "https://webcode-design.vercel.app/r/{name}.json"
  }
  ```
- Registry público no site do DS (https://webcode-design.vercel.app), sem token. Atualizar componente já instalado: não reinstale por cima; o `npm run sync` do repo do DS mostra o diff e só aplica o que não foi customizado (base em `webcode-ds.lock.json`, não edite).
- Guia completo: `docs/usar-em-projeto.md` no repo do DS.
