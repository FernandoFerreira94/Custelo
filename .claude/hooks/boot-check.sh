#!/usr/bin/env bash
# Boot Protocol — Step 0 (Diagnosis). Roda no SessionStart e injeta so o relatorio.
# Nunca bloqueia o boot: qualquer falha vira aviso.
set -uo pipefail

ok() { [ -e "$1" ] && printf '✓' || printf '✗'; }

SKILLS=$(ls -1 .claude/skills 2>/dev/null | wc -l | tr -d ' ')
RULES=$(ls -1 .claude/rules/*.md 2>/dev/null | wc -l | tr -d ' ')
CMDS=$(ls -1 .claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')
AGENTS=$(ls -1 .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
SPECS=$(ls -1 specs/*.md 2>/dev/null | wc -l | tr -d ' ')
HOOKS=$(ls -1 .claude/hooks/*.sh 2>/dev/null | wc -l | tr -d ' ')
MEM=$(wc -l < .claude/memory.md 2>/dev/null | tr -d ' ' || echo 0)

if [ -f graphify-out/graph.json ]; then
  NODES=$(grep -o '"id"' graphify-out/graph.json 2>/dev/null | wc -l | tr -d ' ')
  GRAPH="✓ (~${NODES} nos)"
elif [ -f .claude/tree-snapshot.txt ]; then
  GRAPH="degradado (tree snapshot)"
else
  GRAPH="✗ — rodar: graphify update ."
fi

cat <<EOF
Custelo — Boot Protocol Step 0
Projeto : CLAUDE.md $(ok CLAUDE.md) | AGENTS.md $(ok AGENTS.md) | settings $(ok .claude/settings.json) | memory $(ok .claude/memory.md) (${MEM}L) | scope $(ok .claude/scope.md)
Estrutura: graph ${GRAPH} | hooks ${HOOKS}/5 | rules ${RULES} | commands ${CMDS} | agents ${AGENTS} | skills ${SKILLS} | specs ${SPECS}
Fonte canonica: Notion — Architecture Freeze (LOCKED, 13/08/2026) · Brand & UI Foundation (LOCKED, 15/08/2026)
Regra: decisoes DEFINED nao sao rediscutidas. Ver docs/ antes de perguntar.
EOF

exit 0
