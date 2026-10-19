# 0024 · Agent setup and AI contribution policy

- Status: proposed
- Deciders: Maksim Romanov

## Context

Maintainers and contributors will build most of VoidX with coding agents (Claude Code, Codex, Cursor, Copilot). Instructions must work across tools, and AI-generated PRs must be verifiable without extra reviewer effort.

## Options

- **Tool-specific instruction files**.
- **One vendor-neutral source plus mechanical enforcement and a written AI policy**.

## Decision

Chosen **one source plus enforcement**:

- `AGENTS.md` is the single instruction source. Size limits: [writing docs](../writing-docs.md#size-limits). `CLAUDE.md` imports it with `@AGENTS.md`.
- Every hard rule names the check that enforces it; a rule without one is labelled *convention*.
- Skills live in `.agents/skills/`, each linked individually as `.claude/skills/<name>` → `../../.agents/skills/<name>`; `bun run lint:docs` fails on a missing link. A skill only for Claude Code is a plain directory in `.claude/skills/` ([setup notes](../research/claude-code/setup-notes.md)).
- Permission deny rules in `.claude/settings.json` block edits to generated files and lockfiles and block `git push`; a `PostToolUse` hook formats each edited file (*planned* for M0).
- Cloud agents (Claude Code SessionStart hook, `copilot-setup-steps.yml`, Codex environment) are *planned*; they get their own research first.
- Each subagent pins `model` (and `effort` where review depth matters) in its frontmatter, so env vars cannot downgrade review gates. Committed settings carry no token settings (`model`, `effortLevel`, cache or compaction values); those are personal.
- Agent jobs in CI run `claude -p --strict-mcp-config --max-turns <n> --max-budget-usd <usd>`, never `--bare` (it skips `AGENTS.md`).
- MCP servers and agent tools: [0047](0047-agent-tools-and-mcp.md); token practices: [agent context](../concepts/agent-context.md).
- Issue forms (task, new-integration) produce agent-ready specs; label `agent-ready`.

`AI_POLICY.md`:

- AI use is welcome and disclosed with an `Assisted-by:` trailer.
- The human contributor understands every line and answers reviewers personally.
- No autonomous PRs or comments.
- PRs labelled `slop` get a maintainer comment and 7 days to fix; then they close and may be reopened ([AI_POLICY.md](../../AI_POLICY.md)).
- AI review runs only after deterministic checks pass, and only for trusted authors.

## Consequences

- Any agent reads the same rules.
- Related: [0009](0009-record-replay-verification.md), [0025](0025-research-gate.md), [0047](0047-agent-tools-and-mcp.md), [writing docs](../writing-docs.md).
