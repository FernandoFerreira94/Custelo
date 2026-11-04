# WebCode UI Migration + Dead Code Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levar as telas que já existem (entrada, contexto, sem acesso, estados globais e cascas das superfícies) para os componentes da biblioteca `@webcode` no visual aprovado das pranchas (Névoa + Brasa, Plus Jakarta Sans, sombra "flutuar", logo final) e, no fim, remover todo código morto.

**Architecture:** Só a camada visual muda. Schemas Zod, `request*.ts`, Server Actions, Route Handlers, `src/lib/mensagens.ts`, guard de superfície e testes de comportamento continuam como estão. Os componentes vêm do registry `@webcode` para `src/components/ui/`. O tema é `theme-custelo` do DS com override Névoa no `src/app/globals.css`, que continua sendo a fonte canônica. As composições de tela (trilho, aba de ações, barra da portaria) ficam em `src/components/shell/`, montadas só com primitivos da biblioteca.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn (`radix-nova`) + registry `@webcode`, `sonner`, Vitest (unit/ui), Playwright (e2e/a11y), pnpm.

**Spec:** `docs/plano/PLANO-EXECUCAO-WEBCODE-UI.md` (decisões, mapa tela × prancha × fase, cola da API). Pranchas: `docs/pranchas/` e o artifact https://claude.ai/artifact/62ToCCANhT2uCNvvi4eWoD.

## Global Constraints

- **Componente só da biblioteca `@webcode`.**
  - Faltou algum: anote em `DESIGN-NOTAS.md` ("Faltou na biblioteca") e siga com o resto.
  - Nunca crie primitivo novo nem copie componente de outro lugar.
- **Elemento da prancha sem backend não entra.** Exemplos:
  - link mágico por e-mail;
  - "Manter conectado";
  - "Pedir acesso ao gestor";
  - "Abrir sempre neste empreendimento";
  - aceite de termos sem página de termos;
  - selo "Todos os serviços funcionando".

  Anote cada um em `DESIGN-NOTAS.md` ("Prancha × backend").

- **Dados das pranchas são exemplo.** Nunca leve nomes, números ou contatos para o app.
- **Rótulos de botão e campo que os testes usam não mudam.** Exemplos: "Entrar", "Esqueci minha senha", "Aceitar convite", "Voltar para o login", "Enviar link de recuperação", "Salvar senha", "Criar acesso e entrar", "E-mail", "Senha", "Nova senha", "Confirmar senha", "Nome completo", "Criar senha". Muda a aparência; o texto testado fica.
- **LOCKs:**
  - Sem vidro: nunca `variant="glass"`, `material="glass"` nem `backdrop-filter`.
  - Estado sempre com cor + texto + ícone.
  - Alvo de toque de pelo menos 44 px.
  - Sem hex no TSX e sem `dark:`.
  - pt-BR.
  - Nunca `service_role` em request.
  - Nunca commitar `.env`.
- **Toda tela passa pelo Protocolo de Design Review** (revisor Sonnet, 4 larguras, igual à prancha) antes do commit.
- **Toda ação mostra carregando, sucesso e erro**, com texto de `src/lib/mensagens.ts`.
- **Perguntar ao Fernando antes de:** dependência npm nova (`sonner` já aprovado), migration, auth/segredo, ou apagar algo fora da Task 17.
- **Commits:** Conventional Commits com escopo de `commitlint.config.mjs` (`ui`, `docs`, `deps`, `config`). Linhas do corpo com no máximo 100 caracteres.
- **Rodar no PC do Fernando** (Remote Control). A nuvem não alcança `webcode-design.vercel.app` nem `ui.shadcn.com`.
  - Sem rede para o registry: `WEBCODE_REGISTRY=<webcode-design>/site/public/r node scripts/webcode-add.mjs <nomes>` no lugar de `npx shadcn add`.
- **CI do GitHub está parado por cobrança.** A evidência é a saída local dos comandos, colada no PR.

## Pranchas de referência (o que cada task precisa igualar)

