---
app: repo
topic: Token efficiency in Claude Code — official guidance
checked: 2026-10-01
---

# Token efficiency in Claude Code — official guidance

Facts apply to Claude Code docs as of v2.1.285 (Opus 5.5, Sonnet 5.5) unless a version is named.

## Decisions
- We pin `model` in every subagent's frontmatter: `researcher` and `docs-reviewer` → `sonnet`; `architecture-guard`, `protocol-reviewer`, `security-reviewer` → `opus`. An omitted `model` falls through to the main conversation's model, and `default` resolves to Opus 5.5 on every paid plan and the API. Frontmatter also outranks `CLAUDE_CODE_SUBAGENT_MODEL`, so contributors' env vars can't downgrade the review gates. The docs recommend Sonnet for most work and Opus for multi-step reasoning. [1][4][5]
- We set `effort: high` on `protocol-reviewer` and `security-reviewer` and leave the other agents to inherit, because Opus 5.5 and Sonnet 5.5 default to `medium` and these two agents are correctness gates. [4][5]
- We keep ADR 0024's limits (root `AGENTS.md` ≤ 100 lines, nested ≤ 40). The official target is "under 200 lines per CLAUDE.md file". An `@AGENTS.md` import costs as much as inlining the file, and every non-fork subagent loads the full CLAUDE.md hierarchy again. [2][4]
- We put multi-step procedures in skills, not in `AGENTS.md`, because a skill costs only its description until it is used. Each description puts its key use case first; the listing truncates `description` + `when_to_use` at 1,536 chars. A skill with side effects sets `disable-model-invocation: true`, which keeps it out of context entirely. [1][6][7]
- We put no token settings in committed `.claude/settings.json`: no `model`, `effortLevel`, `promptCacheTtl`, `autoCompactWindow` or token `env` vars. They would apply to every contributor whatever their plan or auth. For example, a 1h TTL bills cache writes at a higher rate on an API key, and `workflowSizeGuideline` already defaults to `small` on Pro. These belong in user settings. Model and effort choices that matter for the project live in agent frontmatter, which is committed. [3][5][15]
- We keep the committed deny rules scoped (`Bash(git push *)`, `Edit(...)`, `Read(...)`). Scoped rules never change the tool list, so they never break the prompt cache. Only a bare tool name, `Bash(*)` or a tool-name glob can, and only when tool search is off. [3]
- We prefer CLIs (`gh`, `git`, `bun`) over MCP servers for the same job, because CLIs add no per-tool listing. This also follows ADR 0047's "no `.mcp.json` in M0". With tool search on (the default), an MCP server costs its tool names plus its server instructions until a tool is used. [1][7][9]
- We keep LSP plugins (`typescript-lsp`, `swift-lsp`) enabled in `settings.local.json` and every other plugin disabled per project. A symbol lookup replaces grep-and-read cycles, while each enabled plugin's skills add descriptions to every request. ADR 0047 already puts LSP in local or user scope. [1][7]
- Agent jobs in CI run `claude -p --strict-mcp-config --max-turns <n> --max-budget-usd <usd> --output-format json`, never `--bare`. `--max-turns` has no default limit. `--max-budget-usd` counts subagent spend. `--bare` skips CLAUDE.md, so `AGENTS.md` would never load. [10]
- Hooks we add in M0 (format, test, cloud SessionStart) print nothing on success and only failures otherwise, because hook output lands in context and anything over 10,000 chars is saved to a file and replaced by its path. To shrink verbose test output, filter it in a PreToolUse hook (`updatedInput`) or rewrite the result in a PostToolUse hook (`updatedToolOutput`). [1][7][12]
- `research-app` fan-out stays at a handful of `researcher` subagents that write files and return only path + Decisions. Every subagent result returns to the main context. Anthropic measured multi-agent systems at about 15× chat tokens and recommends condensed returns of 1,000–2,000 tokens. Subagents beat dynamic workflows here; workflows target "dozens to hundreds of agents". [4][15][16][17]
- Contributor guidance (CONTRIBUTING, *planned*) names the session-level levers: `/clear` between unrelated tasks (costs nothing), `/rewind` instead of `/compact` to abandon a path, choose model and effort at session start, `/usage` to check, `/context` to inspect what's loaded. [1][3][8]

