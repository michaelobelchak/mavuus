#!/bin/bash
# PreToolUse hook for Bash. Blocks dangerous shared operations. Exit 2 blocks the call.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

[ -z "$COMMAND" ] && exit 0

# Heredoc bodies are data (docs, PR bodies), not commands. The line that opens the heredoc stays.
NO_HEREDOC=$(printf '%s' "$COMMAND" | perl -0pe 's/(<<-?[ \t]*([\x27"]?)(\w+)\2)([^\n]*)\n.*?\n[ \t]*\3[ \t]*(?=\n|$)/$1$4/gs')
# For command-word checks, also drop quoted strings so messages can mention anything.
BARE=$(printf '%s' "$NO_HEREDOC" | perl -0pe's/\x27[^\x27]*\x27//g; s/"(\\.|[^"\\])*"//g')

block() {
  echo "BLOCKED: $1" >&2
  exit 2
}

if echo "$BARE" | grep -qiE '(^|[;&|[:space:]])rm[[:space:]]+.*-(r[^[:space:]]*f|f[^[:space:]]*r)'; then
  block "rm recursive force is not allowed"
fi

if echo "$BARE" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+push[[:space:]].*(--force|-f)([[:space:]]|$)'; then
  block "git force push is not allowed"
fi

if echo "$BARE" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+push[[:space:]]+[^;&|]*[[:space:]](HEAD:)?main([[:space:]]|$)'; then
  block "push to main is not allowed - use a feature branch and a PR"
fi

if echo "$BARE" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+reset[[:space:]]+--hard([[:space:]]|$)'; then
  block "git reset --hard is not allowed"
fi

if echo "$BARE" | grep -qiE '(^|[;&|[:space:]])gh[[:space:]]+pr[[:space:]]+merge'; then
  block "merging PRs is a manual step"
fi

PROTECTED_PATH='(\.env(\.(local|production|development|test))?([^.[:alnum:]_]|$)|\.git/|credentials|secrets/|[^[:space:]]+\.(key|pem))'
MUTATING_SHELL='(^|[;&|[:space:]])(tee|sed[[:space:]][^;&|]*-i|perl[[:space:]][^;&|]*-pi|truncate|cp|mv)[[:space:]]|[>]{1,2}[[:space:]]*'

# Writes into a quoted protected path, e.g. echo x > "server/.env".
QUOTED_TARGET="([>]{1,2}|(tee|cp|mv|truncate)[[:space:]][^;&|]*|sed[[:space:]][^;&|]*-i[^;&|]*|perl[[:space:]][^;&|]*-pi[^;&|]*)[[:space:]]*[\"'][^\"']*$PROTECTED_PATH"

if { echo "$BARE" | grep -qiE "$PROTECTED_PATH" && echo "$BARE" | grep -qiE "$MUTATING_SHELL"; } \
  || echo "$NO_HEREDOC" | grep -qiE "$QUOTED_TARGET"; then
  block "shell edits to protected files require manual review"
fi

exit 0
