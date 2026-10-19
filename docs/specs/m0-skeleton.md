---
status: draft
owner: Maksim Romanov
issue: none yet
---

# M0 · Repository skeleton

## Problem

The repo holds only docs. Every later milestone needs a working monorepo: pinned toolchains, one `check` command, CI that enforces the hard rules, empty but buildable apps, and the contract and token pipelines that the apps generate from.

## Scope

- Toolchains pinned in `mise.toml` + `mise.lock`; Bun workspaces; Turborepo task graph `codegen → typecheck · lint · test → check`.
- Workspaces: see [Modules](#modules).
- `packages/core`: domain types and port interfaces from the concepts docs, no implementations; subpath exports `./domain`, `./ports`, `./use-cases`.
- `packages/contracts`: draft Zod schemas for the wire contract, `openapi.json` generated with sorted keys, derived `openapi.swift.json` (open enums as `anyOf`), golden fixtures incl. `*.unknown.json`, `openapi.mock.json` with named examples for Prism ([0048](../decisions/0048-e2e-testing.md)).
- `packages/integration-kit`: JSON Schemas for chain, manifest, deployment and quality files in `schemas/`, generated from its Zod schemas and versioned with `kitApiVersion`; CI validates every file; editor mappings.
- `packages/design-tokens`: DTCG 2025.10 source with one resolver for light/dark and full/reduced motion (colour with the default scheme, type, spacing, radius, and every motion token in [0023](../decisions/0023-motion.md) with its `reduced` value; [0027](../decisions/0027-design-tokens.md)) → CSS + Tailwind `@theme`, Swift + `.xcassets`, Compose, all written under `Generated/` so the deny rules in `.claude/settings.json` cover them; WCAG contrast test; spring settling-time test. SVG icons arrive in M1.
- UI kit v0 ([0055](../decisions/0055-ghost-design-language.md)): the Ghost position card (four fills, ink per fill), range bar, status chip and the Cards/Rows view switch, in `DesignSystem` (iOS), `:core:designsystem` (Android) and the web CSS, built only from generated tokens; the native placeholder screens use only these, and a lint rule fails on a literal colour, font size or spacing outside `Generated/` on every client.
- Server and worker: a Hono app with `/livez`, a worker entry, each with `createRoot(config, overrides)` and one test. No database yet.
- iOS: Tuist project, multiplatform app (iPhone, iPad, Mac) + widget extension stub, module targets, generated `APIClient`, one SwiftUI screen on the mock API; the [0022](../decisions/0022-accessibility.md) gates on it: an XCUITest with `performAccessibilityAudit()` on iPhone, iPad and Mac, snapshots at default and AX5 text sizes in light, dark and RTL, SwiftLint strict with accessibility rules and the [0023](../decisions/0023-motion.md) regex against literal motion values ([ios-app/skeleton](../research/ios-app/skeleton.md)).
- Android SDK: `apps/android-app/sdk-packages.txt` and one script that installs it with `sdkmanager` from mise `android-sdk` ([Libraries](#libraries)), run the same way on laptops, agents and CI; it requires `VOIDX_ACCEPT_ANDROID_SDK_LICENSES=1` (a repository variable in CI) and commits no licence files ([sdk-bootstrap](../research/android-app/sdk-bootstrap.md)).
- Android: Gradle convention plugins, module map with stubs, generated `:core:network` client, one Compose screen on the mock API; the [0022](../decisions/0022-accessibility.md) gates on it: Roborazzi at font scale 1.0, 1.5 and 2.0 in light, dark and RTL with `-Proborazzi.dumpUiTree=true`, Lint accessibility rules and compose-lints as errors, a `:lint-rules` module with the [0020](../decisions/0020-android-stack.md) custom rules for literal animation values (outside `Generated/` and the motion helper in `:core:designsystem`) and missing content descriptions, an instrumented test with `enableAccessibilityChecks()` on the emulator, and the module-graph assertion from [0020](../decisions/0020-android-stack.md).
- E2E harness ([0048](../decisions/0048-e2e-testing.md)): `e2e/` with `config.yaml`, `flows/portfolio-smoke.yaml`, `subflows/`; Debug-only launch arguments `apiBase`, `scenario` and `route` on both apps (they replace the `VOIDX_API` environment key), with `route=gallery` opening a Debug-only screen that renders the UI kit in every fixture state; a script that fixes simulator and emulator state before a run (status bar, appearance, text size, font scale) ([native research](../research/repo/native-agent-verification.md)); `bun run e2e --platform ios|android` starts Prism and runs `maestro test --include-tags smoke --format junit`.
- Quality gates:
  - Lint rules from [code style](../concepts/code-style.md) at `error`: the Biome, SwiftLint (including the custom regex rules), ktlint and compose-lints ids listed there.
  - Biome, with a11y rules as errors (a canary proves they fire on Hono JSX), GritQL plugins against literal motion values in CSS ([research](../research/server/modern-css-and-view-transitions.md)), `z.enum` in `packages/contracts` wire fields, and decorators or `reflect-metadata` in `packages/` ([packages/AGENTS.md](../../packages/AGENTS.md)); banned globals in `integrations/`, and CI fails on any `biome-ignore` under `integrations/` ([0049](../decisions/0049-typescript-toolchain.md)). MIT workspaces set `types: []`.
  - dependency-cruiser: layer rules, MIT never imports AGPL with `tools/` on the AGPL side ([0053](../decisions/0053-developer-cli.md)), only `src/root.ts` imports `infra` in the apps, `core` subpath exports only.
  - Gradle: a check that fails if any Hilt artifact resolves.
  - `reuse lint`, dependency license gate, lockfile guard, codegen drift check, integration path scope (an integration PR is any PR whose diff touches `integrations/`), DCO (a script in `guard` that fails on a PR commit without `Signed-off-by:`, [0016](../decisions/0016-licensing-and-dco.md)).
  - `bun run lint:docs`: lychee, markdownlint-cli2, a check that every path in an `AGENTS.md` exists, and a check that every `.agents/skills/<name>` has its `.claude/skills/<name>` link ([0052](../decisions/0052-docs-as-code.md)).
- CI: one `ci.yml` on `pull_request` and `push` to `main` only, `permissions: contents: read`, every action pinned by SHA ([ci](../research/repo/ci.md)); jobs `changes`, `guard`, `check` Linux, `ios` macOS with a Maestro smoke step, `android` Linux, `e2e-android` Linux with KVM running `connectedDebugAndroidTest` and the Maestro smoke, `ci-ok`. Maestro runs with analytics, update check and AI notice off. Renovate config with `minimumReleaseAge` 7 days.
- `bun run format <files>`: Biome for TS, JSON and CSS, swift-format for Swift, ktlint for Kotlin. A `.claude/` `PostToolUse` hook on `Edit|Write` runs it on the edited file and prints nothing on success ([setup notes](../research/claude-code/setup-notes.md)).
- Agent output contract: with `CLAUDECODE=1` or `AGENT=1`, `check` prints only failures (Turbo `--output-logs=errors-only`, Gradle `-q --console=plain`, `xcodebuild -quiet`) and writes the full log, plus Android lint and Roborazzi reports on failure, to `.logs/` (gitignored, readable by agents unlike `build/` and `.turbo/`), printing the path; lint warnings fail the build; hooks print nothing on success ([token efficiency](../research/claude-code/token-efficiency-practice.md)).

## Out of scope

Database, Redis, real RPC reads, any protocol family, auth, push, flags evaluation, deployment, release automation, remote Turbo cache, cloud-agent setup ([Owner decisions](#owner-decisions), #7), web pages and their Playwright, axe, html-validate and Lighthouse gates (M1).

## Contract changes

First draft of `/api/v1` schemas and `openapi.json`; nothing is frozen until M4.

## Modules

| Workspace | Package | License | M0 content |
|---|---|---|---|
| `apps/server` | `@voidx/server` | AGPL | Hono app, `/livez`, `createRoot`, test |
| `apps/worker` | `@voidx/worker` | AGPL | entry, `createRoot`, test |
| `apps/ios-app` | `@voidx/ios` (wrapper) | AGPL + exception | Tuist targets as in [ios-app/skeleton](../research/ios-app/skeleton.md), app and widget stubs |
| `apps/android-app` | `@voidx/android` (wrapper) | AGPL + exception | Modules as in [android-app/skeleton](../research/android-app/skeleton.md) plus `:lint-rules`; `:widget` stub |
| `packages/core` | `@voidx/core` | MIT | domain types, ports |
| `packages/contracts` | `@voidx/contracts` | MIT | Zod schemas, `openapi.json`, fixtures, mock |
| `packages/integration-kit` | `@voidx/integration-kit` | MIT | `defineProtocol` type, schemas for integration files |
| `packages/infra` | `@voidx/infra` | AGPL | empty port folders |
| `packages/design-tokens` | `@voidx/design-tokens` | MIT | tokens + generators + contrast test |
| `integrations` | `@voidx/integrations` | MIT | `chains/` for Ethereum and Arbitrum, the M1 chains (no protocols); `priceIds` optional in the M0 schema, filled in M3.5 |
| `tools/voidx-cli` | `@voidx/cli` | AGPL | `validate` command only |
| `e2e` | — (flows, not a package) | MIT | Maestro config, smoke flow, subflows |

## Libraries

Every new dependency below needs the owner's approval; versions are pinned in `mise.toml`, the catalog or `libs.versions.toml`.

| Area | Choice | Version seen | Why |
|---|---|---|---|
| Runtime, workspaces, tests | Bun | 1.4.2 exact | [monorepo-toolchain](../research/repo/monorepo-toolchain.md) |
| Task graph | Turborepo | 2.11.x exact | reads Bun lockfile v2 |
| Toolchains | mise + `mise.lock` | — | one source for laptops and CI |
| Types | TypeScript 7 (`tsc`) + TypeScript 6 aliased for dependency-cruiser | 7.x / 6.x | TS 7 has no API before 7.1 |
| Tests | fast-check (TS property tests), Turbine (Kotlin Flow tests) | — | [code style](../concepts/code-style.md) |
| Lint + format | Biome | 2.5.x exact | one tool; a11y rules; banned globals via `noRestrictedGlobals` + GritQL |
| Boundaries | dependency-cruiser | 18.5 | layer and MIT/AGPL rules |
| HTTP + OpenAPI | Hono, `@hono/zod-openapi`, Zod 4 | — / 1.6.3 / 4.x | ADR 0010 |
| Breaking changes | oasdiff | 1.32.x | ADR 0010 |
| Mock API | Prism (static + seeded fuzz) | 5.x | apps work without a backend |
| Tokens | Terrazzo: `@terrazzo/cli`, `@terrazzo/parser`, `@terrazzo/plugin-css`, `@terrazzo/plugin-tailwind`; own `voidx-native` plugin | 2.7.x | DTCG 2025.10 with the resolver; [token-pipeline](../research/repo/token-pipeline.md) |
| Colour and contrast | Color.js (`colorjs.io`), declared directly in the range Terrazzo's parser uses, so the lockfile holds one copy | ^0.7.1 | OKLCH in sRGB gamut, WCAG 2.2 contrast; [colour-and-contrast](../research/repo/colour-and-contrast.md) |
| Licenses | `reuse` tool, `bun pm licenses` script | reuse ≥ 6 | ADR 0016 |
| Docs | lychee, markdownlint-cli2 | 0.24.2 / 0.23.3 | links incl. anchors; structure |
| iOS | Tuist, swift-openapi-generator (CLI via mise), swift-format (toolchain), SwiftLint, swift-snapshot-testing; SPM: swift-dependencies, swift-sharing, swift-openapi-runtime, swift-openapi-urlsession | 4.210.0 / 1.13.1 / — / 0.65.1 / 1.19.x; SPM pinned in M0 | [ios-app/skeleton](../research/ios-app/skeleton.md) |
| Android | AGP 9.4.0, Gradle 9.7.0, Kotlin 2.4.20, Metro 1.4.5, Compose BOM 2026.09.00, Navigation 3 1.2.0, Fabrikt 27.14.0, Ktor (OkHttp engine), kotlinx-serialization, `metrox-viewmodel-compose`, Glance, ktlint 1.8.0, compose-lints 1.6.0, Roborazzi 1.76.0 + Robolectric 4.17, `ui-test-junit4`, `ui-test-manifest`, `ui-test-junit4-accessibility` (Compose BOM), `androidx.test:orchestrator`, UI Automator 2.4, `glance-testing` and `glance-appwidget-testing`; no Espresso ([native-ui-tests](../research/repo/native-ui-tests.md)), Android Lint API for `:lint-rules` (version follows AGP) | as listed | [android-app/skeleton](../research/android-app/skeleton.md) |
| E2E | Maestro CLI (via mise; Java 17+, Temurin 21) | 2.11.0 | [e2e-testing](../research/repo/e2e-testing.md) |
| Android SDK | mise `android-sdk` (cmdline-tools) + `sdkmanager` | 22.0 | [sdk-bootstrap](../research/android-app/sdk-bootstrap.md) |
| CI | `jdx/mise-action`, `gradle/actions/setup-gradle`, `fsfe/reuse-action`, `reactivecircus/android-emulator-runner` (SHA-pinned); Renovate app | — | [ci](../research/repo/ci.md) |

## Acceptance criteria

Setup and build:

- [ ] `mise install` then `bun install --frozen-lockfile` on a clean macOS machine succeed with `MISE_LOCKED=1`.
- [ ] On a clean macOS machine and on `ubuntu-latest`, the SDK script installs `sdk-packages.txt` with `VOIDX_ACCEPT_ANDROID_SDK_LICENSES=1` and stops with the licence names without it.
- [ ] `bun run check` passes on macOS; `bun run check --filter='!@voidx/ios'` passes on Linux.
- [ ] `bun run codegen && git diff --exit-code` shows no changes.
- [ ] With `CLAUDECODE=1`, `bun run check` prints nothing on success; on a failing canary it prints only the failure and the path of the full log.

Contract and integrations:

- [ ] `oasdiff breaking` fails between `openapi.json` and a copy with one field removed.
- [ ] A fixture with an unknown enum value decodes in `bun run check --filter=@voidx/contracts`, `--filter=@voidx/ios` and `--filter=@voidx/android`.
- [ ] `bun run e2e` starts Prism on `openapi.mock.json`, and `GET /livez` on the server returns 200 in its test.
- [ ] `bun run voidx validate` passes on `integrations/chains/*` and fails on a canary chain file with a misspelled key and on one with an address without a source URL.

Gates (every canary is excluded from the normal run):

- [ ] dependency-cruiser fails on canary imports from `integrations/` into `packages/infra`, from a server route into `infra`, and into a non-exported `core` path.
- [ ] Biome fails on a canary `fetch` in `integrations/`, a `z.enum` wire field in `packages/contracts`, a decorator in `packages/`, and an `<img>` without `alt` in Hono JSX; CI fails on a canary `biome-ignore` under `integrations/`.
- [ ] A canary literal colour fails lint in Swift, Kotlin and CSS.
- [ ] A canary file per language breaking one code-style rule fails: a floating promise and a default export in TS, `ObservableObject` and `DispatchQueue` in Swift, a ViewModel passed into a stateless composable in Kotlin.
- [ ] A canary literal duration fails lint in each place: `.animation(.easeIn(duration: 0.3))` in Swift, `tween(300)` in Kotlin, `transition: opacity 300ms` in CSS.
- [ ] A canary image without a content description fails the Android Lint rule and the emulator accessibility check; a canary unlabeled button fails `performAccessibilityAudit()`; a canary label truncated at AX5 fails its snapshot.
- [ ] The Gradle check fails on a canary Hilt dependency.
- [ ] The license gate fails on a canary GPL dependency in an MIT package.
- [ ] `reuse lint`, the license gate and `bun run lint:docs` (offline) pass; `lint:docs` fails on a canary `AGENTS.md` path that does not exist and on a skill without its `.claude/skills/` link.
- [ ] The format hook, fed the hook JSON for a misformatted canary `.ts`, `.swift` and `.kt` file, formats each, exits 0 and prints nothing.

Tokens:

- [ ] Every colour token is inside the sRGB gamut, and the contrast test passes for every token pair in light and dark.
- [ ] The settling time of each spring on iOS and Android is within 5% of its web `linear()` duration; every motion token has a value in the `reduced` context, `stagger` is 0 there and every reduced spring has bounce 0.

Apps:

- [ ] iOS: `tuist install && tuist generate --no-open` and `tuist inspect dependencies --only implicit` pass; `bun run check --filter=@voidx/ios` runs the tests on an iPhone simulator, an iPad simulator and `platform=macOS`; `xcodebuild build -scheme VoidXWidgets` passes for iOS and macOS.
- [ ] Android: `./gradlew assembleDebug testDebugUnitTest lint ktlintCheck verifyRoborazziDebug` passes with the configuration cache on; `./gradlew connectedDebugAndroidTest` passes on the emulator in `e2e-android`.
- [ ] `git grep -l xyz.depthly.voidx apps/` lists only the Tuist constant file and `gradle.properties`.
- [ ] `bun run e2e` passes the smoke flow on the iPhone simulator and the Android emulator; a canary flow asserting a removed id fails.
- [ ] Launching either app with `route=gallery` shows the gallery, and the Maestro smoke flow asserts one id from it; a Release build ignores `route`.

CI:

- [ ] A PR touching only `docs/` runs `changes`, `guard` and `ci-ok`, and skips `check`, `ios`, `android` and `e2e-android`; `ci-ok` is the single required check.
- [ ] A PR commit without `Signed-off-by:` fails `guard`; a PR adding a lockfile change under an integration-only diff fails `guard`; a PR touching `integrations/` and `packages/core/` fails `guard`.
- [ ] `renovate-config-validator` passes on the Renovate config.
- [ ] The `e2e-android` job takes ≤ 10 min on the M0 PR; the measured `ios` and `e2e-android` times are recorded in [ci](../research/repo/ci.md).

## Doc updates this milestone makes

- `REUSE.toml`: root config files and `.github/**` annotated; `precedence = "closest"` for files with their own license header.
- `AGENTS.md`: `check` split by OS in CI; commands stop being *planned* once they exist.

## Owner decisions

| # | Question | Decision |
|---|---|---|
| 1 | Xcode | Xcode 27 locally and in CI: the `xcode-27` image while it is in preview, then `macos-26` once it ships Xcode 27; `compatibleXcodeVersions` in `Tuist.swift` |
| 2 | iOS `Domain` | Tuist target like every other module; tests run through `xcodebuild` on macOS |
| 3 | macOS runner | Kept: the repo is public from the start, so GitHub-hosted macOS runners are free; the `ios` job runs only when iOS or its inputs change |
| 4 | Bundle ids | `xyz.depthly.voidx` (working value) from one Tuist constant and one Gradle property; frozen before M4 ([0044](../decisions/0044-domain-as-configuration.md)) |
| 5 | JDK | Temurin 21 |
| 6 | Widgets | Empty widget targets in M0 (iOS extension, Android `:widget`); UI in M6 |
| 7 | Cloud agents | Local agents only in M0; cloud setup gets its own research later |
| 8 | CLI | `tools/voidx-cli`, AGPL, may use `integration-kit` and `infra` |
| 9 | Problem type URIs | Built from `publicOrigin` (`https://voidx.depthly.xyz/problems/plan-limit` on the official instance); clients use `code` ([0044](../decisions/0044-domain-as-configuration.md)) |
| 10 | Android SDK | mise `android-sdk` + `sdkmanager`; the Android CLI stays optional and local with `--no-metrics` ([sdk-bootstrap](../research/android-app/sdk-bootstrap.md)) |
| 11 | Colour | OKLCH within the sRGB gamut; contrast by Color.js against WCAG 2.2 only, no APCA ([colour-and-contrast](../research/repo/colour-and-contrast.md)) |
| 12 | Token tool | Terrazzo for parsing and web output, own `voidx-native` plugin for Swift, `.xcassets`, Compose and spring CSS; replaces Style Dictionary ([token-pipeline](../research/repo/token-pipeline.md)) |

## Research

- [repo/monorepo-toolchain](../research/repo/monorepo-toolchain.md)
- [repo/ts-quality-gates](../research/repo/ts-quality-gates.md)
- [repo/ci](../research/repo/ci.md)
- [repo/contracts-and-tokens](../research/repo/contracts-and-tokens.md)
- [ios-app/skeleton](../research/ios-app/skeleton.md)
- [android-app/skeleton](../research/android-app/skeleton.md)
- [repo/e2e-testing](../research/repo/e2e-testing.md)
- [repo/native-ui-tests](../research/repo/native-ui-tests.md), [repo/native-agent-verification](../research/repo/native-agent-verification.md)
- [repo/token-pipeline](../research/repo/token-pipeline.md)
- [repo/colour-and-contrast](../research/repo/colour-and-contrast.md)
- [android-app/sdk-bootstrap](../research/android-app/sdk-bootstrap.md)
- [ios-app/motion](../research/ios-app/motion.md), [android-app/motion](../research/android-app/motion.md)
- [claude-code/setup-notes](../research/claude-code/setup-notes.md), [claude-code/token-efficiency-practice](../research/claude-code/token-efficiency-practice.md)
