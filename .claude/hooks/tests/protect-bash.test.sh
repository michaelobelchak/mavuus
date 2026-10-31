#!/bin/bash
# Run: bash .claude/hooks/tests/protect-bash.test.sh
HOOK="$(cd "$(dirname "$0")/.." && pwd)/protect-bash.sh"
FAILS=0

t() {
  jq -n --arg c "$2" '{tool_input:{command:$c}}' | "$HOOK" >/dev/null 2>&1
  local got=$?
  if [ "$got" = "$3" ]; then echo "PASS  $1"; else echo "FAIL  $1 (got $got, want $3)"; FAILS=$((FAILS + 1)); fi
}

t "force push" 'git push --force origin x' 2
t "push main" 'git push origin main' 2
t "push branch" 'git push -u origin feat/x' 0
t "rm -rf" 'rm -rf node_modules' 2
t "rm -rf quoted arg" 'rm -rf "$DIR"' 2
t "db reset" 'rm -f db/mavuus.db && node db/seed.js' 0
t "gh merge" 'gh pr merge 3' 2
t "reset hard" 'git reset --hard HEAD~1' 2
t "write .env" 'echo SECRET=1 > .env' 2
t "write quoted .env" 'echo SECRET=1 > "mavuus-app/server/.env"' 2
t "heredoc into .env" $'cat > .env <<EOF\nA=1\nEOF' 2
t "sed -i .env" "sed -i '' 's/a/b/' server/.env" 2
t "PR body mentions rm -rf" $'gh pr create --title x --body "$(cat <<\'EOF\'\nblocks rm -rf and .env edits\nEOF\n)"' 0
t "doc heredoc mentions .env" $'cat > docs/x.md <<\'EOF\'\nNo `.env` files committed\nEOF' 0
t "commit msg mentions force push" 'git commit -m "docs: never git push --force or rm -rf"' 0
t "multi-line commit msg mentions rm -rf" $'git commit -m "fix: hook\n\nblocked rm -rf text\n" && git push' 0
t "rm -rf after multi-line msg" $'git commit -m "a\nb" && rm -rf build' 2
t "attributed commit msg mentions .env" $'git commit -m "fix: .env check\n\nCo-Authored-By: Claude <noreply@anthropic.com>"' 0
t "cp into quoted .env" 'cp x.txt "server/.env"' 2
t "read env example" 'cat .env.example' 0

echo "$FAILS failed"
exit $FAILS
