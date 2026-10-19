---
app: repo
topic: Native UI test frameworks (XCTest, XCUITest, Swift Testing, Compose UI test, Espresso, UI Automator)
checked: 2026-10-01
---

# Native UI test frameworks

Extends [e2e-testing](e2e-testing.md) and [native-agent-verification](native-agent-verification.md); ADRs 0022, 0023, 0048 stay as written. Versions: Xcode 27, Swift Testing in the Xcode 27 toolchain, Compose UI 1.12.1 (2026-09-09), UI Automator 2.4.0 (2026-07-01), Glance testing 1.1.1.

## Decisions

### Split of responsibilities
- We write each check in exactly one layer. Maestro: journeys and spoken strings on both platforms. XCUITest and Compose UI tests: accessibility audits, state-by-state behaviour, large text, reduce motion, macOS, system UI. Snapshots: pixels. A Maestro flow never re-asserts what an audit or snapshot covers, and snapshots never click. [0048, e2e-testing]
- We keep XCTest only for `VoidXUITests` and performance tests, and Swift Testing for everything else (domain, decoding, snapshots, Motion helper). Swift Testing has no `XCUIApplication`/`XCUIElement` and no `measure(metrics:)`/`XCTMetric`; both frameworks share one target and one `.xcresult`. [1, 2]
- We write no Espresso tests and add no Espresso dependency. Compose UI tests (`createAndroidComposeRule`, `ui-test-junit4`) cover the whole app. Espresso is needed only for `espresso-intents` if a flow must stub an outgoing intent (share, open explorer) and for View interop; VoidX has neither, so the case waits for a real need and owner approval. [3, 4]
- We use UI Automator 2.4 (`uiAutomator { }`, outside the app process) only for what Compose rules cannot reach: the home-screen Glance widget, the permission dialog, notifications, other apps. Glance content logic is tested on the JVM with `runGlanceAppWidgetUnitTest` (`glance-testing`, `glance-appwidget-testing`), which renders nothing and cannot click; ADR 0022's "Glance tests for content descriptions" are these. [5, 6]
- We run the widget on-device checks nightly, not per PR, until the budget is measured. [open question]

### XCUITest on iOS, iPadOS, macOS
- We find elements by `accessibilityIdentifier` (the kebab-case ids from ADR 0048, set through DesignSystem helpers), never by localized text, and keep queries shallow (`app.buttons["portfolio-position-row"]`, not `app.scrollViews...`). Apple's own guidance, and the only way a test survives the second-locale run. [7]
- We create one `XCUIApplication` per test, set `launchArguments` (`-scenario portfolio-default`) before `launch()` and never after (ignored silently). The app reads them from `ProcessInfo`; arguments in `-key value` form land in `UserDefaults`' argument domain. `launchEnvironment` is not used for scenario, matching ADR 0048. [7, 8]
- We wait only with `waitForExistence(timeout:)` and `element.wait(for: \.value, toEqual:, timeout:)` or `XCTNSPredicateExpectation`; no `sleep`, no `Thread.sleep`. `continueAfterFailure = false`. [7]
- We call `performAccessibilityAudit(for:_:)` once per scenario, with the audit types listed explicitly, and filter only through the issue handler by `issue.auditType` plus element identifier. Each filter has a comment with the reason and a removal condition. We never widen the filter to a whole audit type to make a PR pass (AGENTS.md rule on thresholds). [9, 10, native-agent-verification]
- We run the same `VoidXUITests` target on iPhone, iPad and `platform=macOS` with a test plan: one configuration per appearance, locale and content size, so the matrix is data, not code. Xcode 27 articles describe `runsForEachTargetApplicationUIConfiguration` and `XCUIVoiceOverService`; adopt neither before reading Apple's release notes (unverified, see Open questions). [11, 12]
- Test plans keep video and screenshots for failures only; passing runs keep nothing. [7]
- macOS UI tests drive the real window through the same identifiers; no tree tool taps them, so XCUITest is the only macOS UI verifier (see agent-build-and-test-tools). [agent-build-and-test-tools]