As pranchas **ainda estão sendo construídas**. Sempre use a versão em `docs/pranchas/`; o índice está em `docs/pranchas/README.md`. A aba ao vivo do artifact (https://claude.ai/artifact/62ToCCANhT2uCNvvi4eWoD) é a que o Fernando abre. Se a prancha da task mudou depois de 04/11, atualize `docs/pranchas/` antes (README, seção "Atualizar").

| Task | Tela                                 | Fonte (`docs/pranchas/…`)                                                                     | Foto de referência (`docs/pranchas/telas/…`)                                                                                            | Aba                    |
| ---- | ------------------------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 3    | Tema, fonte, flutuar                 | `pz-todas/todas.tsx` (`FLUTUAR`), `pz-dash/painel.tsx` (`PALETAS[0]`, `vars`)                 | `entrada/auth-001-entrar-desktop.webp`                                                                                                  | `#entrada`, `#laranja` |
| 4    | Marca e splash                       | `pz-marca/marca.tsx`, `pz-entrada/entrada.tsx` (`Splash`)                                     | `entrada/splash-abertura.webp`, `entrada/splash-abertura-no-computador.webp`                                                            | `#entrada`, `#laranja` |
| 5    | 404, 403, 500, carregando, vazio     | `pz-estados/estados.tsx` (`Erros`, `EsqueletoDesktop`, `Vazios`)                              | `estados/bloco-e-erros.webp`, `estados/bloco-e-carregar.webp`, `estados/load-dash-painel-carregando.webp`, `estados/bloco-e-vazio.webp` | `#estados`             |
| 6    | Palco de entrada (desktop e celular) | `pz-entrada/entrada.tsx` (`EntrarDesktop`, `EntrarCelular`, `PainelMarca`, `Fundo`, `Rodape`) | `entrada/auth-001-entrar-desktop.webp`, `entrada/auth-001-entrar-celular.webp`                                                          | `#entrada`             |
| 7    | Login AUTH-001                       | `pz-entrada/entrada.tsx` (`FormEntrar`)                                                       | `entrada/auth-001-entrar-desktop.webp`, `entrada/auth-001-entrar-celular.webp`                                                          | `#entrada`             |
| 8    | AUTH-002/003/004                     | `pz-entrada/entrada.tsx` (`CartaoAuth`, `Convite`, `Recuperar`)                               | `entrada/auth-002-auth-004-convite-e-criar-senha.webp`, `entrada/auth-003-recuperar-senha.webp`                                         | `#entrada`             |
| 9    | Ajuda                                | `pz-entrada/entrada.tsx` (`BotaoAjuda`, `AjudaCorpo`)                                         | `entrada/auth-ajuda-ajuda-para-entrar-aberta.webp`                                                                                      | `#entrada`             |
| 10   | AUTH-005                             | `pranchas/pranchas.tsx` (`Contexto`)                                                          | `portaria/auth-005-escolher-empreendimento.webp`                                                                                        | `#portaria`            |
| 11   | AUTH-006                             | `pz-entrada/entrada.tsx` (`SemAcesso`, `SemAcessoCelular`)                                    | `entrada/auth-006-sem-acesso.webp`                                                                                                      | `#entrada`             |
| 12   | Trilho (web/admin)                   | `pz-dash/painel.tsx` (`Trilho`, `DashA`)                                                      | `painel/dash-a-bento.webp` (só a coluna do trilho e o grid)                                                                             | `#painel`              |
| 13   | Barra da portaria                    | `pz-dash/painel.tsx` (`NavMobile`, `MobC`)                                                    | `painel/mob-c-portaria.webp` (só a barra inferior)                                                                                      | `#painel`              |
| 14   | Páginas iniciais vazias              | `pz-estados/estados.tsx` (`Vazios`)                                                           | `estados/bloco-e-vazio.webp`                                                                                                            | `#estados`             |

Telas das próximas fases: veja o Apêndice A do Spec e `docs/pranchas/README.md`.

## Protocolo de Design Review (obrigatório em toda task de tela)

**Quando:** em toda task que muda o que aparece na tela (Tasks 3 a 14), **antes do commit**, e de novo no fim de cada PR, com todas as telas do PR. O executor não aprova o próprio visual: quem aprova é um **subagente Sonnet de design**.

**Meta:** a tela fica **igual à prancha**, e também nas larguras intermediárias.

**Responsividade:**

| Largura         | Regra                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| 390 (celular)   | segue a moldura de celular da prancha                                                                      |
| 768 (tablet)    | layout de celular centralizado, card com a mesma largura máxima da prancha, nada esticado de borda a borda |
| 1024 (notebook) | layout desktop                                                                                             |
| 1440 (desktop)  | segue a moldura desktop da prancha (1280 px de conteúdo)                                                   |

- O ponto de troca é o `lg` (1024).
- Rolagem horizontal = reprovado.
- Alvo de toque menor que 44 px no celular = reprovado.

**Passo a passo:**

1. **Fotografar o app:**

   ```bash
   pnpm build && pnpm start &   # ou pnpm dev
   node scripts/capturar-telas.mjs <task-N> <rota> [rota…]
   ```

   Saída: `.screens/<task-N>/*.png` nas 4 larguras, mais um JSON com `rolagemHorizontal` por foto (precisa ser `0`).
   - Para tela atrás de login, use o usuário seed do Supabase de teste.
   - Sem Supabase: rode em dev com o guard desligado **só localmente** e diga isso no PR.
   - Para estados (erro, carregando, diálogo aberto), fotografe com o estado aberto: script Playwright de uma vez ou `?estado=` só em dev, nunca commitado.

2. **Disparar o revisor:** um subagente (Agent tool, `subagent_type: "general-purpose"`, `model: "sonnet"`) com o prompt abaixo. Se a skill `webcode-design-review` estiver instalada, ele deve usá-la.

   ```text
   Você é revisor de design do PacoteZap. Compare a tela implementada com a prancha aprovada e dê um veredito.
   Se a skill webcode-design-review estiver disponível, use-a.

   Tela: <ID e nome>  ·  Task: <N>
   Fotos do app (4 larguras): .screens/<task-N>/<arquivos>
   Prancha (foto): docs/pranchas/telas/<arquivos>
   Prancha (código): docs/pranchas/<arquivo>.tsx, função <Nome>
   Código implementado: <arquivos alterados>
   Diferenças permitidas (não reprovar): itens de DESIGN-NOTAS.md "Prancha × backend" e dados de exemplo da prancha.

   Confira, nesta ordem:
   1. Estrutura: mesmas regiões, ordem, hierarquia e alinhamento da prancha.
   2. Componentes: o mesmo componente @webcode da prancha (veja os imports do .tsx), com as mesmas props
      (variant, shape, size). Nada de componente feito à mão no lugar de um da biblioteca.
   3. Medidas: espaçamentos, raios (cards rounded-3xl, botões pill), larguras máximas, alturas de controle.
   4. Tipografia: títulos em Plus Jakarta Sans (font-display) com o peso da prancha, corpo em Inter, mesmos tamanhos.
   5. Cor e profundidade: só tokens; fundo Névoa, navy no texto e na ação grande, brasa no botão pequeno,
      carmim no erro, sombra "flutuar" em card, campo e botão. Sem vidro.
   6. Ícones: os mesmos ícones lucide nos mesmos lugares.
   7. Estados: carregando, erro, sucesso e vazio presentes e no padrão (toast, Alert, Result, Skeleton).
   8. Responsividade: 390, 768, 1024 e 1440 sem rolagem horizontal, sem corte e sem sobreposição;
      390 igual à moldura de celular; 1440 igual à moldura desktop; 768 sem nada esticado.
   9. Acessibilidade: foco visível, label em todo campo, contraste AA, alvo de toque de 44 px ou mais no celular,
      role="alert" no erro.
   10. Texto: pt-BR, igual à prancha, exceto os rótulos que os testes exigem (Global Constraints do plano).

   Responda só neste formato:
   VEREDITO: APROVADO | REPROVADO
   BLOQUEANTES:
   - [largura] onde · esperado (prancha) · encontrado · correção sugerida (arquivo e classe ou prop)
   MENORES:
   - …
   ```

3. **Corrigir e repetir:**
   - Corrija **todos** os bloqueantes, fotografe de novo e dispare o revisor de novo, com as fotos novas.
   - Os menores entram no mesmo commit quando forem baratos; senão, vão para `DESIGN-NOTAS.md`.
   - **No máximo 3 rodadas.** Se ainda vier REPROVADO, **pare** e mande ao Fernando as fotos lado a lado e a lista do revisor.

4. **Registrar:** cole o último veredito (APROVADO) no corpo do PR, com as fotos de 390 e 1440 da tela e da prancha.

---

## File Structure

- **Modify:**
  - `src/components/ui/*` (troca pelos arquivos `@webcode`)
  - `src/lib/utils.ts` (cn do DS)
  - `src/app/globals.css` (tema + Névoa + flutuar + splash)
  - `src/app/layout.tsx` (fontes, `data-wc-theme`, Toaster, NotificationBannerHost, ícones)
  - `src/lib/design-tokens.test.ts` (guarda dos novos tokens)
- **Create:**
  - `src/components/brand/marca.tsx` (PzSimbolo, PzMarca, PzSplash)
  - `src/components/brand/marca.test.tsx`
- **Delete:** `src/components/brand/pacotezap-mark.tsx`.
- **Modify:**
  - `src/components/feedback/tela-de-estado.tsx` (passa a usar `Result`)
  - `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/loading.tsx`
- **Create:**
  - `src/components/auth/entrar-layout.tsx` (EntrarDesktop/EntrarCelular, PainelMarca, Fundo, Rodape)
  - `src/components/auth/splash-sessao.tsx` (splash na 1ª abertura)
  - `src/components/auth/botao-ajuda.tsx` (diálogo de ajuda)
  - `src/lib/suporte.ts`
- **Modify:**
  - `src/components/auth/login-desktop.tsx`, `auth-card-stage.tsx`, `login-form.tsx`, `recover-access-form.tsx`, `set-password-form.tsx`, `accept-invite-form.tsx`, `context-selector.tsx`
  - `src/app/(auth)/sem-acesso/page.tsx`
- **Delete:**
  - `src/components/auth/login-intro-parcel.tsx` (+ teste)
  - `src/components/auth/login-orbs.tsx`, `login-hero.tsx`, `use-login-motion.ts`, `auth-password-field.tsx`
- **Create:**
  - `src/components/shell/trilho.tsx` (+ teste)
  - `src/components/shell/nav-portaria.tsx`
  - `src/components/shell/casca-web.tsx`
- **Modify:**
  - `src/app/(web)/layout.tsx`, `src/app/(saas)/layout.tsx`, `src/app/(ops)/layout.tsx`
  - `src/app/(web)/gestao/page.tsx`, `src/app/(saas)/plataforma/page.tsx`, `src/app/(ops)/receber/page.tsx`, `src/app/page.tsx`
- **Modify (docs):** `DESIGN.md`, `WEBCODE-DS.md`, `DESIGN-NOTAS.md`, `.ai/page-map.md`, `.ai/roadmap.md`, `docs/product/screen-tracker.csv`, `docs/product/pages-roadmap.md`.
- **Delete (Task 17):**
  - `Imagen/`
  - logos antigos em `public/brand/`
  - SVGs do create-next-app em `public/`
  - `gsap`, `@gsap/react`
  - o que mais o knip confirmar
- **Create:** `knip.json`.
- **Já existem (usar):** `scripts/capturar-telas.mjs` (fotos do app em 390, 768, 1024 e 1440), `docs/pranchas/telas/` (fotos das pranchas).

---

### Task 0: Linha de base

**Files:** nenhum.

- [ ] **Step 1: Sincronizar sem perder trabalho local**

Run:

```bash
git status --short
git stash push -u -m "wip-antes-webcode-ui"   # só se o status listar algo; reversível com git stash pop
git fetch origin && git checkout main && git pull origin main
git checkout -b feat/webcode-ui-base
pnpm install
```

Expected: branch `feat/webcode-ui-base` a partir da `main` atual. O arquivo `docs/superpowers/plans/2026-11-04-webcode-ui-migracao.md` existe.

- [ ] **Step 2: Confirmar a base verde**

Run: `pnpm verify && pnpm build`

Expected: `Test Files 29 passed`, `Tests 139 passed` e o build termina sem erro.

**Se falhar: PARE.** Não comece a migração em base vermelha. Reporte a saída.

- [ ] **Step 3: Registry `@webcode` no `components.json`**

O bloco `"registries"` precisa ser exatamente:

```json
"registries": {
  "@webcode": "https://webcode-design.vercel.app/r/{name}.json"
}
```

Run: `node -e "console.log(require('./components.json').registries)"`

Expected: `{ '@webcode': 'https://webcode-design.vercel.app/r/{name}.json' }`

---

### Task 1: Trocar a base de componentes

**Files:**

- Modify: `src/lib/utils.ts`
- Modify: `src/components/ui/{alert,button,card,field,input-group,input,label,separator,spinner}.tsx`

**Interfaces:**

- Produces: API `@webcode`, que é um superconjunto da shadcn atual.
  - `Button`: `variant` (`default|elevated|outline|secondary|soft|ghost|link|destructive|destructive-soft`), `shape` (`default|pill|square`), `size` (`xs|sm|default|lg|icon|icon-xs|icon-sm|icon-lg`).
  - `Input` e `InputPassword`.
  - `cn` com `tailwind-merge` estendido (`control-*`, `shadow-wc-*`).

- [ ] **Step 1: Instalar por cima**

Run:

```bash
npx shadcn@latest add @webcode/utils @webcode/alert @webcode/button @webcode/card @webcode/field \
  @webcode/input-group @webcode/input @webcode/label @webcode/separator @webcode/spinner --overwrite --yes
git checkout -- src/app/globals.css   # o tema é a Task 2; desfaz qualquer mudança de CSS do CLI
```

Expected: os 10 arquivos regravados. `git diff --stat` mostra `src/components/ui/*` e `src/lib/utils.ts`, além de possíveis arquivos novos de dependência (`src/lib/glass.ts`, `src/lib/gesture.ts`, `src/hooks/*`).

- [ ] **Step 2: Rodar o gate**

Run: `pnpm verify`

Expected: `Tests 139 passed`, sem erro de tipo. (Validado em 04/11 com o mesmo conjunto de arquivos.)

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(ui): troca a base de componentes para a biblioteca @webcode"
```

---

### Task 2: Tema Névoa + Brasa no `globals.css`

**Files:**

- Modify: `src/app/globals.css`
- Test: `src/lib/design-tokens.test.ts`

**Interfaces:**

- Produces:
  - tokens `--wc-*` do tema `custelo` com override Névoa;
  - `--pz-brasa`, `--pz-brasa-hover`, `--pz-brasa-fg`, `--pz-brasa-clara`, `--pz-brasa-soft`;
  - `--pz-sombra-controle`, `--pz-sombra-card`, `--pz-sombra-card-dentro`, `--pz-sombra-primaria`.
- Keeps: `--state-*` (9 estados, claro e escuro) e `--shadow-elevation-0..3` (ainda usados no `src/`).

- [ ] **Step 1: Escrever o teste que falha**

Em `src/lib/design-tokens.test.ts`, substitua o caso `"define a paleta de marca completa"` por:

```ts
it("define a paleta Névoa + Brasa aprovada em 03/11/2026", () => {
  for (const token of [
    "--wc-bg: #EEF1F5",
    "--wc-fg: #0C2C55",
    "--wc-accent-soft: #DCEBEF",
    "--wc-danger: #B4123F",
    "--pz-brasa: #D23B26",
    "--pz-brasa-hover: #B9321F",
    "--pz-brasa-clara: #FF6B4F",
  ]) {
    expect(css.toLowerCase()).toContain(token.toLowerCase());
  }
});

it("define as sombras de flutuar", () => {
  for (const token of [
    "--pz-sombra-controle:",
    "--pz-sombra-card:",
    "--pz-sombra-primaria:",
  ]) {
    expect(css.toLowerCase()).toContain(token.toLowerCase());
  }
});
```

- [ ] **Step 2: Ver o teste falhar**

Run: `pnpm vitest run --project unit src/lib/design-tokens.test.ts`

Expected: FAIL. O texto `--wc-bg: #EEF1F5` não existe.

- [ ] **Step 3: Instalar o tema base**

Run: `npx shadcn@latest add @webcode/theme-custelo`

O CLI escreve em `src/app/globals.css`. Confira com `git diff src/app/globals.css`:

- os imports continuam no topo;
- os blocos `--state-*` (`:root` e `.dark`) continuam lá;
- `--shadow-elevation-0..3` continuam lá;
- nenhuma regra com `backdrop-filter` diferente de `none` entrou. Se entrou, troque por `none` ou apague.

Sem rede: copie o objeto `css` de `<webcode-design>/site/public/r/theme-custelo.json` (seletores `:root`, `.dark` e as duas `@media`) para CSS, logo depois dos imports.

- [ ] **Step 4: Acrescentar o override Névoa + Brasa + flutuar**

No fim de `src/app/globals.css`, cole:

```css
/* PacoteZap — paleta Névoa + Brasa (aprovada em 03/11/2026). Fonte: docs/pranchas/pz-dash/painel.tsx (PALETAS[0], vars()). */
:root {
  --wc-bg: #eef1f5;
  --wc-sunken: #e4e8ee;
  --wc-surface: #ffffff;
  --wc-surface-raised: #ffffff;
  --wc-fg: #0c2c55;
  --wc-fg-muted: #4a5b74;
  --wc-fg-subtle: #6b7a90;
  --wc-border: #dde3ea;
  --wc-border-strong: #c6cfda;
  --wc-control-border: #758398;
  --wc-accent: #0c2c55;
  --wc-accent-hover: #143a6b;
  --wc-accent-solid: #0c2c55;
  --wc-accent-solid-fg: #ffffff;
  --wc-accent-soft: #dcebef;
  --wc-focus: #0c2c55;
  --wc-chart-1: #0c2c55;
  --wc-chart-2: #629fad;
  --wc-chart-3: #2e8a6a;
  --wc-chart-4: #c2702e;
  --wc-chart-5: #a7577f;
  --wc-danger: #b4123f;
  --wc-danger-solid: #b4123f;
  --wc-danger-soft: #fce8ee;
  --wc-font-display:
    var(--font-display), "Plus Jakarta Sans", Inter, system-ui, sans-serif;
  --wc-font-body: var(--font-sans), Inter, system-ui, sans-serif;
  --accent: #f1f3f6; /* hover cinza-claro, não azul */
  --accent-foreground: var(--wc-fg);
}
```

**Valores mais novos vencem.** Os valores acima são de 04/11. Antes de colar, compare com `PALETAS[0]` e `vars()` da versão atual de `docs/pranchas/pz-dash/painel.tsx` e com `docs/pranchas/pz-todas/todas.tsx`. Se a prancha mudou, vale a prancha (ajuste também o teste do Step 1).

Decisões de 04/11 que ainda podem não estar no código da prancha:

- **Urgente em vinho `#8F1D4A`:** troque `--state-urgente` no `:root`.
- **Borda de input `#C6CFDA`:** a sombra compensa o contraste.

Se a prancha já trouxer esses valores, use os dela. Se não trouxer, pergunte ao Fernando antes de aplicar.

Depois, copie **sem alterar** o conteúdo da constante `FLUTUAR` de `docs/pranchas/pz-todas/todas.tsx`: tudo entre as crases, do primeiro `[data-wc-theme="custelo"] {` até o `}` que fecha o `@media (prefers-reduced-motion: no-preference)`. Cole logo abaixo, envolvido em:

```css
@layer components {
  /* cole aqui o FLUTUAR de docs/pranchas/pz-todas/todas.tsx */
}
```

- [ ] **Step 5: Ver o teste passar**

Run: `pnpm vitest run --project unit src/lib/design-tokens.test.ts`

Expected: PASS em todos os casos, incluindo "nao usa blur" e "9 estados".

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): aplica tema custelo com a paleta Névoa + Brasa e a sombra flutuar"
```

---

### Task 3: Layout raiz (fontes, tema, avisos e ícones)

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (bloco `@theme inline`)
- Create: `src/components/ui/sonner.tsx`, `src/components/ui/notification-banner.tsx` (via CLI)

**Interfaces:**

- Produces: `<Toaster />` e `<NotificationBannerHost />` montados uma vez. Uso nas telas:
  - `toast.success/error/promise` de `"sonner"` para resultado de ação da própria pessoa;
  - `notify()` de `@/components/ui/notification-banner` para evento de fora.

- [ ] **Step 1: Instalar**

Run: `npx shadcn@latest add @webcode/sonner @webcode/notification-banner`

Expected:

- `src/components/ui/sonner.tsx` e `notification-banner.tsx` criados;
- `sonner` no `package.json`;
- dependências `glass`/`gesture` do registry instaladas (permitido; nunca use a variante de vidro).

- [ ] **Step 2: Reescrever `src/app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { NotificationBannerHost } from "@/components/ui/notification-banner";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/** Corpo em Inter; títulos e marca em Plus Jakarta Sans (aprovado em 03/11/2026). */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PacoteZap",
    template: "%s · PacoteZap",
  },
  description:
    "Recebimento e cadeia de custódia para portarias e operações prediais.",
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1533" },
  ],
  // O PWA operacional é usado com uma mão, em aparelho de portaria.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-wc-theme="custelo" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        {children}
        <Toaster />
        <NotificationBannerHost />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Ajustar o `@theme inline` do `globals.css`**

