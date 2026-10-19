---
app: repo
topic: Agent-driven e2e and UI/UX verification on native apps
checked: 2026-10-01
---

# Agent-driven e2e and UI/UX verification on native apps

Scope: how a coding agent proves its own iOS, iPadOS, macOS and Android work (behaviour, accessibility, motion, visuals, UX) on the owner's Mac and in CI. Builds on [e2e-testing](e2e-testing.md), [ios-app/agent-build-and-test-tools](../ios-app/agent-build-and-test-tools.md), [android-app/agent-tools](../android-app/agent-tools.md), ADRs 0022, 0023, 0047, 0048. Tool lists already decided there are not repeated.

## Decisions

### The agent loop
- We give agents one loop per UI change: (1) `bun run check --affected` is the only pass/fail; (2) launch Debug with `scenario=<fixture>` on the mock; (3) observe text first (tree), then pixels; (4) read the snapshot diff artifacts. Trees are cheap and exact, screenshots only judge look. [mobile MCP instructions, 6, 7]
- iOS observation: MobileBuildMCP `snapshot_ui` and `screenshot`, or plain `xcrun simctl io booted screenshot <file>`; `openurl`, `push` and `ui` also come from simctl. Mac apps: XCUITest only, no tree tool taps them. [agent-build-and-test-tools, 16, 17]
- Android observation: `android layout --flat --pretty --output build/agent/layout.json` (add `--full` for hidden nodes) and `android screen capture --annotate --output build/agent/screen.png`; tap by label with `android screen resolve`, which maps `#N` to x,y. Only `adb shell input` and `screencap` beyond that (ADR 0047 rule kept). [6, 7, 8]
- Agents prefer the tree over screenshots in every driver (mobile-mcp, MobileBuildMCP, Maestro `inspect_screen`): tree text has ids and labels, so the agent can assert the same strings the spoken-label rule needs. [mobile MCP instructions, e2e-testing]

### Deterministic simulator state (local and CI)
- We set device state in a pre-step script `e2e/scripts/prepare-device.*` (planned): iOS `xcrun simctl status_bar booted override --time 9:41 --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4 --operatorName ""`, `xcrun simctl ui booted appearance dark|light`, `xcrun simctl ui booted content_size accessibility-extra-extra-extra-large`; Android `settings put system font_scale 2.0` and the emulator runner's animation-off flags. A clock or battery in a screenshot is a guaranteed diff. [16, 17, 10]
- We pin the simulator by name and OS in the test destination, never `booted`: the `xcode-27` image ships only iOS 27 simulators, runs on arm64 macOS 27 and is a public preview. [11, 5]

### Visual regression
- iOS: we keep swift-snapshot-testing as the only pixel gate and render views directly with a fixed matrix, not through the running app: devices {iPhone, iPad}, {light, dark}, content sizes {default, `.accessibilityExtraExtraExtraLarge`}, {LTR, RTL}, one fixture per state. Matrix size is chosen per screen, not globally, to keep PR time down. Snapshots must be compared on the same simulator that recorded them. [5, ios-app/skeleton]
- Android: we keep Roborazzi 1.76.0 (Gradle `recordRoborazziDebug` / `verifyRoborazziDebug` / `compareRoborazziDebug`) with qualifiers for dark (`+night`), locale and RTL, and font scale {1.0, 1.5, 2.0} per ADR 0022. `generateComposePreviewRobolectricTests` can turn existing `@Preview`s into tests, so the state matrix is written once as previews. [1, 0022]
- We turn on `-Proborazzi.dumpUiTree=true` for agent runs only: it writes a JSON tree beside each image, which is the cheapest oracle for an agent that is told a snapshot changed. [1]
- We do not adopt Compose Preview Screenshot Testing. The standalone plugin is deprecated from AGP 9.5.0-alpha03, its replacement (AGP test suites) needs AGP 9.5.0-alpha03+ and both are experimental; we are on AGP 9.4. Re-check when AGP 9.5 is stable. [2, 3, skeleton]
- We do not adopt Paparazzi: 2.0.0-alpha05.1 is the latest release, nothing found on AGP 9 support, and Roborazzi is already the Robolectric-based choice. [1, 4]
- Flake control: precision settings are set once per project and never raised in a PR; Roborazzi `changeThreshold` stays at a documented value (docs suggest 0.01); record baselines only on the OS that verifies them; animations disabled (`UIView.setAnimationsEnabled(false)` equivalent on iOS, emulator runner flags on Android); no live clock, no network (fixture transport). [1, 5, e2e-testing]
- Baselines are recorded by a manual `workflow_dispatch` job that uploads images as an artifact; a person reviews and commits them (AGENTS.md: leave pushing to a person). An agent never "fixes" a failing snapshot by re-recording without showing the diff to the owner. [AGENTS.md, 1]

