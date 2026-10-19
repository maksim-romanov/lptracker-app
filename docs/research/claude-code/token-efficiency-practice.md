---
app: repo
topic: Token efficiency in Claude Code — practice
checked: 2026-10-01
---

# Token efficiency in Claude Code — practice

Scope: habits and repo changes that cut tokens without cutting quality, for a Bun/Turbo monorepo with Tuist and Gradle wrappers and a docs-heavy tree. Claude Code facts are from docs that name v2.1.283; third-party numbers are the authors' own and unverified. Setup already decided lives in [setup-notes](setup-notes.md), [LSP](../agent-tools/lsp.md) and [base dev MCP](../agent-tools/base-dev-mcp.md); this file does not repeat it.

## Decisions

Ranked top 15, highest saving per effort first.
1. We run `/clear` between unrelated tasks, and after two failed corrections we `/clear` and re-prompt with what we learned, because every request re-sends the whole history and "a clean session with a better prompt almost always outperforms a long session with accumulated corrections". `/clear` costs nothing; `/compact` is itself a large request. [1][2]
2. We make `bun run check` quiet for agents in the M0 spec: when `CLAUDECODE=1` or `AGENT=1` is set, Turbo runs with `--output-logs=errors-only --ui=stream`, Gradle with `-q --console=plain`, and `xcodebuild` with `-quiet`. Bun's test runner already hides passing tests under those variables. The full log goes to a gitignored file whose path is printed on failure. Reason: a failing command reaches Claude only as a head-and-tail excerpt of about 10,000 characters, so noise can push the real error out. [5][15][16][17][23]
3. We default agents to `bun run check --affected` (already in AGENTS.md), because Turbo then runs only packages changed since `main`. Cloud and CI checkouts must have enough git history: if the clone is too shallow, Turbo treats every package as changed. [15]
4. We keep root `AGENTS.md` ≤ 100 lines and nested ones ≤ 40, as ADR 0024 says, and move task procedures into skills. CLAUDE.md loads every session, while a skill costs only its description until it is used. Anthropic's limit (200 lines) and HumanLayer's (under 300; models follow about 150 to 200 instructions) are looser than ours, so no change is needed. [1][2][19][20][0024]
5. We tell agents to use CLIs (`gh`, `playwright-cli`, `psql`) over MCP servers, as CONTRIBUTING already does, because they add no per-tool listing to context. Playwright CLI writes snapshots to files instead of putting the page tree into context. [1][2][14][27]
6. We leave MCP tool search on (the default) and turn off idle servers with `/mcp`. Never set `ENABLE_TOOL_SEARCH=false`: with schemas loaded upfront, GitHub alone cost about 26K tokens for 35 tools, and five servers cost about 55K before the first prompt (Anthropic, 2025-11). [9][11]
7. We send exploration, doc fetching and log reading to subagents that return a summary, as our five agents in `.claude/agents/` already do. Tight edit-test loops stay in the main session, because a non-fork subagent starts cold and re-reads files. [2][4][21]
8. We use plan mode for multi-file or unfamiliar work and skip it when the diff fits in one sentence. Plan mode keeps the prompt cache, because its instructions are appended as messages. [2][3]
9. We treat the approved spec in `docs/specs/`, or the plan in the PR description, as the session handoff note. Implementation starts in a fresh session that reads it, as Anthropic's interview-then-spec workflow recommends. [2]
10. We pick model and effort at the start of a session and avoid toggling MCP servers or plugins mid-task. We do not use `opusplan`, and we `/rewind` instead of `/compact` to drop a dead end. Reason: a model switch, an `opusplan` plan toggle or a change to tool definitions re-reads the whole history uncached, while a rewind lands on an already cached prefix. [3]
11. We search before reading. Use Grep or Glob (ripgrep, capped results), then Read with `offset` and `limit`. A whole-file read that exceeds the token limit returns only the first page. [5]
12. We add `Read(...)` deny rules for lockfiles (`bun.lock`, `Package.resolved`, `gradle.lockfile`) and build output (`.turbo/`, `DerivedData/`). Agents never need them, and `Read` rules also cover Grep, Glob and `@file` on a best-effort basis. `openapi.json` and `Generated/` stay readable (see Open questions). [8]
13. We keep LSP plugins personal, as decided in [LSP](../agent-tools/lsp.md). Anthropic's cost guide says one go-to-definition call replaces a grep plus reading several candidate files. It gives no number. [1]
14. We watch context with a personal status line (`context_window.used_percentage`) plus `/context` and `/usage`. `/usage` splits recent usage by MCP server, skill and subagent, and shows the prompt-cache hit rate. `ccusage` (MIT, reads local JSONL) is optional for history across agents; pin its version as ADR 0047 requires. [1][6][26][0047]
15. Contributors who want shorter replies use the built-in `Concise` output style in local settings. It keeps full error reports and safety warnings, and it does not break the cache. We do not commit an `outputStyle`. [3][7]