Troque:

```css
--font-brand: var(--font-brand);
```

por:

```css
--font-display: var(--wc-font-display);
```

Troque também `--font-heading: var(--font-sans);` por `--font-heading: var(--wc-font-display);`.

Depois, procure outros usos: `grep -rn "font-brand" src`. Para cada um, troque a classe `font-brand` por `font-display`.

Expected: `grep -rn "font-brand\|Poppins" src` sem resultado.

- [ ] **Step 4: Rodar o gate**

Run: `pnpm verify && pnpm build`

Expected: verde.

- [ ] **Step 5: Conferir o visual**

Run: `pnpm dev`. Abra `/entrar` em 1440 px e em 390 px.

Expected:

- fundo `#EEF1F5`;
- títulos em Jakarta;
- campos e card com sombra em camadas;
- botão pequeno de ação em brasa e botão `lg` em navy.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-3 /entrar /nao-existe`

Revisar: o tema aplicado no login atual e no 404: fundo, fonte, sombra, botão brasa/navy.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): fontes Jakarta e Inter, toaster e banner de avisos no layout raiz"
```

---

### Task 4: Marca final (logo e splash)

**Files:**

- Create: `src/components/brand/marca.tsx`
- Test: `src/components/brand/marca.test.tsx`
- Modify: `src/app/globals.css` (CSS do splash)
- Modify: todo arquivo que importa `@/components/brand/pacotezap-mark`
- Delete: `src/components/brand/pacotezap-mark.tsx`

**Interfaces:**

- Produces:
  - `PzSimbolo({ className?, escuro?, mono?, title? })`;
  - `PzMarca({ escuro?, nome?, simbolo?, texto?, className? })`;
  - `PzSplash({ className?, fundo?, nome? })`.

