@AGENTS.md

## Claude Code adapter

Este arquivo nao e a fonte de regras de produto. Ele so liga o Claude Code ao
contrato universal.

- Permissoes e hooks: `.claude/settings.json` + `.claude/hooks/`
- Commands: `.claude/commands/` (`/verify`, `/security-review`,
  `/performance-review`, `/tela`, `/scope`, `/roadmap`)
- Subagentes: `.claude/agents/`
- Skills de modulo: `.claude/skills/<modulo>/SKILL.md` — ponte para
  `.ai/modules/<modulo>.md`
- Regras path-scoped: `.claude/rules/` aponta para `.ai/rules/`
- Diagnostico de sessao: hook `boot-check.sh` (nao carrega o protocolo inteiro)

Nao duplique invariantes, stack ou roadmap aqui. Canonico: `AGENTS.md` + `.ai/`.

## Biblioteca de UI

- Biblioteca de componentes e padroes de tela: WebCode Design System
  (`@webcode`, decisao do Fernando em 30/10/2026). Regras em `WEBCODE-DS.md`,
  importado abaixo. O LOCK de stack vence em conflito.

@WEBCODE-DS.md