Rejected or limited
- We do not commit RTK or any command-rewriting hook. RTK's PreToolUse hook rewrites Bash commands and drops passing tests, file bodies and log detail. Its own README says the claimed "up to 90%" applies to Bash output, not to the bill, and its command list has no `xcodebuild`. Native quiet flags (decision 2) give most of the saving without hiding anything. A contributor may still use RTK in user scope, pinned. [24][0047]
- We do not adopt caveman (skill or proxy). ADR 0047 bans vendored third-party skills. Its terse prose conflicts with [writing-docs](../../writing-docs.md) and with PR text a human must answer for. A local proxy routed through `ANTHROPIC_BASE_URL` can strip cache markers, which bills the whole history uncached. The evidence is mixed: −8.5% output tokens with no detectable quality change (JetBrains, 86 tasks), about 1K tokens of overhead per call, and one case at +9.9%. [3][25][0047]
- We do not use agent teams or wide fan-out for coding. Teams use about 7× the tokens of a standard session in plan mode. Multi-agent systems use about 15× the tokens of a chat, and Anthropic says coding has "fewer truly parallelizable tasks". [1][13]
- We do not raise `BASH_MAX_OUTPUT_LENGTH` or `bashOutputMaxChars` in project settings. Larger windows put more noise into every result; fix the noise at the source (decision 2). [5]

## Facts that constrain us
- Bash results: a successful result over about 30,000 characters reaches Claude as a file path plus a 2,000-character preview. A failure comes inline as a head-and-tail excerpt of about 10,000 characters. Only `grep`, `rg`, `find`, `diff`, `test`, `git diff` and `git grep` count exit code 1 as success. [5]
- MCP output: a warning above 10,000 tokens and a 25,000-token cap (`MAX_MCP_OUTPUT_TOKENS`). Deferred tools put only names in context. `ENABLE_TOOL_SEARCH=auto` loads schemas upfront when they fit in 10% of the window. [9][10]
- Cache lifetime: on a subscription the main conversation's cache lasts 1 h; subagents, API keys and usage credits get 5 min. Editing CLAUDE.md mid-session keeps the cache but takes effect only after `/clear`, `/compact` or a restart. Nested CLAUDE.md files load when Claude first reads a file in their folder. On Opus 5.5 and Sonnet 5.5, changing effort keeps the cache. [3]
- Non-fork subagents load the full CLAUDE.md chain, so ours load root `AGENTS.md`. The built-in Explore and Plan agents skip it. `omitClaudeMd: true` skips it too. Explore inherits the session model, capped at Opus. [4]
- `CLAUDE_CODE_SUBAGENT_MODEL` sets the default subagent model. `..._FORCE=1` overrides every agent's `model` field. A skill whose frontmatter names another model switches the model for that turn, which misses the cache. [3][4]
- Enterprise average is about $13 per developer per active day, under $30 for 90% of users. Background usage is under $0.04 per session. [1]
- CLI vs MCP is not settled by protocol: Zechner's 120-run benchmark found a well-designed MCP and CLI within 3% on cost. Tool design mattered more. [18]
- Context quality drops as input grows, even on simple tasks across 18 models (Chroma). HumanLayer keeps context 40–60% full by compacting deliberately. Both are articles, not Claude Code docs. [21][22]
- Programmatic tool calling cut tokens 37% (43,588 → 27,297) on research tasks. Code execution over MCP cut 150K → 2K tokens on one Drive-to-Salesforce flow. These are API-level patterns, not Claude Code settings. [11][12]

