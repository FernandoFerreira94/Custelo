# Page / Screen Map

Indice rapido para o agente. Spec completa: Notion (4 paginas de telas).
Controle versionado: `docs/product/pages-roadmap.md` +
`docs/product/screen-tracker.csv`. Inventario: `docs/product/screen-map.md`.

83 telas · 77 MVP · 6 pos-MVP · 3 superficies (OPS, WEB, SAAS).
ID = frame Penpot = branch `feat/<ID>` = task.

Atualize **so a entrada afetada** depois de mudar UI/fluxo. Ao concluir tela:
CSV + pages-roadmap (F/B/T).

## AUTH — fatia atual (I2)

### `/(auth)/entrar` — AUTH-001..004 (um palco)

- Purpose: login; recuperar acesso; definir senha; aceitar convite — **cards
  no mesmo palco**, sem rotas `/recuperar` `/senha` `/convite`.
- User/permission: anonimo.
- Module: `auth-rbac` / `tenancy`.
- Data/API: `requestSession()` real; callback SSR `/auth/confirm` valida
  token-hash ou codigo PKCE; recovery e convite reais via Supabase Auth.
- Actions: entrar · esqueci senha · enviar link · definir senha · aceitar
  convite e ativar usuario/escopo.
- States: validacao · loading · erro de credencial · sucesso (redirect
  `/contexto`) · reduced-motion (pula intro GSAP).
- Connects to: `/contexto` · `/sem-acesso`.
- Notes: GSAP so nesta tela. A intro bloqueia interacao ate o palco estar
  hidratado. Bola `primary` atras do card. Senha min 10. AUTH-001..004 REVIEW:
  RLS e E2E desktop/OPS revalidados; fechamento formal aguarda `pnpm verify`,
  a11y global e configuracao de Auth no Supabase.

### `/(auth)/contexto` — AUTH-005

- Purpose: escolher org/empreendimento e gravar escopo na sessao.
- User/permission: autenticado, 1..N escopos.
- Module: `tenancy` `auth-rbac`.
- Data/API: lista de escopos do usuario; claims `empreendimento_id` /
  `papel_codigo` podem nascer nulos no JWT.
- Actions: selecionar contexto → OPS ou WEB.
- States: loading · vazio (→ sem-acesso) · erro · sucesso.
- Connects to: `(ops)` ou `(web)` · `/sem-acesso`.
- Status repo: F/B marcados DONE no pages-roadmap; fluxo server-side validado
  por testes unitarios (sessao, status, escopo unico/multiplo e escopo invalido)
  e E2E real do usuario seed no desktop e OPS.

### `/(auth)/sem-acesso` — AUTH-006

- Purpose: sessao invalida ou usuario sem escopo.
- User/permission: autenticado sem vinculo util, ou sessao morta.
- Actions: sair / contatar admin.
- States: mensagem + CTA. Encaminhamento de sessao invalida, desativada ou
  convite pendente validado no fluxo server-side de `/contexto`.
- Connects to: `/entrar`.
- Status repo: frontend/backend/testes DONE; recovery sem escopo cai aqui.

### AUTH-007 MFA

Pos-MVP. Nao implementar.

## Outros blocos (entrar so na fase certa)

| Bloco            | Rotas tipicas                          | Fase       | Superficie |
| ---------------- | -------------------------------------- | ---------- | ---------- |
| REC-001..010     | `(ops)` recebimento / camera / offline | I5–I6      | OPS        |
| CUS              | fila, detalhe, localizacao, correcao   | I4–I5, I9  | OPS+WEB    |
| RET / DEV        | retirada 1:N, assinatura, devolucao    | I8         | OPS+WEB    |
| NOT              | templates, janelas, falhas             | I7         | WEB        |
| UNI / PES        | estrutura, pessoas, vinculos           | I3         | WEB        |
| IMP / DASH / REL | importacao, dashboard, relatorios      | I10        | WEB        |
| USR              | usuarios do empreendimento             | I2         | WEB        |
| AUD              | timeline / trilha                      | I9         | WEB        |
| CFG              | configs (notif, retencao, etc.)        | I7/I11/I12 | WEB        |
| ORG / SAAS / BIL | conta, plataforma, billing             | I11        | WEB/SAAS   |

Sheets (nao viram rota): REC-004/005/006, CUS-004/005, DEV-002, NOT-004.

## Estados obrigatorios por natureza

- Lista: loading / empty / first-use / no results / network error / forbidden
- Form: validation / success / network / double-submit bloqueado
- OPS: offline / sync pending / partial sync / retry
- Acao critica: confirmacao + motivo

Estado e variante, nao pagina nova. Token semantico, nunca hex literal.