## Facts that constrain us
- **Cost baseline:** enterprise average ≈ $13 per developer per active day; under $30 for 90% of users. Background usage is typically < $0.04 per session. Agent teams use ≈ 7× the tokens of a standard session in plan mode and are off unless `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. [1]
- **Usage commands:** `/usage` shows session cost (estimated at list price) and, from v2.1.251, a `Prompt cache (main)` line (main conversation only, not subagents). Totals reset on `/clear` from v2.1.211. On subscriptions it shows a 24h/7d breakdown by skill, subagent, plugin and MCP server. `/insights` reports how you work; it spends tokens too. [1]
- **Cache order:** system prompt + tool definitions → project context (CLAUDE.md, auto memory, unscoped rules) → conversation. The prefix must match exactly; a change re-processes everything after it. [3]
- **What breaks the cache:**
  - switching model, including `opusplan` plan-mode toggles and a skill or command whose frontmatter sets `model`;
  - changing effort, except on Opus 5.5, Sonnet 5.5 and Fable 5.1 with an API key or subscription;
  - turning on fast mode;
  - adding or removing an MCP server, or denying a whole tool, only when tool search is off;
  - enabling or disabling a plugin that ships MCP servers;
  - `/compact`;
  - accumulated images;
  - a Claude Code upgrade. [3]
- **What keeps the cache:** editing repo files; editing CLAUDE.md mid-session (the edit applies only after `/clear`, `/compact` or a restart); permission-mode changes; output-style switches (v2.1.251+); invoking skills; `/recap`; `/rewind`; spawning a subagent. A fork reuses the parent's cache; a fresh subagent builds its own. [3][4]
- **TTL:** main conversation gets 1h on a subscription within plan usage and 5m on usage credits, API keys or cloud providers. Subagents, workflows, compaction and teammates get 5m. Override with `promptCacheTtl` / `CLAUDE_CODE_PROMPT_CACHE_TTL` and `subagentPromptCacheTtl` / `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` (`5m`|`1h`, v2.1.242+). `FORCE_PROMPT_CACHING_5M=1` wins over all of them. Cache scope is per machine and directory. [3]
- **Memory loading:** ancestor CLAUDE.md files load at launch; subdirectory CLAUDE.md files load when Claude reads a file there. Imports recurse up to 4 hops. Block-level HTML comments are stripped before injection. A file > 4 MiB is skipped. Auto memory loads the first 200 lines or 25 KB of `MEMORY.md` and is not loaded into subagents. `/doctor` proposes trims (v2.1.206+). `/doctor prompt-audit` finds stale or conflicting instructions (v2.1.283+). [2]
- **After compaction:** the root CLAUDE.md, unscoped rules and auto memory are re-injected from disk. Nested CLAUDE.md files and `paths:` rules come back only when a matching file is read again. Invoked skills are re-attached at ≤ 5,000 tokens each and ≤ 25,000 tokens in total, oldest dropped first. The skill listing is not re-injected. Up to 5 recent files are re-read; files > 5,000 tokens come back as paths only. [6][8]
- **Auto-compact:** native-1M models compact at ≈ 967K tokens by default. Set the window with `autoCompactWindow`, `/autocompact`, `--autocompact` or `CLAUDE_CODE_AUTO_COMPACT_WINDOW` (100K–1M; the env var takes digits only). `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` can only lower the threshold. `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` caps the window at 200K. Custom focus: `/compact <focus>`, or a `# Compact instructions` section in CLAUDE.md. [1][5][11]
- **Skills:** the listing budget is 1% of the context window (`skillListingBudgetFraction`, `SLASH_COMMAND_TOOL_CHAR_BUDGET`). The per-entry cap is `skillListingMaxDescChars` (1,536). Use `skillOverrides` set to `"name-only"` to hide descriptions of skills you didn't write. A subagent's `skills:` field preloads full skill bodies at launch. [6][7]
- **Subagents:** model order is per-invocation `model` → frontmatter → `CLAUDE_CODE_SUBAGENT_MODEL` → main model. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` (v2.1.257+) overrides every agent, including ours. Explore inherits the main model, capped at Opus. Other limits:
  - `maxTurns` returns partial output (v2.1.246+);
  - `omitClaudeMd: true` drops user, project and local CLAUDE.md (v2.1.271+);
  - 20 concurrent subagents (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`);
  - spawn depth 3 (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`). [4][11]
- **Effort and thinking:** levels are `low`/`medium`/`high`/`xhigh`/`max`. Precedence: `CLAUDE_CODE_EFFORT_LEVEL` > `--effort` > `/effort` > `modelSettings`/`effortLevel`. Thinking can't be turned off on Opus 5.5, Sonnet 5.5 or Fable. `MAX_THINKING_TOKENS` affects only fixed-budget models. `/effort ultracode` makes every substantive task a workflow. [1][5][15]
- **MCP:** tool search is on by default (v2.1.221+). `ENABLE_TOOL_SEARCH=auto` loads schemas upfront if they fit in 10% of the context window; `false` loads everything. Output warns at 10,000 tokens and is capped at 25,000 (`MAX_MCP_OUTPUT_TOKENS`); a per-tool `_meta["anthropic/maxResultSizeChars"]` allows up to 500,000 chars. `/context all` shows tokens per MCP tool. [8][9]
- **Built-in output limits:** Bash output is inline up to ≈ 30,000 chars; above that Claude gets a file path plus a 2,000-char preview. `BASH_MAX_OUTPUT_LENGTH` (max 150,000) sets the read-back window and `bashOutputMaxChars` (≤ 128,000, v2.1.261+) sets the inline ceiling. Read returns a `PARTIAL view` past its token limit (`CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS`). Glob is capped at 100 files. [11][13]
- **Workflows:** the default size guideline is `medium` (< 10 agents), or `small` on Pro (v2.1.271+). Up to 16 concurrent agents and 1,000 per run. A `Large workflow` warning appears above 25 agents or 1.5M projected tokens. Workflows are off with `disableWorkflows: true` or `CLAUDE_CODE_DISABLE_WORKFLOWS=1`. [15]
- **Status line:** costs no tokens. Fields: `cost.total_cost_usd`, `context_window.used_percentage` (input tokens only), `context_window.current_usage`, `prompt_cache` (v2.1.251+), `rate_limits.*`. [14]

## Open questions
- Every non-fork subagent also loads each contributor's `~/.claude/CLAUDE.md` and `~/.claude/rules/`, which are personal and unbounded. `omitClaudeMd` would remove them but also drop `AGENTS.md`, which the reviewers need. Should reviewers set `omitClaudeMd: true` and read `AGENTS.md` themselves?
- `maxTurns` per agent: the docs give no recommended value. Measure with `/usage` attribution before setting caps.
- CI values for `--max-turns` and `--max-budget-usd` wait for the M0 AI-review job (ADR 0024: AI review only after deterministic checks).
- Frontmatter `app:` is `repo` here, as the task asked, but `repository` in `setup-notes.md`. Which value does the owner want?
- `settings.local.json` enables `swiftui-expert@swiftui-expert-skill`, a third-party skill plugin. ADR 0047 allows third-party skills only as per-user installs, never in project scope. Does local scope count as allowed? Its skill descriptions are paid in every session in this repo.

## Sources
1. Manage costs effectively — https://code.claude.com/docs/en/costs
2. How Claude remembers your project — https://code.claude.com/docs/en/memory
3. How Claude Code uses prompt caching — https://code.claude.com/docs/en/prompt-caching
4. Create custom subagents — https://code.claude.com/docs/en/sub-agents
5. Model configuration — https://code.claude.com/docs/en/model-config
6. Skills — https://code.claude.com/docs/en/skills
7. Extend Claude Code (context cost by feature) — https://code.claude.com/docs/en/features-overview
8. Explore the context window — https://code.claude.com/docs/en/context-window
9. MCP — https://code.claude.com/docs/en/mcp
10. CLI reference — https://code.claude.com/docs/en/cli-reference
11. Environment variables — https://code.claude.com/docs/en/env-vars
12. Hooks reference — https://code.claude.com/docs/en/hooks
13. Tools reference — https://code.claude.com/docs/en/tools-reference
14. Status line — https://code.claude.com/docs/en/statusline
15. Dynamic workflows — https://code.claude.com/docs/en/workflows
16. Effective context engineering for AI agents (2025-09-29) — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
17. How we built our multi-agent research system (2025-06-13) — https://www.anthropic.com/engineering/multi-agent-research-system