### Compose UI tests on Android
- We run `createAndroidComposeRule<ComponentActivity>()` with the real theme and DesignSystem, content set from a fixture, so a test needs no network and no Prism. `testTag` values equal the shared ids; `testTagsAsResourceId` is set once on the root for Maestro and UI Automator only. [3, e2e-testing]
- We call `enableAccessibilityChecks()` on every `connectedDebugAndroidTest` class (one `@Rule` wrapper), after `setContent`, then act; checks run on the next action or `onRoot().tryPerformAccessibilityChecks()`. The checks need API 34+ and do nothing on Robolectric (the extension checks `Build.FINGERPRINT`), so the emulator job is the only gate; the API 36 image satisfies this. [13, 14]
- We keep time under test control: `mainClock.autoAdvance = false`, then `advanceTimeBy(<token duration>)` and assert the intermediate and end state, using the generated motion tokens (`fast` 150 ms, `base` 250 ms). This keeps motion tests meaningful while the emulator runs with animations off. Real work outside Compose is waited with `waitUntil(timeoutMs)` / `waitUntilExactlyOneExists`, whose timeout runs on the wall clock (default 1 s), never with `Thread.sleep`. [15, 14]
- We enable Android Test Orchestrator with `clearPackageData` in `e2e-android`: each test gets a fresh process, and a crash fails one test, not the run. Cost is slower runs; measure in the M0 spike. [16]
- We use the `emulator-runner` with KVM for `connectedDebugAndroidTest`, as the M0 spec says, and do not add Gradle Managed Devices: they give snapshots and sharding but the `aosp-atd` image is API 30 only and does not support hardware-rendered screenshot tests, and a second device path doubles setup. Revisit if the emulator job exceeds its budget. [17, m0-skeleton]

### Layout and naming
- iOS: `VoidXUITests` (XCTest, audits, large text, macOS) beside `DesignSystemSnapshotTests` and unit targets (Swift Testing). One class per scenario family; method name `test<Scenario>Audit`, `test<Journey>`. The journey id from the glossary is the class or method name where a native twin of a Maestro flow exists. [skeleton, e2e-testing]
- Android: instrumented tests in `app/src/androidTest` (one APK, one emulator boot); component tests in `<module>/src/test` under Robolectric with Roborazzi; Glance tests in the widget module's `src/test`. Class `<Screen>AccessibilityTest`, `<Journey>Test`. Needs owner check against the module layout in android-app/skeleton.
- Every UI test names its scenario; a scenario that has no UI test and no snapshot fails a coverage test (same rule as the state gallery). [native-agent-verification]

### What runs where
| Where | iOS | Android |
|---|---|---|
| Every PR | Maestro smoke; XCUITest audit on iPhone (default + error + large text) | `connectedDebugAndroidTest` with a11y checks; Roborazzi verify; Glance JVM tests |
| Nightly | audit scenarios on iPad and macOS, dark, second locale; widget checks | UI Automator widget tests; dark, locale, font scale 2.0 |
| Owner's device | hitch and signpost metrics (`bench:ios`) | Macrobenchmark (`bench:android`) |
- We run `XCTOSSignpostMetric` animation metrics (hitch count, hitch time ratio, frame rate) only on a device: on simulators only duration is reported, so those tests call `XCTSkip` on a simulator. Confirms ADR 0023. [18, 19]

