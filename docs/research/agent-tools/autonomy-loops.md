---
app: agent-tools
topic: Autonomous work loops (owner-local)
checked: 2026-10-01
---

# Autonomous work loops

Scope: how the owner runs Claude Code (Opus and Sonnet 5.x) on approved specs with minimal involvement. Everything below lives in local scope; nothing here binds contributors.

## Decisions

Scope and placement
- We keep all autonomy config local and commit nothing, because [AI_POLICY.md](../../../AI_POLICY.md) and [ADR 0024](../../decisions/0024-agent-setup-and-ai-policy.md) bind contributors, and Claude Code lets one machine add settings, instructions, skills, agents and hooks without touching the repo. [12][13][16]
- We launch loops from one owner-only folder outside the repo, `~/.claude/voidx-loop/` (*planned*): `settings.json`, `instructions.md`, `plugin/` (skills, agents, hooks), `run.sh`. The launcher runs `claude -p --worktree <slug> --settings ~/.claude/voidx-loop/settings.json --plugin-dir ~/.claude/voidx-loop/plugin --strict-mcp-config --append-system-prompt "$(cat instructions.md)" --max-turns <n> --max-budget-usd <usd>`. We do not rely on `.claude/settings.local.json` or `CLAUDE.local.md`: they are gitignored, exist only in the checkout where created, and are absent in a fresh worktree. `--settings` outranks local and project settings and works in any checkout. [11][12][13]
- We ship the loop's skills, agents and hooks as a `--plugin-dir` plugin, not in `~/.claude/skills` or `~/.claude/agents`, because user scope applies to every project on the machine and wins name conflicts over project skills; a plugin loads for one session. [14][15][16]

Loop design
- We define done as commands: every box in the spec's Acceptance criteria plus `bun run check --affected`. The agent ticks a box only after printing the command output, because Claude stops when work "looks done" unless a check it can run exists. [4][7]
- We gate the stop twice. First a `/goal` condition per iteration, e.g. `/goal criterion 3 of docs/specs/<spec>.md holds: <command> exits 0, bun run check --affected is green, or stop after 20 turns`; the evaluator only reads the transcript, so the condition names the command whose output must appear. Second a Stop hook `voidx-loop/plugin/hooks/verify-done.sh` that runs the criteria commands and `check`, prints only the failing log path, exits 2 to block, and lets the stop through when `stop_hook_active` is true after writing a `BLOCKED` note. It acts only when `VOIDX_LOOP=1` (set in `--settings` `env`), so interactive sessions stay fast. [5][6][7]
- We run one criterion group per iteration in a fresh `claude -p` session. State passes through git and the shared state folder outside the worktrees, `~/.claude/voidx-loop/state/<spec>/` ([orchestration](multi-agent-orchestration.md)). The outer loop stops when all boxes are ticked, after N iterations, or after two iterations with no new commit. This is the Ralph pattern; Anthropic's harness needs the same bridge between sessions, and resets beat compaction on smaller models while newer models need fewer harness parts. [1][2][17]
- We commit per criterion on the worktree branch with `git commit -s` and `Assisted-by: Claude Code`, because commits are the recoverable checkpoints and `/rewind` does not track Bash changes. [1][4]
- We write the failing test or fixture first for any observable criterion, in its own commit, then the code. [4]
- We stop the agent from weakening the check: the Stop hook fails when `git diff main --diff-filter=D --name-only` lists a test file, or the diff touches a threshold or lint config, unless the spec says so. [1] (Matches the AGENTS.md rule "keep the threshold".)

Verification layers
- We add a local `spec-verifier` agent (Opus, tools `Read, Grep, Glob, Bash`, read-only) to the plugin. It gets the spec and `git diff main`, re-runs the criteria commands, and reports only gaps in correctness or stated requirements; at most two fix rounds. Existing `architecture-guard` and `security-reviewer` run by path (core, auth, CI, integrations). The model that wrote the code does not grade it. [2][4]
- We keep CI as the final judge: the loop ends at a green local branch, the owner pushes, `ci-ok` decides. No agent reads CI as its stop signal. [3][4]
- We leave first snapshot baselines and any new screen to the owner's eyes; afterwards ADR 0022/0023 gates (audits, snapshots, motion lint) run in the loop. A web evaluator driving Playwright is an option for web specs. [2]
- We measure the setup per spec: iterations, USD (`/goal` status shows turns and tokens), CI first-pass, owner edits at review. We re-test the harness at every model release and delete parts the model no longer needs. [2][7]

