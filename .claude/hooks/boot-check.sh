#!/usr/bin/env bash
# Boot Protocol — Step 0 (Diagnosis). Roda no SessionStart e injeta so o relatorio.
# Nunca bloqueia o boot: qualquer falha vira aviso.
set -uo pipefail

ok() { [ -e "$1" ] && printf '✓' || printf '✗'; }

SKILLS=$(ls -1 .claude/skills 2>/dev/null | wc -l | tr -d ' ')
RULES=$(ls -1 .ai/rules/*.md 2>/dev/null | wc -l | tr -d ' ')
MODULES=$(ls -1 .ai/modules/*.md 2>/dev/null | wc -l | tr -d ' ')
CMDS=$(ls -1 .claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')
AGENTS=$(ls -1 .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
SPECS=$(ls -1 .ai/specs/*.md 2>/dev/null | wc -l | tr -d ' ')
HOOKS=$(ls -1 .claude/hooks/*.sh 2>/dev/null | wc -l | tr -d ' ')
MEM=$(wc -l < .ai/memory.md 2>/dev/null | tr -d ' ' || echo 0)

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
Router : AGENTS.md $(ok AGENTS.md) | CLAUDE.md $(ok CLAUDE.md) | DESIGN.md $(ok DESIGN.md)
.ai    : scope $(ok .ai/scope.md) | arch $(ok .ai/architecture.md) | roadmap $(ok .ai/roadmap.md) | page-map $(ok .ai/page-map.md) | memory $(ok .ai/memory.md) (${MEM}L) | gotchas $(ok .ai/gotchas.md)
Estrutura: graph ${GRAPH} | hooks ${HOOKS} | rules ${RULES} | modules ${MODULES} | commands ${CMDS} | agents ${AGENTS} | skill-bridges ${SKILLS} | specs ${SPECS}
Fonte: repo (.ai + docs + ADRs). Notion do projeto pode estar atras do Freeze.
Regra: decisoes LOCKED nao sao rediscutidas. Confirmar so o destrutivo.
EOF

exit 0
