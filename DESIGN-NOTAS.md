# DESIGN-NOTAS

Pontos em que o Custelo precisou fugir do padrão `@webcode` ou em que o design
system faltou. Levar ao repo `webcode-design`.

## Tarefa 6 — `/entrar`

- **Splash sem GSAP:** o palco de entrada (painel da marca + splash) é CSS +
  timers. A classe `.pz-splash-tag` (animação `pz-foco`, atraso de 3,6 s,
  desligada com movimento reduzido) vive em `src/app/globals.css`. Não existe
  componente `@webcode` de splash/abertura para isso.
- **Card de login:** `max-w-[460px]`, `overflow-hidden`, `rounded-3xl` e título
  em `font-brand text-4xl font-extrabold`, ajustados na revisão de design. O
  `Card` do DS não tem variante para rodapé sangrando até a borda; o `pb-0` e o
  `py-4` no `CardFooter` cobrem a falta.
- **Splash uma vez por sessão:** chave `pz-splash-visto` no `sessionStorage`,
  duração 4000 ms. O splash vive no layout de `(auth)` e nasce no HTML do
  servidor; um script inline (`splash-sessao-script.ts`) o esconde nas visitas
  seguintes e com movimento reduzido. O `loading.tsx` da raiz saiu para
  `(web)`, `(ops)` e `(saas)`: ali ele cobria o layout de `(auth)` e o
  esqueleto aparecia antes do splash.

## Tarefa 8 — recuperar, senha e convite

- **`InputPassword` não serve no lugar do `AuthPasswordField`:** o botão do DS tem
  `aria-label` fixo "Mostrar senha" com `aria-pressed`, e os testes do login exigem
  o rótulo alternando para "Ocultar senha". O `AuthPasswordField` fica até o DS
  aceitar rótulos de mostrar/ocultar por prop.
- **`PasswordStrength`:** a regra padrão pede 8 caracteres; o Custelo exige 10
  (`password-policy`). O app passa as regras próprias por prop.
- **Casca dos cards de `/entrar`:** as classes vivem em `auth-card.ts`.

## Tarefa 9 — ajuda para entrar

- **Tokens que o `Dialog` pede e o tema não tinha:** `--color-scrim`
  (`bg-scrim`), `--shadow-wc-lg` e `--ease-wc-spring` no `@theme inline`,
  apontando para os `--wc-*` existentes. Sem o `--color-scrim` o fundo do
  diálogo não escurecia.
- **Prancha × backend:** o bloco "Vai junto com o pedido" não mostra e-mail
  digitado, último aviso nem código, porque o pedido de ajuda não os leva. O
  texto de privacidade fica "Seu e-mail e sua senha nunca são enviados." Sem
  contato em `src/lib/suporte.ts`, os botões de envio ficam escondidos, e a
  frase de horário da prancha não entra até haver contato real.
- **Botão de ajuda × card:** a coluna do card reserva `pt-20` no topo. Em
  1024×768 o card cobria o botão e interceptava o clique.

## Tarefa 10 — escolher empreendimento

- **Sem escolha inicial:** nenhum empreendimento vem marcado; o botão diz
  "Escolha um empreendimento" até a pessoa marcar um, para o registro não ir
  ao primeiro da lista por inércia.

## Tarefa 11 — sem acesso

- **Prancha × backend:** o botão primário "Pedir acesso ao gestor" não entra,
  porque não existe pedido de acesso no backend; um botão sem efeito seria
  silêncio (invariante 11). Fica só "Entrar com outra conta".
- **Título da tela:** a página passa a chamar "Você ainda não tem acesso aqui"
  (h1). O e2e `auth-callbacks.spec.ts` foi ajustado para esse título.
- **Casca do card:** `authCardClass` tem `pb-0` (pensado para rodapé); a tela
  devolve o respiro de baixo com `pb-(--card-spacing)`.
- **Contraste do selo de sucesso:** `--wc-success` passa de `#15803d` para
  `#166534` (4,27 → acima de 4,5:1 sobre `success-soft`). `--state-retirada`
  segue `#15803d`.
- **Contraste do selo de aviso:** `--wc-warning` deixa de seguir `--state-aguardando`
  e passa a `#a64b07` (4,22 → 4,77:1 sobre `warning-soft`). `--state-aguardando`
  segue `#b45309` (branco sobre sólido).
- **Sem `loading.tsx` em `(auth)`:** um `loading.tsx` vazio fazia o redirect de
  `/contexto` virar meta refresh (200) e reprovava o a11y da raiz. Sem ele o
  redirect volta a ser 307.

## Tarefas 12–14 — cascas e páginas iniciais

- **Trilho (web e admin) e barra da portaria (ops):** `Trilho`, `CascaWeb` e
  `NavPortaria` vivem em `src/components/shell/`. A biblioteca não tem uma casca
  pronta com a marca; o `AppShell` do DS não foi usado.
- **Contexto ativo:** as páginas mostram só o papel. As claims ainda não trazem
  o nome do empreendimento, e nenhum nome foi inventado.
- **Estado vazio das páginas iniciais:** `estadoVazioPaginaClass` dá respiro do
  topo e põe fundo de card + anel de brasa na mídia, porque `bg-accent` some sobre
  a Névoa. O DS deveria ter um `tone="brand"` com contraste próprio.
- **Testes de a11y:** esperam o splash sair e rodam com movimento reduzido; sem
  isso o axe media contraste no meio do fade.

## Ajuda dos campos (login e convite)

- **Dica no label:** `DicaCampo`/`RotuloComDica` (`src/components/auth/dica-campo.tsx`)
  trocam o `FieldDescription` por um "?" em círculo à direita do label com o
  `Tooltip` do DS. O texto vai também no `aria-label` do botão. Falta no DS um
  `FieldLabel` com slot de dica. O `TooltipProvider` mora no próprio componente
  para funcionar sem provider na raiz.
- **Botão de suporte:** tooltip no lugar do `title` nativo.
- **Ícones nos botões:** Entrar, Aceitar convite, Criar acesso e Voltar.
