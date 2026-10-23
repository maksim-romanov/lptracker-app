---
status: draft
owner: Maksim Romanov
issue: none yet
---

# M0 · Repository skeleton

## Problem

The repo holds only docs. Every later milestone needs a working monorepo: pinned toolchains, one `check` command, CI that enforces the hard rules, empty but buildable apps, and the contract and token pipelines that the apps generate from.

## Scope

- Toolchains pinned in `mise.toml` + `mise.lock`; Bun workspaces; Turborepo task graph `codegen → typecheck · lint · test → check`. Step M0-S01 installs every npm package and mise tool in [Libraries](#libraries); no later step changes `bun.lock`, `mise.toml` or `mise.lock`.
- Workspaces: see [Modules](#modules).
- `packages/core`: domain types and the [ports](#ports), no implementations; subpath exports `./domain`, `./ports`, `./use-cases`.
- `packages/contracts`: draft Zod schemas for the wire contract, `openapi.json` generated with sorted keys, derived `openapi.swift.json` (open enums as `anyOf`), golden fixtures incl. `*.unknown.json`, `openapi.mock.json` with named examples for Prism ([0048](../decisions/0048-e2e-testing.md)).
- `packages/integration-kit`: JSON Schemas for chain, manifest, deployment and quality files in `schemas/`, generated from its Zod schemas and versioned with `kitApiVersion`; CI validates every file; editor mappings. Its `PositionIndex` sources read through `ChainReader` and `IndexTransport` only. Compile-only `uniswap-v3` and `uniswap-v4` adapter stubs in its tests `satisfies ProtocolAdapter`.
- `packages/design-tokens`: DTCG 2025.10 source with one resolver for light/dark and full/reduced motion (colour with the default scheme, type, spacing, radius, and every motion token in [0023](../decisions/0023-motion.md) with its `reduced` value; [0027](../decisions/0027-design-tokens.md)) → CSS + Tailwind `@theme`, Swift + `.xcassets` (the plugin keeps a seam for Compose, [0056](../decisions/0056-android-after-the-mvp.md)), all written under `packages/design-tokens/Generated/` so the deny rules in `.claude/settings.json` cover them; WCAG contrast test; spring settling-time test. SVG icons arrive in M1.
- UI kit v0 on iOS ([0055](../decisions/0055-ghost-design-language.md)): the status chip, the static range bar and a card shell with the four fills and ink chosen per fill, in `DesignSystem`, built only from generated tokens; the card face and the Cards/Rows switch wait for the D0 prototype ([roadmap](../roadmap.md)). The iOS placeholder screen uses only these. A lint rule fails on a literal colour, font size or spacing outside `Generated/` in Swift and in CSS.
- Server and worker: a Hono app with `/livez`, a worker entry, each with `createRoot(config, overrides)` and one test. No database yet.
- iOS: Tuist project, multiplatform app (iPhone, iPad, Mac) + widget extension stub, module targets, `APIClient` generated from `openapi.swift.json`, one SwiftUI screen on the mock API; the [0022](../decisions/0022-accessibility.md) gates on it: an XCUITest with `performAccessibilityAudit()` on iPhone, iPad and Mac, snapshots at default and AX5 text sizes in light, dark and RTL, SwiftLint strict with accessibility rules and the [0023](../decisions/0023-motion.md) regex against literal motion values ([ios-app/skeleton](../research/ios-app/skeleton.md)). The app and widget declare no entitlements.
- iOS toolchain file `apps/ios-app/toolchain.json`: exact Xcode build, iOS simulator runtime, iPhone and iPad device names and the `xcodebuild` destinations. The check wrapper and `ci.yml` read only this file; its values are `TODO (owner)` until the owner fills them.
- iOS checks by place: a local agent `check` runs the iPhone and iPad simulator tests and the macOS build and unit tests. The Mac UI audit runs in the CI `ios` job and in `bun run check:mac-ui` (owner-run), because XCUITest on macOS needs a one-time permission. Swift codegen and its drift check run only in the `ios` job and on macOS.
- E2E harness ([0048](../decisions/0048-e2e-testing.md)): `e2e/` with `config.yaml`, `flows/portfolio-smoke.yaml`, `subflows/`; Debug-only launch arguments `apiBase`, `scenario` and `route` on the iOS app (they replace the `VOIDX_API` environment key), with `route=gallery` opening a Debug-only screen that renders the UI kit in every fixture state; a script that fixes simulator state before a run (status bar, appearance, text size) ([native research](../research/repo/native-agent-verification.md)); `bun run e2e --platform ios` starts Prism and runs `maestro test --include-tags smoke --format junit`.
- Agent QA ([workflow](../workflow.md#iterations-and-steps)): the screenshot review rubric in `docs/design/book/rubric.md` (owner-approved), the report validator `bun run qa:validate`, and one agent QA pass that drives the iOS app on the simulator on fixture data and writes findings to `.artifacts/agent-qa/` (gitignored).
- [Step verification](#step-verification) and [canaries](#canaries) as below.
- Quality gates:
  - Lint rules from [code style](../concepts/code-style.md) at `error`: the Biome and SwiftLint (including the custom regex rules) ids listed there.
  - Biome, with a11y rules as errors (a canary proves they fire on Hono JSX), GritQL plugins against literal motion values in CSS ([research](../research/server/modern-css-and-view-transitions.md)), `z.enum` in `packages/contracts` wire fields, and decorators or `reflect-metadata` in `packages/` ([packages/AGENTS.md](../../packages/AGENTS.md)); banned globals in `integrations/` and `packages/integration-kit`, and CI fails on any `biome-ignore` under `integrations/` ([0049](../decisions/0049-typescript-toolchain.md)). MIT workspaces set `types: []`.
  - dependency-cruiser: layer rules, MIT never imports AGPL with `tools/` on the AGPL side ([0053](../decisions/0053-developer-cli.md)), only `src/root.ts` imports `infra` in the apps, `core` subpath exports only.
  - `reuse lint`, dependency license gate, lockfile guard, codegen drift check, DCO (a script in `guard` that fails on a PR commit without `Signed-off-by:`, [0016](../decisions/0016-licensing-and-dco.md)).
  - Integration path scope as an allowlist: an integration PR (any PR whose diff touches `integrations/`) may touch only `integrations/**` and the app files the [promise](../concepts/integration-model.md#promise) allows, listed in `scripts/guard/integration-allowlist.json` ([0036](../decisions/0036-integration-trust.md)).
  - Baseline guard: `guard` fails a PR that changes a snapshot (`__Snapshots__/`, matched case-insensitively), a canary or a threshold file listed in `scripts/guard/protected-paths.json` unless the PR has the `owner-approved` label. Snapshot tests use record mode `.never` in CI and when `CLAUDECODE=1` or `AGENT=1`; only `bun run snapshots:record` records.
  - `bun run guard --workflows` fails when a workflow uses an action not pinned by full SHA, grants more than `contents: read`, or retries a test on `pull_request` (no flaky retries on PR runs); `bun run guard --codeowners` fails when a path in `scripts/guard/protected-paths.json` has no `.github/CODEOWNERS` entry.
  - `bun run lint:docs`: lychee, markdownlint-cli2, a check that every path in an `AGENTS.md` exists, and a check that every `.agents/skills/<name>` has its `.claude/skills/<name>` link ([0052](../decisions/0052-docs-as-code.md)).
- CI: one `ci.yml` on `pull_request` and `push` to `main` only, `permissions: contents: read`, every action pinned by SHA ([ci](../research/repo/ci.md)); jobs `changes`, `guard`, `check` Linux, `ios` macOS with a Maestro smoke step, `ci-ok`. Maestro runs with analytics, update check and AI notice off. `.github/CODEOWNERS` requires the owner's review on the gate and config paths in [0036](../decisions/0036-integration-trust.md), including `.github/`, `.claude/`, `**/canaries/**`, `apps/ios-app/Canaries/**`, `apps/ios-app/.swiftlint.yml` and `apps/ios-app/toolchain.json`. Renovate config with `minimumReleaseAge` 7 days. Issue forms `new-integration.yml` (the fields in [add a protocol](../guides/add-a-protocol.md#1-issue)) and `task.yml`, and a PR template that asks for the source of every address ([ADR 0024](../decisions/0024-agent-setup-and-ai-policy.md)).
- `bun run format <files>`: Biome for TS, JSON and CSS, swift-format for Swift. A `.claude/` `PostToolUse` hook on `Edit|Write` formats the edited file and prints nothing on success ([setup notes](../research/claude-code/setup-notes.md)). The hook command in `.claude/settings.json` calls the mise-pinned binaries (`mise exec -- biome format --write`, `xcrun swift-format format -i`, `jq` for the path) directly, never a repo script, because an agent can edit a script.
- Agent output contract: with `CLAUDECODE=1` or `AGENT=1`, `check` prints only failures (Turbo `--output-logs=errors-only`, `xcodebuild -quiet`) and writes the full log to `.logs/` (gitignored, readable by agents unlike `build/` and `.turbo/`), printing the path; lint warnings fail the build; hooks print nothing on success ([token efficiency](../research/claude-code/token-efficiency-practice.md)).

## Out of scope

Database, Redis, real RPC reads, any protocol family, auth, push, flags evaluation, deployment, release automation, remote Turbo cache, cloud-agent setup ([Owner decisions](#owner-decisions), #7), web pages and their Playwright, axe, html-validate and Lighthouse gates (M1). Moved to M1b: the web UI kit v0 (CSS chip, range bar, card shell), the Debug-only web gallery page and the agent QA pass in a browser, because M0 has no Tailwind dependency and no web-stack research.

## Contract changes

First draft of `/api/v1` schemas and `openapi.json`; nothing is frozen until M4a.

## Ports

Types only in M0, in `packages/core/ports`. Every port method takes a last argument `signal: AbortSignal`, taken from the request's `Deadline`, and throws `PortError` with an open uppercase `code` ([0039](../decisions/0039-error-model.md)). `BlockRef` is `{ number: bigint; hash: Hex }`.

| Port | Owning doc | Signature |
|---|---|---|
| `ChainReader` | [providers-and-cache](../concepts/providers-and-cache.md) | `call(req: { to: Address; data: Hex; blockHash: Hex }, signal): Promise<Hex>`; `multicall(calls: readonly Call[], at: { blockHash: Hex }, signal): Promise<CallResult[]>`; `getLogs(filter: { address: Address; topics: readonly (Hex \| null)[]; fromBlock: bigint; toBlock: bigint }, signal): Promise<Log[]>`; `head(tag: "latest" \| "safe" \| "finalized", signal): Promise<BlockRef>` |
| `IndexTransport` | [integration-model](../concepts/integration-model.md#index-sources) | `query(source: IndexSourceId, request: { query: string; variables: Readonly<Record<string, unknown>> }, signal): Promise<unknown>`; the kit's subgraph sources call it, never `fetch` |
| `PositionIndex` | [0008](../decisions/0008-pluggable-discovery.md) | `refs(owners: readonly Address[], signal): Promise<{ refs: PositionRef[]; indexBlock: bigint }>` |
| `ProtocolAdapter` | [integration-model](../concepts/integration-model.md#adapter) | `discover(ctx: AdapterContext, owners: readonly Address[], signal): Promise<PositionRef[]>`; `snapshot(ctx: AdapterContext, refs: readonly PositionRef[], signal): Promise<SnapshotResult>` |
| `AdapterContext` | [0036](../decisions/0036-integration-trust.md) | `{ readBlock: BlockRef; chain: PinnedChainReader; index: readonly PositionIndex[]; staking: StakingPlugin; logger: Logger; clock: Clock }`; `PinnedChainReader` is `ChainReader` without `head` and with every block argument fixed to `readBlock` |
| `Cache` | [providers-and-cache](../concepts/providers-and-cache.md#cache) | `get<T>(key: CacheKey, signal): Promise<T \| undefined>`; `set<T>(key: CacheKey, value: T, ttlMs: number, signal): Promise<void>` |
| `EventBus` | [providers-and-cache](../concepts/providers-and-cache.md#cache) | `publish(topic: Topic, event: BusEvent, signal): Promise<void>`; `subscribe(topic: Topic, handler: (event: BusEvent) => void, signal): Promise<void>`, which unsubscribes when `signal` aborts |
| `Deadline` | [resilience](../concepts/resilience.md#deadlines) | `{ signal: AbortSignal; remainingMs(): number; child(timeoutMs: number): Deadline }` |
| `Entitlements` | [plans-and-entitlements](../concepts/plans-and-entitlements.md) | `value(subject: Subject, key: EntitlementKey, signal): Promise<EntitlementValue>` |

## Step verification

- `bun run step:verify <id>` is real from M0-S01, never a stub. It passes only when at least one test named `<id>: …` or one canary with `"step": "<id>"` exists, every such test ran and passed, and every such canary failed as declared. It fails on zero matches and on a skipped test. TS tests run through `bun test --test-name-pattern`; Swift test names come from the `.xcresult` the iOS check wrapper writes to `.logs/`.
- Every step's `done_when` ends with `bun run step:verify <id>`, except M0-S15, M0-S26, M0-S27, M0-S28 and the gates, which name a command that fails until their work exists.

## Canaries

- A canary is a folder under `canaries/<tool>/` or `apps/ios-app/Canaries/<tool>/` with a `canary.json`: `{ "tool": "dependency-cruiser", "rule": "no-integrations-to-infra", "path": "canaries/dependency-cruiser/integrations-to-infra/index.ts", "step": "M0-S08", "platform": "linux" }`. `platform` is `linux` or `ios`.
- `bun run gates:canaries` discovers every `canary.json` by that folder convention, runs `tool` on `path`, and passes a canary only when the tool fails and its output names `rule`. It fails on zero canaries for its filter, a missing field, a missing `path` and a canary that passes.
- Normal lint, typecheck and test runs exclude canary folders. CI runs `bun run gates:canaries --platform linux` in `check` and `--platform ios` in `ios` on every run.

## Modules

| Workspace | Package | License | M0 content |
|---|---|---|---|
| `apps/server` | `@voidx/server` | AGPL | Hono app, `/livez`, `createRoot`, test |
| `apps/worker` | `@voidx/worker` | AGPL | entry, `createRoot`, test |
| `apps/ios-app` | `@voidx/ios` (wrapper) | AGPL + exception | Tuist targets as in [ios-app/skeleton](../research/ios-app/skeleton.md), app and widget stubs |
| `apps/android-app` | — | — | `AGENTS.md` only; Android follows the MVP ([0056](../decisions/0056-android-after-the-mvp.md)) |
| `packages/core` | `@voidx/core` | MIT | domain types, ports |
| `packages/contracts` | `@voidx/contracts` | MIT | Zod schemas, `openapi.json`, fixtures, mock |
| `packages/integration-kit` | `@voidx/integration-kit` | MIT | `defineProtocol` type, `PositionIndex` sources, schemas for integration files, adapter stubs |
| `packages/infra` | `@voidx/infra` | AGPL | empty port folders |
| `packages/design-tokens` | `@voidx/design-tokens` | MIT | tokens + generators + contrast test |
| `integrations` | `@voidx/integrations` | MIT | `chains/` for Ethereum and Arbitrum, the M1a chains (no protocols); `priceIds` optional in the M0 schema, filled in M3.5 |
| `tools/voidx-cli` | `@voidx/cli` | AGPL | `validate` command only |
| `e2e` | — (flows, not a package) | MIT | Maestro config, smoke flow, subflows |

## Libraries

Approving this spec approves every row of this table. Versions are exact and pinned in `mise.toml` or the Bun catalog; SPM packages in `apps/ios-app/Tuist/Package.swift`. A `TODO (owner)` version is filled by the owner before approval.

| Area | Choice | Version | Why |
|---|---|---|---|
| Runtime, workspaces, tests | Bun | 1.4.2 | [monorepo-toolchain](../research/repo/monorepo-toolchain.md) |
| Task graph | Turborepo | TODO (owner) | reads Bun lockfile v2 |
| Toolchains | mise + `mise.lock`; jq (format hook) | TODO (owner) / TODO (owner) | one source for laptops and CI |
| Types | TypeScript 7 (`tsc`) + `@typescript/typescript6` aliased for dependency-cruiser | 7.0.2 / TODO (owner) | TS 7 has no API before 7.1 |
| Tests | fast-check (TS property tests) | TODO (owner) | [code style](../concepts/code-style.md) |
| Lint + format | Biome, in `mise.toml` | TODO (owner) | one tool; a11y rules; banned globals via `noRestrictedGlobals` + GritQL |
| Boundaries | dependency-cruiser | 18.5.0 | layer and MIT/AGPL rules |
| HTTP + OpenAPI | Hono, `@hono/zod-openapi`, Zod 4 | TODO (owner) / 1.6.3 / TODO (owner) | ADR 0010 |
| Breaking changes | oasdiff | 1.32.1 | ADR 0010 |
| Mock API | Prism (static + seeded fuzz) | 5.16.0 | apps work without a backend |
| Tokens | Terrazzo: `@terrazzo/cli`, `@terrazzo/parser`, `@terrazzo/plugin-css`, `@terrazzo/plugin-tailwind`; own `voidx-native` plugin | 2.7.1 | DTCG 2025.10 with the resolver; [token-pipeline](../research/repo/token-pipeline.md) |
| Colour and contrast | Color.js (`colorjs.io`), declared directly in the range Terrazzo's parser uses, so the lockfile holds one copy | ^0.7.1 (range by design) | OKLCH in sRGB gamut, WCAG 2.2 contrast; [colour-and-contrast](../research/repo/colour-and-contrast.md) |
| Licenses | `reuse` tool, `bun pm licenses` script | TODO (owner) | ADR 0016 |
| Docs | lychee, markdownlint-cli2 | 0.24.2 / 0.23.3 | links incl. anchors; structure |
| Renovate config check | `renovate` (`renovate-config-validator`) | TODO (owner) | validates `renovate.json` offline |
| iOS tools | Tuist, swift-openapi-generator (CLI via mise), swift-format (from the pinned Xcode), SwiftLint, swift-snapshot-testing | 4.210.0 / 1.13.1 / Xcode / 0.65.1 / 1.19.0 | [ios-app/skeleton](../research/ios-app/skeleton.md) |
| iOS SPM | swift-dependencies, swift-sharing, swift-openapi-runtime, swift-openapi-urlsession | TODO (owner) each | [ios-app/skeleton](../research/ios-app/skeleton.md) |
| E2E | Maestro CLI (via mise; Java 17+, Temurin 21) | 2.11.0 / Temurin TODO (owner) | [e2e-testing](../research/repo/e2e-testing.md) |
| CI | `jdx/mise-action`, `fsfe/reuse-action`, `actions/checkout` (SHA-pinned); Renovate app | SHAs TODO (owner) | [ci](../research/repo/ci.md) |

## Acceptance criteria

Owner-run criteria need the public repo and a real PR; agents list them as `owner-run` instead of running them.

Setup and build:

- [ ] `mise install` then `bun install --frozen-lockfile` on a clean macOS machine succeed with `MISE_LOCKED=1`.
- [ ] M0-S01 installs every npm package and mise tool in the Libraries table; no later step's diff touches `bun.lock`, `mise.toml` or `mise.lock`.
- [ ] Root scripts `codegen`, `gates:canaries`, `guard`, `lint:docs`, `voidx`, `e2e`, `qa:validate`, `format`, `check:mac-ui` and `snapshots:record` exist and exit 0 until their step fills them; `step:verify` fails on an id with no tests or canaries.
- [ ] `bun run check` passes on macOS; `bun run check --filter='!@voidx/ios'` passes on Linux.
- [ ] `bun run codegen --filter='!@voidx/ios' && git diff --exit-code` shows no changes on Linux, and `bun run codegen && git diff --exit-code` shows none on macOS.
- [ ] With `CLAUDECODE=1`, `bun run check` prints nothing on success; on a failing canary it prints only the failure and the path of the full log.

Contract and integrations:

- [ ] `oasdiff breaking` fails between `openapi.json` and a copy with one field removed.
- [ ] A fixture with an unknown enum value decodes in `bun run check --filter=@voidx/contracts`, and `--filter=@voidx/ios`.
- [ ] `bun run e2e` starts Prism on `openapi.mock.json`, and `GET /livez` on the server returns 200 in its test.
- [ ] `bun run voidx validate` passes on `integrations/chains/*` and fails on a canary chain file with a misspelled key and on one with an address without a source URL.
- [ ] Every method of every port in [Ports](#ports) takes an `AbortSignal`; the `uniswap-v3` and `uniswap-v4` adapter stubs typecheck with `satisfies ProtocolAdapter`, and a canary stub without `snapshot` fails `tsc` with `TS1360`.

Gates (every canary is excluded from the normal run):

- [ ] `bun run gates:canaries` fails on a canary folder without `canary.json` fields, on a canary whose tool passes, and on a filter that matches no canary.
- [ ] dependency-cruiser fails on canary imports from `integrations/` into `packages/infra`, from a server route into `infra`, and into a non-exported `core` path.
- [ ] Biome fails on a canary `fetch` in `integrations/` and in `packages/integration-kit`, a `z.enum` wire field in `packages/contracts`, a decorator in `packages/`, and an `<img>` without `alt` in Hono JSX; CI fails on a canary `biome-ignore` under `integrations/`.
- [ ] A canary literal colour fails lint in Swift and CSS.
- [ ] A canary file per language breaking one code-style rule fails: a floating promise and a default export in TS, `ObservableObject` and `DispatchQueue` in Swift.
- [ ] A canary literal duration fails lint in each place: `.animation(.easeIn(duration: 0.3))` in Swift, `transition: opacity 300ms` in CSS.
- [ ] A canary unlabeled button fails `performAccessibilityAudit()`; a canary label truncated at AX5 fails its snapshot.
- [ ] The license gate fails on a canary GPL dependency in an MIT package.
- [ ] `reuse lint`, the license gate and `bun run lint:docs` (offline) pass; `lint:docs` fails on a canary `AGENTS.md` path that does not exist and on a skill without its `.claude/skills/` link.
- [ ] The format hook, fed the hook JSON for a misformatted canary `.ts` and `.swift` file, formats each, exits 0 and prints nothing; its command calls `mise exec` and `xcrun` binaries, not a repo script.
- [ ] `guard --self-test` fails: a commit without `Signed-off-by:`; a lockfile change under an integration-only diff; an integration diff with a path outside the allowlist; a snapshot, canary or protected threshold change without the `owner-approved` label.
- [ ] `guard --workflows` fails on canary workflows with an action pinned by tag, with `permissions: write-all`, and with a test retry on `pull_request`.

Tokens:

- [ ] Every colour token is inside the sRGB gamut, and the contrast test passes for every token pair in light and dark.
- [ ] The settling time of each spring on iOS is within 5% of its web `linear()` duration; every motion token has a value in the `reduced` context, `stagger` is 0 there and every reduced spring has bounce 0.

Apps:

- [ ] iOS: `tuist install && tuist generate --no-open` and `tuist inspect dependencies --only implicit` pass; `git ls-files apps/ios-app | grep -c '\.entitlements$'` prints 0.
- [ ] `bun run check --filter=@voidx/ios` reads `apps/ios-app/toolchain.json`, fails early on another Xcode build, runs the tests on the iPhone and iPad simulators and the macOS build and unit tests; `xcodebuild build -scheme VoidXWidgets` passes for iOS and macOS.
- [ ] `bun run check:mac-ui` runs the Mac UI audit (owner-run).
- [ ] With `CI`, `CLAUDECODE=1` or `AGENT=1` set, a missing snapshot fails instead of recording; `bun run snapshots:record` records.
- [ ] `git grep -l xyz.depthly.voidx apps/` lists only the Tuist constant file.
- [ ] `bun run e2e` passes the smoke flow on the iPhone simulator; a canary flow asserting a removed id fails.
- [ ] Launching the iOS app with `route=gallery` shows the gallery, and the Maestro smoke flow asserts one id from it; a Release build ignores `route`.
- [ ] `bun run qa:validate .artifacts/agent-qa/m0-skeleton.json` passes on the agent QA report and fails on a report missing a rubric item.

CI:

- [ ] `ci.yml` runs `gates:canaries --platform linux` in `check`, `--platform ios` and the Swift codegen drift check in `ios`, and reads Xcode and destinations only from `apps/ios-app/toolchain.json`; `guard --workflows` passes on it.
- [ ] `.github/CODEOWNERS` covers every gate and config path named in [Scope](#scope): `bun run guard --codeowners` passes, and `guard --self-test` fails on a protected path missing from it.
- [ ] A PR touching only `docs/` runs `changes`, `guard` and `ci-ok`, and skips `check` and `ios`; `ci-ok` is the single required check (owner-run).
- [ ] A PR commit without `Signed-off-by:` fails `guard`; a PR adding a lockfile change under an integration-only diff fails `guard`; a PR touching `integrations/` and `packages/core/` fails `guard` (owner-run).
- [ ] `renovate-config-validator` passes on the Renovate config.
- [ ] The measured `ios` job time on the M0 PR is recorded in [ci](../research/repo/ci.md) (owner-run).
- [ ] Every item in [CI settings](#ci-settings-owner-run) is set (owner-run).

## CI settings (owner-run)

- [ ] Ruleset on `main`: `ci-ok` required, pull request required, code-owner review required.
- [ ] Approvals dismissed on a new push; the last push needs approval from someone other than its author.
- [ ] Actions must be pinned to a full-length commit SHA (repository setting).
- [ ] Default `GITHUB_TOKEN` permission read-only; workflows from fork PRs need approval.
- [ ] Label `owner-approved` exists and only the owner applies it.

## Doc updates this milestone makes

- `REUSE.toml`: root config files and `.github/**` annotated; `precedence = "closest"` for files with their own license header.
- `.gitignore`: `.artifacts/`, `.logs/`.
- `AGENTS.md`: `check` split by OS in CI; commands stop being *planned* once they exist; a flake policy line that bans test retries on PR runs (`guard --workflows`); the rest of the policy is the owner's.

## Owner decisions

| # | Question | Decision |
|---|---|---|
| 1 | Xcode | Xcode 27 locally and in CI: the `xcode-27` image while it is in preview, then `macos-26` once it ships Xcode 27; `compatibleXcodeVersions` in `Tuist.swift` |
| 2 | iOS `Domain` | Tuist target like every other module; tests run through `xcodebuild` on macOS |
| 3 | macOS runner | Kept: the repo is public from the start, so GitHub-hosted macOS runners are free; the `ios` job runs only when iOS or its inputs change |
| 4 | Bundle ids | `xyz.depthly.voidx` (working value) from one Tuist constant; frozen before M4a ([0044](../decisions/0044-domain-as-configuration.md)) |
| 5 | JDK | Temurin 21 |
| 6 | Widgets | Empty iOS widget extension in M0; UI in M6 |
| 7 | Cloud agents | Local agents only in M0; cloud setup gets its own research later |
| 8 | CLI | `tools/voidx-cli`, AGPL, may use `integration-kit` and `infra` |
| 9 | Problem type URIs | Built from `publicOrigin` (`https://voidx.depthly.xyz/problems/plan-limit` on the official instance); clients use `code` ([0044](../decisions/0044-domain-as-configuration.md)) |
| 10 | Colour | OKLCH within the sRGB gamut; contrast by Color.js against WCAG 2.2 only, no APCA ([colour-and-contrast](../research/repo/colour-and-contrast.md)) |
| 11 | Token tool | Terrazzo for parsing and web output, own `voidx-native` plugin for Swift, `.xcassets` and spring CSS (Compose later); replaces Style Dictionary ([token-pipeline](../research/repo/token-pipeline.md)) |
| 12 | Exact Xcode build, iOS runtime, device names | TODO (owner), in `apps/ios-app/toolchain.json` |
| 13 | Library versions marked `TODO (owner)` | TODO (owner) |
| 14 | Split M0 into M0a (repo, tokens, contracts, kit, gates, CI) and M0b (iOS, UI kit, e2e, QA) | TODO (owner) |
| 15 | Loop budget for M0 | TODO (owner) |
| 16 | Chain files: Ethereum `publicRpcs: []`, nullable `logo` in the M0 schema, Multicall3 codehash check in M0-S06 | TODO (owner) |

## Research

- [repo/monorepo-toolchain](../research/repo/monorepo-toolchain.md)
- [repo/ts-quality-gates](../research/repo/ts-quality-gates.md)
- [repo/ci](../research/repo/ci.md)
- [repo/contracts-and-tokens](../research/repo/contracts-and-tokens.md)
- [ios-app/skeleton](../research/ios-app/skeleton.md)
- [repo/e2e-testing](../research/repo/e2e-testing.md)
- [repo/native-ui-tests](../research/repo/native-ui-tests.md), [repo/native-agent-verification](../research/repo/native-agent-verification.md)
- [repo/token-pipeline](../research/repo/token-pipeline.md)
- [repo/colour-and-contrast](../research/repo/colour-and-contrast.md)
- [ios-app/motion](../research/ios-app/motion.md)
- [claude-code/setup-notes](../research/claude-code/setup-notes.md), [claude-code/token-efficiency-practice](../research/claude-code/token-efficiency-practice.md)