Decomposition and gates
- We split work as: owner approves each app plan and each milestone spec once (workflow step 4); the launcher refuses a spec whose frontmatter is not `status: approved`. Slices inside it are sections with command criteria; no further approval. [4][18][19]
- We keep these owner-only: accepting ADRs, approving plans, new dependencies, `core`/`contracts`/`infra` changes, any address, start block or ABI marked `TODO`, merging, release and signing, secrets. On any of these the agent writes `BLOCKED: <question>` to the progress file and exits non-zero; the launcher notifies the owner. [3][4]
- We do not adopt Spec Kit or Kiro: our `docs/specs/` format already holds spec, tasks and verification, and third-party skills are barred by [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md). Their implement-until-converged loop is what the outer loop does. [18][19]

Parallelism
- (Updated 2026-10-19) Superseded by [orchestration](multi-agent-orchestration.md) and [resource limits](local-resource-limits.md): a weighted budget instead of a fixed worker count (step `size` S=1, M=2, L=3 against a budget of about 8, halved under memory pressure, at most 8 sessions), with disjoint `owns` sets, one host-wide build slot and one device slot; never two steps on `packages/contracts` or `packages/core` at once. Steps come from the spec's step list ([work decomposition](work-decomposition.md)).
- We run no agent teams or `/batch` for feature work; agent view is allowed as a read-only monitor. [4]

Guardrails
- We run unattended loops with `--permission-mode dontAsk` and an explicit allowlist in the local `settings.json` (`bun run *`, `git add`, `git commit -s *`, read-only `git`, the native build commands), because auto mode's classifier pauses the run after 3 blocks in a row or 20 total and is not deterministic. Watched sessions may use auto mode. `--dangerously-skip-permissions` only inside a container or VM. [9]
- We rely on committed deny rules (`git push`, generated files, lockfiles, `.env`) applying in every mode; a local allow cannot lift them. [9][12]
- We add local denies: `Bash(gh pr *)`, `Bash(gh issue *)`, `Bash(gh api *)`, `Bash(git remote *)`. [9]
- We bound cost per run: `--max-turns`, `--max-budget-usd`, a turn clause in every `/goal`, an iteration cap in `run.sh`. Anthropic's full harness took 6 h and about $200 against 20 min and $9 solo; the cap is the guard. [2][7]
- We load no MCP in unattended loops (`--strict-mcp-config`), because MCP output is untrusted and a session that read it gets no unattended writes ([ADR 0047](../../decisions/0047-agent-tools-and-mcp.md)). `add-protocol` work stays watched.
- We do not use `/loop`, cron or `claude-code-action` to drive work: `/loop` is session-bound and expires after 7 days, and the action pushes commits and PRs from CI. [8][10]

