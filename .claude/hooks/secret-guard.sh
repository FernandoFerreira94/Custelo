#!/usr/bin/env bash
# Bloqueia comandos que imprimem ou exfiltram segredo.
# Camada de enforcement real — o `deny` de settings.json e prefix-match e
# contornavel. Este hook e regex.
set -uo pipefail

INPUT=$(cat 2>/dev/null || true)
CMD=$(printf '%s' "$INPUT" | tr '\n' ' ')

block() {
  echo "BLOQUEADO por secret-guard: $1" >&2
  echo "Quality Gates Gate 3 — segredo nunca sai do cofre. Use .env.example." >&2
  exit 2
}

# leitura/vazamento de .env por qualquer ferramenta de texto
if printf '%s' "$CMD" | grep -Eq '(cat|bat|less|more|head|tail|grep|rg|sed|awk|xxd|base64|strings)[^|;]*\.env'; then
  block "leitura de .env"
fi

# interpretadores lendo env
if printf '%s' "$CMD" | grep -Eq '(node|python[0-9.]*|ruby|perl|deno|bun)[[:space:]]+-(e|c)\b.*(process\.env|os\.environ|ENV\[)'; then
  block "leitura de variaveis de ambiente via interpretador"
fi

# dump de ambiente
if printf '%s' "$CMD" | grep -Eq '\b(printenv|env)\b[[:space:]]*(\||>|$)'; then
  block "dump de ambiente"
fi

# echo de chave/token/segredo
if printf '%s' "$CMD" | grep -Eiq 'echo[[:space:]]+.*\$[A-Z_]*(KEY|TOKEN|SECRET|PASSWORD|DSN|SERVICE_ROLE)'; then
  block "echo de credencial"
fi

# envio de env para rede
if printf '%s' "$CMD" | grep -Eq '(curl|wget|http|nc)\b.*(\$[A-Z_]*(KEY|TOKEN|SECRET)|\.env)'; then
  block "envio de credencial pela rede"
fi

# commit de .env
if printf '%s' "$CMD" | grep -Eq 'git[[:space:]]+add\b.*\.env'; then
  block "git add de .env"
fi

# service_role fora de job — o risco numero 1 do ADR-004
if printf '%s' "$CMD" | grep -Eq 'SUPABASE_SERVICE_ROLE_KEY'; then
  block "manipulacao da service_role key (ADR-004: nunca em codigo de request)"
fi

exit 0
