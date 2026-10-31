#!/bin/bash
# PreToolUse hook for Bash. Blocks dangerous shared operations. Exit 2 blocks the call.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

[ -z "$COMMAND" ] && exit 0

block() {
  echo "BLOCKED: $1" >&2
  exit 2
}

if echo "$COMMAND" | grep -qiE '(^|[;&|[:space:]])rm[[:space:]]+.*-(r[^[:space:]]*f|f[^[:space:]]*r)'; then
  block "rm recursive force is not allowed"
fi

if echo "$COMMAND" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+push[[:space:]].*(--force|-f)([[:space:]]|$)'; then
  block "git force push is not allowed"
fi

if echo "$COMMAND" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+push[[:space:]]+[^;&|]*[[:space:]](HEAD:)?main([[:space:]]|$)'; then
  block "push to main is not allowed - use a feature branch and a PR"
fi

if echo "$COMMAND" | grep -qiE '(^|[;&|[:space:]])git[[:space:]]+reset[[:space:]]+--hard([[:space:]]|$)'; then
  block "git reset --hard is not allowed"
fi

if echo "$COMMAND" | grep -qiE '(^|[;&|[:space:]])gh[[:space:]]+pr[[:space:]]+merge'; then
  block "merging PRs is a manual step"
fi

PROTECTED_PATH='(\.env([^.[:space:]]|$|\.local|\.production)|\.git/|credentials|secrets/|[^[:space:]]+\.(key|pem))'
MUTATING_SHELL='(^|[;&|[:space:]])(tee|sed[[:space:]][^;&|]*-i|perl[[:space:]][^;&|]*-pi|truncate|cp|mv)[[:space:]]|[>]{1,2}[[:space:]]*'

if echo "$COMMAND" | grep -qiE "$PROTECTED_PATH" && echo "$COMMAND" | grep -qiE "$MUTATING_SHELL"; then
  block "shell edits to protected files require manual review"
fi

exit 0