### Journeys and the XCUITest/Maestro split
- We run `performAccessibilityAudit()` once per scenario, not once per screen: a parametrised XCUITest loops over `scenario` values (loading, partial, stale, error, empty, unknown-family, default) because most violations (clipped text, hit regions) hide in the non-default states. Audit types to enable explicitly: `.dynamicType`, `.textClipped`, `.contrast`, `.hitRegion`, `.sufficientElementDescription`, `.trait`. [15, 0022]
- Maestro flows only do journeys and assert ids and labels; XCUITest and Compose tests own audits, text size, reduce motion and macOS. State selection uses `launchApp.arguments.scenario`, never `openLink`: deep links on the iOS simulator were reported flaky on GitHub Actions across 1.39 to 1.41, and no later fix was found. One nightly flow may use `openLink` on purpose. [13, e2e-testing]
- PR smoke runs on one simulator and one emulator, no `--shard-split`. On iOS, when the XCTest runner dies, the rest of that shard fails with connection errors (reported on 2.6.0, 6 to 12% of flows lost). Nightly parallelism uses separate CI matrix jobs, one device each, with `--shard-all` or `--shard-split` only on Android. Flows write JUnit with `--format junit --test-output-dir`. [9, 12]

### State gallery and UX review
- We add a Debug-only "state gallery" route in both apps: one scrollable screen that renders every DesignSystem component and every screen-level state (loading, partial, stale, error, empty, unknown family) from the fixtures named like the golden fixtures. It is reached through the existing `scenario` mechanism plus a new Debug-only launch argument `route=debug-states` (proposed; ADR 0048 names only `apiBase` and `scenario`). It is excluded from Release builds by a compile condition. Rows get ids `state-<screen>-<state>`. [0048, e2e-testing]
- The gallery is for agents driving the running app and for Maestro; the gate is still the per-state snapshot matrix, which needs no gallery. Both read the same fixtures, so a new state appears in both or fails a coverage test.
- UX review is an agent step with a written rubric, never a merge gate: the agent gets the snapshot images as one contact sheet per screen plus the UI tree JSON and answers a fixed checklist (HIG or Material layout, token use only, no clipped text at AX5 and 2.0 font scale, every state present and distinguishable without colour, spoken labels match shared formatters, touch targets, safe areas, RTL mirroring). Output is findings with ids, not a pass flag. [18]
- Pixel diffs decide "did it change"; a multimodal model decides "is this change acceptable" and may only raise findings. Reported failure modes: hallucinated or misread rendering and misinterpreting highlighted diff pixels as defects, so every finding must cite a tree node id or a screenshot region and is checked against the tree before it is trusted. [18, 19]
- Rubric file location: `docs/` or `apps/<app>/docs/` (owner decides; see Open questions).

### Motion and performance
- Locally an agent verifies motion by what is deterministic: tokens (generated and linted), the reduce-motion branch (unit test of the `Motion` helper with the flag injected, snapshot at the end state), no layout-phase reads (lint). Frame timing is not verified locally. [0023, ios-app/motion, android-app/motion]
- Macrobenchmark returns errors on emulators and debuggable apps; those can be suppressed with `androidx.benchmark.suppressErrors`, but Google says emulator numbers do not represent the end user. We therefore run Macrobenchmark only on a physical device and never as a baseline gate on an emulator. An agent may run it on the emulator with suppressed errors only to check that the benchmark compiles and the trace opens. [10, 0023]
- iOS hitch thresholds from Apple: under 5 ms/s good, 5 to 10 investigate, 10 or more act. Baselines are set with `XCTOSSignpostMetric` animation intervals (hitch count, time, ratio, frame rate). Whether `XCTHitchMetric` runs on a simulator is not settled (one article says no); until measured on the owner's Mac, hitch tests are device-only and nightly as ADR 0023 says. [14, 19-source note]

## Facts that constrain us
- Android CLI 1.0.16486076: `android layout` flags are `--flat --full --no-idle --pretty --output --device`; `-d/--diff` is a deprecated no-op. `android screen capture --annotate` embeds bounding-box metadata in the PNG for `android screen resolve`. `--no-metrics` is global. [6, 7, 8]
- Maestro CLI docs list `test`, `start-device`, `record`, `mcp`, `download-samples`; the docs page names no `hierarchy` command. Test options: `--shard-split`, `--shard-all`, `--format JUNIT|HTML`, `--test-output-dir`, `--debug-output`, `--include-tags`, `--exclude-tags`, `--device`. [9]
- `simctl status_bar` takes `--time`, `--dataNetwork`, `--wifiMode`, `--wifiBars`, `--cellularMode`, `--cellularBars`, `--batteryState`, `--batteryLevel`, `--operatorName`; `clear` restores. `simctl ui` values for `appearance` and `content_size` come from community posts, not Apple docs; confirm with `xcrun simctl ui --help` on Xcode 27. [16, 17]
- `performAccessibilityAudit(for:_:)` takes an audit-type set and an issue handler returning whether an issue is handled; audit types: `dynamicType`, `contrast`, `textClipped`, `elementDetection`, `hitRegion`, `sufficientElementDescription`, `trait`, `parentChild`. [15]
- Compose Preview Screenshot Testing (experimental): `@PreviewTest` plus `@Preview(fontScale=…, uiMode=…)`; tasks `updateDebugScreenshotTest` / `validateDebugScreenshotTest`; suites variant `testScreenshotTest…TestSuite`. [2, 3]
- swift-snapshot-testing README: "Snapshots must be compared using the exact same simulator that originally took the reference"; Swift Testing trait `@Suite(.snapshots(record: .failed))`. [5]
- GitHub `xcode-27` and `xcode-27-xlarge` labels: public preview, arm64 only, macOS 27, iOS 27 simulators only. A preview image can change between runs; pin and re-record deliberately. [11]

