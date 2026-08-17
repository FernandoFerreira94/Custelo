#!/usr/bin/env bash
# Bloqueia variantes destrutivas que o prefix-match do `deny` nao pega.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
CMD=$(printf '%s' "$INPUT" | tr '\n' ' ')

block() {
  echo "BLOQUEADO por destructive-guard: $1" >&2
  exit 2
}

printf '%s' "$CMD" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*[rf][a-zA-Z]*[[:space:]]+)+' \
  && block "rm recursivo/forcado"

printf '%s' "$CMD" | grep -Eq 'find\b.*-delete' && block "find -delete"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+clean\b.*-[a-z]*f' && block "git clean -f"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+reset\b.*--hard' && block "git reset --hard"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+push\b.*(--force|-f)\b' && block "git push --force"
printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+checkout\b.*(--|\.)$' && block "git checkout descartando alteracoes"

# Banco: o produto inteiro depende de evidencia nao apagavel (ADR-007).
printf '%s' "$CMD" | grep -Eiq '(drop|truncate)[[:space:]]+(table|schema|database)' \
  && block "DROP/TRUNCATE — evidencia operacional nao tem hard delete"
printf '%s' "$CMD" | grep -Eiq 'delete[[:space:]]+from[[:space:]]+custody_events' \
  && block "DELETE em custody_events — o log e append-only (ADR-007)"
printf '%s' "$CMD" | grep -Eq 'drizzle-kit[[:space:]]+(drop|push)' \
  && block "drizzle-kit drop/push — migrations sao versionadas e aplicadas por pipeline (ADR-019)"
printf '%s' "$CMD" | grep -Eq 'supabase[[:space:]]+db[[:space:]]+reset' \
  && block "supabase db reset"

exit 0
