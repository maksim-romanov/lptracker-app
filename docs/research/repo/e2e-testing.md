---
app: repo
topic: E2E testing and Maestro
checked: 2026-10-01
---

# E2E testing and Maestro

Input for the roadmap's M0 "E2E harness on the mock API". Builds on [ios-app/skeleton](../ios-app/skeleton.md), [android-app/skeleton](../android-app/skeleton.md), [contracts-and-tokens](contracts-and-tokens.md) and [ci](ci.md).

## Decisions

### Layers
- We write golden user journeys once as Maestro flows and run them on the iPhone simulator, the iPad simulator and the Android emulator. One YAML file drives both platforms: `id` maps to `accessibilityIdentifier` on iOS and to the resource id on Android, and `runFlow` with `when: platform:` handles the few platform-specific steps. [6][9][20]
- We keep XCUITest and Compose UI tests for what Maestro cannot do: `performAccessibilityAudit()` on iPhone, iPad and macOS, Compose `enableAccessibilityChecks()`, snapshots at large text sizes, and any test on the native macOS app. Maestro has no audit command, no Dynamic Type or font-scale command, and no macOS desktop support. Its only trait selectors are `text`, `long-text` and `square`. ADR 0022 stays as written. [6][10][22][24]
- We use Maestro flows to assert spoken strings. `text` matches `accessibilityLabel` on iOS and `contentDescription` plus visible text on Android, so one flow can check that both apps build the same label, for example "starting 0x1f9a, ending 4c2b" (ADR 0022's shared-formatter rule). [9]
- We keep Playwright for the web app and do not use Maestro web, because Maestro calls its web support "functional with ongoing development" and Chromium-only, and Playwright is already the ADR 0022 web gate. [6][0022]
- A journey has the same id in all three stacks: the Maestro file name `e2e/flows/<journey>.yaml`, the Playwright test tag `@<journey>`, and the XCUITest or Compose test name where one exists.
- We reject Appium. It covers macOS through the Mac2 driver, but it needs a server, drivers for Appium 3 and test code in a client language. Two native suites plus Maestro cost less and give agents YAML instead of code. [26]
- We reject Detox, because it targets React Native apps and VoidX is native. [27]

### Mock API and test ids
- Maestro flows run against Prism in static mode on `openapi.mock.json`, so a journey exercises the real HTTP client and the generated decoders. The flow passes `apiBase` and `scenario` through `launchApp.arguments`, and Debug builds send `Prefer: example=<scenario>`. The scenario name equals the golden fixture name. Hosts: `localhost:4010` on the iOS simulator, `10.0.2.2:4010` on the Android emulator, which needs a cleartext exception in the debug network config only. XCUITest keeps the in-process fixture transport. [11][contracts-and-tokens]
- Debug builds read launch configuration from `ProcessInfo.arguments` / `UserDefaults` on iOS and from intent extras on Android, because Maestro passes `arguments` that way and not as environment variables. XCUITest sets the same keys through `launchArguments`. **This conflicts with ios-app/skeleton.md and the iOS audit notes, which use a launch-environment key (`VOIDX_API=fixture`).** [11]
- Test ids are kebab-case strings (`portfolio-position-row`), identical on both platforms, and set through DesignSystem helpers. Maestro treats `id` as a regex, so ids contain no `.`, `(` or `+`. [9]
- Android sets `Modifier.semantics { testTagsAsResourceId = true }` once on the root `Scaffold`. Without it, Compose `testTag` values are invisible to Maestro and UiAutomator. [9][23]

### Tooling and CI
- We pin the Maestro CLI to an exact version in `mise.toml` through the registry backend `github:mobile-dev-inc/maestro`. It needs Java 17+; the M0 decision is Temurin 21. 2.11.0 (2026-09-29) adds Android 17 (API 37) to `start-device`, and the 7-day Renovate age makes it eligible on 2026-10-06. **New dependency: the owner must approve it.** [2][3][4][21]
- CI sets `MAESTRO_CLI_NO_ANALYTICS=true`, `MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true` and `MAESTRO_DISABLE_UPDATE_CHECK=true`. [17]
- We use the free, Apache-2.0 CLI and never Maestro Cloud ($250 per device per month). Maestro's CI guides only cover `maestro cloud`, so we write our own jobs. [1][18][19]
- PR jobs run only flows tagged `smoke` (`includeTags` in `e2e/config.yaml`):
  - iOS: inside the existing `ios` job after the build, on one iPhone simulator. This keeps us within ci.md's limit of two macOS jobs per PR.
  - Android: a new `e2e-android` job on `ubuntu-latest` with KVM, the API 36 emulator and AVD snapshot caching, using `reactivecircus/android-emulator-runner` (SHA-pinned). [14][25][ci]
- A nightly job on `main` runs every flow on iPhone, iPad and Android, in light and dark (`setDarkMode`, 2.9.0+) and in a second locale (`maestro start-device --device-locale`). A nightly failure opens an issue and does not block merges. [3][13]
- We do not use Maestro `assertScreenshot` as a visual gate. Its default 95% match threshold is looser than swift-snapshot-testing and Roborazzi, which stay the snapshot gates. [16][0022]
- We start deep-link flows with `openLink` and `autoVerify: true` on Android. The flow handles the iOS first-launch confirmation conditionally, because the simulator remembers the answer. [15]

### Agents
- Agents use the Maestro MCP (`maestro mcp`, stdio, bundled in the CLI) locally to drive a booted simulator or emulator and write flows. The tools are `list_devices`, `inspect_screen` (to find ids), `take_screenshot`, `run`, `cheat_sheet` and `open_maestro_viewer`. Plain `maestro test` and `maestro hierarchy` (absent from the CLI docs page; verify on the pinned version) do the same without MCP. [3][5]
- The MCP is opt-in in user scope, pinned to the mise version, and never added to `.mcp.json`, because ADR 0047 bans `stdio` entries in project config. The cloud tools (`list_cloud_devices`, `run_on_cloud`, `get_cloud_run_status`) need `maestro login` or `MAESTRO_CLOUD_API_KEY`, and contributors leave both unset. [5][0047]
- From M4, when apps read the real API, `inspect_screen` output contains on-chain token names. ADR 0047 then treats it as untrusted data. [0047]

## Facts that constrain us
- Maestro CLI 2.11.0 (2026-09-29) refuses physical iPhones ("Physical iOS devices are not yet supported"). Android emulators and physical devices work. iPad works as a simulator. Widgets are not documented. [3][6][7]
- 2.5.0 cut the MCP surface from 15 tools to 8 and reports Android about 41% faster through a direct ADB socket. 2.6.0 added parallel iOS simulators, moved Studio out of the CLI into a desktop app and added Maestro Viewer. [3]
- Maestro Studio is free and closed-source. Nothing in our workflow requires it. [2][28]
- `disableAnimations` (Reduce Motion on the iOS simulator, animator scales on Android) works only on Maestro Cloud. Locally, Android animations are off through the emulator runner, and iOS has no switch. So reduced-motion branches stay covered by native tests (ADR 0023). [12][25]
- SwiftUI `Toggle` with text merges into one accessibility element, and `WheelPickerStyle` hides its children. Flows there select by text. [8]
- Compose accessibility checks need Compose 1.8+ and `ui-test-junit4-accessibility`, built on the Accessibility Test Framework. The docs do not say whether they run under Robolectric. [22]

## Conflicts with existing docs (flagged, not resolved)
- ios-app/skeleton.md and the iOS audit notes say `VOIDX_API=fixture` is a launch-environment key; Maestro delivers `arguments` as process arguments or `UserDefaults`.
- ADR 0047 allows only `https` project MCP servers; the Maestro MCP is `stdio`, so it can only be a personal opt-in.
- ADR 0023 lists the native PR gates as "the accessibility audits and snapshot tests". A smoke E2E gate adds a third.
- The M0 spec (Libraries, Modules, CI jobs, acceptance) has no Maestro, no `e2e/` workspace and no `e2e-android` job. android-app/skeleton.md (line 64) notes there is no E2E module. ci.md's job table has no emulator job.
- Resolved by the [M0 spec](../../specs/m0-skeleton.md): `connectedDebugAndroidTest` runs on the emulator in `e2e-android`, next to the Maestro smoke.

## Proposed M0 "E2E harness" scope
- `e2e/` (MIT, in the Bun workspace list): `config.yaml` (`flows: flows/**`, tags), `flows/portfolio-smoke.yaml` (launch with scenario `portfolio-default`, assert the screen id and one spoken label, switch to dark, assert again), `subflows/`.
- Debug-only launch arguments `apiBase`, `scenario` and `route` on both apps, plus the `Prefer` header.
- `bun run e2e --platform ios|android` starts Prism, installs the Debug build and runs `maestro test --include-tags smoke --format junit`.
- CI: Maestro step in `ios`; new `e2e-android` job; JUnit and screenshots uploaded as artifacts on failure.
- Acceptance: the smoke flow passes on the iPhone simulator and the Android emulator against Prism, and fails when the asserted id is removed (canary).

## Open questions
- Budgets: no source gives Maestro wall-clock numbers on hosted runners. Proposed limits are a 10-minute timeout for `e2e-android` and 5 extra minutes in `ios`. Measure them in the M0 spike before writing them into the spec.
- Do flows run Dynamic Type and font scale through `xcrun simctl ui … content_size` and `adb shell settings put system font_scale` in a pre-step, or do we leave large text to snapshots only?
- Should test ids come from one generated source (TS, Swift, Kotlin constants via `codegen`), or stay hand-written strings guarded by the flows?
- Prism static mode with `Prefer: example=` per request: one scenario usually spans several endpoints. Does Prism need a per-endpoint example name convention, or does the app send the scenario name to every endpoint?
- Should a Claude Code deny rule for `mcp__maestro__run_on_cloud` and the other cloud tools be committed? That is agent config, so the owner decides.
- Is `runScript` JavaScript (GraalJS) able to make network calls from a flow? Not verified; it matters for flows from untrusted PRs.

## Sources
1. Maestro LICENSE (Apache-2.0) — https://github.com/mobile-dev-inc/Maestro/blob/main/LICENSE
2. Maestro README — https://github.com/mobile-dev-inc/Maestro
3. Maestro CHANGELOG (2.5.0–2.11.0) — https://github.com/mobile-dev-inc/Maestro/blob/main/CHANGELOG.md
4. Maestro releases — https://github.com/mobile-dev-inc/Maestro/releases
5. Maestro MCP — https://docs.maestro.dev/get-started/maestro-mcp
6. Supported platforms — https://docs.maestro.dev/get-started/supported-platform
7. UIKit (physical iOS devices) — https://docs.maestro.dev/get-started/supported-platform/ios/uikit
8. SwiftUI — https://docs.maestro.dev/get-started/supported-platform/ios/swiftui
9. Core selectors — https://docs.maestro.dev/reference/selectors/core-selectors
10. Element traits — https://docs.maestro.dev/reference/selectors/element-traits
11. launchApp — https://docs.maestro.dev/reference/commands-available/launchapp
12. Workspace configuration — https://docs.maestro.dev/reference/workspace-configuration
13. Test in different locales — https://docs.maestro.dev/maestro-flows/flow-control-and-logic/test-in-different-locales
14. Test discovery and tags — https://docs.maestro.dev/maestro-flows/workspace-management/test-discovery-and-tags
15. openLink — https://docs.maestro.dev/reference/commands-available/openlink
16. assertScreenshot — https://docs.maestro.dev/reference/commands-available/assertscreenshot
17. CLI environment variables — https://docs.maestro.dev/maestro-cli/environment-variables
18. Maestro pricing — https://maestro.dev/pricing
19. Generic CI platform (cloud only) — https://docs.maestro.dev/maestro-cloud/ci-cd-integration/generic-ci-platform
20. Conditions — https://docs.maestro.dev/maestro-flows/flow-control-and-logic/conditions
21. mise registry entry — https://github.com/jdx/mise/blob/main/registry/maestro.toml
22. Compose accessibility testing — https://developer.android.com/develop/ui/compose/accessibility/testing
23. Compose interoperability, `testTagsAsResourceId` — https://developer.android.com/develop/ui/compose/testing/interoperability
24. WWDC23, Perform accessibility audits for your app — https://developer.apple.com/videos/play/wwdc2023/10035/
25. ReactiveCircus android-emulator-runner — https://github.com/ReactiveCircus/android-emulator-runner
26. Appium Mac2 driver — https://github.com/appium/appium-mac2-driver
27. Detox getting started — https://wix.github.io/Detox/docs/introduction/getting-started
28. Maestro Studio overview — https://docs.maestro.dev/maestro-studio/maestro-studio-overview
- [0022] ADR 0022, [0023] ADR 0023, [0047] ADR 0047, [ci] ci.md, [contracts-and-tokens] contracts-and-tokens.md — in this repo
