#!/bin/bash
# PostToolUse hook. Lints edited client .js/.jsx files and reports problems without blocking.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

case "$FILE_PATH" in
  */mavuus-app/client/src/*.js|*/mavuus-app/client/src/*.jsx) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR/mavuus-app/client" || exit 0
OUTPUT=$(npx eslint "$FILE_PATH" 2>&1)
if [ $? -ne 0 ]; then
  echo "ESLint problems in $FILE_PATH (fix any you introduced):" >&2
  echo "$OUTPUT" | head -30 >&2
fi
exit 0
