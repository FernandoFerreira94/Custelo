#!/usr/bin/env bash
# Stop hook — gate deterministico antes de "pronto".
# Instrucao ao modelo pode ser ignorada (sobretudo pos-compact); este hook nao.
set -uo pipefail

# Nada a verificar se nao houve alteracao rastreada.
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
CHANGED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
[ "$CHANGED" = "0" ] && exit 0

FAIL=0
MSG=""

if ! pnpm exec tsc --noEmit >/tmp/custelo-tsc.log 2>&1; then
  FAIL=1
  MSG="${MSG}\n- typecheck falhou:\n$(tail -20 /tmp/custelo-tsc.log)"
fi

if ! pnpm exec eslint . >/tmp/custelo-eslint.log 2>&1; then
  FAIL=1
  MSG="${MSG}\n- lint falhou:\n$(tail -20 /tmp/custelo-eslint.log)"
fi

# Gate 3 — segredo no diff.
if git diff --cached -U0 2>/dev/null | grep -Eq '^\+.*(SERVICE_ROLE_KEY|sk_live_|eyJhbGciOi|-----BEGIN [A-Z ]*PRIVATE KEY)'; then
  FAIL=1
  MSG="${MSG}\n- possivel segredo no diff staged"
fi

if [ "$FAIL" = "1" ]; then
  printf 'Quality gate falhou — tarefa NAO esta pronta.%b\n' "$MSG" >&2
  exit 2
fi

exit 0