- [ ] **Step 1: Escrever o teste que falha**

`src/components/brand/marca.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PzMarca, PzSimbolo } from "@/components/brand/marca";

describe("marca PacoteZap", () => {
  it("o símbolo tem nome acessível", () => {
    render(<PzSimbolo />);
    expect(screen.getByRole("img", { name: "PacoteZap" })).toBeInTheDocument();
  });

  it("a marca escreve Pacote + Zap", () => {
    render(<PzMarca />);
    expect(screen.getByText("Zap")).toBeInTheDocument();
    expect(screen.getByText(/Pacote/)).toBeInTheDocument();
  });

  it("sem nome mostra só o símbolo", () => {
    render(<PzMarca nome={false} />);
    expect(screen.queryByText("Zap")).not.toBeInTheDocument();
  });
});
```

Run: `pnpm vitest run --project ui src/components/brand/marca.test.tsx`

Expected: FAIL. O módulo `@/components/brand/marca` não existe.

- [ ] **Step 2: Criar `src/components/brand/marca.tsx`**

Copie de `docs/pranchas/pz-marca/marca.tsx`, **sem alterar os paths SVG**:

- as constantes de geometria;
- `PzSimbolo`, `PzMarca` e `PzSplash`.

Ajustes obrigatórios:

- remova o `export const PZ_SPLASH_CSS` do TSX e mova o conteúdo dele para o fim do `src/app/globals.css`;
- mantenha `"use client"` só se `PzSplash` usar estado; caso contrário, apague;
- troque concatenação de classe por `cn()` de `@/lib/utils`;
- os fallbacks hex dentro de `var(--pz-brasa, #D23B26)` podem sair, porque o token agora existe no `globals.css`.

- [ ] **Step 3: Ver o teste passar**

Run: `pnpm vitest run --project ui src/components/brand/marca.test.tsx`

Expected: PASS (3).

- [ ] **Step 4: Trocar os usos da marca antiga**

Run: `grep -rln "pacotezap-mark" src`

Em cada arquivo listado:

| Antes                                                        | Depois                        |
| ------------------------------------------------------------ | ----------------------------- |
| `<PacoteZapMark showIcon={false} textClassName="text-xl" />` | `<PzMarca texto="text-xl" />` |
| `<PacoteZapMark variant="onPrimary" …/>`                     | `<PzMarca escuro … />`        |
| `<PacoteZapMobileHeader … />`                                | `<PzMarca />` (sem wrapper)   |

Depois apague `src/components/brand/pacotezap-mark.tsx`.

Expected: `grep -rn "pacotezap-mark\|PacoteZapMark\|PacoteZapMobileHeader" src` sem resultado.

- [ ] **Step 5: Rodar o gate**

Run: `pnpm verify && pnpm build && pnpm a11y`

Expected: verde. O contraste do "Zap", que falhava antes, agora passa (brasa `#D23B26` sobre `#EEF1F5`/branco ≥ 4,5:1).

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-4 /entrar /sem-acesso /nao-existe`

Revisar: a marca em todas as telas e o splash (fotografe o splash com `sessionStorage` limpo).

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): marca final PacoteZap (símbolo, nome e splash)"
```

---

### Task 5: Estados globais (404, erro, carregando)

**Files:**

- Modify: `src/components/feedback/tela-de-estado.tsx`
- Modify: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/loading.tsx`
- Create: `src/components/ui/{result,skeleton,empty,banner,badge}.tsx` (via CLI)
- Test: `src/components/feedback/tela-de-estado.test.tsx`

**Interfaces:**

- Produces: `TelaDeEstado({ status, titulo, descricao, codigo?, acoes })`, com `status: "404" | "403" | "500" | "warning" | "info"`. Fonte visual: `docs/pranchas/pz-estados/estados.tsx` (`Erros`, `EsqueletoDesktop`).

- [ ] **Step 1: Instalar**

Run: `npx shadcn@latest add @webcode/result @webcode/skeleton @webcode/empty @webcode/banner @webcode/badge`

- [ ] **Step 2: Escrever o teste que falha**

`src/components/feedback/tela-de-estado.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";

