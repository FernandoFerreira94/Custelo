#!/usr/bin/env bash
# PostToolUse(Edit|Write): formata e corrige o arquivo tocado. Silencioso no sucesso.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
FILE=$(printf '%s' "$INPUT" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed 's/.*"\([^"]*\)"$/\1/')

[ -z "${FILE:-}" ] && exit 0
[ -f "$FILE" ] || exit 0

case "$FILE" in
  *.ts|*.tsx|*.js|*.mjs|*.json|*.css|*.md|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac

pnpm exec prettier --write "$FILE" >/dev/null 2>&1 || true

case "$FILE" in
  *.ts|*.tsx|*.js|*.mjs) pnpm exec eslint --fix "$FILE" >/dev/null 2>&1 || true ;;
esac

exit 0
