# VoidX

Open-source tracker for LP positions across protocols and chains. Web (SSR), iOS, iPadOS, macOS; Android after the MVP ([ADR 0056](docs/decisions/0056-android-after-the-mvp.md)).

The repo is docs-only until M0. No command below exists yet. To verify a doc change, run the [fluff test](docs/writing-docs.md#fluff-test) and check every link resolves. Do not create `package.json`, `mise.toml` or scripts; M0 has its own spec.

## Before you write code

- Before changing anything outside `docs/`, read [docs/architecture.md](docs/architecture.md).
- Run the research gate before the first code in an app, or before using a framework, library or platform API that has no file in `docs/research/<app>/` ([workflow](docs/workflow.md#research-gate), skill `research-app`). Skip it for doc edits, bug fixes and changes that follow existing patterns.
- Work that changes a public contract, adds a module or spans more than one workspace starts from an `approved` spec in `docs/specs/`. An integration uses its accepted `new-integration` issue plus the agent checkpoint as the spec. Other multi-file changes: put the plan in the PR description. Doc edits need no spec.
- Use the terms in [docs/glossary.md](docs/glossary.md), exactly.

## Commands (*planned*, arrive in M0)

| Task | Command |
|---|---|
| Install toolchains | `mise install` |
| Everything affected by your change | `bun run check --affected` |
| One workspace | `bun run check --filter=<workspace>` |
| Regenerate API, tokens, metadata | `bun run codegen` |
| Contract change end to end | `bun run api:sync` |
| Verify an integration | `bun run verify:protocol <family>` |

`check` = `codegen`, `typecheck`, `lint`, `test`, in every workspace including the native wrappers. Agents run `check --affected`; on failure read the log file whose path it prints, not the whole output. `api:sync` = `codegen` + the iOS client build + oasdiff, only for contract changes. Swift checks need macOS with Xcode; Android checks (after the MVP) need the Android SDK.

## Hard rules

Each rule names the check that enforces it. Until M0 no check runs; follow each rule yourself.

| Rule | Enforced by |
|---|---|
| Everything in the repo is English ([ADR 0052](docs/decisions/0052-docs-as-code.md)) | *convention* |
| `packages/core` imports nothing outside itself; integrations never import `infra` or each other; MIT code never imports AGPL code | dependency-cruiser |
| An integration PR edits only `integrations/**` and the app files the [promise](docs/concepts/integration-model.md#promise) allows; any other path fails | CI path scope (allowlist) |
| Gate and config paths change only with a maintainer review ([ADR 0036](docs/decisions/0036-integration-trust.md)) | CODEOWNERS |
| Snapshots, canaries and thresholds change only in a PR with the owner's label | baseline guard (*planned*) |
| No retries on PR runs; a flaky test goes to the nightly repeat run and gets an issue | CI check (*planned*) |
| Change generated files (`Generated/`, `openapi.json`, `openapi.*.json`, `*.schema.json`, `*.gen.*`) only by running `bun run codegen` | permission deny rules + CI drift check |
| An integration PR adds no dependency and leaves lockfiles unchanged | CI lockfile guard |
| Every number shown to users is derived on the server and clients only format it, because four clients must show identical values | golden formatting tests |
| Every address in `integrations/` has a source URL | `bun run voidx validate` |
| Every UI change passes the accessibility gates | per-app CI, see [ADR 0022](docs/decisions/0022-accessibility.md) |
| Animations use motion tokens and have a reduced-motion branch | lint + perf budgets, see [ADR 0023](docs/decisions/0023-motion.md) |
| When a test, accessibility or performance threshold fails, fix the code or stop and ask; keep the threshold | *convention* |
| Docs change with the code they describe | docs-lint (links, anchors, paths) |
| Docs pass the fluff test | *convention* |
| Plans and limits are decided on the server through the `Entitlements` port; clients never enforce ([plans](docs/concepts/plans-and-entitlements.md)) | entitlement matrix + concurrency tests |
| Server and worker rules | [apps/server/AGENTS.md](apps/server/AGENTS.md), [apps/worker/AGENTS.md](apps/worker/AGENTS.md), [resilience](docs/concepts/resilience.md), [feature flags](docs/concepts/feature-flags.md) |

## Stop and ask the owner (Maksim Romanov) when

- A contract address, start block, ABI or chain parameter is unknown: write `TODO` and stop.
- A change needs a new dependency, a core change or a new index source or staking plugin kind.
- A plan or spec your work depends on is not `approved`.
- Two docs disagree: quote both lines and ask.

## Git

- Commit only when asked, with `git commit -s` (DCO). Conventional commits. Credit AI with a trailer such as `Assisted-by: Claude Code`, never `Co-Authored-By` ([AI_POLICY.md](AI_POLICY.md)).
- Leave pushing and opening PRs to a person.

## Where things are

| Need | Go to |
|---|---|
| Why something is the way it is | [docs/decisions/](docs/decisions/) |
| Data rules, contract, integrations, states, caching, resilience, feature flags | [docs/concepts/](docs/concepts/) |
| How to add a chain or protocol | [integrations/AGENTS.md](integrations/AGENTS.md) |
| App specifics | `apps/<app>/AGENTS.md` and `apps/<app>/docs/` |
| How to write docs | [docs/writing-docs.md](docs/writing-docs.md) |
| Keeping agent context small | [docs/concepts/agent-context.md](docs/concepts/agent-context.md) |
| Order of work | [docs/roadmap.md](docs/roadmap.md) |
| Who decides | [GOVERNANCE.md](GOVERNANCE.md) |
