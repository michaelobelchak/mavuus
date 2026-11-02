---
description: Print git state, recent commits, active plans, and the latest changelog entry.
---

Print:

1. Current branch: `git branch --show-current`
2. Recent commits: `git log --oneline -8`
3. Working tree: `git status --short`
4. Open PRs when available: `gh pr list --author @me --state open`
5. Plans: `ls mavuus-app/plans/*.md` (flag the ones marked TODO or IN PROGRESS)
6. Latest changelog entry: the last section of `CHANGELOG.md`

End with a short summary: branch, uncommitted work, and the likely next pickup point.
