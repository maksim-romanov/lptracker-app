---
app: agent-tools
topic: Real-time dashboard for parallel local agents (owner-local)
checked: 2026-10-19
---

# Agent dashboard

Scope: owner-local, one Mac, Claude Code v2.1.29x-era docs. Extends [multi-agent-orchestration](multi-agent-orchestration.md) (which already decides `tasks.json`, `progress/<agent>.md`, `$VOIDX_STATE`, a generated `dashboard.html`) and [autonomy-loops](autonomy-loops.md). Binds no contributor. Claims marked (unverified) were not confirmed in a primary source.

## Decisions

Source of truth and pipeline
- We keep `tasks.json` plus an append-only `events.jsonl` in `$VOIDX_STATE` as the source of truth, and treat every view (HTML, terminal, phone, Artifact) as disposable and regenerated from them, because views then cannot lose state and the 15 s agent-view summaries do not matter. [3][4]
- We capture events with command hooks configured `async: true` in the local `--settings`/plugin, each appending one line (`ts`, `session_id`, `agent_id`, `agent_type`, `cwd`, `hook_event_name`, `tool_use_id`) via `>>` to `events.jsonl`, because async hooks do not block Claude and every event carries these ids, so agents spend zero tokens on reporting. Events: `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PostToolUse`, `PostToolUseFailure`, `SubagentStart`, `SubagentStop`, `TaskCompleted`, `Notification`, `Stop`, `StopFailure`, `WorktreeCreate`. We drop `PreToolUse` from the log (the ownership hook there stays synchronous) and truncate tool input to the tool name and file path. [1][2]
- We read cost and tokens from the status line `command`, not from hooks: it receives `session_id`, `cost.total_cost_usd`, context use, `worktree.*` and `rate_limits.five_hour/seven_day` as JSON, and `refreshInterval` (min 1 s) keeps it firing while the session idles. The script writes `$VOIDX_STATE/usage/<session_id>.json`. In `-p` runs the final `result` object of `--output-format stream-json` carries the same totals (field names (unverified) in this pass). [5][6]
- We do not enable OpenTelemetry for the live page. OTel is an option for later history: `CLAUDE_CODE_ENABLE_TELEMETRY=1`, `OTEL_METRICS_EXPORTER`, metrics `session.count`, `cost.usage`, `token.usage`, `commit.count`, `lines_of_code.count`, `active_time.total`, events `tool_result`, `api_request`, `tool_decision`; export defaults to 60 s metrics / 5 s logs, so it is slower than hooks. Content stays off (`OTEL_LOG_USER_PROMPTS`, `OTEL_LOG_TOOL_DETAILS`, `OTEL_LOG_RAW_API_BODIES` unset; all default off). [7]
- We take commit and check status from git and our scripts, not from the model: a 5 s poller runs `git log -n3 --format=...` and `git status -sb` per worktree under `.claude/worktrees/` and reads the last `bun run check` exit code written by the Stop-hook verifier. The `commit` field in `tasks.json` is set by `voidx-task`. [3][8]
- We detect staleness with a heartbeat computed from the newest event or usage write per `session_id`: no event for 5 min while state is `working` shows "stale"; 30 min matches the existing reaper (claim returned to `todo`). Pid liveness comes from the claim file. [3]

What agents write vs what hooks capture
- Agents write only two things, through `voidx-task`: `status`/`note` transitions (`doing`, `blocked: <question>`, `done`) and one progress line per finished step in `progress/<agent>.md`. Everything else on the page (role, session, cwd, branch, tool counts, last tool, subagent starts/stops, files touched, commits, cost, tokens, check result, idle time) is derived without the model. [3][2]
- We derive "current step" from `tasks.json` (`doing` task and its `acceptance` list ticked by the wrapper) and show step progress as ticked criteria over total; iteration number comes from the launcher, which writes `iteration` into the task. Hooks show liveness and last tool, never plan content. [3]
- We feed "needs owner" from three sources: `tasks.json` `blocked`, the `Notification` hook (permission prompts, idle waits), and `claude agents --json --all` `waitingFor` when the worker is `--bg`. One queue, sorted oldest first, at the top of the page. [2][9]

