# Git Workflow — Depthly

## Golden rules (personal — override defaults)
- **Never `git commit` unless explicitly asked in the current turn.** "go ahead", "fix this", "продолжай" authorize the *edit only*, never the commit. Permission doesn't carry across turns.
- Default end-state after edits: working tree dirty, no commit. Summarize and stop.
- Don't push unless asked.
- **English only** for commits, PRs, code comments, identifiers — even when chatting in Russian.
- **Never** add `Co-Authored-By: Claude …` or `🤖 Generated with Claude Code` to commits or PRs.

## Commit messages
- Conventional Commits with scope: `feat(server): …`, `fix(server): …`, `docs(server): …`, `chore: …`.
- Types: feat, fix, refactor, docs, test, chore, perf, ci.
- Short and clear. No per-file changelogs in the body.

## Branches
Current convention: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/` (e.g. `feat/uniswap-v4-subgraph`). Main branch: `main`. Use `gh` for GitHub ops.

## PRs
- Description: human-readable — what and why. No file stats, no AI footer.
- **PR comments are unique.** Before posting, fetch existing comments on **both** endpoints and skip anything already raised (including by `claude[bot]`):
  - `gh api repos/{owner}/{repo}/pulls/{n}/comments`
  - `gh api repos/{owner}/{repo}/issues/{n}/comments`

## Committed by mistake
Not pushed → offer `git reset --soft HEAD~N`. Pushed to a feature branch → same plus `git push --force-with-lease` after OK. Never to a shared/protected branch.