### Agent ergonomics and flakes
- We have agents read failures from files, not logs. iOS: `xcodebuild test -resultBundlePath build/ui.xcresult`, then `xcrun xcresulttool get test-results summary --path … --compact`, `get test-results tests`, `get test-results test-details --test-id …`, and `export attachments --path … --output-path … --only-failures` for screenshots. Android: XML in `<module>/build/outputs/androidTest-results/connected/`, HTML in `build/reports/androidTests/connected/`. `bun run check` prints only the failing test names and the path. [20, 21]
- We use `xcodebuild … -only-testing:VoidXUITests/<Class>` and `./gradlew connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=<fqcn>` for single runs; agents never run the whole suite to check one class. [21, 22]
- We run no automatic retries on PRs: a flake is a bug in the test or app. Nightly may repeat a failing test, and a test that passes on repeat opens a flake issue and is fixed within the milestone or deleted. Xcode 27 reportedly repeats single Swift Testing cases and SwiftPM has `--repeat-until`; XCTest repetition flags are unverified here. [11, open questions]
- We use no parallel UI testing on PR: `-parallel-testing-enabled NO` for `VoidXUITests`. Parallel runs clone simulators, which also hides Device Hub output, and share one Prism instance. Unit and snapshot targets may run parallel. Android shards only in nightly, one device per CI job. [12, 23, native-agent-verification]
- Deterministic state comes from `scenario`, a frozen clock injected by the scenario (the app never reads `Date()` directly), and the status-bar and animation pre-steps in native-agent-verification. Animations: Android emulator off; iOS XCUITest cannot switch them off, so waits use state, not time. [native-agent-verification]

## Facts that constrain us
- Swift Testing in Xcode 26 gained attachments and exit tests; Xcode 27 reportedly adds interop warnings between XCTest and Swift Testing assertions, set in the test plan. Mixing assertion kinds in one test is a warning, so UI tests use only `XCTAssert*`. [1, 11, 12]
- `xcresulttool get test-results` (`summary`, `tests`, `test-details`, `activities`, `insights`, `metrics`) replaces the deprecated `get object`; `get … --legacy` is the old path. [20, 24]
- XCUITest records UI and screenshots per test plan configuration and shows them in the Xcode test report; locales, appearance, orientation and devices are test plan configurations. [7]
- Compose accessibility checks: `ui-test-junit4-accessibility` for the rule, `ui-test-accessibility` (API 34, experimental annotation) for `ComposeUiTest`. [13, 14]
- Compose UI 1.13 alpha promotes `ComposeUiTest` and `waitUntil` to stable and adds `useUnmergedTree` overloads; 1.12.0 added `onRootWithViewInteraction` for Espresso interop. Pin to the BOM, do not use alphas. [25]
- UI Automator 2.4.0: `uiAutomator { onElement {…}, startApp, watchFor, waitForStable, takeScreenshot, ResultsReporter }`, runs outside the process so it can test minified builds. The how-to page still shows `2.4.0-alpha05` in the snippet; use 2.4.0. [5, 26]
- Orchestrator: `testInstrumentationRunnerArguments clearPackageData: 'true'` plus `testOptions.execution 'ANDROIDX_TEST_ORCHESTRATOR'` and `androidTestUtil` orchestrator. [16]
- GMD sharding: `android.experimental.androidTest.numManagedDeviceShards`; on CI without GPU add `-Pandroid.testoptions.manageddevices.emulator.gpu=swiftshader_indirect`. [17]

## Conflicts with existing docs (flagged, not resolved)
- android-app/agent-tools.md and ADR 0022 treat `roborazzi-accessibility-check` (ATF on Robolectric) as a JVM-side a11y gate; the Compose ATF extensions are a no-op on Robolectric, so unless that library bypasses it, only `connectedDebugAndroidTest` actually checks accessibility. [13, 14]
- ADR 0048 gives XCUITest the in-process fixture transport and Maestro a Prism round trip; one scenario name therefore has two data paths (fixture file vs Prism example) that can drift. Needs one shared fixture source or a contract test.
- ADR 0023 puts reduce motion for iOS in a snapshot or UI test; XCUITest cannot set `accessibilityReduceMotion` (see Open questions).
- ADR 0022 says audits run "on every screen"; native-agent-verification says once per scenario. This file follows the second.
- The new dependencies in this file (`ui-test-junit4`, `ui-test-manifest`, `ui-test-junit4-accessibility`, `uiautomator`, `glance-testing`, `glance-appwidget-testing`, `androidx.test:orchestrator`) need owner approval (AGENTS.md, new dependency).