Tool choice
- We build a small owner-local viewer (one Bun script, `~/.claude/voidx-loop/dashboard/`, not in the repo): tails `events.jsonl`, re-reads `tasks.json`, serves one HTML page and a Server-Sent Events stream on `127.0.0.1`, because SSE is one-way push, needs no dependency and the static-file generator from the orchestration note becomes its fallback. It replaces nothing else. (Our design.)
- We do not adopt any surveyed dashboard. The nearest, disler/claude-code-hooks-multi-agent-observability (local: Bun + SQLite + Vue, ports 4000/5173, hooks over HTTP/WebSocket, event timeline with 12 hook event types, 1.5k stars), shows an event firehose, not tasks, done/next, blockers or checks, shows no licence on its page, and its Python hooks run per event. We copy its idea (hooks → local server → live timeline), not its code, which also fits [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md) on third-party code. [10]
- We use `ccusage` (MIT, local JSONL reader) only as an offline cross-check on spend, not in the pipeline. [11]
- We skip Langfuse, Phoenix and OpenLIT: each needs a container stack (Langfuse: ClickHouse via Docker Compose, `ee` folders under another licence; OpenLIT: ClickHouse, ports 4317/4318, Apache-2.0; Phoenix: Elastic License 2.0, default web analytics unless `PHOENIX_TELEMETRY_ENABLED=false`), they model LLM traces rather than task progress, and a Docker stack for one owner exceeds the need. Grafana/Prometheus/Loki Docker stacks for Claude Code OTel exist (community, activity not checked) and give cost charts only. [12][13][14][7]
- We skip Claude Squad (AGPL-3.0, tmux TUI, 8.6k stars) and Vibe Kanban (Apache-2.0, README says "sunsetting"): both launch and own the sessions, which collides with our launcher and claims. [15][16]

What the page shows
- We make one page with four zones, in this order: (1) Needs owner queue (blocker text, age, copy-paste resume command `claude attach <id>`); (2) one card per agent: role, task id and title, state (working, blocked, stale, done, failed), step bar (criteria ticked / total), iteration n/N, last tool and age, done / doing / next lists from `tasks.json`, last 3 commits (hash, subject, age), check badge (pass/fail + log path), cost and tokens this task; (3) a task DAG from `depends_on` (small, columns by workspace), because ownership and dependency order is the real constraint here; (4) a collapsible event log (newest first) filtered by agent. Totals bar: spend today against the daily cap, five-hour and seven-day `rate_limits` percentages. [3][5]
- We choose cards plus DAG over a kanban board or swimlane timeline: only 3-5 workers run, so the useful questions are "who is stuck" and "what unblocks what". Kanban states already exist as the card state; a timeline is the event log. This follows what Claude Code agent view does (rows grouped Needs input, Ready for review, Working, Completed, secondary sources) with added task content. [9][17]

Artifact and phone
- We do not make a claude.ai Artifact the live view. Official help: artifact storage is text-only, 20 MB per artifact, personal or shared, works only after publishing, and unpublishing deletes the data; the `window.storage` API is not in public docs (unverified third-party). Nothing found says a local Claude Code session can write into an artifact's database, or that it offers `onSnapshot` subscriptions; the owner's described model (db written via a tool, live snapshots) is unverified. [18][19]
- We allow an Artifact only as an optional, manually refreshed redacted snapshot: `voidx-dashboard export` prints a JSON with roles, task titles, states, step counts and cost, with no paths, commit subjects, addresses, ABIs or log text, which the owner pastes into the Artifact conversation. The data goes to Anthropic, so the owner rule (watched wallet addresses never reach third-party tools) is met by the redaction, not by trust. (Our design.)
- We reach the local page from a phone through Claude Code's own channel first: Remote Control (`claude remote-control`, `--rc`) controls a session from claude.ai or the Claude app, so the owner can read and answer a blocked agent from a phone without exposing a port. For the dashboard itself we bind `127.0.0.1` and, if wanted, publish through the owner's private network (e.g. Tailscale, not researched); never a public tunnel. [20]

## Facts that constrain us

