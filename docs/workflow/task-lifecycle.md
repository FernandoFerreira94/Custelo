# Ciclo de uma tarefa

Vale para qualquer agente e para qualquer ferramenta.

## Comecar

1. **Contexto minimo.** Leia `AGENTS.md`. Nao leia `docs/` inteiro — leia o
   arquivo em `.ai/` que a tarefa exige.
2. **Modulo.** Identifique o bounded context e carregue
   `.ai/modules/<modulo>.md`. E la que estao as invariantes daquele contexto.
3. **Fase.** Confirme em `.ai/roadmap.md` (e, se precisar da ordem I1–I13,
   `docs/product/implementation-roadmap.md`) que a fase que habilita esta
   tarefa ja foi entregue. Dependencia invertida e o erro mais caro deste
   roadmap.
4. **Tela.** Se e uma tela, use `/tela <ID>` — ele checa status de design, fase e
   modulo antes de deixar comecar. `.ai/page-map.md` + `DESIGN.md` na UI.
5. **Complexidade.** Feature complexa ganha `.ai/specs/<feature>.md` **antes** do
   codigo: requisitos, criterios de aceite, o que muda e o que nao muda.
6. **Branch.** `feat/<ID>` quando for tela, `feat/<nome>` caso contrario.

## Durante

- Regras path-scoped carregam sozinhas quando o arquivo entra em contexto. No
  Cursor, o mesmo — via `globs` em `.cursor/rules/`.
- Teste nasce com o codigo, nao depois.
- Decisao arquitetural, padrao novo ou workaround com motivo → `.ai/memory.md`
  no formato `[YYYY-MM-DD] contexto — decisao`. Se for critica, atualize o bloco
  `## Summary`.
- Erro que aparece pela segunda vez → `.ai/gotchas.md`.
- Dependencia nova, mudanca de assinatura publica, renomeio, exclusao ou
  migration → **pergunte antes**.
- Precisa mudar uma decisao LOCKED? Escreva um ADR em `docs/adr/`. Nao decida no
  codigo.

## Encerrar

```bash
pnpm verify
pnpm test:rls   # se tocou banco, tenancy ou auth
pnpm test:e2e   # se tocou UI
```

1. Cole a **saida real**. Nao declare pronto sem evidencia observavel.
2. Se o diff tocou rota, auth, query, schema, upload ou dependencia, rode
   `/security-review` **antes** de reportar. Nunca reporte pronto com
   High/Critical em aberto.
3. Confira o Gate 7 (dominio) em `quality-gates.md` — e o que este produto exige
   alem do padrao.
4. Commit em Conventional Commits, um contexto por commit.
5. Atualize `docs/product/screen-tracker.csv` e `docs/product/pages-roadmap.md`
   (colunas Frontend, Backend/API, Testes). Regra: `.cursor/rules/pages-roadmap.mdc`.
   Atualize `.ai/page-map.md` se rota/estado/navegacao mudou e `.ai/roadmap.md`
   se o status de fase mudou.
6. Sincronize o Notion (_Roadmap Mestre_) quando o MCP estiver autenticado.
7. Atualize `.ai/memory.md` se houve decisao duradoura.
8. Se a estrutura de codigo mudou, `graphify update .`.

## O que nunca fazer

- Declarar pronto sem rodar a verificacao.
- Afrouxar assercao de teste para o teste passar.
- Contornar a regra de ESLint do dominio com `eslint-disable`.
- Criar tabela de dominio sem RLS.
- Ampliar escopo sem autorizacao.
- Criar arquivo de memoria proprio de uma ferramenta.
