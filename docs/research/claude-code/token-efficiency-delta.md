---
app: repo
topic: Token saving in autonomous multi-agent loops — new findings
checked: 2026-10-20
---

# Token saving in autonomous multi-agent loops — new findings

Scope: the owner-local launcher that starts several `claude -p` workers in git worktrees on a Claude subscription. Adds to, and does not repeat, [official](token-efficiency-official.md), [practice](token-efficiency-practice.md), [agent-context](../../concepts/agent-context.md), [autonomy-loops](../agent-tools/autonomy-loops.md) and [orchestration](../agent-tools/multi-agent-orchestration.md). Claude Code facts come from docs that name up to v2.1.302. Evidence tags: **official** (Anthropic docs, unmeasured), **measured-1** (one author's small test), **paper** (peer-reviewed or arXiv with numbers), **secondary** (blog without primary data), **reasoning** (ours, no source measures it). No saving percentage below is ours; where a source gave none, none is given.

## Decisions

All are proposals for the owner's launcher (`~/.claude/voidx-loop/`, local scope). None binds contributors.

Cache layout for parallel workers
- We keep `--append-system-prompt` text byte-identical in every worker and put the step, role and paths in the user prompt, because the appended text lives in the system prompt and any change there makes everything after it a miss. `--system-prompt` is not used: one report saw 0 cache reads in 10 identical calls with it on v2.1.222 (measured-1, mechanism unconfirmed), and the docs add a `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` line only from v2.1.275. [1][2][3][25]
- We run read-only reviewers (`spec-verifier`, `architecture-guard`, `security-reviewer`) in the same directory and in parallel when they review one integration branch, with identical model, `--tools`, `--append-system-prompt` and settings. Docs: parallel sessions in the same directory build matching prefixes and read each other's cache; sessions in different directories do not. Implementers stay in separate worktrees, so we do not plan on shared cache between them. [1] (official)
- We start the first reviewer, wait until its first assistant event appears on `--output-format stream-json`, then release the rest. Claude Code does exactly this for workflow fan-outs (holds all but the first, up to 5,000 ms, `CLAUDE_CODE_WORKFLOW_PREFIX_STAGGER_MS`); the setting does not apply to our `-p` processes, so the launcher imitates it. [4] (official for workflows; reasoning for `-p`)
- We do not pass `--exclude-dynamic-system-prompt-sections` until a probe shows a gain. The flag exists to share the system prompt across checkouts, but the one public test (40 calls, v2.1.268, fresh temp directories) saw flat `cache_read` and unchanged `cache_creation`, and the SDK doc says the working directory is not in the system prompt anyway. The probe is the first M0 task for the launcher: two worktrees, same prompt, compare `usage.cache_read_input_tokens` of the first request with and without the flag. [1][2][5][6] (official + measured-1, conflicting)
- We leave `ENABLE_PROMPT_CACHING_1H` and `subagentPromptCacheTtl` at their defaults. A `-p` run is in the main-conversation bucket and gets 1 h on a subscription within plan usage; subagents get 5 min; 1 h writes cost more on the API and no source says how the plan limit weighs them. On startup the launcher runs `claude -p "hello" --output-format json` and checks `usage.cache_creation.ephemeral_1h_input_tokens` is non-zero. [1] (official)

Cheaper worker startup, without `--bare`
- We never use `--bare` on the subscription: bare mode skips OAuth and keychain, so it needs `ANTHROPIC_API_KEY`. The docs say bare "will become the default for `-p` in a future release", so the launcher checks `system/init` for the `CLAUDE.md` it expects and stops if the files are gone. [7] (official)
- We start every worker with `--setting-sources project` (plus `--settings` for the loop config) so the owner's `~/.claude/CLAUDE.md`, `~/.claude/rules/`, user hooks and user plugins are not loaded into workers. The owner's global rules are personal, large and unrelated to the repo. Check once with `system/init` or `OTEL_LOG_RAW_API_BODIES=file:<dir>` that user CLAUDE.md really disappears from the first request. [8][9] (official for the flag; effect on user `CLAUDE.md` unverified)
- We set in the worker environment: `CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1` (skips the title helper request), `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false`, `CLAUDE_CODE_ENABLE_AWAY_SUMMARY=0`, `CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY=1`, `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`, `CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS=1`. These remove helper model calls, the auto-memory block (the one piece of the default system prompt that embeds a per-checkout path) and the git snapshot (branch and recent commits, which differ per worktree). With git instructions off, the loop prompt must carry the commit rule itself (`git commit -s`, `Assisted-by: Claude Code`), and `attribution.commit` goes into `--settings` as the same trailer, because the default `Co-Authored-By` trailer is forbidden by AGENTS.md. [2][10] (official; no source measures the saving)
- We do not set `CLAUDE_CODE_DISABLE_ATTACHMENTS=1`: it also turns `@file` into plain text and drops the skill list, which workers use. [2] (official)

Failing fast and not paying for retries
- We run cheap deterministic gates in the launcher before a worker exists: spec `status: approved`, `bun run check --affected` green on the base commit (only the affected workspaces), the step's `owns` globs free, and the build slot free. A red base or a missing prerequisite costs shell time instead of a session whose first request carries the full prefix. The Anthropic harness has the agent run its init and health check; moving that check into the launcher and passing only a failure excerpt is ours. [11] (reasoning)
- We retry a failed step in a fresh session with the failing log path and `git diff` summary, not with `--resume`, whenever the last response is older than 1 h (30 min is not a threshold anyone measured), because a resume re-sends the whole history and reads nothing from an expired cache. Within the TTL `--resume` is cheap: it reads the cache. [1][12] (official)
- We keep our own cumulative USD ledger per step and per day. `--max-budget-usd` does not count spend restored by `--continue` or `--resume`, so a retry loop built on resume can pass any per-invocation cap; spend is also a list-price estimate and can overshoot the cap. [12] (official)
- We treat a usage-limit error as a global stop: the launcher stops spawning, reads the reset time from the error, and sleeps. `-p` runs do not wait for a reset (the auto-wait is interactive only), and every extra spawn only adds a prefix to a request that will be rejected. [13][14] (official)
- When only the Opus limit message appears ("You've hit your Opus limit"), the launcher re-routes pending Opus steps to Sonnet instead of waiting; the docs say a model outside the named family keeps working, while the shared session and weekly limits cannot be dodged by switching. Core and review steps then wait for the reset unless the owner chooses otherwise. [13] (official)

Routing, effort, planning once
- We choose model and effort per step at launch (`--model`, `--effort`) and store both in `tasks.json`; nothing switches mid-session. Effort can change without breaking the cache on Opus 5.5 and Sonnet 5.5, so the launcher may raise it on a retry of the same session; a model change never fits in one session. Thinking cannot be turned off on these models, so effort is the only lever on thinking tokens. No source measures tokens saved per effort level; record `usage` per step and decide from our own data. [1][15] (official)
- We make the planner emit, per step, a `reads` list (files, optionally with line ranges), the criteria commands and the test command, and pass it in the worker prompt. Anthropic's cost page ties specific prompts to fewer file reads and plan mode to avoiding rework, but gives no number. Workers start from the list and may read more. [16] (official, unmeasured)
- We run no subagents inside implementer workers unless a step is read-heavy: a non-fork subagent builds its own cache at a 5-minute TTL, reloads the CLAUDE.md chain, and its tokens count toward the same limits. [1][17] (official)

Measuring every step
- The launcher runs workers with `--output-format json` (or reads the last `result` event of `stream-json`) and appends to `events.jsonl`: step id, model, effort, `usage.input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, the 5m/1h split, `total_cost_usd`, `num_turns`, exit code. `total_cost_usd` is a client-side list-price estimate; it is not the weight against the 5-hour or weekly limit. A step with a high creation share and few turns means a prefix miss, which is the signal to look for. [12][18] (official)
- Before choosing any threshold, run the two-week baseline in [Open questions](#open-questions); do not set alert numbers from blogs.

## Facts that constrain us

- Cache scope (docs, v2.1.30x era): the system prompt embeds the auto memory path and the conversation opens with the working directory, platform, shell and OS version; two directories build different prefixes. Same-directory parallel sessions read each other's cache. Sequential sessions share a prefix only if the startup git snapshot (branch and recent commits) matches. [1] (official)
- SDK doc, narrower: the per-checkout part of the preset system prompt is the auto memory location (a path under `~/.claude/projects/` named for the repository path); CLAUDE.md and the working directory are delivered in the conversation and do not affect the system prompt cache. Sharing the system-prompt entry would therefore need the same memory path or `excludeDynamicSections`, which moves it into the first user message with "marginally less weight". The two pages do not say how much of the request the tools-plus-system block is. [1][6] (official)
- Fan-out stagger rule for workflows: agents share a prefix only with the same model, effort, agent type, tools, output schema and working directory; the hold is 5,000 ms by default and is for workflow agents only. [4] (official)
- The prompt-cache TTL bucket for `-p` is "main conversation": 1 h on a subscription within plan usage, 5 min once over the plan on usage credits. Subagents, workflows, forks, compaction and session titles are the 5-minute bucket unless set. `FORCE_PROMPT_CACHING_5M=1` wins over everything. [1] (official)
- `--max-budget-usd`: counts subagent spend, can be passed, ignores totals restored by `--continue`/`--resume`; `--max-turns` exits with an error and has no default. From v2.1.302 a `-p` run starts in Manual mode when nothing sets a permission mode, so the launcher always passes `--permission-mode`. [12][19] (official)
- Resuming keeps the system prompt recorded on the conversation's first request (since v2.1.265), so changing `--append-system-prompt` on a resume does not apply until compaction; `--system-prompt-snapshot off` rebuilds it on every request and loses the session cache. [3][6] (official)
- Single-author measurements, `claude -p` on Sonnet: default prompt, same directory, repeated calls had `cache_creation=0`; across fresh temp directories the first call wrote ≈ 1,000 tokens (stripped tools) or ≈ 10,100 tokens (full default tool surface) with ≈ 38,200 `cache_read`; the flag moved nothing. Total about $0.70 for 40 calls; one CLI version, one account. [5] (measured-1)
- `usage` after `-p` shows `ephemeral_1h_input_tokens` versus `ephemeral_5m_input_tokens`; the `/usage` line `Prompt cache (main)` counts the main conversation only and tags compaction and tool-result clearing as "expected rebuilds". [1][18] (official)
- Observation masking (replace old tool outputs with a placeholder, keep reasoning and actions) matched LLM summarization on SWE-bench Verified in SWE-agent across five model configurations and cut cost about in half versus the raw agent (Qwen3-Coder 480B: 52% cheaper, 54.8% solve rate versus 53.8% raw). In OpenHands the window tuned for SWE-agent hurt badly, because OpenHands keeps retry turns SWE-agent drops. A hybrid cut cost by a further 7% against masking and 11% against summarization. Claude Code does its own tool-result clearing and compaction and exposes only the compaction window, so this explains why long sessions cost what they cost; it is not a knob. [20] (paper)
- Subscription limits: 5-hour and weekly windows are shared with chat; model-specific messages exist ("Opus limit", "Sonnet limit"); how cache reads weigh against them is not stated in the docs read. An Anthropic support snippet says cached tokens count less than uncached ones, with no ratio. [13][21] (official snippet, partial)
- `--bare` needs an API key; `--setting-sources` takes `user`, `project`, `local`; `--settings` is always loaded. [7][8]

## Claims we reject

- "`--exclude-dynamic-system-prompt-sections` shares cache across worktrees." The flag is documented for cross-user and cross-machine reuse; the only public test of directories saw no gain and the SDK doc says the directory is not in the system prompt. Unproven until our probe. [5][6][8]
- "A custom `--system-prompt` is cached when its text is identical." One report: 0 of 10 calls read cache on v2.1.222. Mechanism inferred from minified code. Avoid until retested on the pinned version. [3][25]
- "Filter test output with `cmd | grep FAIL | head`" (the example hook in the official cost page). In an unattended loop an empty result looks like a pass when the runner crashes with a different message. Quiet flags plus a log file path (practice decision 2) keep the signal. [16] (reasoning on documented behavior)
- "Diff-only edits cut tokens, per Aider." The Aider unified-diff article measures laziness (SEARCH/REPLACE 20% to 61% on a 89-task benchmark with GPT-4 Turbo), reports no token numbers and covers no whole-file format. Claude Code edits by string replacement already. [22] (measured, not about tokens)
- "A repo map beats reading files." Aider's map defaults to 1,024 tokens (secondary, a guide, not Aider's docs); no source compares map tokens with file reads. Claude Code has no repo map; the documented substitutes are LSP and a codebase-overview skill. We build nothing until measured. [16][23] (secondary)
- "Context editing saves 84% of tokens." Anthropic's figure is for a 100-turn web-search evaluation on the API beta; it says nothing about Claude Code settings. [24] (official, wrong scope)
- "Cache reads are free against the subscription limit." Not stated anywhere we found. [21]
- "More workers share more cache." Only same-directory, same-configuration sessions do. [1]
- "`/usage` dollars tell us how close we are to the limit." The figure is list price; the window is separate. [12][18]

## Open questions

- Does `--setting-sources project` drop `~/.claude/CLAUDE.md` and `~/.claude/rules/` in `-p`? Verify against a logged request body.
- Do two worktrees of one repo share the auto-memory path (and so the system-prompt block)? If yes, disabling auto memory is only a token saving, not a cache fix.
- Real cross-worktree hit: with and without `--exclude-dynamic-system-prompt-sections`, on the pinned version, with our CLAUDE.md. Gates the whole "shared prefix" idea.
- How a script reads the 5-hour and weekly percentage after a step. The status line has `rate_limits.*` but only for interactive sessions; `/usage` in `-p` was not confirmed.
- How 1 h cache writes and cache reads weigh against the subscription limits. Measure: limit percentage before and after a fixed worker run with `FORCE_PROMPT_CACHING_5M=1` versus default.
- Does `CLAUDE_CODE_DISABLE_1M_CONTEXT=1` (200K window) for Sonnet workers lower total spend, or does it only add compactions? Context quality drops with input length (Chroma, already in practice), but no source prices it for our steps.
- Is Haiku 5.5 safe for mechanical steps (format, rename, doc link fixes)? The cost page suggests Haiku for simple subagents; existing docs bar it only for reviewers. Not researched.
- Baseline to collect first: per step type (S/M/L, Sonnet or Opus), median and worst tokens, cache creation share, turns, retries. Two weeks of `events.jsonl`, then decide thresholds.
- Codex CLI and OpenHands guidance on prefix stability was read only through secondary write-ups (stable ordering of instructions, tools, then dynamic parts; routing hint `prompt_cache_key`); nothing there changes Claude Code behavior.

## Sources

1. How Claude Code uses prompt caching (cache scope, TTL buckets, subagents and the cache) — https://code.claude.com/docs/en/prompt-caching
2. Environment variables — https://code.claude.com/docs/en/env-vars
3. CLI reference, system prompt flags — https://code.claude.com/docs/en/cli-reference#system-prompt-flags
4. Dynamic workflows, prompt caching in a fan-out — https://code.claude.com/docs/en/workflows#prompt-caching-in-a-fan-out
5. mer.vin, why exclude-dynamic-system-prompt-sections didn't help my cache (single author, v2.1.268) — https://mer.vin/news/why-exclude-dynamic-system-prompt-sections-didnt-help-my-cache/
6. Agent SDK, modifying system prompts (cache across users and machines, snapshot) — https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts
7. Run Claude Code programmatically (bare mode, permission mode in `-p`) — https://code.claude.com/docs/en/headless
8. CLI reference, flags (`--exclude-dynamic-system-prompt-sections`, `--setting-sources`, `--max-budget-usd`, `--effort`) — https://code.claude.com/docs/en/cli-reference
9. How Claude remembers your project — https://code.claude.com/docs/en/memory
10. Agent SDK, turn off the context your agent replaces (`includeGitInstructions`, `attribution`) — https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts#turn-off-the-context-your-agent-replaces
11. Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
12. Manage costs (usage, cache line, why usage climbs, limit messages) — https://code.claude.com/docs/en/costs
13. Manage costs, "When a developer asks about a limit" — https://code.claude.com/docs/en/costs#when-a-developer-asks-about-a-limit
14. Dynamic workflows, when a run hits your usage limit (no pause in `-p`) — https://code.claude.com/docs/en/workflows#when-a-run-hits-your-usage-limit
15. Model configuration (effort, thinking) — https://code.claude.com/docs/en/model-config
16. Manage costs, reduce token usage (specific prompts, hooks and skills, example test filter) — https://code.claude.com/docs/en/costs#reduce-token-usage
17. Create custom subagents (startup context, cacheTtl, omitClaudeMd) — https://code.claude.com/docs/en/sub-agents
18. Run Claude Code programmatically, structured output; prompt-caching docs `usage.cache_creation` check — https://code.claude.com/docs/en/prompt-caching#choose-the-ttl-yourself
19. CLI reference, `--max-turns` and print-mode flags — https://code.claude.com/docs/en/cli-reference
20. The Complexity Trap: Simple Observation Masking Is as Efficient as LLM Summarization for Agent Context Management (Lindenbauer et al., JetBrains Research and TUM, 2025) — https://arxiv.org/abs/2508.21433
21. Claude Help Center usage-limit articles via search snippet (cached tokens count less; no ratio) — https://support.anthropic.com/en/?q=tokens
22. Aider, unified diffs make GPT-4 Turbo 3X less lazy — https://aider.chat/docs/unified-diffs.html
23. Aider token-limit guide (secondary; default map 1,024 tokens) — https://fast.io/resources/aider-token-limit/
24. Anthropic, Managing context on the Claude Developer Platform (context editing, 84% in a 100-turn evaluation) — https://www.anthropic.com/news/context-management
25. mer.vin, why your custom system prompt silently kills Claude's prompt cache (single author, v2.1.222) — https://mer.vin/2026/08/why-your-custom-system-prompt-silently-kills-claudes-prompt-cache/
