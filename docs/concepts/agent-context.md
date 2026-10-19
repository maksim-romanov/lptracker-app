# Agent context

How we keep coding agents' context small and their token use low ([ADR 0024](../decisions/0024-agent-setup-and-ai-policy.md), [ADR 0047](../decisions/0047-agent-tools-and-mcp.md)). Sources and measurements: [official](../research/claude-code/token-efficiency-official.md), [practice](../research/claude-code/token-efficiency-practice.md).

## What every request carries

Each request re-sends the whole history. The prompt cache makes the repeated part cheap until something changes it.

| Always loaded | Cost driver | Our limit |
|---|---|---|
| Root `AGENTS.md` via `CLAUDE.md`, again in every subagent | every line × every agent | ≤ 100 lines |
| Nested `AGENTS.md` | loaded when the agent works in that folder | ≤ 40 lines |
| Skill descriptions | every enabled skill, body only when used | lead with the use case |
| MCP tool names and server instructions | every enabled server, even with tool search | CLIs first, idle servers off |
| Hook output | every hook run | silent on success |
| Tool results | everything read or printed stays in history | see below |

## Where knowledge lives

- A rule every task needs goes in `AGENTS.md`, with its check.
- A procedure goes in a skill (`.agents/skills/`), loaded on demand.
- Details go in `docs/`, linked from `AGENTS.md`; agents read them when the task needs them.

## Tools

- CLIs over MCP servers: `gh`, `playwright-cli`, `psql`, `bun`. A CLI adds nothing to context until it runs.
- LSP over grep-and-read loops for definitions and references, where the language server works.
- Search with Grep or Glob, then Read with `offset` and `limit`. Never read a whole large file to find one symbol.
- `Read` is denied for lockfiles and build output (`.turbo/`, `DerivedData/`, `build/`) in `.claude/settings.json`. `openapi.json` and `Generated/` stay readable: they hold the client signatures.
- Keep MCP tool search on; never set `ENABLE_TOOL_SEARCH=false`.

## Command output

- Agents run `bun run check --affected`, not the full graph.
- With `CLAUDECODE=1` or `AGENT=1`, `check` prints only failures and the path of a gitignored file with the full log; the agent reads that file in ranges. A Bash result reaches the agent only as a head-and-tail excerpt of about 10,000 characters, so a noisy log hides the error.
- Lint warnings fail the build, so quiet output never hides them.
- Hooks print nothing on success and only the failure otherwise; output over 10,000 characters is replaced by a file path.

## Subagents

- Worth it for exploration, doc fetching, research and log reading: the main context gets a summary of 1,000–2,000 tokens instead of the raw reads.
- Not worth it for edit-test loops: a subagent starts cold and re-reads what the main session already knows.
- Each subagent pins its model and effort in frontmatter: `researcher` and `docs-reviewer` on Sonnet, the three reviewers on Opus.
- Fan-out costs about 15× a single chat. Keep it to a handful of agents with narrow prompts that return a path and a few lines.
- A fresh subagent with a precise prompt is cheaper than a fork, which inherits the whole conversation.

## Sessions

- `/clear` between unrelated tasks; after two failed corrections, `/clear` and re-prompt with what you learned.
- Drop a dead end with `/rewind`; `/compact` is itself a large request.
- Pick model and effort at session start. Switching them, or toggling MCP servers or plugins mid-task, re-sends the history uncached.
- An approved spec or PR plan is the handoff note; implement in a fresh session.
- Watch `/context`, `/usage` and a status line with context use.

## CI

- Agent jobs run `claude -p --strict-mcp-config --max-turns <n> --max-budget-usd <usd>`; values are set with the job.
- Never `--bare`: it skips `CLAUDE.md`, so `AGENTS.md` never loads.

## Not used

Output-compressing proxies and command-rewriting hooks (they drop information and can break cache markers), terse "caveman" output styles (lower quality, against [writing-docs](../writing-docs.md)), Haiku for review agents, wide fan-out and agent teams.