## Conflicts with docs (flagged, not resolved)
- Decision 12 adds `Read(...)` deny rules. [setup-notes](setup-notes.md) lists only `.env` under `Read` deny, and ADR 0024 names deny rules only for edits and `git push`. The owner decides.
- Decision 2 adds agent-mode behaviour to `bun run check`. AGENTS.md defines `check` as `codegen`, `typecheck`, `lint` and `test` with no output contract. The M0 spec owns this. `--output-logs=errors-only` hides warnings from successful tasks, so lint warnings must fail the build or agents never see them.
- Model routing: each agent pins `model` in its frontmatter: `researcher` and `docs-reviewer` on `sonnet`, the three reviewers on `opus` ([ADR 0024](../../decisions/0024-agent-setup-and-ai-policy.md)). Never `haiku` for `security-reviewer` or `protocol-reviewer`: they guard addresses and auth. [1][4]

## Open questions
- Should agents query `openapi.json` with `jq` instead of reading it, and should `Generated/` get a `Read` deny? Generated Swift and Kotlin clients may be the only place call signatures are visible.
- xcbeautify `--quiet`/`--quieter` flags and Tuist pass-through of `-quiet` were not verified (README fetch gave no flag list). xcbeautify would also be a new dependency.
- No primary measurement of Playwright CLI vs MCP tokens was found; Playwright's docs say only "token-efficient". Measure one VoidX page flow before citing a ratio.
- Should CLAUDE.md get a two-line `# Compact instructions` block (keep the spec path, changed files, commands run)? It is Claude-only text outside AGENTS.md.
- Cloud sessions: what clone depth makes `--affected` work, given the shallow-clone fallback?

## Sources
1. Claude Code, Manage costs — https://code.claude.com/docs/en/costs
2. Claude Code, Best practices — https://code.claude.com/docs/en/best-practices
3. Claude Code, Prompt caching — https://code.claude.com/docs/en/prompt-caching
4. Claude Code, Subagents — https://code.claude.com/docs/en/sub-agents
5. Claude Code, Tools reference (Bash output limits, Read, Grep) — https://code.claude.com/docs/en/tools-reference
6. Claude Code, Status line — https://code.claude.com/docs/en/statusline
7. Claude Code, Output styles — https://code.claude.com/docs/en/output-styles
8. Claude Code, Permissions — https://code.claude.com/docs/en/permissions
9. Claude Code, Context window — https://code.claude.com/docs/en/context-window
10. Claude Code, MCP — https://code.claude.com/docs/en/mcp
11. Anthropic, Advanced tool use (2025-11-24) — https://www.anthropic.com/engineering/advanced-tool-use
12. Anthropic, Code execution with MCP (2025-11-04) — https://www.anthropic.com/engineering/code-execution-with-mcp
13. Anthropic, Multi-agent research system — https://www.anthropic.com/engineering/multi-agent-research-system
14. Playwright, CLI for coding agents — https://playwright.dev/docs/getting-started-cli
15. Turborepo, `turbo run` reference — https://turborepo.dev/docs/reference/run
16. Bun, test runner (AI agent output) — https://bun.com/docs/test
17. Gradle 9.8.0, command-line interface — https://docs.gradle.org/current/userguide/command_line_interface.html
18. Mario Zechner, MCP vs CLI (2025-08-15) — https://mariozechner.at/posts/2025-08-15-mcp-vs-cli/
19. Simon Willison, Claude Skills (2025-10-16) — https://simonwillison.net/2025/Oct/16/claude-skills/
20. HumanLayer, Writing a good CLAUDE.md (2025-11-25) — https://www.humanlayer.dev/blog/writing-a-good-claude-md
21. HumanLayer, Advanced context engineering for coding agents — https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/ace-fca.md
22. Chroma, Context rot (2025-07-14) — https://www.trychroma.com/research/context-rot
23. Armin Ronacher, Agentic coding recommendations (2025-06-12) — https://lucumr.pocoo.org/2025/6/12/agentic-coding/
24. rtk-ai/rtk — https://github.com/rtk-ai/rtk
25. JuliusBrussee/caveman — https://github.com/JuliusBrussee/caveman
26. ryoppippi/ccusage — https://github.com/ryoppippi/ccusage
27. microsoft/playwright-cli — https://github.com/microsoft/playwright-cli
