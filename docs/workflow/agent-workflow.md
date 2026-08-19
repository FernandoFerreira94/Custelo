# Agent Workflow — agentes, skills, MCPs e plugins

Regra que governa tudo aqui: **contexto principal enxuto, detalhe sob demanda.**
Nada entra em "always load" sem justificar o custo em toda sessao.

---

## Always Load vs Load On Demand

### Always Load (custo fixo por sessao — mantenha pequeno)

| Item                                     | Por que                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`                              | regras fixas, comandos e as 12 invariantes. Curto de proposito.                                                            |
| `AGENTS.md`                              | contrato de agentes (lido por Cursor/Codex)                                                                                |
| `.claude/memory.md` — bloco `## Summary` | 5 linhas com as decisoes ativas                                                                                            |
| `.claude/rules/security.md`              | sem `paths:` porque regra de seguranca vale no momento da **criacao** do arquivo, e regra path-scoped so injeta em leitura |
| hook `boot-check.sh`                     | injeta so o relatorio de diagnostico, nao o protocolo                                                                      |

### Load On Demand

| Item                               | Gatilho                                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `.claude/rules/<topico>.md`        | automatico, quando um arquivo que casa com `paths:` entra em contexto                                  |
| `.claude/skills/<modulo>/SKILL.md` | tarefa naquele bounded context                                                                         |
| `.claude/scope.md`                 | comando `scope` — contexto de negocio                                                                  |
| `.claude/gotchas.md`               | comando `gotchas` — erro recorrente suspeito                                                           |
| `docs/**`                          | conforme a tarefa; nunca "docs inteiro"                                                                |
| Graphify                           | primeira pergunta estrutural. No boot carrega **so o resumo** (contagem de nos), nunca o mapa completo |
| MCP do Notion                      | consultar spec de tela, ADR ou atualizar tracker                                                       |
| MCP do Penpot                      | trabalho visual contra o arquivo de design                                                             |

### Anti-padrao

Nao repetir arquitetura em varios arquivos. `CLAUDE.md` aponta; `docs/` detalha.
Se a mesma frase aparece em dois lugares, um dos dois esta errado — e sera o que
alguem le.

---

## Agentes

Poucos e especializados. O agente principal coordena e preserva contexto; os
subagentes executam com contexto proprio e devolvem resultado.

| Agente              | Responsabilidade                                                                                   | Ferramentas                                | Skills tipicas                            | Quando chamar                                                                                 | Quando NAO chamar                           |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **(principal)**     | coordenar, decidir, preservar contexto, falar com o Fernando                                       | todas                                      | as de processo                            | sempre                                                                                        | —                                           |
| `domain-backend`    | dominio, casos de uso, Drizzle, RLS, migrations, Route Handlers, Server Actions, jobs, adaptadores | Read, Write, Edit, Glob, Grep, Bash, Skill | modulo + `tenancy` `custodia-eventos`     | qualquer trabalho de servidor ou dados                                                        | trabalho de UI; mudanca so de design system |
| `frontend-ui`       | superficies `(web)` e `(saas)`                                                                     | Read, Write, Edit, Glob, Grep, Bash, Skill | `frontend-design` + modulo                | telas de gestao, tabelas, dashboards, componentes                                             | PWA operacional; logica de dominio          |
| `ops-pwa`           | superficie `(ops)` — captura, camera, QR, assinatura, offline                                      | Read, Write, Edit, Glob, Grep, Bash, Skill | `ui-ops-pwa` `recebimento` `offline-sync` | qualquer coisa no route group `(ops)`                                                         | telas de gestao; regra de dominio pura      |
| `security-reviewer` | Gate 3, isolamento de tenant, integridade de evidencia, BOLA/IDOR                                  | Read, Glob, Grep, Bash (**sem escrita**)   | —                                         | antes de merge quando o diff toca rota, auth, query, migration, schema, upload ou dependencia | diff so de estilo, copy ou teste            |
| `test-engineer`     | testes unit, ui, rls, e2e, a11y                                                                    | Read, Write, Edit, Glob, Grep, Bash, Skill | `testing`                                 | escrever ou consertar teste                                                                   | implementar funcionalidade                  |

`security-reviewer` nao tem `Write` nem `Edit` de proposito: quem revisa nao
corrige. Achado vira tarefa, nao commit silencioso.

Disponivel globalmente: **Reality Checker** — usar como ultimo portao antes de
declarar qualquer coisa "pronta".

---

## Skills

### De processo (globais, ja instaladas)

| Skill             | Uso                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `superpowers`     | brainstorming → writing-plans → TDD → code review → systematic-debugging → finishing-a-branch. Nao recriar esses fluxos a mao. |
| `frontend-design` | **obrigatoria** antes de qualquer UI nova                                                                                      |
| `graphify`        | estrutura do codebase como grafo consultavel — economia de token em pergunta estrutural                                        |
| `shadcn`          | adicionar e compor componentes shadcn/ui                                                                                       |
| `ponytail`        | antidoto a over-engineering. Util neste projeto porque o dominio e complexo e a tentacao de abstrair cedo e alta.              |

### De modulo (deste projeto — 19)

Materializadas do catalogo do Notion em `.claude/skills/`. Cada uma carrega o que
o modulo faz, a regra de negocio e **a invariante que o agente nao pode violar**.

`tenancy` · `auth-rbac` · `estrutura-fisica` · `pessoas-vinculos` ·
`recebimento` · `ocr-matching` · `custodia-eventos` · `correcoes` · `whatsapp` ·
`offline-sync` · `retirada` · `devolucao` · `auditoria` · `importacao` ·
`billing-entitlements` · `retencao-lgpd` · `observabilidade` · `ui-ops-pwa` ·
`relatorios`