- Hooks (33 events in the docs read): input has `session_id`, `transcript_path`, `cwd`, `hook_event_name`, `prompt_id`, `permission_mode`; `agent_id`/`agent_type` when in a subagent; `SubagentStop` adds `last_assistant_message`. `type: "http"` hooks POST the same JSON to a URL, non-2xx is non-blocking. `async: true` is for command hooks only and ignores `timeout`. `transcript_path` is written asynchronously and may lag. [2]
- `--include-hook-events` adds hook lifecycle to the stream-json output; `SessionStart`/`Setup` always appear; `Notification` and `SessionEnd` never produce `hook_started`. `--forward-subagent-text` (v2.1.211+) streams subagent messages with `parent_tool_use_id`. [6]
- Status line: JSON on stdin, 300 ms debounce, in-flight script cancelled by a new update, optional `refreshInterval`; cost is a client-side estimate at list price, not the bill; `rate_limits` fields exist for subscription plans. [5]
- OTel: off unless enabled; `session.id` on all metrics by default; `prompt.id`, `tool_use_id`, `event.sequence` (resets per process) for correlation; `OTEL_METRICS_INCLUDE_SESSION_ID` default true. [7]
- `claude agents --json [--all]` prints sessions for scripting; `claude --bg` cannot combine with `-p`; `claude logs`, `claude attach`, `claude stop` manage background sessions; agent view requires v2.1.139+ (research preview, May 2026). [6][9]
- Artifacts: Pro/Max/Team/Enterprise on web and desktop; artifacts created from 2026-08-19 are saved to the account and shareable in an organization (Cowork article, secondary reading of the help center). [18][19]

## Open questions

- Whether `claude -p --worktree` workers appear in `claude agents --json` (carried from the orchestration note). If not, the page relies on `events.jsonl` alone.
- Exact stream-json `result` field names for cost and tokens; read the Agent SDK cost-tracking page before building.
- Whether hooks from `--settings` fire inside subagents and for `-p` workers with the async option; test in M0.
- Whether any supported way exists for a local session to write an Artifact's shared storage or for an Artifact to subscribe to live changes. Ask the owner for the source of the `onSnapshot` description.
- Whether the Artifact sandbox may call a user's local or tailnet URL (CSP); not found in docs.
- Licences and last-commit dates of disler's repo, Claude Squad releases and the community Grafana stacks were not shown on the pages read; re-check before any adoption.
- Cursor, OpenAI Codex and GitHub Copilot background-agent status UIs were not read first-hand; the layout above rests on Claude Code agent view only.

## Sources

1. Claude Code hooks reference (async, http hooks) — https://code.claude.com/docs/en/hooks
2. Hooks reference, common input fields and SubagentStop — https://code.claude.com/docs/en/hooks
3. Multi-agent orchestration (this repo) — [multi-agent-orchestration.md](multi-agent-orchestration.md)
4. Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
5. Customize your status line — https://code.claude.com/docs/en/statusline
6. CLI reference — https://code.claude.com/docs/en/cli-reference
7. Monitoring usage (OpenTelemetry) — https://code.claude.com/docs/en/monitoring-usage
8. Worktrees — https://code.claude.com/docs/en/worktrees
9. Agent view — https://code.claude.com/docs/en/agent-view
10. disler/claude-code-hooks-multi-agent-observability — https://github.com/disler/claude-code-hooks-multi-agent-observability
11. ryoppippi/ccusage (MIT) — https://github.com/ryoppippi/ccusage
12. Langfuse — https://github.com/langfuse/langfuse
13. Arize Phoenix — https://github.com/Arize-ai/phoenix
14. OpenLIT — https://github.com/openlit/openlit
15. Claude Squad — https://github.com/smtg-ai/claude-squad
16. Vibe Kanban — https://github.com/BloopAI/vibe-kanban
17. Claude Code Agent View overview (secondary, 2026-05) — https://rits.shanghai.nyu.edu/ai/anthropic-ships-agent-view-a-multi-session-dashboard-for-claude-code/
18. What are artifacts and how do I use them (help center) — https://support.claude.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them
19. Use artifacts in Claude Cowork — https://support.claude.com/en/articles/14729249-use-artifacts-in-claude-cowork
20. Remote Control — https://code.claude.com/docs/en/remote-control
