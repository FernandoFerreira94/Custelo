# Quality Gates

Aplicam-se a **toda** tarefa. Uma tarefa so esta pronta quando todos os gates
aplicaveis passam — com evidencia colada, nao com afirmacao.

Base: Notion, _Quality Gates — DoD · Performance · Security · A11y · Git_.
Aqui estao os gates adaptados a este produto, com os acrescimos que o dominio
exige.

## Como rodar

```bash
pnpm verify        # typecheck + lint + format:check + test
pnpm test:rls      # se tocou banco, tenancy ou auth
pnpm test:e2e      # se tocou UI
pnpm a11y          # acessibilidade
pnpm audit:deps    # se mexeu em dependencia
```

Automatizados e nao contornaveis: hook `Stop` (`quality-check.sh`) roda
typecheck + lint + varredura de segredo antes de qualquer "pronto"; hooks
`PreToolUse` bloqueiam comando destrutivo e vazamento de segredo. Os mesmos
scripts rodam no Cursor via `.cursor/hooks.json`.

---

## Gate 1 — Definition of Done

- sem `any`, sem cast desnecessario
- toda entrada externa validada com Zod
- erro tratado como **resultado tipado**, nunca throw cru para o cliente
- sem `console.log` esquecido
- sem segredo hardcoded; `.env.example` atualizado
- rota autenticada por padrao; publica exige comentario explicando por que
- teste escrito **com** o codigo — caminho feliz + caminho de erro
- JSDoc em funcao publica ou complexa
- loading, erro e sucesso em toda acao do usuario

## Gate 2 — Performance

**Banco** — nunca consultar em laco (`inArray`) · selecionar so as colunas
necessarias · relacao carregada so com motivo · paginacao obrigatoria em lista,
cursor preferido · sinalizar filtro em coluna nao indexada · transacao para
escrita multipla · indice liderando por `empreendimento_id`.

**Frontend** — dado de servidor via TanStack Query, nunca `useEffect` + fetch ·
`next/image` com dimensoes · dependencias de hooks conferidas · limite de
Suspense/skeleton em toda rota que busca dado · componente pesado via
`dynamic()`.

**OPS** — o alvo e Android de baixo custo. Avaliar custo de render na fila e na
captura, tamanho do bundle de `(ops)` e efeitos visuais caros. Blur e superficie
translucida sao proibidos por isso.

## Gate 3 — Seguranca

Rodar `/security-review`. **Gatilho automatico**: sempre que o diff tocar rota,
auth/middleware, query, schema/DTO, upload, migration ou dependencia. Diff so de
estilo, copy ou teste dispensa.

**Isolamento de tenant (prioridade maxima)** — query escopada por tenant, nao so
por id · tenant do contexto autenticado · RLS em toda tabela de dominio, com
policy na mesma migration · service_role fora de codigo de request e do cliente ·
sem cache mal escopado.

**BOLA/IDOR e mass assignment** — id do request nao e prova de acesso · corpo da
requisicao nunca espalhado em create/update.

**Integridade da evidencia** — nenhum caminho de hard delete · sem UPDATE/DELETE
em `custody_events` · correcao gera evento novo · acao elevada com motivo e
trilha.

**Entrada e saida** — Zod antes do caso de uso · SQL parametrizado · upload valida
MIME e tamanho no servidor antes de processar · resposta sem stack trace, id
interno ou nome de tabela · rate limiting em rota publica · CORS com origem
explicita.

**Dado e segredo** — sem dado pessoal, imagem de etiqueta, texto bruto de OCR ou
segredo em log · PostHog sem PII · `.env` nunca commitado · `pnpm audit --prod`
apos mudar dependencia, nunca `audit fix --force` automatico.

Nunca reportar pronto com High ou Critical em aberto.

## Gate 4 — Documentacao

- README atualizado quando surgir env var nova, servico externo novo ou mudanca
  de setup
- decisao arquitetural registrada em `.claude/memory.md`; mudanca de decisao
  congelada exige **ADR novo** em `docs/adr/`
- feature complexa tem `specs/<feature>.md` antes da implementacao
- erro recorrente vai para `.claude/gotchas.md`

## Gate 5 — Acessibilidade e UX

- elemento interativo com texto visivel ou `aria-label`
- `<label htmlFor>` associado
- contraste WCAG AA: 4.5:1 normal, 3:1 grande
- foco visivel, nunca removido sem substituto
- **estado nunca depende so de cor** — cor + label + icone
- alvo de toque minimo 44px; acao primaria 48–56px
- feedback apos toda acao do usuario
- `pnpm a11y` — violacao serious/critical **quebra o build**

## Gate 6 — Git

- Conventional Commits, imperativo: `feat:` `fix:` `refactor:` `test:` `docs:`
  `chore:`
- escopo da lista de `commitlint.config.mjs` (modulos + superficies)
- um contexto por commit — nunca misturar `feat` com `fix`
- branch: `feat/<ID-ou-nome>`, `fix/<nome>` — quando a tarefa e uma tela, use o
  ID (`feat/REC-003`)
- nunca commitar `.env` nem arquivo gerado

## Gate 7 — Dominio (proprio deste produto)

Estes nao existem no template global. Existem porque este produto vende
evidencia.

- [ ] teste negativo cross-tenant para toda tabela nova
- [ ] prova de que evento de custodia nao pode ser alterado nem pela conexao da
      aplicacao
- [ ] transicao de estado proibida rejeitada em todo caminho
- [ ] matriz de permissoes testada — Recepcionista nao corrige, nao cancela, nao
      altera retirada
- [ ] ciclo offline → sync sob conflito sem perda de evidencia
- [ ] reenvio duplicado tratado por idempotencia
- [ ] retirada concorrente do mesmo volume
- [ ] janela de notificacao e aging testados via `Clock` fake
- [ ] nenhuma migration cria tabela de dominio sem RLS

## Gates de merge (CI)

Bloqueiam o merge: `typecheck` · `lint` · `format:check` · `test` (unit + ui) ·
`test:rls` · `build` · `audit:deps`.

`test:e2e` e `a11y` rodam contra o preview.
