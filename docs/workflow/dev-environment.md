# Development Environment

Como um agente (ou humano) sobe a maquina. Contas de nuvem sao fase **I1**.

## Pre-requisitos locais

- Node `>= 22.16` (ver `package.json#engines`)
- pnpm `10.33` (`packageManager`)
- Git com bash (hooks Husky e `.claude/hooks/*.sh`)
- Opcional: Graphify CLI (`graphify update .` apos editar codigo)

```bash
pnpm install
cp .env.example .env.local   # nomes apenas; nunca commitar valores
pnpm dev
```

Sem `.env.local` o `pnpm dev` sobe: health responde `db: skipped` e o Sentry
nao envia. Contas de nuvem (Supabase ×3, Inngest, Sentry, GitHub) ainda sao
passo humano — ver `docs/workflow/environments.md`.

## O que ja esta no repo

Quality gates, ESLint de fronteira de dominio, tokens em `globals.css`,
route groups vazios `(ops)` `(web)` `(saas)` `(auth)`, CI, Dependabot,
agentes, skills, hooks. Ver `docs/boot-protocol-status.md`.

## O que NAO esta (e nao deve estar nesta fase)

- Tres projetos Supabase preenchidos (conta — passo humano)
- GitHub `origin` + CI verde no remoto (`gh auth login`)
- DSN Sentry / chaves Inngest em producao
- Migration de dominio
- Pagina, API de produto ou autenticacao reais

## MCP nesta maquina

Configurados em `.mcp.json` e `.cursor/mcp.json`:

- **notion** — precisa OAuth no Cursor Settings → MCP. Sem isso, use o repo.
- **penpot** — `localhost:4401`; so em trabalho visual.

Serena, Supabase, GitHub, Vercel, Figma: nao conectados. Motivo em
`docs/workflow/agent-workflow.md` e `docs/workflow/tooling-decisions.md`.

## Windows

Hooks e `boot-check.sh` esperam `bash`. Instale Git for Windows e deixe
`bash.exe` no PATH. `create-next-app` recusa pasta com maiuscula — ja
contornado (gotcha).