## Open questions
- Can a Debug launch argument (for example `reduceMotion=1`) override `accessibilityReduceMotion` for XCUITest, or must the `Motion` helper take the flag as input? ADR 0048 names only `apiBase`, `scenario`, `route`.
- Apple's Xcode 27 release notes were not retrievable; `XCUIVoiceOverService`, `runsForEachTargetApplicationUIConfiguration`, the crash-handling test plan setting and interop warnings come from secondary articles. Verify in Xcode 27 before use.
- Exact `xcodebuild` flags for XCTest repetition and retry (`-retry-tests-on-failure`, `-test-iterations`) were not checked against Xcode 27 `xcodebuild -help`.
- Does `performAccessibilityAudit()` run under the macOS destination on CI runners without extra Accessibility permission? Measure once.
- Budgets: wall time of the iPhone audit run per PR, Orchestrator overhead, and the widget UI Automator nightly are unmeasured; set in the M0 spike.
- Does the Glance widget need an on-device test at all beyond JVM tests and one manual check by the owner?
- Does `XCTHitchMetric` give usable numbers on the owner's device for SwiftUI scroll, and which signposts does SwiftUI emit? (Existing open question.)

## Sources
1. Swift Testing vs XCTest, what stays in XCTest — https://blakecrosley.com/blog/swift-testing-vs-xctest
2. Swift Testing vs XCTest search digest (UI and `XCTMetric` XCTest-only) — https://developer.apple.com/videos/play/wwdc2024/10179/
3. Compose testing, interoperability — https://developer.android.com/develop/ui/compose/testing/interoperability
4. Espresso-Intents — https://developer.android.com/training/testing/espresso/intents
5. UI Automator guide — https://developer.android.com/training/testing/other-components/ui-automator
6. Unit testing with Glance — https://developer.android.com/develop/ui/compose/glance/testing
7. WWDC25 Record, replay, and review: UI automation with Xcode — https://developer.apple.com/videos/play/wwdc2025/344/
8. XCUITest launch arguments and environment (article) — https://www.polpiella.dev/configuring-ui-tests-with-launch-arguments
9. performAccessibilityAudit — https://developer.apple.com/documentation/xcuiautomation/xcuiapplication/performaccessibilityaudit(for:_:)
10. WWDC23 Perform accessibility audits for your app — https://developer.apple.com/videos/play/wwdc2023/10035/
11. Xcode 27 everything developers need to know (secondary) — https://dev.to/arshtechpro/xcode-27-everything-developers-need-to-know-6lh
12. Xcode 27 release notes (not retrievable) — https://developer.apple.com/documentation/xcode-release-notes/xcode-27-release-notes
13. Compose accessibility testing — https://developer.android.com/develop/ui/compose/accessibility/testing
14. androidx testing file map, API 34 and Robolectric no-op (secondary) — https://github.com/skydoves/android-testing-skills/blob/main/docs/CORPUS.md
15. Synchronize your Compose tests — https://developer.android.com/develop/ui/compose/testing/synchronization
16. AndroidJUnitRunner, Orchestrator, sharding — https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner
17. Gradle Managed Devices — https://developer.android.com/studio/test/gradle-managed-devices
18. WWDC20 Eliminate animation hitches with XCTest — https://developer.apple.com/videos/play/wwdc2020/10077/
19. Simulator reports duration only (article) — https://dev.to/mtmorozov/discovering-ui-performance-testing-with-xctest-scrolling-performance-pon
20. xcresulttool man page — https://keith.github.io/xcode-man-pages/xcresulttool.1.html
21. Test from the command line (Android) — https://developer.android.com/studio/test/command-line
22. Flutter issue on `xcresulttool get object` deprecation — https://github.com/flutter/flutter/issues/151502
23. WWDC20 Get your test results faster (parallel testing) — https://developer.apple.com/videos/play/wwdc2020/10221/
24. Apple forums, `xcresulttool get` deprecated — https://developer.apple.com/forums/thread/763888
25. Compose UI release notes — https://developer.android.com/jetpack/androidx/releases/compose-ui
26. UI Automator release notes — https://developer.android.com/jetpack/androidx/releases/test-uiautomator
- [0022] [0023] [0048] ADRs, [e2e-testing], [native-agent-verification], [agent-build-and-test-tools], [skeleton], [m0-skeleton] — in this repo
