---
app: agent-tools
topic: Work decomposition for agents (owner-local)
checked: 2026-10-19
---

# Work decomposition for agents

Scope: how the roadmap is cut into iterations and steps that agents run unattended, with safe parallelism. Builds on [autonomy-loops](autonomy-loops.md) (launcher, `/goal`, Stop hook, worktrees, at most three at once). Nothing here binds contributors. Items marked *(own)* are my judgment, not a primary source.

## Decisions

Units
- We make one iteration = one roadmap milestone = one `approved` spec in `docs/specs/`, because the spec is already the single owner gate ([workflow](../../workflow.md)) and Claude's guidance is to hand a self-contained spec to a fresh session. A milestone whose spec would exceed about 30 steps is split into two specs by the owner (e.g. M1 data, M1 portfolio screen) before approval. [1][2]
- We cut each iteration into slices, each ending in a checkpoint that is demonstrable alone (Spec Kit: "story should work and be testable on its own"). A slice is vertical (one thin path through contracts, server, client) once the walking skeleton exists; M0 is the walking skeleton, so its slices are horizontal by necessity. [3] *(own for the slice rule; walking skeleton and tracer bullet are general practice, no primary source read)*
- We make one step = one fresh `claude -p` session, one workspace, one acceptance command. Targets *(own)*: at most about 5 owned files or about 400 changed lines, a command that finishes in under about 10 minutes, a diff describable in one sentence; bigger steps are split. Reason: Anthropic's harness works best at one feature per session, and METR measures the 80% reliability horizon well below the 50% one (up to 2x uncertainty), so plan for the shorter horizon. [1][2][5][6]
- We give every step a "Done when" line that is a command, never prose, and require printed output as evidence, because Codex's prompt template has the same field and Claude stops when work "looks done". [2][4]

Dependencies and scheduling
- We write dependencies as explicit `depends_on` step IDs and compute parallelism instead of hand-marking `[P]`. A step is parallel-safe with another iff both are ready, their `owns` globs are disjoint, and neither touches `packages/contracts` or `packages/core` while the other does. Spec Kit's `[P]` ("different files, no dependencies") is the same test written by hand; Kiro derives waves from the graph. [7][8]
- We pick the next step by: status `todo`, all `depends_on` `done`, workspace lock free, then highest remaining critical-path length (longest chain of dependants), then phase order below, then lowest ID. Cap: three concurrent steps, one per workspace. Waves are an output, not an input: Wave 1 is steps with no dependencies, later waves unlock as dependencies finish. [8] *(critical-path priority is general practice, not from a primary source)*
- We flip status only by the harness, never by the step's agent: the agent edits code, the launcher runs `done_when` and writes `passes`. Anthropic's feature list lets agents change only `passes`, in JSON because models edit it less readily than Markdown. [1]
- We keep a failing step at `blocked` after two fix rounds with a one-line reason in `.agent/progress/<slug>.md`, and the scheduler continues with independent steps. Dependants stay `todo`. [autonomy-loops](autonomy-loops.md)

