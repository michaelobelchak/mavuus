#!/bin/bash
# PreToolUse hook for Edit/Write/MultiEdit. Exit 2 blocks the call.
# Protected: .env files (except .env.example), SQLite DB files, .git internals, keys and credentials.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null || echo "")

[ -z "$FILE_PATH" ] && exit 0

if echo "$FILE_PATH" | grep -qiE '\.env\.example$'; then
  exit 0
fi

PROTECTED=(
  "\.env"
  "\.db(-shm|-wal)?$"
  "\.git/"
  "credentials"
  "secrets/"
  "\.key$"
  "\.pem$"
  "service-account.*\.json$"
)

for pattern in "${PROTECTED[@]}"; do
  if echo "$FILE_PATH" | grep -qiE "$pattern"; then
    echo "BLOCKED: $FILE_PATH matches protected pattern '$pattern'" >&2
    echo "Edit it manually outside Claude Code. Reset the DB with: cd mavuus-app/server && rm -f db/mavuus.db && node db/seed.js" >&2
    exit 2
  fi
done

exit 0
