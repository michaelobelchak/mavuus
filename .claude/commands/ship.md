---
description: Verify, commit, push, and open a PR to main, with an approval gate at each step.
disable-model-invocation: true
---

Approval gates are required:

1. Show the branch and a working tree summary. If on `main`, stop and propose a branch name (`feat/`, `fix/`, `chore/`, `docs/`).
2. Run `/verify`. Stop on failure.
3. Check that `CHANGELOG.md` has an entry for this work and that any plan in `mavuus-app/plans/` it finishes is marked done. Propose the edits if not.
4. Show changed files and a proposed conventional commit message: `<type>(<optional-scope>): <summary>` with type one of feat, fix, docs, style, refactor, perf, test, chore, build, ci, revert.
5. Ask before staging. Stage files by name, never `git add -A`.
6. Ask before committing.
7. Ask before pushing (`git push -u origin <branch>`).
8. Ask before opening a PR to `main` with `gh pr create`, using `.github/pull_request_template.md`.

Never merge the PR, bypass hooks, force push, or commit to `main`.