describe("TelaDeEstado", () => {
  it("mostra título, descrição, código e ação", () => {
    render(
      <TelaDeEstado
        status="500"
        titulo="Algo deu errado do nosso lado"
        descricao="Tente de novo."
        codigo="PZ-500-8F2A"
        acoes={<button type="button">Tentar de novo</button>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Algo deu errado do nosso lado" }),
    ).toBeInTheDocument();
    expect(screen.getByText("PZ-500-8F2A")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar de novo" }),
    ).toBeInTheDocument();
  });
});
```

Run: `pnpm vitest run --project ui src/components/feedback/tela-de-estado.test.tsx`

Expected: FAIL. As props `status` e `codigo` não existem.

- [ ] **Step 3: Reescrever `src/components/feedback/tela-de-estado.tsx`**

```tsx
import type { ReactNode } from "react";

import { PzMarca } from "@/components/brand/marca";
import { Card, CardContent } from "@/components/ui/card";
import { Result } from "@/components/ui/result";

type Status = "404" | "403" | "500" | "warning" | "info";

/** Tela cheia de erro, página não encontrada e sem permissão (prancha #estados). */
export function TelaDeEstado({
  status,
  titulo,
  descricao,
  codigo,
  acoes,
}: {
  status: Status;
  titulo: string;
  descricao: string;
  codigo?: string;
  acoes: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6">
      <PzMarca texto="text-xl" />
      <Card role="alert" className="w-full max-w-lg rounded-3xl py-10">
        <CardContent>
          <Result
            status={status}
            headingLevel={1}
            title={titulo}
            description={
              codigo ? (
                <>
                  {descricao} Código:{" "}
                  <span className="font-mono">{codigo}</span>
                </>
              ) : (
                descricao
              )
            }
            extra={acoes}
          />
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Reescrever as páginas**

`src/app/not-found.tsx`:

```tsx
import Link from "next/link";

import { TelaDeEstado } from "@/components/feedback/tela-de-estado";
import { Button } from "@/components/ui/button";

export default function PaginaNaoEncontrada() {
  return (
    <TelaDeEstado
      status="404"
      titulo="Página não encontrada"
      descricao="O endereço mudou ou não existe. Nada foi perdido."
      acoes={
        <Button asChild shape="pill" size="lg">
          <Link href="/">Ir para o início</Link>
        </Button>
      }
    />
  );
}
```

`src/app/error.tsx`:

- mantenha o `useEffect` com `Sentry.captureException` e a detecção de `navigator.onLine`;
- troque o retorno por:

```tsx
<TelaDeEstado
  status={offline ? "warning" : "500"}
  titulo={offline ? "Sem conexão" : "Algo deu errado do nosso lado"}
  descricao={
    offline
      ? "Verifique a internet e tente de novo."
      : "Já fomos avisados. Tente de novo; se continuar, fale com o suporte."
  }
  codigo={offline ? undefined : error.digest}
  acoes={
    <>
      <Button type="button" shape="pill" size="lg" onClick={reset}>
        Tentar de novo
      </Button>
      <Button asChild variant="ghost" shape="pill">
        <Link href="/">Ir para o início</Link>
      </Button>
    </>
  }
/>
```

`src/app/global-error.tsx`: mesmo conteúdo do `error.tsx`, dentro de `<html lang="pt-BR" data-wc-theme="custelo"><body>…</body></html>`. Ele substitui o layout raiz, então importe `./globals.css` no topo.

`src/app/loading.tsx`:

```tsx
import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/skeleton";

export default function Carregando() {
  return (
    <main
      aria-busy="true"
      className="grid min-h-dvh content-start gap-6 bg-background p-6"
    >
      <span role="status" className="sr-only">
        Carregando…
      </span>
      <Skeleton className="h-10 w-48 rounded-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard ratio="16/9" />
        <SkeletonCard ratio="16/9" delay={80} />
        <SkeletonCard ratio="16/9" delay={160} />
      </div>
      <SkeletonText lines={4} />
    </main>
  );
}
```

- [ ] **Step 5: Ver os testes passarem**

Run: `pnpm verify`

Expected: PASS, incluindo `tela-de-estado.test.tsx`.

- [ ] **Step 6: Conferir no navegador**

Run: `pnpm build && pnpm start`. Abra `/nao-existe`.

Expected: card com o ícone 404 do `Result`, título "Página não encontrada" e botão pill navy.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-5 /nao-existe`

Revisar: 404, 500 (forçar um erro só em dev) e carregando, contra `estados/bloco-e-erros.webp` e `estados/bloco-e-carregar.webp`.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 7: Commit e PR 1**

```bash
git add -A && git commit -m "feat(ui): telas de erro, 404 e carregamento com Result e Skeleton"
git push -u origin feat/webcode-ui-base
gh api repos/FernandoFerreira94/Custelo/pulls -f base=main -f head=feat/webcode-ui-base \
  -f title="feat(ui): base @webcode, tema Névoa + Brasa, marca e estados" -f body="<o que mudou + saída dos gates + screenshots>"
```

---

### Task 6: Palco de entrada sem GSAP

**Files:**

- Create: `src/components/auth/entrar-layout.tsx`, `src/components/auth/splash-sessao.tsx`
- Modify: `src/components/auth/login-desktop.tsx`, `src/components/auth/auth-card-stage.tsx`
- Delete:
  - `src/components/auth/login-intro-parcel.tsx`, `login-intro-parcel.test.tsx`
  - `login-orbs.tsx`, `login-hero.tsx`, `use-login-motion.ts`

**Interfaces:**

- Consumes: `AuthCardStage({ initialInvite, initialView, initialError })` (mesma API).
- Produces:
  - `EntrarLayout({ children })`, com o grid desktop (painel da marca + coluna do card) e a versão celular;
  - `SplashSessao()`, um overlay que aparece uma vez por sessão.

Faça antes: `git checkout main && git pull && git checkout -b feat/webcode-ui-entrada` (depois do merge do PR 1).

- [ ] **Step 1: Instalar**

Run: `npx shadcn@latest add @webcode/checkbox @webcode/dialog @webcode/radio-group @webcode/textarea @webcode/description-list @webcode/password-strength @webcode/item @webcode/navigation-bar`

- [ ] **Step 2: Tirar o GSAP do `auth-card-stage.tsx`**

- Remova os imports de `gsap` e `@gsap/react`, além de `gsap.registerPlugin`, `useGSAP`, `isFirstView` e os refs `root`/`panel`.
- `go(next)` vira só `setView(next)`.
- O wrapper fica:

```tsx
<div className="relative z-10 w-full max-w-[460px]">
  <div
    key={view}
    className="motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
  >
    {/* os mesmos quatro blocos condicionais de hoje */}
  </div>
</div>
```

- Apague o `<span aria-hidden … bg-primary/80 …>` (bola atrás do card): a prancha não tem.

- [ ] **Step 3: Criar `src/components/auth/entrar-layout.tsx`**

Copie de `docs/pranchas/pz-entrada/entrada.tsx` as funções `Fundo`, `PainelMarca` e `Rodape`. Ajustes:

- **`PainelMarca`:**
  - use `<PzMarca escuro />` no lugar de `<Marca claro />`;
  - **remova** o `<Badge variant="success">Todos os serviços funcionando</Badge>`, porque não há status real;
  - o card de exemplo (B-304, Mariana) fica, com `aria-hidden` no contêiner, porque é ilustração.
- **`Rodape`:** só `<span>© 2026 WebCodeFF</span>`. Links de Termos e Privacidade só quando as páginas existirem.
- **Exporte:**

```tsx
export function EntrarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:p-6">
      <div className="hidden lg:flex">
        <PainelMarca />
      </div>
      <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-4 py-8 lg:min-h-0 lg:px-10">
        <div className="absolute top-4 right-4">
          <BotaoAjuda />
        </div>
        <div className="w-full max-w-[460px] lg:hidden">
          <PzMarca />
        </div>
        {children}
        <div className="w-full max-w-[460px]">
          <Rodape />
        </div>
      </div>
    </div>
  );
}
```

`PainelMarca` precisa de `className` com `min-h-[calc(100dvh-3rem)] w-full` para ocupar a altura.

- [ ] **Step 4: Criar `src/components/auth/splash-sessao.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

import { PzSplash } from "@/components/brand/marca";

const CHAVE = "pz-splash-visto";
const DURACAO_MS = 4000;

/** Splash "IA primeiro" só na 1ª abertura da sessão. Nunca bloqueia o formulário. */
export function SplashSessao() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(CHAVE)) return;
      sessionStorage.setItem(CHAVE, "1");
    } catch {
      return; // sem storage (aba privada): não mostra
    }
    setVisivel(true);
    const t = window.setTimeout(() => setVisivel(false), DURACAO_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (!visivel) return null;
  return (
    <div
      aria-hidden="true"
      onClick={() => setVisivel(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-primary text-primary-foreground motion-safe:animate-out motion-safe:delay-[3600ms] motion-safe:duration-300 motion-safe:fade-out"
    >
      <PzSplash className="w-60 lg:w-80" />
      <span className="opacity-80">Recebeu, avisou, entregou.</span>
    </div>
  );
}
```

- [ ] **Step 5: Reescrever `login-desktop.tsx`**

```tsx
"use client";

import {
  AuthCardStage,
  type AuthCardView,
} from "@/components/auth/auth-card-stage";
import { EntrarLayout } from "@/components/auth/entrar-layout";
import { SplashSessao } from "@/components/auth/splash-sessao";
import type { PendingInvitePreview } from "@/components/auth/request-accept-invite";

type LoginDesktopProps = {
  initialInvite?: PendingInvitePreview | null;
  initialView?: AuthCardView;
  initialError?: string | null;
};

export function LoginDesktop({
  initialInvite = null,
  initialView = "entrar",
  initialError = null,
}: LoginDesktopProps) {
  return (
    <>
      <EntrarLayout>
        <AuthCardStage
          initialInvite={initialInvite}
          initialView={initialView}
          initialError={initialError}
        />
      </EntrarLayout>
      <SplashSessao />
    </>
  );
}
```

- [ ] **Step 6: Apagar a intro antiga**

Run:

```bash
git rm src/components/auth/login-intro-parcel.tsx src/components/auth/login-intro-parcel.test.tsx \
  src/components/auth/login-orbs.tsx src/components/auth/login-hero.tsx src/components/auth/use-login-motion.ts
grep -rn "gsap\|login-intro\|login-orbs\|login-hero\|use-login-motion\|data-login-" src
```

Expected:

- o grep não acha `gsap` nem imports dos arquivos apagados;
- atributos `data-login-*` que sobraram nos forms podem sair (eram ganchos do GSAP);
- **mantenha** `data-login-card` se algum teste usar (`grep -rn data-login tests src --include=*.test.*`).

- [ ] **Step 7: Rodar o gate**

Run: `pnpm verify && pnpm build`

Expected: verde. `BotaoAjuda` ainda não existe: crie um stub na Task 9, ou faça a Task 9 antes do Step 7.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-6 /entrar`

Revisar: o palco desktop e celular contra `entrada/auth-001-entrar-desktop.webp` e `entrada/auth-001-entrar-celular.webp`.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(ui): palco de entrada da prancha com splash CSS no lugar da intro GSAP"
```

---

### Task 7: Formulário de login (AUTH-001)

**Files:**

- Modify: `src/components/auth/login-form.tsx`
- Test: `src/components/auth/login-form.test.tsx` (sem mudar asserções)

**Interfaces:**

- Consumes: `requestSession`, `loginSchema`. A props `onInvite`, `onRecover` e `initialError` continuam iguais.

- [ ] **Step 1: Trocar o JSX do card**

Prancha: `FormEntrar` + `EntrarDesktop` em `docs/pranchas/pz-entrada/entrada.tsx`. Mantenha `useForm`, `onSubmit` e todos os `id`/`aria-*`/`register`.

```tsx
<Card className="w-full gap-8 rounded-3xl px-2 py-8">
  <CardContent className="grid gap-8">
    <div className="grid gap-2">
      <h1 className="font-display text-4xl font-extrabold tracking-tight">
        Entrar
      </h1>
      <p className="text-muted-foreground">
        Para gestores, síndicos e equipe da portaria.
      </p>
    </div>
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <Field data-invalid={errors.email ? true : undefined}>
        <FieldLabel htmlFor="email">E-mail</FieldLabel>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <FieldError id="email-error">{errors.email.message}</FieldError>
        ) : null}
      </Field>
      <Field data-invalid={errors.password ? true : undefined}>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Button
            type="button"
            variant="link"
            className="h-auto min-h-11 px-0"
            onClick={onRecover}
          >
            Esqueci minha senha
          </Button>
        </div>
        <InputPassword
          id="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <FieldError id="password-error">{errors.password.message}</FieldError>
        ) : null}
      </Field>
      {submitError ? (
        <Alert variant="danger" role="alert">
          <CircleAlert aria-hidden />
          <AlertTitle>Não foi possível entrar</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" shape="pill" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Spinner data-icon="inline-start" aria-label="Carregando" />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
    <p className="text-sm text-muted-foreground">
      Primeiro acesso? Abra o convite que chegou no seu e-mail.{" "}
      <Button
        type="button"
        variant="link"
        className="h-auto min-h-11 px-0"
        onClick={onInvite}
      >
        Aceitar convite
      </Button>
    </p>
  </CardContent>
</Card>
```

Notas:

- `InputPassword` (de `@/components/ui/input`) substitui `AuthPasswordField` aqui.
- Se o teste usa `getByLabelText("Senha")` e o `InputPassword` tem botão "Mostrar senha", confira que o label continua apontando para o `<input>`.
- **Sucesso:** mantenha o `window.location.assign`, mas deixe o botão desabilitado e "Entrando…" até a página trocar. Use um `useState` `saindo` que fica `true` depois do sucesso; isso evita o clique duplo (item 16 do review).

- [ ] **Step 2: Rodar os testes do login**

Run: `pnpm vitest run --project ui src/components/auth/login-form.test.tsx`

Expected: PASS, sem alterar asserções.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-7 /entrar`

Revisar: o login com erro de credencial aberto e com "Entrando…".

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(ui): login no visual da prancha AUTH-001"
```

---

### Task 8: Recuperar, definir senha e convite (AUTH-002..004)

**Files:**

- Modify:
  - `src/components/auth/recover-access-form.tsx`
  - `src/components/auth/set-password-form.tsx`
  - `src/components/auth/accept-invite-form.tsx`
- Delete: `src/components/auth/auth-password-field.tsx` (no fim da task)
- Test: `*-form.test.tsx` (sem mudar asserções)

**Interfaces:**

- Consumes: os mesmos `request*`, schemas e callbacks (`onBack`, `onSaved`, `onActivated`).

- [ ] **Step 1: Casca comum dos três cards**

Prancha: `CartaoAuth`, `Recuperar` e `Convite`. Cada form usa:

```tsx
<Card className="w-full rounded-3xl">
  <CardHeader>
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="w-fit px-2"
      onClick={onBack}
    >
      <ArrowLeftIcon aria-hidden />
      Voltar para o login
    </Button>
    <CardTitle className="font-display mt-2 text-2xl font-extrabold tracking-tight">
      <h1 className="contents">{/* título atual do form */}</h1>
    </CardTitle>
    <CardDescription>{/* descrição atual */}</CardDescription>
  </CardHeader>
  <CardContent className="grid gap-5">{/* campos */}</CardContent>
</Card>
```

**Mantenha os títulos e rótulos atuais** (os testes dependem deles). Troque só a casca e os controles.

- [ ] **Step 2: Recuperar (`recover-access-form.tsx`)**

- Campo: `Field` + `FieldLabel htmlFor` + `Input type="email"`.
- Botão: `<Button type="submit" shape="pill" size="lg">`, com o rótulo atual "Enviar link de recuperação" e a variação "Enviando…" com `Spinner`.
- Estado de sucesso: mantenha o heading "Link enviado" e coloque abaixo:

```tsx
<Banner variant="success" className="rounded-2xl">
  <MailIcon aria-hidden />
  <BannerContent>
    <BannerTitle>Confira seu e-mail</BannerTitle>
    <BannerDescription>
      Se existir uma conta com esse e-mail, o link chega em alguns minutos.
    </BannerDescription>
  </BannerContent>
</Banner>
```

- Erro: `Alert variant="danger" role="alert"` com o texto que o form já calcula.

- [ ] **Step 3: Definir senha (`set-password-form.tsx`) e convite (`accept-invite-form.tsx`)**

- Troque cada `<AuthPasswordField … />` por:

```tsx
<Field data-invalid={erro ? true : undefined}>
  <FieldLabel htmlFor={id}>{label}</FieldLabel>
  <InputPassword
    id={id}
    autoComplete="new-password"
    aria-invalid={Boolean(erro)}
    {...register(nome)}
  />
  {erro ? <FieldError>{erro}</FieldError> : null}
</Field>
```

- No campo da senha nova, adicione `<PasswordStrength value={watch("<nome do campo>") ?? ""} />` abaixo do input. Use `watch` do RHF.
- **Convite:** `CardHeader` com `<PzMarca />` em vez do botão Voltar no topo. O Voltar continua no rodapé do form, com o rótulo atual "Voltar para o login".
- **Sem checkbox de termos** (Global Constraints).
- Os botões principais ficam `shape="pill" size="lg"`, com os rótulos atuais ("Salvar senha", "Criar acesso e entrar") e "Salvando…"/"Criando acesso…" com `Spinner`.
- **Sucesso de senha:** antes do `onSaved`, mostre `toast.success("Senha alterada.", { description: "Use a nova senha no próximo acesso." })`.
  - Se a action retornou aviso de "não conseguimos encerrar outros aparelhos", use `toast.warning` com esse texto.

- [ ] **Step 4: Apagar `auth-password-field.tsx`**

Run: `grep -rn "auth-password-field\|AuthPasswordField" src`

Expected: só o próprio arquivo. Então: `git rm src/components/auth/auth-password-field.tsx`.

- [ ] **Step 5: Rodar os testes**

Run: `pnpm verify`

Expected: PASS em todos os `*-form.test.tsx`, sem alterar asserções.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-8 "/entrar#recuperar" "/entrar?view=senha" "/entrar?view=convite"`

Revisar: recuperar (antes e depois de enviar), definir senha e convite.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(ui): recuperar, definir senha e convite no visual das pranchas AUTH-002..004"
```

---

### Task 9: Diálogo de ajuda

**Files:**

- Create: `src/components/auth/botao-ajuda.tsx`, `src/lib/suporte.ts`
- Test: `src/components/auth/botao-ajuda.test.tsx`

**Interfaces:**

- Produces: `BotaoAjuda()`.
- Produces: `SUPORTE: { whatsapp: string; email: string }`. Vazio enquanto o Fernando não definir os contatos reais.

- [ ] **Step 1: Teste que falha**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BotaoAjuda } from "@/components/auth/botao-ajuda";

describe("BotaoAjuda", () => {
  it("abre o diálogo com a lista de problemas", async () => {
    render(<BotaoAjuda />);
    fireEvent.click(
      screen.getByRole("button", { name: "Precisa de ajuda para entrar?" }),
    );
    expect(
      await screen.findByRole("dialog", {
        name: "Precisa de ajuda para entrar?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Esqueci a senha ou ela não funciona"),
    ).toBeInTheDocument();
  });

  it("sem contato configurado não mostra botões de envio", async () => {
    render(<BotaoAjuda />);
    fireEvent.click(
      screen.getByRole("button", { name: "Precisa de ajuda para entrar?" }),
    );
    await screen.findByRole("dialog");
    expect(
      screen.queryByRole("button", { name: /Enviar pelo WhatsApp/ }),
    ).not.toBeInTheDocument();
  });
});
```

Run: `pnpm vitest run --project ui src/components/auth/botao-ajuda.test.tsx`

Expected: FAIL (módulo não existe).

- [ ] **Step 2: Implementar**

`src/lib/suporte.ts`:

```ts
/** Contatos reais de suporte. Vazio = botão de envio escondido (pendência do Fernando). */
export const SUPORTE = { whatsapp: "", email: "" } as const;
```

`src/components/auth/botao-ajuda.tsx`: copie `PROBLEMAS`, `AjudaCorpo` e `BotaoAjuda` de `docs/pranchas/pz-entrada/entrada.tsx`. Ajustes:

- `"use client"` e `useId()` no lugar do prop `id`;
- o `DescriptionList` "Vai junto com o pedido" mostra só:
  - "Aparelho" (`navigator.userAgent` resumido);
  - "Página" (`location.pathname`);
- remova e-mail, último aviso e código fixos da prancha;
- os botões "Enviar pelo WhatsApp/e-mail" aparecem só se `SUPORTE.whatsapp`/`SUPORTE.email` não estiverem vazios. O link é `https://wa.me/<numero>?text=<problema + detalhe>` / `mailto:`;
- o texto de horário de atendimento sai até existir o real.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-9 /entrar`

Revisar: o diálogo de ajuda aberto, em celular e desktop.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 3: Ver passar e commit**

Run: `pnpm vitest run --project ui src/components/auth/botao-ajuda.test.tsx`

Expected: PASS (2).

```bash
git add -A && git commit -m "feat(ui): diálogo de ajuda da entrada com contato de suporte configurável"
```

---

### Task 10: Escolher empreendimento (AUTH-005)

**Files:**

- Modify: `src/components/auth/context-selector.tsx`, `src/app/(auth)/contexto/page.tsx` (só o layout)

**Interfaces:**

- Consumes:
  - `selectContextAction({ orgId, empreendimentoId })`;
  - `labelForScope`;
  - `MENSAGEM_CONTEXTO`;
  - `initialError` (vindo de `?erro=` da rota `/contexto/auto`).

- [ ] **Step 1: Trocar o JSX**

Prancha: função `Contexto` em `docs/pranchas/pranchas/pranchas.tsx`.

- Topo: `<NavigationBar title="Onde você está hoje?" large />`, com o texto "Tudo o que você registrar vai para este empreendimento."
- Lista: `<RadioGroup value={selecionado} onValueChange={setSelecionado} aria-label="Empreendimento">`, com um `<RadioGroupCard value={chave}>` por escopo. Use a chave `${orgId}:${empreendimentoId ?? "org"}`.
  - Dentro do card: `Building2Icon`, `RadioGroupCardTitle` = `labelForScope(scope)` e `RadioGroupCardDescription` = `papelNome`.
- Botão: `<Button shape="pill" size="lg" className="w-full">`.
  - Texto `Começar no ${nome do escolhido}`.
  - Carregando: `<Spinner /> Entrando…`.
  - Desabilitado sem seleção.
- Erro: `Alert variant="danger" role="alert"`, com `MENSAGEM_CONTEXTO[code]` ou `initialError`.
- **Sem** "Abrir sempre neste empreendimento".
- Página: `main` com `bg-background`, `max-w-md`, centralizado no desktop. O `PzMarca` fica no topo.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-10 /contexto`

Revisar: a lista com 2 ou mais escopos, a seleção e o erro.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 2: Gate e commit**

Run: `pnpm verify`

Expected: PASS, incluindo `src/app/(auth)/contexto/*.test.ts`, que não mudam.

```bash
git add -A && git commit -m "feat(ui): escolha de empreendimento no visual da prancha AUTH-005"
```

---

### Task 11: Sem acesso (AUTH-006)

**Files:**

- Modify: `src/app/(auth)/sem-acesso/page.tsx`

- [ ] **Step 1: Reescrever a página**

```tsx
import type { Metadata } from "next";
import { LockIcon } from "lucide-react";

import { signOutAction } from "@/app/(auth)/sem-acesso/actions";
import { PzMarca } from "@/components/brand/marca";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Result } from "@/components/ui/result";
import { getAuthenticatedSession } from "@/infrastructure/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sem acesso",
  description: "Sua conta não possui escopo ativo no PacoteZap.",
};

export default async function SemAcessoPage() {
  const sessao = await getAuthenticatedSession();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background p-6">
      <PzMarca texto="text-xl" />
      <Card className="w-full max-w-md rounded-3xl">
        <CardContent className="grid gap-4">
          <Result
            status="warning"
            headingLevel={1}
            icon={<LockIcon aria-hidden className="size-8" />}
            title="Você ainda não tem acesso aqui"
            description="Sua conta existe, mas não está ligada a nenhum empreendimento. Quem libera é o gestor do condomínio."
          />
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="outline"
              shape="pill"
              size="lg"
              className="w-full"
            >
              Entrar com outra conta
            </Button>
          </form>
          {sessao?.email ? (
            <p className="text-center text-sm text-muted-foreground">
              Conectado como {sessao.email}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
```

Se `signOutAction` hoje não retorna erro, mantenha assim. Item 14 do review: caso ele passe a retornar, mostre `toast.error(mensagemDeFalha(erro))` num client wrapper.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-11 /sem-acesso`

Revisar: sem acesso, contra `entrada/auth-006-sem-acesso.webp`.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 2: Gate, E2E e PR 2**

Run:

```bash
pnpm verify && pnpm build && pnpm a11y
pnpm test:e2e   # só com Supabase de teste; sem ele, dizer isso no PR
```

Expected: verde. `tests/e2e/auth-entrar.spec.ts` passa **sem mudar texto**, porque os rótulos foram mantidos.

Screenshots 1440 e 390 px:

- login;
- recuperar (antes e depois de enviar);
- convite;
- contexto com 2 escopos;
- sem acesso;
- diálogo de ajuda.

Compare com as abas `#entrada` e `#portaria` do artifact.

```bash
git add -A && git commit -m "feat(ui): sem acesso no visual da prancha AUTH-006"
git push -u origin feat/webcode-ui-entrada
# abrir PR 2 via gh api (como na Task 5)
```

---

### Task 12: Trilho de navegação (web e admin)

**Files:**

- Create:
  - `src/components/shell/trilho.tsx`, `src/components/shell/trilho.test.tsx`
  - `src/components/shell/casca-web.tsx`
- Modify: `src/app/(web)/layout.tsx`, `src/app/(saas)/layout.tsx`

**Interfaces:**

- Produces: `Trilho({ itens: { label: string; href: string; icon: ReactNode; desabilitado?: boolean }[], ativo: string, label?: string })`.
- Produces: `CascaWeb({ itens, children })`. É um client component que calcula `ativo` por `usePathname()`.

Faça antes: `git checkout main && git pull && git checkout -b feat/webcode-ui-cascas`. Depois: `npx shadcn@latest add @webcode/avatar @webcode/sheet @webcode/bottom-bar`.

- [ ] **Step 1: Teste que falha**

```tsx
import { render, screen } from "@testing-library/react";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Trilho } from "@/components/shell/trilho";

const itens = [
  { label: "Hoje", href: "/gestao", icon: <HomeIcon aria-hidden /> },
  {
    label: "Configurações",
    href: "/gestao/config",
    icon: <SettingsIcon aria-hidden />,
    desabilitado: true,
  },
];

describe("Trilho", () => {
  it("marca o item ativo com aria-current", () => {
    render(<Trilho itens={itens} ativo="Hoje" />);
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("item desabilitado não vira link", () => {
    render(<Trilho itens={itens} ativo="Hoje" />);
    expect(
      screen.queryByRole("link", { name: "Configurações" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Configurações" }),
    ).toBeDisabled();
  });
});
```

Run: `pnpm vitest run --project ui src/components/shell/trilho.test.tsx`

Expected: FAIL (módulo não existe).

- [ ] **Step 2: Implementar `trilho.tsx`**

Fonte: função `Trilho` de `docs/pranchas/pz-dash/painel.tsx`.

- Cada item vira `<Button asChild … ><Link href={href}>{icon}</Link></Button>`. Com `desabilitado`, é `<Button disabled …>` sem link.
- O item ativo usa `variant="default"` + `className="bg-[var(--pz-brasa)] text-[var(--pz-brasa-fg)] hover:bg-[var(--pz-brasa-hover)]"` e `aria-current="page"`. Os demais usam `variant="outline"`.
- Todos são `shape="pill" size="icon-lg"`, com `aria-label` e `title` = label.
- O logo no topo é `<PzSimbolo className="size-11" />`. O item cujo label é "Configurações" vai no pé.
- Os `<Link>` recebem `aria-label`. O `Button asChild` repassa.

- [ ] **Step 3: Ver passar**

Run: `pnpm vitest run --project ui src/components/shell/trilho.test.tsx`

Expected: PASS (2).

- [ ] **Step 4: Casca e layouts**

`casca-web.tsx` (`"use client"`):

```tsx
<div className="grid min-h-dvh grid-cols-[auto_1fr] gap-6 bg-background p-6">
  <Trilho itens={itens} ativo={ativo} />
  <div className="relative min-w-0 overflow-hidden">{children}</div>
</div>
```

O `ativo` é o label do item cujo `href` é o prefixo mais longo de `usePathname()`.

`src/app/(web)/layout.tsx`: mantenha `await exigirSuperficie("web")` e `force-dynamic`, e retorne `<CascaWeb itens={ITENS_WEB}>{children}</CascaWeb>`. Os itens são **só rotas que existem**:

```tsx
const ITENS_WEB = [
  { label: "Hoje", href: "/gestao", icon: <HomeIcon aria-hidden /> },
  {
    label: "Configurações",
    href: "/gestao/config",
    icon: <SettingsIcon aria-hidden />,
    desabilitado: true,
  },
];
```

`(saas)`: o mesmo com `[{ label: "Hoje", href: "/plataforma", icon: <HomeIcon aria-hidden /> }]`.

`AcoesAba` **não entra agora**, porque não há ação real. Ela entra na I5 (fonte: `AcoesAba` em `painel.tsx`).

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-12 /gestao /plataforma`

Revisar: o trilho e o grid contra `painel/dash-a-bento.webp`, o foco visível no Tab e o item ativo em brasa.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(web): trilho de navegação das superfícies web e admin"
```

---

### Task 13: Barra da portaria (ops)

**Files:**

- Create: `src/components/shell/nav-portaria.tsx`
- Modify: `src/app/(ops)/layout.tsx`

**Interfaces:**

- Produces: `NavPortaria()`.
  - 4 abas e um botão central "Registrar encomenda".
  - Só a aba "Hoje" (`/receber`) fica ativa. As outras e o botão central ficam `disabled` até a I5.

- [ ] **Step 1: Implementar**

Fonte: `NavMobile` de `docs/pranchas/pz-dash/painel.tsx`.

- Use `<BottomBar position="fixed" className="grid grid-cols-5 items-center gap-1 px-3">`, **sem fundo de vidro**: rodapé sem fundo, só os botões, como na prancha.
- Abas:
  - "Hoje": `<Button asChild variant="secondary"><Link href="/receber" aria-current="page">…</Link></Button>`;
  - "Fila", "Avisos" e "Mais": `<Button variant="ghost" disabled>`.
- Botão central: `<Button shape="pill" size="icon-lg" variant="elevated" aria-label="Registrar encomenda" disabled>` com `ScanLineIcon`.

`src/app/(ops)/layout.tsx`: mantenha o guard e retorne:

```tsx
<div className="min-h-dvh bg-muted pb-28">
  {children}
  <NavPortaria />
</div>
```

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-13 /receber`

Revisar: a barra inferior contra `painel/mob-c-portaria.webp`, sem fundo de vidro e com alvos de 44 px.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 2: Gate e commit**

Run: `pnpm verify && pnpm build`

Expected: verde.

```bash
git add -A && git commit -m "feat(ops): barra inferior da portaria"
```

---

### Task 14: Páginas iniciais honestas

**Files:**

- Modify: `src/app/(web)/gestao/page.tsx`, `src/app/(saas)/plataforma/page.tsx`, `src/app/(ops)/receber/page.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Trocar os placeholders**

Cada página usa `EmptyState` (de `@/components/ui/empty`). **Nenhum número falso.**

| Rota          | Título                     | Descrição                                                                           |
| ------------- | -------------------------- | ----------------------------------------------------------------------------------- |
| `/gestao`     | "Tudo pronto para começar" | "O painel do dia chega quando as encomendas começarem a ser registradas."           |
| `/plataforma` | "Plataforma pronta"        | "Organizações e planos aparecem aqui na fase de administração."                     |
| `/receber`    | "Turno pronto"             | "O registro de encomendas chega na próxima fase. Esta tela já funciona no celular." |

No topo de cada página, mostre o contexto ativo lido da sessão: nome do empreendimento e papel, de `getAuthenticatedSession()` e dos claims. **Não invente** se o claim não tiver nome; nesse caso, mostre só o papel.

`src/app/page.tsx`: mantenha o comportamento atual (redirect ou landing). Troque só a marca por `PzMarca`.

- [ ] **Step R: Design review**

Siga o Protocolo de Design Review (veja a tabela "Pranchas de referência", linha desta task).

Run: `node scripts/capturar-telas.mjs task-14 /gestao /plataforma /receber`

Revisar: o estado vazio contra `estados/bloco-e-vazio.webp`.

Expected: `rolagemHorizontal: 0` em todas as fotos e o revisor Sonnet com `VEREDITO: APROVADO`.

- [ ] **Step 2: Gate, screenshots e PR 3**

Run: `pnpm verify && pnpm build && pnpm a11y`

Expected: verde.

Screenshots:

- `/gestao` em 1440;
- `/receber` em 390.

Se não houver Supabase, rode `pnpm dev` com o guard desligado **só localmente, sem commitar**. Teclado: Tab percorre o trilho com foco visível.

```bash
git add -A && git commit -m "feat(ui): páginas iniciais das superfícies com estado vazio"
git push -u origin feat/webcode-ui-cascas
# abrir PR 3
```

---

### Task 15: Documentação em dia

**Files:**

- Modify: `DESIGN.md`, `WEBCODE-DS.md`, `DESIGN-NOTAS.md`, `.ai/page-map.md`, `.ai/roadmap.md`, `docs/product/screen-tracker.csv`, `docs/product/pages-roadmap.md`

Faça antes: `git checkout main && git pull && git checkout -b chore/webcode-ui-limpeza`.

- [ ] **Step 1: Atualizar**

- **`DESIGN.md`:** "Tokens" e "Visual direction" passam a descrever Névoa + Brasa:
  - fundo `#EEF1F5`;
  - navy `#0C2C55`;
  - Ocean `#629FAD`;
  - brasa `#D23B26` no botão pequeno;
  - carmim `#B4123F` no erro;
  - Jakarta e Inter;
  - flutuar.

  Fonte: `docs/pranchas/` e o artifact. Remova Deep Blue, Floral White e Bodoni.

- **`WEBCODE-DS.md`:**
  - tema = `theme-custelo` + override Névoa no `globals.css`;
  - plano B `scripts/webcode-add.mjs`;
  - regra toast × `notify()`.
- **`.ai/page-map.md`:** em `/entrar`, troque "GSAP só nesta tela… intro… Bola primary" por "splash CSS na 1ª abertura da sessão; transição CSS entre cards".
- **`screen-tracker.csv` e `pages-roadmap.md`:** AUTH-001..006 com Frontend `REVIEW`.
- **`.ai/roadmap.md`:** "Migração WebCode UI" para DONE, com a lista de pendências de `DESIGN-NOTAS.md`.
- **`DESIGN-NOTAS.md`:** seções "Faltou na biblioteca" e "Prancha × backend" completas, com tudo que foi pulado nas Tasks 6–14.

- [ ] **Step 2: Gate e commit**

Run: `pnpm format:check`

Expected: verde.

```bash
git add -A && git commit -m "docs(docs): design, page-map e roadmap após a migração para a WebCode UI"
```

---

### Task 16: Descobrir código morto

**Files:**

- Create: `knip.json`

- [ ] **Step 1: Configurar o knip (sem instalar)**

`knip.json`:

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "src/app/**/{page,layout,loading,error,global-error,not-found,route,default,template}.{ts,tsx}",
    "src/middleware.ts",
    "src/instrumentation*.ts",
    "scripts/*.mjs",
    "tests/**/*.{ts,tsx}"
  ],
  "project": ["src/**/*.{ts,tsx}", "scripts/*.mjs"],
  "ignore": ["docs/pranchas/**"],
  "ignoreDependencies": [
    "dexie",
    "@serwist/next",
    "@tanstack/react-query",
    "@tanstack/react-query-persist-client",
    "@tanstack/react-table",
    "@zxing/browser",
    "signature_pad",
    "posthog-js",
    "recharts",
    "uuidv7",
    "shadcn"
  ]
}
```

Os `ignoreDependencies` são a stack LOCKED (ADR) das próximas fases: offline, fila, câmera, assinatura, analytics, gráficos e ids. Não remover.

- [ ] **Step 2: Rodar**

Run: `pnpm dlx knip --no-progress > /tmp/knip.txt; cat /tmp/knip.txt`

Expected: lista de arquivos, exports e dependências sem uso. **Guarde a saída para o PR.**

---

### Task 17: Remover código morto

**Files:** os que a Task 16 confirmar, mais a lista abaixo.

- [ ] **Step 1: Confirmar cada alvo com grep e apagar**

Para cada item, rode `grep -rn "<nome>" src tests scripts`. Só apague com zero uso.

```bash
git rm -r Imagen
git rm public/brand/logo-custelo-escrita.png public/brand/logo-custelo-icon.png public/brand/logo-icon.png public/brand/logo.png
git rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
sed -i '/^Imagen$/d' .prettierignore
pnpm remove gsap @gsap/react
```

Depois apague:

- os arquivos de `src/components/ui/*` que o knip listou como não usados;
- os exports sem uso que o knip listou;
- os `README.md` de route group que só dizem "a fazer";
- as variáveis CSS antigas sem uso no `globals.css`: `--brand-deep-blue`, `--brand-powder-blue`, `--brand-floral-white`, `--brand-pale-brown` e qualquer `--font-brand`.

Antes de apagar uma variável CSS, confira com `grep -rn "<variável>" src`.

**Não apague:**

- `--state-*`;
- `--shadow-elevation-*` (se ainda houver uso);
- READMEs que documentam fronteira (`src/domain`, `src/application`, `src/ports`, `src/infrastructure`);
- nada em `src/db/migrations`.

- [ ] **Step 2: Rodar o knip de novo**

Run: `pnpm dlx knip --no-progress`

Expected: sem achados, ou só itens justificados no PR.

- [ ] **Step 3: Gate completo**

Run:

```bash
pnpm verify && pnpm build && pnpm a11y
pnpm test:rls   # com banco local ou de teste; sem ele, dizer no PR
```

Expected: tudo verde. `git diff --stat main` mostra praticamente só remoções, além de `knip.json` e dos ajustes de import.

- [ ] **Step 4: Commit e PR 4**

```bash
git add -A && git commit -m "chore(deps): remove código, assets e dependências sem uso"
git push -u origin chore/webcode-ui-limpeza
# abrir PR 4 com a saída do knip antes e depois
```

---

### Task 18: Entrega

- [ ] **Step 1: Resumo para o Fernando**

Mande para o Fernando:

- os 4 PRs;
- os screenshots antes e depois;
- a saída dos gates;
- a lista do `DESIGN-NOTAS.md` (faltas da biblioteca e itens de prancha sem backend);
- as pendências dele: contatos de suporte, mapeamento de papéis do PR #14, cobrança do GitHub Actions e ADR da barra inferior de vidro.

**Não faça merge.** O merge é dele.

Antes de cada PR (Tasks 5, 11, 14 e 17), rode o Protocolo de Design Review com **todas** as telas do PR juntas. Os vereditos vão no corpo do PR.

---

## Self-Review

- **Cobertura:** as telas que existem hoje estão todas cobertas.
  - Base e tema (Tasks 1–3), marca (4), estados globais (5).
  - AUTH-001..006 (6–11) e cascas com placeholders (12–14).
  - Docs (15) e limpeza (16–17).
  - As telas das fases seguintes ficam fora; elas seguem o Apêndice D do Spec quando a fase chegar.
- **Placeholders:**
  - `SUPORTE` vazio é intencional: o contato real é pendência do Fernando, e os botões ficam escondidos.
  - O corpo dos PRs é escrito pelo executor a partir da saída real.
- **Tipos e consistência:**
  - `PzMarca`/`PzSimbolo` (Task 4) são os únicos usados nas Tasks 5–14.
  - `TelaDeEstado` (Task 5) tem a mesma API em `not-found`, `error` e `global-error`.
  - `Trilho` (Task 12) recebe `itens` com `href`, e `CascaWeb` deriva `ativo`.
  - Rótulos testados mantidos em todas as tasks de auth.
- **Design:** toda task de tela tem um Step R (revisor Sonnet, 4 larguras, contra a foto e o código da prancha).
- **Riscos conhecidos:**
  - O CLI do shadcn pode tentar reescrever o `globals.css` (Task 1 Step 1 desfaz).
  - O `InputPassword` pode mudar o nome acessível do label (Task 7 Step 1 manda conferir).
  - O knip acusa entradas do Next como mortas (o `entry` do `knip.json` cobre).