Phase order inside an iteration (owner rule: core before UI)
- We order phases: 0 contracts and fixtures, 1 core/domain, 2 server and data, 3 client logic, 4 UI kit, 5 screens, 6 motion and polish, 7 audits and owner review. Phases 0 to 3 are the "core" of the iteration. One gate step `core-green` (depends on every step of phases 0 to 3, `done_when`: `bun run check --affected` plus the iteration's contract and data criteria) must be a `depends_on` of every step in phases 4 to 7. The launcher rejects a step list where a phase 4+ step lacks it. [1][3] *(the gate is own design)*
- We let client work start before server work by contract-first with a mock: once phase 0 emits `openapi.json`, `openapi.mock.json` and fixtures, generated clients, decode tests and client logic (phase 3) depend only on phase 0, not on phase 2, and run in parallel with it. The server proves it matches the same contract (contract tests). UI steps still wait for `core-green`. [3][9] *(mock-first is the repo's own ADR 0010/0048 approach; I found no primary source on it)*
- We treat design tokens and other generators with no domain input as phase 0 (data): they start in wave 1 and are not UI; the UI kit built on them is phase 4.
- We put motion tokens' use, reduced-motion branches, snapshot baselines and accessibility audits in phases 6 and 7, after screens work. The first snapshot baseline stays owner-reviewed ([autonomy-loops](autonomy-loops.md)).
- We write the failing test or fixture as the first commit of a step, then the code. [2][3]

Step template
- We use these fields, stored as JSON next to the spec (`docs/specs/<spec>.steps.json`, approved with the spec; open question on status). [1]

| Field | Meaning |
|---|---|
| `id` | `M0-S07`, never reused |
| `title`, `phase` | one line; 0 to 7 |
| `role` | `builder` or `verifier` (read-only, different session) |
| `workspace` | one of the monorepo workspaces; sets the lock |
| `owns` | globs the step may edit; anything else is a violation the Stop hook checks |
| `reads` | docs and files to load, no more (context budget) |
| `depends_on` | step IDs |
| `done_when` | one command, exit 0; plus the spec criterion it ticks |
| `owner_gate` | true if it needs a new dependency, `core`/`contracts` change, `TODO` address (stops with `BLOCKED`) |
| `status` | `todo`, `in_progress`, `done`, `blocked` (harness-written) |

- We forbid a step from editing a test, threshold or lint config it does not own, as in the Stop hook already specified. [1]

## M0 sketch (illustrative, from [m0-skeleton](../../specs/m0-skeleton.md))

| ID | Phase | Step (workspace) | depends_on |
|---|---|---|---|
| S01 | 0 | mise, Bun, Turbo, `check` task graph (root) | none |
| S02 | 0 | design-tokens source, Terrazzo, generators, contrast and spring tests (design-tokens) | S01 |
| S03 | 1 | core domain types and ports (core) | S01 |
| S04 | 0 | contracts: Zod, `openapi.json`, swift variant, fixtures, `openapi.mock.json` (contracts) | S03 |
| S05 | 0 | integration-kit schemas, `voidx validate`, Ethereum and Arbitrum chain files | S03 |
| S06 | 2 | server and worker `createRoot`, `/livez`, tests | S03 |
| S07 | 3 | lint, dependency-cruiser, Biome, license, lockfile gates with canaries (root) | S04, S05, S06 |
| S08 | 3 | agent output contract, `.logs/`, format hook (root) | S01 |
| S09 | 3 | `lint:docs`, REUSE (root) | S01 |
| S10 | 3 | Android SDK bootstrap script | S01 |
| S11 | 3 | iOS: Tuist project, modules, generated `APIClient`, decode of unknown enum | S04 |
| S12 | 3 | Android: Gradle plugins, modules, generated client, decode of unknown enum | S04, S10 |
| S13 | 3 | iOS gates: SwiftLint rules, motion regex, canaries | S11 |
| S14 | 3 | Android gates: ktlint, `:lint-rules`, Hilt check, module graph | S12 |
| G1 | gate | `core-green`: `bun run check` excluding UI-kit and e2e criteria | S02 to S14 |
| S15 | 4 | UI kit web CSS (server) | G1, S02 |
| S16 | 4 | UI kit iOS `DesignSystem` | G1, S02, S13 |
| S17 | 4 | UI kit Android `:core:designsystem` | G1, S02, S14 |
| S18 | 5 | placeholder screen on mock API, iOS | S16 |
| S19 | 5 | placeholder screen on mock API, Android | S17 |
| S20 | 5 | e2e harness: Prism script, Maestro flows, `route=gallery` | S18, S19 |
| S21 | 6 | motion: reduced-motion branches, spring settling checks, motion lint use | S16, S17 |
| S22 | 7 | accessibility gates on screens: audits, snapshots (owner approves baselines) | S18, S19, S21 |
| S23 | 7 | `ci.yml`, Renovate config, CI-time measurement (root, `.github/`) | S20, S22 |
| S24 | 7 | `spec-verifier` over all criteria | S23 |

- Waves: W1 S01. W2 S02, S03, S08, S09, S10 (disjoint workspaces; cap three at once, S03 first). W3 S04, S05, S06. W4 S07, S11, S12. W5 S13, S14. W6 G1. W7 S15 to S17. Then S18/S19, S20/S21, S22, S23, S24.
- Critical path: S01, S03, S04, S11, S13, G1, S16, S18, S20, S22, S23, S24. S02 and S10 are off it, so they fill idle slots.
- Parallel-unsafe pairs: S03 and S04 (both `packages/*` contracts/core); S11 and S12 are safe together (different workspaces) but share simulator and Gradle CPU.
- Owner gates inside M0: every library in the spec's Libraries table (S01, S07, S11, S12), first snapshot baselines (S22), CI secrets and runner choice (S23).
- CI is last here only for loop simplicity; drafting `ci.yml` earlier is possible but its only check is a real PR run, which stays owner-driven. *(own)*

## Facts that constrain us

- Spec Kit task line: `[ID] [P?] [Story] Description` with exact file path; phases Setup, Foundational (blocks all stories), one per story by priority, Polish; each story ends in a checkpoint; tests first when requested; plan files order contracts, then tests, then source. [3][7]
- Kiro: `tasks.md` becomes a dependency graph grouped into waves; waves run in sequence, tasks within a wave run concurrently. [8]
- Anthropic harness: features list with `category`, `description`, `steps`, `passes`; all start failing; one feature per session; `init.sh` plus a basic end-to-end test before new work; progress file plus git history bridge sessions. [1]
- Claude Code: context fill degrades performance; a fresh session executes a written spec; fix after two failed corrections in a clean session; `claude -p` loops with `--allowedTools` and `dontAsk` for batch work; reviewer in a fresh subagent should report only correctness or stated-requirement gaps. [2]
- Codex: prompts need goal, context, constraints and "Done when"; plan first when complex or ambiguous; no size threshold given; run parallel live tasks in separate worktrees; "fork only when the work truly branches". [4]
- METR: success near 100% under 4 minutes and under 10% over about 4 hours (Claude 3.7-era data); time horizons grow fast but the 2026 notes warn of wide intervals (about 2x either way, alternative fits move 80% horizons up to 100%). Task length is measured in human time, not agent tokens. [5][6]

## Open questions

- Where step status lives. Committed JSON gives history but churns on every step and weakens "docs change with code"; a gitignored `.agent/progress/` copy loses it on a fresh clone. The starting point is the step list committed, status gitignored.
- Whether the step list belongs in the committed spec format ([specs README](../../specs/README.md)) or stays owner-local; the first option needs a doc change, the second keeps the contributor path unchanged.
- The real size cutoffs (files, lines, minutes) are my estimate; calibrate on the first five M0 steps and record median turns and USD per step.
- Whether `claude -p` sessions in separate worktrees on a shared simulator or emulator collide (S11, S12, S20); may need a device lock.
- Codex and Cursor sizing guidance gave no thresholds; Kiro was read from its docs page only, not run.
- Walking skeleton, tracer bullet, vertical slicing and critical-path scheduling are cited from general practice; no primary source was read for them.

## Sources

1. Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
2. Best practices for Claude Code — https://code.claude.com/docs/en/best-practices
3. Spec-driven development (GitHub Spec Kit) — https://github.com/github/spec-kit/blob/main/spec-driven.md
4. Codex best practices (OpenAI) — https://learn.chatgpt.com/guides/best-practices
5. Measuring AI ability to complete long tasks (METR, 2025-03-19) — https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/
6. Impact of modelling assumptions on time horizon results (METR, 2026-03-20) — https://metr.org/notes/2026-03-20-impact-of-modelling-assumptions-on-time-horizon-results/
7. Spec Kit tasks template — https://raw.githubusercontent.com/github/spec-kit/main/templates/tasks-template.md
8. Kiro specs — https://kiro.dev/docs/specs/
9. Wire contract and mock decisions in this repo — [ADR 0010](../../decisions/0010-wire-contract.md), [ADR 0048](../../decisions/0048-e2e-testing.md)