## Conflicts with existing docs (flagged, not resolved)
- android-app/agent-tools.md line 15 says `android layout` has `--diff`; the official page marks it deprecated and a no-op.
- ADR 0023 runs hitch and Macrobenchmark "nightly on a physical device". GitHub-hosted runners have no physical device, and ADR 0048 and the M0 spec name only simulator and emulator jobs; no doc says where the device lives.
- Resolved: ADR 0048 and the M0 spec add the `route` launch argument for the gallery.
- ADR 0022 Android row: "Roborazzi at font scale 1.0, 1.5, 2.0"; ADR 0022 iOS: snapshots at accessibility sizes. Neither fixes RTL, dark or device matrices, which this file proposes.
- ADR 0047 allows no `stdio` MCP in the repo; every observation tool above is personal opt-in or a plain CLI, so nothing in the repo can configure them.

## Open questions
- Do Roborazzi images recorded on macOS match those verified on Ubuntu CI? Not found in docs; decides whether Android baselines are recorded locally or in CI.
- Can `accessibilityReduceMotion` be set in a snapshot or XCUITest (environment override vs system setting)? Decides how the iOS reduce-motion branch is tested; the helper may need to take the flag as input.
- Does `xcrun simctl ui` expose Reduce Motion or Increase Contrast on Xcode 27? Check `--help`.
- Does `XCTHitchMetric` work on Apple Silicon simulators on Xcode 27? Measure once.
- Who owns the physical device for nightly motion runs (self-hosted runner, owner's phone, cloud farm)? Cloud farms touch ADR 0047's limits.
- Where do the UX rubric and gallery rules live, and is an agent UX review a documented required step in PR descriptions or just a skill?
- Budget: matrix size times 8 states on Roborazzi and swift-snapshot-testing is unmeasured; do in the M0 spike.
- `maestro hierarchy` (cited in e2e-testing.md) is absent from the CLI doc page; verify on the pinned version.

## Sources
1. Roborazzi README — https://github.com/takahirom/roborazzi
2. Compose Preview Screenshot Testing — https://developer.android.com/studio/preview/compose-screenshot-testing
3. Screenshot testing with AGP test suites — https://developer.android.com/studio/preview/compose-screenshot-testing-with-testsuites
4. Paparazzi — https://github.com/cashapp/paparazzi
5. swift-snapshot-testing — https://github.com/pointfreeco/swift-snapshot-testing
6. Android CLI — https://developer.android.com/tools/agents/android-cli
7. android layout — https://developer.android.com/tools/agents/android-cli/commands/layout
8. android screen capture — https://developer.android.com/tools/agents/android-cli/commands/screen_capture
9. Maestro CLI commands and options — https://docs.maestro.dev/maestro-cli/maestro-cli-commands-and-options
10. Macrobenchmark overview — https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview
11. Xcode 27 runner image on macOS 27 — https://github.blog/changelog/2026-09-10-xcode-27-runner-image-now-runs-on-macos-27/
12. Maestro issue 3643, shard failure on iOS — https://github.com/mobile-dev-inc/Maestro/issues/3643
13. Maestro issue 2610, deep links on Actions — https://github.com/mobile-dev-inc/Maestro/issues/2610
14. WWDC20 Eliminate animation hitches with XCTest — https://developer.apple.com/videos/play/wwdc2020/10077/
15. performAccessibilityAudit — https://developer.apple.com/documentation/xcuiautomation/xcuiapplication/performaccessibilityaudit(for:_:)
16. simctl status_bar syntax — https://www.mikegopsill.com/posts/control-statusbar-ios-simulator/
17. simctl ui content_size and appearance (community, unconfirmed) — https://github.com/Algorythmos-AI/gurbani-soul-ios/issues/23
18. RippleGUItester (LLM GUI testing false positives) — https://arxiv.org/pdf/2603.03121
19. Hitch metrics on simulator (article, unconfirmed) — https://dev.to/mtmorozov/discovering-ui-performance-testing-with-xctest-navigation-performance-32c
- [0022] [0023] [0047] [0048] ADRs, [e2e-testing], [skeleton], [ios-app/motion], [android-app/motion], [agent-build-and-test-tools], [AGENTS.md] — in this repo. "mobile MCP instructions" = the mobile-mcp server's own tool guidance.