> `tenancy`, `auth-rbac` e `custodia-eventos` sao pre-requisito de qualquer
> outra.

### Avaliadas e nao adotadas

| Skill                      | Decisao              | Motivo                                                                                                                                                                                                                        |
| -------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `caveman`                  | **nao ativar**       | comprime a saida em 65–75%, mas em estilo telegrafico. Conflita com a exigencia de comunicacao clara em PT-BR e com a rastreabilidade que este produto exige. A economia real vem de contexto enxuto, nao de saida abreviada. |
| `ui-ux-pro-max`            | **nao ativar**       | sobrepoe `frontend-design` e traz direcao visual generica. O design system daqui e LOCKED — direcao externa e ruido.                                                                                                          |
| `impeccable`               | **nao ativar**       | mesmo motivo. Identidade visual ja definida e aprovada.                                                                                                                                                                       |
| `gsap-skills`              | nao aplicavel        | sem GSAP; motion e curto e o alvo e Android de baixo custo                                                                                                                                                                    |
| `core-web-vitals`          | nao aplicavel no MVP | produto e app autenticado, nao site publico                                                                                                                                                                                   |
| `code-review-graph`        | **avaliar em I5**    | blast radius de mudanca fica util quando houver codigo real. Instalar cedo e custo sem retorno.                                                                                                                               |
| `graphiti`                 | **nao ativar**       | Graphify ja e o grafo deste repo                                                                                                                                                                                              |
| `emotion`                  | **nao ativar**       | CSS-in-JS conflita com Tailwind v4 LOCKED; skill de "emocao" de UI e ruido contra a fundacao de marca                                                                                                                         |
| `gapskill`                 | **nao encontrado**   | nenhum pacote confiavel com esse nome; quality gates + Reality Checker cobrem o caso                                                                                                                                          |
| `vercel-labs/agent-skills` | **avaliar em I5**    | React/Next best practices pagam quando houver UI real                                                                                                                                                                         |

---

## MCPs

Configurados em `.mcp.json` (Claude Code) e `.cursor/mcp.json` (Cursor) — mesmos
servidores nos dois.

| MCP          | Finalidade                                                 | Fase                | Quem usa                        | Riscos                                                                                        | Quando NAO usar                                                    |
| ------------ | ---------------------------------------------------------- | ------------------- | ------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **notion**   | fonte canonica: ADRs, spec de tela, tracker, Boot Protocol | todas               | principal                       | conteudo desatualizado (o cabecalho do projeto ja estava); escrita acidental em pagina errada | para regra que ja esta no repo — o repo e a fonte de valor         |
| **penpot**   | arquivo de design "Custelo" — 53 componentes, 77 telas     | trabalho visual     | `frontend-ui`, `ops-pwa`        | exige servidor local em `localhost:4401`; `export_shape` instavel com arquivo grande          | para decidir valor de token — isso vem de `globals.css`            |
| **serena**   | navegacao semantica de codigo, edicao por simbolo          | a partir de I1      | `domain-backend`, `frontend-ui` | indexa o projeto; sem risco de dado                                                           | enquanto nao houver codigo real                                    |
| **supabase** | SQL, tabelas, migrations, storage                          | **adicionar em I1** | `domain-backend`                | acesso direto ao banco; token com permissao ampla                                             | nunca apontado para producao a partir de sessao de desenvolvimento |

### Nao conectados, por decisao

| MCP                | Motivo                                                                               |
| ------------------ | ------------------------------------------------------------------------------------ |
| GitHub             | `gh` CLI ja instalado cobre PR, issue e API com menos superficie                     |
| Vercel             | deploy via CI; MCP acrescenta risco de acao em producao sem ganho                    |
| Playwright/browser | Playwright ja roda como teste; browser MCP e para exploracao, nao para o loop de dev |
| Figma              | o design vive no Penpot (AD-010), nao no Figma                                       |

### Regras de uso

- MCP que escreve em servico externo (Notion, Supabase) **pede confirmacao antes**.
- Nunca colocar segredo em `.mcp.json` — ele e commitado. Token vai por variavel
  de ambiente.
- MCP fora do ar nunca bloqueia o trabalho: reporte e continue.

---

## Plugins

| Plugin            | Escopo | Estado         | Motivo                                                              |
| ----------------- | ------ | -------------- | ------------------------------------------------------------------- |
| `superpowers`     | global | ativo          | fluxo de desenvolvimento; nao recriar manualmente                   |
| `frontend-design` | global | ativo          | obrigatorio antes de UI nova                                        |
| `shadcn`          | global | ativo          | a UI deste projeto e shadcn/ui                                      |
| `ponytail`        | global | ativo          | freio de over-engineering — sob demanda, nao continuo               |
| `github`          | global | **desativado** | `gh` CLI cobre o caso                                               |
| `context7`        | global | **desativado** | docs de biblioteca sob demanda via WebFetch; carga de contexto alta |
| `caveman`         | global | **desativado** | ver tabela de skills                                                |
| `ui-ux-pro-max`   | global | **desativado** | sobrepoe `frontend-design`; design ja e LOCKED                      |
| `codex`           | global | desativado     | Codex acessa o repo pelo `AGENTS.md`, nao por plugin                |

Nenhum plugin foi adicionado ao escopo deste projeto: os quatro ativos ja cobrem
o necessario, e plugin de projeto so se justifica quando o global nao serve.
