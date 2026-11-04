# Plano de execução: telas na WebCode UI + limpeza de código morto

> Escrito em 04/11/2026 para um **agente executor** (Sonnet) seguir passo a passo, sem precisar de outra conversa.
> Base: `main` em `a941cf6` (PRs #12, #13 e #14 mergeados). Os testes passam (139/139 unit e UI, 20/20 RLS) e o build passa.
> Pranchas (referência visual): artifact https://claude.ai/artifact/62ToCCANhT2uCNvvi4eWoD. O código-fonte delas está em `docs/pranchas/`.

> **Plano executável (superpowers):** `docs/superpowers/plans/2026-11-04-webcode-ui-migracao.md`. Ele manda na ordem, no código e nos comandos. Este arquivo vira o **Spec**: guarda as decisões, o mapa tela × prancha × fase (Apêndice A) e a cola da API. Em conflito, vale o plano superpowers.

---

## 0. Regras para o executor (ler antes de tudo)

1. **Um passo por vez, na ordem.** Cada passo termina com o seu **Gate**. Se o Gate falhar, corrija dentro do passo. Não pule para o próximo.
2. **Um commit por passo**, em Conventional Commits, com um escopo de `commitlint.config.mjs` (`ui`, `auth`, `chore`, `docs`…). Faça um PR por bloco (Passos 1–4, Passo 5, Passo 6, Passos 7–8).
3. **Todo componente vem da biblioteca `@webcode`.** Não crie primitivo novo e não copie um componente de outro lugar.
   - Se a prancha usa algo que não existe no registry, **pare a parte afetada**.
   - Anote a falta em `DESIGN-NOTAS.md` (seção "Faltou na biblioteca") e siga com o resto. O designer do Fernando cria o componente.
   - Composição de componentes da biblioteca (ex.: `Trilho` feito de `Button`) é permitida em `src/components/<área>/`.
4. **A prancha manda no visual; o código atual manda na lógica.**
   - Mantenha schemas Zod, actions, `request*.ts`, mensagens (`src/lib/mensagens.ts`) e testes de comportamento.
   - Troque só a camada visual.
5. **Elemento da prancha sem backend não entra.**
   - Exemplos: "Receber link de acesso por e-mail", "Manter conectado", "Pedir acesso ao gestor", "Abrir sempre neste empreendimento", aceite de termos sem página de termos.
   - Liste cada um em `DESIGN-NOTAS.md`, seção "Prancha × backend", e siga.
6. **Dados da prancha são exemplo.** Nunca leve nomes, números ou contatos da prancha para o app. Sem dado real, use estado vazio (`Empty`).
7. **LOCKs que não mudam:**
   - Sem vidro: nunca `variant="glass"`, `material="glass"` nem `backdrop-filter`.
   - Estado sempre com cor + texto + ícone.
   - Alvo de toque de pelo menos 44 px.
   - Cor só por token: sem hex no TSX e sem `dark:`.
   - Textos em pt-BR.
   - Nunca `service_role` em request.
   - Nunca commitar `.env`.
8. **Toda ação tem 3 estados visíveis:** carregando, sucesso e erro. O padrão está em `/mnt/project-files/pacotezap/REVIEW-2026-11-04.md` §3, resumido no Apêndice C.
9. **Pergunte ao Fernando antes de:** dependência npm nova (exceção: `sonner`, já aprovada), migration, mexer em auth/segredo, ou apagar algo fora da lista do Passo 8.
10. **Não declare pronto sem evidência.** Cole a saída do Gate no PR.

### Onde rodar

- **Recomendado: no PC do Fernando** (`Desktop\Custelo`, por Remote Control). Lá a rede alcança `webcode-design.vercel.app` e `ui.shadcn.com`, e o `npx shadcn add` funciona.
- **Na nuvem** (proxy bloqueia esses dois domínios): use o plano B `node scripts/webcode-add.mjs`. Aponte `WEBCODE_REGISTRY` para um clone local do DS (`<webcode-design>/site/public/r`).
  - Esse caminho foi testado em 04/11: trocar todos os `src/components/ui/*` deixou typecheck verde e 139/139 testes.

---

## Passo 0. Preparar o repositório

```bash
git status                     # PC: se houver mudança local, NÃO descarte:
git stash push -u -m "wip-antes-plano-webcode"   # reversível (git stash pop)
git fetch origin && git checkout main && git pull origin main
git checkout -b feat/webcode-ui-base
pnpm install
pnpm verify && pnpm build      # linha de base precisa estar verde
```

Antes de começar o Passo 1, confirme no `components.json` que existe o bloco `"registries": { "@webcode": "https://webcode-design.vercel.app/r/{name}.json" }`. Se não existir, adicione.

**Gate 0:** `pnpm verify` e `pnpm build` verdes **antes** de mudar qualquer coisa.

---

## Passo 1. Trocar a base de componentes (`src/components/ui`)

Hoje `src/components/ui` tem 9 arquivos do shadcn puro: alert, button, card, field, input-group, input, label, separator e spinner. A API do `@webcode` é compatível (é um superconjunto), então a troca é direta.

```bash
# PC (CLI):
npx shadcn@latest add @webcode/utils @webcode/alert @webcode/button @webcode/card @webcode/field \
  @webcode/input-group @webcode/input @webcode/label @webcode/separator @webcode/spinner --overwrite --yes
# Nuvem (plano B):
WEBCODE_REGISTRY=<webcode-design>/site/public/r node scripts/webcode-add.mjs --overwrite \
  utils alert button card field input-group input label separator spinner
```

- `utils` **precisa** ser trocado: o `cn` do DS estende o `tailwind-merge` com `control-*` e `shadow-wc-*`.
- `input-group` **precisa** ir junto com `input`. Sem ele, o typecheck quebra (`size`/`material`).
- Se o CLI tentar mexer no `globals.css`, **reverta só o CSS** (`git checkout src/app/globals.css`). O tema é o Passo 2.

**Gate 1:** `pnpm verify` verde. Telas visualmente iguais ou melhores (a cor só muda no Passo 2).

---

## Passo 2. Tema Névoa + Brasa, fonte e "flutuar"

Decisões aprovadas (03 e 04/11, não reabrir):

- **Paleta Névoa:** fundo `#EEF1F5`, cartão branco, navy `#0C2C55` em texto e ação, Ocean `#629FAD` em destaque e gráfico.
- **Brasa** `#D23B26` no botão pequeno de ação. Botão `lg`, `elevated` e card de destaque continuam navy.
- **Erro em carmim** `#B4123F`.
- **Plus Jakarta Sans** nos títulos e Inter no corpo.
- **Hover** cinza-claro `#F1F3F6`.
- **"Flutuar":** sombra navy em camadas em botão, campo e card. O botão sobe 1 px no hover.

### 2.1 Instalar o tema base do DS

PC: `npx shadcn@latest add @webcode/theme-custelo`. Nuvem: copie o objeto `css` de `<webcode-design>/site/public/r/theme-custelo.json` para CSS.

- Isso traz todas as variáveis `--wc-*` que os componentes usam: densidade, raio, movimento e sombras.
- Em `src/app/globals.css`, o bloco do tema fica **depois** dos imports e **antes** das regras do app.
- **Mantenha** os blocos `--state-*` (9 estados, claro e escuro). Eles são do produto, não do DS.

### 2.2 Sobrescrever com a Névoa (fonte: `docs/pranchas/pz-dash/painel.tsx`, `PALETAS[0]` e `vars()`)

Logo depois do tema, adicione:

```css
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
  --accent: #f1f3f6; /* hover cinza-claro (não azul) */
  --accent-foreground: var(--wc-fg);
}
```

- **Não** copie `--wc-glass-*` da prancha (LOCK sem vidro).
- **Modo escuro:** a paleta "Noturno" (P3) foi só proposta e **não foi aprovada**. Mantenha o `.dark` do tema e não exponha alternador de tema. Registre isso em `DESIGN-NOTAS.md`.

### 2.3 Brasa + flutuar

- Copie **literalmente** a constante `FLUTUAR` de `docs/pranchas/pz-todas/todas.tsx` (linhas ~26–82) para o fim do `globals.css`, dentro de `@layer components { … }`.
- Os seletores usam `[data-wc-theme="custelo"]`. Por isso, ponha `data-wc-theme="custelo"` no `<html>` do `src/app/layout.tsx`. Assim o CSS fica idêntico ao das pranchas.

### 2.4 Fontes, layout raiz e avisos

Em `src/app/layout.tsx`:

- **Fontes:**
  - Troque `Poppins` por `Plus_Jakarta_Sans` (`next/font/google`, pesos 500, 600, 700 e 800, `variable: "--font-display"`).
  - Mantenha `Inter` (`--font-sans`).
  - No `@theme inline` do `globals.css`, `--font-heading` passa a ser `var(--wc-font-display)`, e existe `--font-display`.
  - **Remova** `--font-brand`/Poppins. A logo é SVG (Passo 3).
- **Cor do navegador:** `viewport.themeColor` claro vira `#EEF1F5` (fundo Névoa). Mantenha o escuro.
- **Avisos:**
  - Instale `@webcode/sonner` (pacote npm `sonner`, aprovado) e `@webcode/notification-banner`.
  - No `<body>`, renderize `<Toaster />` (padrão `bottom-center`, `material="solid"`) e `<NotificationBannerHost />`.
  - **Regra de uso:** toast para o resultado de ação da própria pessoa; `notify()` para evento que vem de fora (morador leu, WhatsApp caiu).

### 2.5 Atualizar o guarda de tokens

Em `src/lib/design-tokens.test.ts`:

- Troque o teste "paleta de marca" (Deep Blue/Floral White) pela Névoa + Brasa: `--wc-bg: #EEF1F5`, `--wc-fg: #0C2C55`, `--pz-brasa: #D23B26`, `--wc-danger: #B4123F`.
- Mantenha os testes "sem blur" e "9 estados".
- O teste de `--shadow-elevation-0..3`:
  - Se ainda houver uso dessas variáveis no `src/` (`grep -rn shadow-elevation src`), mantenha as variáveis e o teste.
  - Se não houver, troque o teste por `--pz-sombra-card`/`--pz-sombra-controle`.

**Gate 2:**

- `pnpm verify` verde.
- `pnpm build` verde.
- Screenshot de `/entrar` em 1440 e 390 px (Playwright, `deviceScaleFactor: 1`): fundo `#EEF1F5`, botão "Entrar" navy, campos com sombra.
- `pnpm a11y` sem regressão. O contraste do "Zap" que falhava some no Passo 3.

---

## Passo 3. Marca (logo final e splash)

- **Fonte:** `docs/pranchas/pz-marca/marca.tsx`. Exporta `PzSimbolo`, `PzMarca`, `PzSplash` e `PZ_SPLASH_CSS`. Os SVGs e o favicon estão em `public/brand/` (svg, png, favicon).
- **Criar:** `src/components/brand/marca.tsx` com `PzSimbolo`, `PzMarca` e `PzSplash` (as mesmas props). Mova `PZ_SPLASH_CSS` para o `globals.css`.
  - Troque o hex do arquivo por token quando houver: navy = `var(--wc-fg)`, brasa = `var(--pz-brasa)`, brasa clara = `var(--pz-brasa-clara)`.
  - **Regra:** brasa sobre navy é proibido (2,92:1). No fundo escuro, o "Zap" usa a brasa clara `#FF6B4F`.
- **Trocar** todo uso de `PacoteZapMark`/`PacoteZapMobileHeader` (`grep -rn "pacotezap-mark" src`) por `PzMarca` e **apagar** `src/components/brand/pacotezap-mark.tsx`.
- **Metadados:** em `src/app/layout.tsx`, `metadata.icons` aponta para `public/brand/favicon/*` (svg, ico, apple-touch). O manifesto do PWA fica para a fase do Serwist.

**Gate 3:** `pnpm verify`, `pnpm build` e `pnpm a11y` verdes. A logo aparece em `/entrar`, `/sem-acesso`, `/contexto` e nas páginas de erro.

---

## Passo 4. Estados e erros globais (prancha `#estados`: `docs/pranchas/pz-estados/estados.tsx`)

Instale: `result skeleton empty banner badge`.

| Arquivo atual                                | Vira                                                                                              | Componentes                     | Texto (do catálogo `MSG`)                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------- |
| `src/components/feedback/tela-de-estado.tsx` | wrapper fino sobre `Result` (ou apagar e usar `Result` direto)                                    | `Result`, `Button`              | —                                                   |
| `src/app/not-found.tsx`                      | `Result status="404"`, "Página não encontrada", ação "Voltar para o início"                       | `Result`, `Button shape="pill"` | "O endereço mudou ou não existe. Nada foi perdido." |
| `src/app/error.tsx`                          | `Result status="500"`, botões "Tentar de novo" (`reset()`) e "Falar com o suporte" (ghost)        | `Result`, `Button`              | `MSG.inesperado` com o código (digest/Sentry id)    |
| `src/app/global-error.tsx`                   | igual ao `error.tsx`, com `<html><body>` próprios e sem depender de tema carregado                | `Result`                        | idem                                                |
| `src/app/(web)/loading.tsx`                  | `Skeleton` no formato do conteúdo (ver `EsqueletoDesktop`/`EsqueletoFila`), não spinner de página | `Skeleton`, `SkeletonCard`      | —                                                   |
| `(ops)/(web)/(saas)` sem permissão           | o guard já redireciona; se mostrar tela, use `Result status="403"` "Sem permissão para esta área" | `Result`                        | `MSG.semPermissao`                                  |

Outros pontos:

- **Spinner** só em espera curta, dentro do botão (`<Spinner />` + gerúndio: "Entrando…").
- **Sem conexão:** `Banner variant="brand"` "Sem conexão", com ícone `WifiOffIcon`.
- **Alerta fixo** (`Alert variant="danger|warning|success"`) só para o que continua valendo até alguém resolver.

**Gate 4:** `pnpm verify` e `pnpm build` verdes. Uma rota inexistente mostra o 404 novo. Erro forçado em dev mostra o 500 com "Tentar de novo". **Abra o PR 1 (Passos 1–4).**

---

## Passo 5. Telas de entrada (AUTH-001..006, prancha `#entrada`)

Fontes: `docs/pranchas/pz-entrada/entrada.tsx` (AUTH-001..004 e 006, ajuda) e `docs/pranchas/pranchas/pranchas.tsx` (função `Contexto`, AUTH-005).
Instale: `checkbox dialog radio-group textarea description-list password-strength result banner item badge navigation-bar`.

### 5.1 `/entrar`: AUTH-001 login, AUTH-002/004 convite e senha, AUTH-003 recuperar

- **Mantenha** o "palco único" por hash (`use-auth-hash-view.ts`), os 4 formulários e toda a lógica: RHF + Zod, `request*.ts`, mensagens, `force-dynamic`.
- **Layout desktop (≥ lg)** = `EntrarDesktop`. Grid `1.05fr / 1fr`:
  - À esquerda, o `PainelMarca` (aside `bg-primary`, `Fundo` em SVG inline, título "A portaria registra. O morador fica sabendo.", card de exemplo e rodapé com `ShieldCheckIcon`).
  - À direita, o `Card rounded-3xl` com o formulário.
  - **Dados do card de exemplo:** é ilustração da marca, então pode manter (é decorativo, `aria-hidden`).
  - O selo "Todos os serviços funcionando" **sai**: não há status real.
- **Layout celular** = `EntrarCelular`: fundo `bg-muted`, marca e botão de ajuda no topo, saudação ("Boa tarde." conforme a hora local) e card com o form.
- **Campos (login):**
  - `Field` + `FieldLabel` + `Input type="email"` e `InputPassword`. O `InputPassword` substitui `auth-password-field.tsx`; **apague** esse arquivo depois de trocar os 3 usos.
  - Link "Esqueci minha senha" ao lado do rótulo da senha.
  - Botão `Button type="submit" shape="pill" size="lg"` "Entrar". Carregando: `<Spinner /> Entrando…` e `disabled`.
- **Erro do formulário:** `Alert variant="danger"` com `role="alert"`, texto da `mensagemDeFalha`/constantes de `request-session.ts`.
- **Convite (AUTH-002/004):** `CardHeader` com `PzMarca`, título "Bem-vindo(a), {nome}" quando o convite tiver nome, `InputPassword` + `PasswordStrength value={senha}` e botão "Criar senha e entrar".
  - **Sem** checkbox de termos: não há página de termos (vai para `DESIGN-NOTAS.md`).
- **Recuperar (AUTH-003):**
  - Botão ghost "Voltar", título "Recuperar senha", campo e "Enviar link".
  - Sucesso: `Banner variant="success"` "Confira seu e-mail" + "Se existir uma conta com esse e-mail, o link chega em alguns minutos."
  - Contagem para reenviar **só se** já existir limite no backend; se não, omita.
- **Ajuda (`BotaoAjuda`):** `Dialog size="md"` com `RadioGroup` de `RadioGroupCard` (lista `PROBLEMAS`), `Textarea` opcional e `DescriptionList` com e-mail digitado, último aviso, código e aparelho.
  - **Contato real de suporte ainda não existe.** Crie `src/lib/suporte.ts` com `SUPORTE = { whatsapp: "", email: "" }`.
  - Os botões "Enviar pelo WhatsApp/e-mail" só aparecem se o valor existir. Registre a pendência.
- **Rodapé:** "© 2026 WebCodeFF". Links de Termos e Privacidade **só** quando as páginas existirem.
- **Removido da prancha (sem backend):** "Receber link de acesso por e-mail" e "Manter conectado neste aparelho". Registre os dois.
- **Splash (`PzSplash`):** só na 1ª abertura da sessão (`sessionStorage`, com try/catch), cerca de 4 s, pulado com `prefers-reduced-motion`.
  - Ele **não pode bloquear** o formulário. Renderize o form por baixo e o splash como overlay que some.
  - O splash substitui a intro GSAP.
- **Apagar** (depois de trocar): `login-intro-parcel.tsx` (+ teste), `login-orbs.tsx`, `login-hero.tsx`, `use-login-motion.ts` e o uso de GSAP em `auth-card-stage.tsx`.
  - A transição entre cards vira CSS (`tw-animate-css` `animate-in fade-in slide-in-from-bottom-2`, desligada com movimento reduzido).

### 5.2 `/contexto`: AUTH-005 (função `Contexto` em `pranchas.tsx`)

- `NavigationBar title="Onde você está hoje?" large`, texto "Tudo o que você registrar vai para este empreendimento." e `RadioGroup` com um `RadioGroupCard` por escopo.
  - No card: `Building2Icon`, título = nome do empreendimento (ou da org, se `isOrgScope`), descrição = `papelNome`.
- **Botão:** `Button shape="pill" size="lg" className="w-full"` com o texto "Começar no {nome}". Carregando: "Entrando…".
- **Mantenha:** `selectContextAction`, o mapa `MENSAGEM_CONTEXTO`, `initialError` (vindo de `?erro=` da rota `/contexto/auto`) e o caminho automático com 1 escopo.
- **Sem** "Abrir sempre neste empreendimento" (sem backend).

### 5.3 `/sem-acesso`: AUTH-006 (`SemAcesso`)

- `Card rounded-3xl` com `Result status="warning"`, ícone `LockIcon`, título "Você ainda não tem acesso aqui" e descrição da prancha.
- Ação real: "Entrar com outra conta" (`signOutAction`; em caso de falha, toast de erro com `mensagemDeFalha`).
- Rodapé "Conectado como {email}".
- "Pedir acesso ao gestor" **não entra** (sem backend).

### 5.4 Testes

Os rótulos de botão e campo que os testes usam **não mudam** (lista nas Global Constraints do plano superpowers). Só a aparência muda, então os testes UI e E2E passam sem editar asserções.

**Gate 5:**

- `pnpm verify`, `pnpm build` e `pnpm a11y` verdes.
- `pnpm test:e2e`, se houver Supabase de teste; se não houver, diga isso no PR.
- Screenshots de 1440 e 390 px de: login, recuperar, convite, contexto (2 escopos) e sem acesso.
- Compare lado a lado com as abas `#entrada` e `#portaria` do artifact.
- **Abra o PR 2.**

---

## Passo 6. Cascas das superfícies (prancha `#painel`: `pz-dash/painel.tsx`)

Instale: `sheet avatar kbd search-bar bottom-bar empty`.

### 6.1 `(web)` e `(saas)`: desktop com trilho

Crie `src/components/shell/`:

- **`trilho.tsx`:** copie `Trilho` de `painel.tsx`.
  - Recebe `itens: { label, href, icon }[]` e `ativo`.
  - Cada item é `Button asChild` + `next/link`, `shape="pill" size="icon-lg"`. O selecionado usa `variant="default"` com as classes Brasa da prancha; os demais usam `outline`.
  - `aria-current="page"` no item ativo e `aria-label`/`title` = label.
  - Engrenagem no pé.
- **`acoes-aba.tsx`:** `AcoesAba` (meia-aba navy à direita que abre `Sheet side="right" size="sm" inset`). O pai precisa de `relative overflow-hidden`.
- **`perfil.tsx`:**
  - Botão com o empreendimento ativo (leva a `/contexto`).
  - Sino (desabilitado até a I7, com `title="Avisos chegam na fase de WhatsApp"`).
  - `Avatar` com iniciais do e-mail.
- **`busca.tsx`:** `SearchBar` + `Kbd` "⌘K". **Não renderize** até existir busca real; deixe o arquivo só quando for usado. Se não usar agora, **não crie**.

`src/app/(web)/layout.tsx` e `src/app/(saas)/layout.tsx` usam o grid da `DashA`: trilho fixo à esquerda, conteúdo à direita, `bg-background`.

- **Itens do trilho:** só rotas que **existem**. Hoje: "Hoje" (`/gestao`) e "Configurações", que fica desabilitado até a rota existir. Cada fase nova adiciona o seu item.
- **`AcoesAba`:** só entra quando houver pelo menos uma ação real (I5+). Não renderize ação que dá 404.

### 6.2 `(ops)`: celular com barra inferior (MobC)

- `src/components/shell/nav-portaria.tsx` = `NavMobile` (`BottomBar position="fixed"`, 4 abas + botão central `elevated` "Registrar encomenda").
  - **Regra da prancha:** rodapé sem fundo, só os botões. **Sem vidro** (ADR pendente para exceção).
- **Itens:** só os que existem (hoje só "Hoje" = `/receber`). O botão central fica `disabled` até a I5.

### 6.3 Páginas placeholder

`/receber`, `/gestao` e `/plataforma` viram estado vazio honesto, sem números falsos:

- Use `EmptyState` com título "Tudo pronto para começar" e descrição do que chega na próxima fase.
- Mostre `PzMarca` e o contexto ativo (nome do empreendimento e papel, lidos da sessão).

**Gate 6:**

- `pnpm verify` e `pnpm build` verdes.
- Screenshot de `/gestao` (1440) e `/receber` (390), com usuário seed, se houver Supabase; se não houver, rode em dev com o guard desligado **só localmente, sem commitar**.
- Teclado: Tab percorre o trilho e o foco é visível.
- **Abra o PR 3.**

---

## Passo 7. Documentação em dia

Atualize no mesmo PR da limpeza:

- **`DESIGN.md`:** reescreva "Tokens" e "Visual direction" para Névoa + Brasa, Jakarta, flutuar e carmim. Aponte para `docs/pranchas/` e o artifact. Tire Deep Blue/Floral White/Bodoni.
- **`WEBCODE-DS.md`:**
  - Tema = `theme-custelo` + override Névoa no `globals.css`.
  - Plano B `scripts/webcode-add.mjs`.
  - Regra toast × banner.
- **`.ai/page-map.md`:** em `/entrar`, troque "GSAP só nesta tela / intro" por "splash CSS na 1ª abertura".
- **`docs/product/screen-tracker.csv` + `pages-roadmap.md`:** AUTH-001..006 com Frontend `REVIEW` (visual novo).
- **`.ai/roadmap.md`:** mova a migração para DONE e liste as pendências de `DESIGN-NOTAS.md`.
- **`DESIGN-NOTAS.md`:** consolide "Faltou na biblioteca" e "Prancha × backend". O Fernando leva isso ao designer e ao DS (ex.: tema `theme-custelo` Névoa no repo do DS).

---

## Passo 8. Limpeza de código morto

Só depois dos Passos 1–7 mergeados ou no mesmo branch final.

### 8.1 Descobrir

```bash
pnpm dlx knip --no-progress            # sem instalar dependência
pnpm dlx ts-prune -p tsconfig.json | grep -v "used in module"
```

Confirme cada item com `grep -rn "<nome>" src tests` antes de apagar. **Rotas do Next (`page.tsx`, `layout.tsx`, `route.ts`, `error.tsx`…), `middleware.ts`, `instrumentation*.ts` e arquivos de config são pontos de entrada:** knip pode acusar falso positivo neles.

### 8.2 Apagar (lista conhecida; cada item só se o grep confirmar zero uso)

| Alvo                                                                                                                                         | Motivo                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/components/auth/login-intro-parcel.tsx` (+ teste), `login-orbs.tsx`, `login-hero.tsx`, `use-login-motion.ts`, `auth-password-field.tsx` | trocados no Passo 5                                                                                 |
| `src/components/brand/pacotezap-mark.tsx`                                                                                                    | trocado no Passo 3                                                                                  |
| `src/components/feedback/tela-de-estado.tsx`                                                                                                 | se virou `Result` direto                                                                            |
| `Imagen/` inteiro (Penpot de referência + logos Custelo)                                                                                     | só o `login-hero` usava; tire `Imagen` do `.prettierignore`                                         |
| `public/brand/logo-custelo-escrita.png`, `logo-custelo-icon.png`, `logo-icon.png`, `logo.png`                                                | logo antiga                                                                                         |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`                                                                       | sobras do create-next-app                                                                           |
| `src/components/ui/*` sem import                                                                                                             | reinstala quando a fase precisar                                                                    |
| `src/app/(auth)/README.md`, `(ops)/README.md`, `(web)/README.md`, `(saas)/README.md`, `api/README.md`, `src/*/README.md`                     | **só** se forem placeholder "a fazer"; se documentam fronteira (domain/application/ports), mantenha |
| Variáveis CSS sem uso no `globals.css` (`--brand-*` antigas, `--font-brand`, `--shadow-elevation-*` se o Passo 2 trocou)                     | tema antigo                                                                                         |
| Exports sem uso apontados pelo knip/ts-prune                                                                                                 | código morto                                                                                        |

### 8.3 Dependências

- **Remover** se sem uso: `gsap`, `@gsap/react` (saem no Passo 5), além de qualquer outra que o knip acusar e que **não** esteja na lista abaixo.
- **Manter**, mesmo sem uso hoje: stack LOCKED (ADR) das próximas fases. São `dexie`, `@serwist/next`, `@tanstack/react-query`, `@tanstack/react-query-persist-client`, `@tanstack/react-table`, `@zxing/browser`, `signature_pad`, `posthog-js`, `inngest`, `recharts`, `uuidv7` e `shadcn` (CLI).
  - Anote o motivo num `knip.json` (`ignoreDependencies`) para o knip parar de acusar.

### 8.4 Gate 8

- `pnpm verify`, `pnpm build`, `pnpm a11y` e `pnpm test:rls` verdes (se tiver banco).
- `pnpm dlx knip` sem achado novo, só os ignorados com motivo.
- Diff só com remoções e os ajustes de import necessários.
- **Abra o PR 4.**

---

## Passo 9. Entrega

- Cada PR com: o que mudou, screenshots antes/depois, saída dos Gates e itens adicionados ao `DESIGN-NOTAS.md`.
- O CI do GitHub está fora por cobrança da conta. Rode os Gates localmente e cole a saída.
- Pare e avise o Fernando ao fim de cada PR. O merge é dele.

---

## Apêndice A. Telas × prancha × rota × fase (próximas fases)

Rota canônica: `docs/product/screen-tracker.csv`. Prancha: arquivo em `docs/pranchas/` e aba no artifact.
A migração (Passos 1–8) cobre só o que existe hoje (AUTH e cascas). As outras telas seguem o **Apêndice D** quando a fase chegar.

| Bloco                          | IDs                                                          | Fase                                        | Prancha (arquivo · aba)                          | Componentes `@webcode` da prancha                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrada                        | AUTH-001..004, 006                                           | I2                                          | `pz-entrada/entrada.tsx` · #entrada              | badge banner button card checkbox description-list dialog field input item label password-strength radio-group result separator textarea                                                                                            |
| Contexto                       | AUTH-005                                                     | I2                                          | `pranchas/pranchas.tsx` (`Contexto`) · #portaria | navigation-bar radio-group checkbox label button                                                                                                                                                                                    |
| Portaria (casa)                | REC-001 (MobC), DASH-001 (DashA)                             | I5 / I10                                    | `pz-dash/painel.tsx` · #painel                   | activity-ring avatar badge bar-chart bottom-bar button card donut-chart filter-counters item kbd line-chart progress search-bar segmented-bar sheet stat-card tab-bar table timeline usage-meter week-strip                         |
| Receber, fila, retirar         | REC-002/003, CUS-001, RET-004                                | I4–I8                                       | `pranchas/pranchas.tsx` · #portaria              | app-shell badge banner button camera-capture card checkbox data-table field filter-counters input item label navigation-bar page-header radio-group search-bar signature-pad stat-card tab-bar toggle-group                         |
| Fluxo completo                 | REC-004/006/008/009/010, CUS-002/003/004/007, RET-001..004   | I4–I9                                       | `pz-fluxo/fluxo.tsx` · #fluxo                    | alert badge banner button card checkbox description-list field input input-document item navigation-bar progress qr-code quantity-stepper radio-group result search-bar signature-pad stepper textarea timeline toggle-group        |
| Cadastros e avisos             | UNI-002, PES-001/003, DEV-001..003, NOT-001/002/004          | I3 / I7 / I8                                | `pz-telas/telas.tsx` · #cadastros                | avatar badge banner button camera-capture card description-list field filter-counters input item navigation-bar radio-group result signature-pad table tabs textarea timeline usage-meter                                           |
| Estrutura                      | UNI-001/003/004, PES-002                                     | I3                                          | `pz-estrutura/estrutura.tsx` · #estrutura        | avatar badge banner button card description-list field input input-date item label native-select switch tree-view usage-meter                                                                                                       |
| Formulários                    | UNI-002..004, PES-001/002, USR-003, CFG-001, SAAS-001        | I2–I11                                      | `pz-forms/forms.tsx` · #formularios              | banner button card checkbox field input input-cep input-date input-document input-phone label native-select radio-group step-form switch tags-input textarea                                                                        |
| Gestão                         | USR-001..003, AUD-001, NOT-003, CFG-002/003/004/008          | I2 / I7 / I9 / I12                          | `pz-gestao/gestao.tsx` · #gestao                 | alert avatar badge banner button card checkbox description-list field filter-counters input item label native-select permission-matrix switch table tabs textarea timeline usage-meter                                              |
| Importar cadastros             | IMP-010..015                                                 | **I3 (Excel/CSV, recomendado)** / I10 (PDF) | `pz-importar/importar.tsx` · #importar           | alert badge button card checkbox description-list empty field file-upload filter-counters input item label native-select radio-group result segmented-bar stat-card stepper table                                                   |
| Importação antiga e relatórios | IMP-001..004, REL-001..005                                   | I10                                         | `pz-escala/escala.tsx` · #importacao             | alert badge bar-chart button card checkbox date-picker description-list field file-upload filter-counters heatmap-chart input item label line-chart native-select progress radio-group result segmented-bar stat-card stepper table |
| Configurações e organização    | CFG-001/005/006/007, ORG-001..004, AUD-002                   | I7 / I11 / I12                              | `pz-config/config.tsx` · #config                 | alert avatar badge button card countdown description-list field filter-counters input input-cep input-document input-phone item locked-feature native-select stat-card stepper switch table timeline usage-meter                    |
| Plataforma (admin)             | SAAS-001..006, BIL-003                                       | I11                                         | `pz-plataforma/plataforma.tsx` · #plataforma     | alert badge button card countdown field filter-counters input item line-chart native-select stat-card switch table textarea timeline usage-meter                                                                                    |
| Estados                        | 404/403/500, sessão, offline, manutenção, esqueletos, vazios | todas                                       | `pz-estados/estados.tsx` · #estados              | alert badge banner button card empty notification-banner progress result skeleton spinner                                                                                                                                           |

**MVP sem prancha ainda** (pedir ao design **antes** da fase; não inventar): REC-005 Escolher pessoa, REC-007 Localização física, CUS-005 Movimentação interna, CUS-008 Etiqueta/QR, RET-005 Histórico de retiradas, RET-006 Corrigir retirada.

---

## Apêndice B. Instalação por momento

- **Agora (Passos 1–6):** `utils alert button card field input-group input label separator spinner theme-custelo sonner notification-banner result skeleton empty banner badge checkbox dialog radio-group textarea description-list password-strength item navigation-bar sheet avatar bottom-bar`.
  - `kbd` e `search-bar` só se a busca entrar.
- **Cada fase:** instale só o que a prancha da tela usa (coluna do Apêndice A), na hora de construir.
  - Nunca instale a biblioteca inteira: o que sobra vira código morto no Passo 8.
- **Dependências do registry vêm sozinhas:** `glass`, `gesture`, `use-keyboard`, `copy-button`, `br`, `use-mask`, `csv`, `qr`, `eta`, `chart-core`.
  - `glass` entra como dependência técnica, mas **nunca** use a variante de vidro.

---

## Apêndice C. Cola rápida da API e do padrão de mensagens

**Button:**

- `variant`: `default` (pequeno = brasa pelo CSS, `lg` = navy) | `elevated` (navy, destaque) | `outline` | `secondary` | `soft` | `ghost` | `link` | `destructive` | `destructive-soft`. **Proibido:** `glass*`.
- `shape`: `default` | `pill` | `square`.
- `size`: `xs` | `sm` | `default` | `lg` | `icon` | `icon-xs` | `icon-sm` | `icon-lg`.
- **Padrão das pranchas:** ação principal = `shape="pill" size="lg"`; ícone = `size="icon-lg" shape="pill"` + `aria-label`.

**Formulário e campos:**

- **Input:** `Input`, `InputPassword` (mostrar/ocultar embutido), `size`.
- **Campo:** `Field` > `FieldLabel htmlFor` + controle + `FieldDescription` | `FieldError`. Grupo: `FieldGroup`, `FieldSet`, `FieldLegend`.

**Feedback:**

- **Result:** `status` `success|info|warning|error|404|403|500`, `title`, `description`, `extra` (botões, primário primeiro), `icon`.
- **Alert:** `variant` `default|info|success|warning|danger|destructive`, com `AlertTitle` e `AlertDescription`.
- **Banner:** `variant` (`success`, `brand`…) > ícone + `BannerContent` > `BannerTitle` + `BannerDescription` (+ `BannerAction`).
- **Badge:** `variant` `success|warning|danger|outline|secondary|soft…` + `size`. Estado = ícone + texto, sempre.
- **Empty:** `EmptyState` (pronto) ou `Empty` > `EmptyHeader` > `EmptyMedia`/`EmptyTitle`/`EmptyDescription` + `EmptyContent`.
- **Skeleton:** `Skeleton`, `SkeletonText lines`, `SkeletonRow`, `SkeletonCard ratio`, `SkeletonTable rows columns`.

**Sobreposição:**

- **Sheet:** `Sheet` > `SheetTrigger asChild` + `SheetContent side size inset` > `SheetHeader`/`SheetTitle`/`SheetBody`/`SheetFooter`.
- **Dialog:** `DialogContent size="md"` > `DialogHeader`/`DialogTitle`/`DialogDescription` + `DialogBody`.

**Avisos:**

- **Toast:** `import { toast } from "sonner"`, com `toast.success(título, { description })`, `toast.error(...)` e `toast.promise(p, { loading, success, error })`.
- **Evento de fora:** `import { notify } from "@/components/ui/notification-banner"`, com `notify({ app: "PacoteZap", icon, time: "agora", title, body })`.

**Mensagens (REVIEW-2026-11-04 §3):**

| Situação                 | Como mostrar                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------- |
| Carregando até 1 s       | botão `disabled` + `<Spinner />` + gerúndio                                           |
| Carregando mais que isso | `loading.tsx` com `Skeleton`                                                          |
| Sucesso de ação própria  | `toast.success` com o que aconteceu e o próximo passo                                 |
| Erro de campo            | `FieldError` abaixo do campo                                                          |
| Erro de ação             | `Alert variant="danger" role="alert"` no formulário, texto de `mensagemDeFalha(erro)` |
| Evento externo           | `notify()`                                                                            |
| Erro de página           | `error.tsx`                                                                           |

Regras do texto:

- Nunca culpar a pessoa e nunca escrever "erro" sozinho.
- Use `aria-live`/`role="alert"`.
- Offline no recebimento = "Salvo no aparelho. Vai sincronizar quando a internet voltar".

---

## Apêndice D. Receita para cada tela nova (I3 em diante)

1. Ache o ID no Apêndice A e abra a prancha (arquivo + aba do artifact).
2. Instale só os componentes que a tela usa.
3. Copie o JSX da tela e troque os imports:
   - `@/registry/webcode/ui/` → `@/components/ui/`.
   - Helpers de prancha (`Moldura`, `Celular`, `Prancha`, `Bloco`) **não entram**: são moldura de apresentação.
4. Troque os dados de exemplo por dados reais:
   - Server Component + `withAppRls`; tenant **só** do contexto autenticado.
   - Mutação por Server Action com Zod e `comMensagemDeFalha`.
5. Implemente os estados obrigatórios do `.ai/page-map.md`:
   - Lista: loading, vazio, sem resultado, erro de rede, sem permissão.
   - Formulário: validação, sucesso, rede, duplo clique bloqueado.
   - OPS: offline, sync pendente.
6. Peças repetidas (Trilho, `EstadoBadge`, `CardCustodia`, `Movimentos`…) viram componente do app em `src/components/<área>/` na **primeira** vez que aparecem em código real, não antes.
7. Gate:
   - `pnpm verify` e `pnpm build`.
   - Screenshot em 1440 e 390 px ao lado da prancha.
   - `pnpm a11y`.
   - `pnpm test:rls` se a tela tocar o banco.
   - Atualize o `screen-tracker.csv`.
