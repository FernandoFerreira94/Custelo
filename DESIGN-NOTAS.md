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
- **Splash uma vez por navegador:** chave `pz-splash-visto` no localStorage,
  duração 4000 ms.

## Tarefa 8 — recuperar, senha e convite

- **`InputPassword` não serve no lugar do `AuthPasswordField`:** o botão do DS tem
  `aria-label` fixo "Mostrar senha" com `aria-pressed`, e os testes do login exigem
  o rótulo alternando para "Ocultar senha". O `AuthPasswordField` fica até o DS
  aceitar rótulos de mostrar/ocultar por prop.
- **`PasswordStrength`:** a regra padrão pede 8 caracteres; o Custelo exige 10
  (`password-policy`). O app passa as regras próprias por prop.
- **Casca dos cards de `/entrar`:** as classes vivem em `auth-card.ts`.