AI policy
- We hold the local setup to this: the agent may edit, run commands and commit locally on its worktree branch. It may not push, open PRs or issues, comment, or reply to reviewers. The owner reads the diff, pushes, runs `gh pr create --draft` and fills the template. That keeps AI_POLICY rules 1, 2 and 4 and the AGENTS.md Git section as written, so no policy change is needed. [Conflicts](#conflicts-with-committed-docs)

## Facts that constrain us

- `/goal`: evaluator is the small fast model (Haiku by default), sees only the transcript, condition up to 4,000 chars, works with `-p`; stops after several turns without tool use; clears on auth, credit, context-overflow or model errors; check-ins need v2.1.234, resume restore v2.1.239. Unavailable when `disableAllHooks` is true. [7]
- Stop and SubagentStop: `stop_hook_active`, exit 2 or `decision: "block"` blocks; Claude Code overrides after 8 consecutive blocks; `prompt` hooks and experimental `agent` hooks can decide. [5][6]
- Auto mode is the starting mode from v2.1.283 in interactive sessions; in `-p` the default is `default` unless the session does not fetch feature flags. `dontAsk` denies anything not allowlisted. [9]
- Settings precedence: managed, `--settings`, `.claude/settings.local.json`, `.claude/settings.json`, user. List keys such as `permissions.allow` merge across files. [12]
- `CLAUDE.local.md` loads after `CLAUDE.md` and counts as a CLAUDE.md; it exists only where created. To share across worktrees import a home file with `@~/...`; the first external import asks once. [13]
- No local-only scope exists for project skills or subagents; `--agents` JSON outranks project agents; `--plugin-dir` (or `CLAUDE_CODE_PLUGIN_DIRS`) loads skills, agents and hooks for one session. [14][15][16]
- Worktrees: `claude --worktree <name>` makes `.claude/worktrees/<name>` on branch `worktree-<name>`; `-p` runs are never cleaned up; `${CLAUDE_PROJECT_DIR}` in hooks stays at the main checkout, hook `cwd` follows the worktree. [11]
- Scheduled `/loop`: session-scoped, 1 minute minimum, recurring tasks expire after 7 days; cloud Routines minimum 1 hour. [8]
- A push made with the default `GITHUB_TOKEN` does not trigger CI. [10]

## Where it lives

| Piece | Location | Committed |
|---|---|---|
| Launcher, instructions, settings, plugin | `~/.claude/voidx-loop/` | no |
| Handoff state | `~/.claude/voidx-loop/state/<spec>/` (`tasks.json`, `events.jsonl`, `progress/`) | no, outside the repo |
| Worktrees | `.claude/worktrees/` | no; needs one ignore line (below) |
| Deny rules, hooks for formatting | `.claude/settings.json` | yes, unchanged |

Narrowest committed change, optional: `.claude/worktrees/` in `.gitignore` (the docs recommend it); or `.git/info/exclude` for zero committed change.

## Conflicts with committed docs

With local-only autonomy none blocks the owner:
- AI_POLICY.md rule 4 and ADR 0024 "No autonomous PRs or comments": kept, because the loop stops at a local commit and the owner pushes.
- AGENTS.md "Leave pushing and opening PRs to a person" and the `git push` deny: kept, same reason.
- [workflow](../../workflow.md) step 4 and AGENTS.md "plan not `approved` → stop": kept; the launcher enforces them. This is the one required owner gate per plan.
- AGENTS.md "Commit only when asked": the loop prompt asks for commits.
- [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md) untrusted MCP output: no MCP unattended.
- agent-context "Not used: wide fan-out, agent teams": consistent with at most three worktrees.
- If the owner later wants agent-opened draft PRs, AI_POLICY rule 4 and ADR 0024 must say "contributors' agents"; that is a policy change and not proposed here.

## Open questions

- Hooks from `--settings` and a `--plugin-dir` plugin should add to those in `.claude/settings.json` (lists merge); not confirmed in the hooks docs. Test in M0.
- Whether `claude -p` runs plugin hooks and `/goal` together with a `dontAsk` allowlist covering `xcodebuild` and `./gradlew` without prompting.
- Stop hook runtime when `check --affected` includes iOS or Android builds; may need a fast subset per spec.
- OpenAI Codex and Cursor loop guidance was not researched; Claude Code only.
- Kiro was not read first-hand; judged through a secondary write-up.

## Sources

1. Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
2. Harness design for long-running application development — https://www.anthropic.com/engineering/harness-design-long-running-apps
3. Building effective agents — https://www.anthropic.com/engineering/building-effective-agents
4. Best practices for Claude Code — https://code.claude.com/docs/en/best-practices
5. Hooks reference, Stop and SubagentStop — https://code.claude.com/docs/en/hooks
6. Hooks guide, block cap — https://code.claude.com/docs/en/hooks-guide
7. Keep Claude working toward a goal — https://code.claude.com/docs/en/goal
8. Run prompts on a schedule — https://code.claude.com/docs/en/scheduled-tasks
9. Permission modes — https://code.claude.com/docs/en/permission-modes
10. Claude Code GitHub Actions — https://code.claude.com/docs/en/github-actions
11. Worktrees — https://code.claude.com/docs/en/worktrees
12. Settings and precedence — https://code.claude.com/docs/en/settings
13. Memory, CLAUDE.local.md — https://code.claude.com/docs/en/memory
14. Skills — https://code.claude.com/docs/en/skills
15. Subagents — https://code.claude.com/docs/en/sub-agents
16. Plugins, `--plugin-dir` — https://code.claude.com/docs/en/plugins
17. The Ralph Wiggum technique — https://github.com/ghuntley/how-to-ralph-wiggum
18. GitHub Spec Kit — https://github.com/github/spec-kit
19. Understanding Spec-Driven-Development: Kiro, spec-kit, and Tessl (Fowler) — https://www.alldevblogs.com/article/martin-fowler/understanding-spec-driven-development-kiro-spec-kit-and-tessl
