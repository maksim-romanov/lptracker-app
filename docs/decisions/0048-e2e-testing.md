# 0048 · E2E testing: shared Maestro journeys, native gates, Playwright on the web

- Status: proposed
- Deciders: Maksim Romanov

## Context

The roadmap asks for an E2E harness on the mock API in M0. iOS and Android must behave the same for the same journey, and agents need one way to run and inspect it. Maestro runs one YAML flow on both platforms, but has no accessibility audit, no text-size command and no macOS support ([research/repo/e2e-testing](../research/repo/e2e-testing.md)).

## Options

- **Native tests only** (XCUITest, Compose UI tests).
- **Appium** with test code in a client language.
- **Maestro flows for shared journeys, native tests for what Maestro cannot check.**

## Decision

Chosen **Maestro flows plus native gates**, because one flow per journey proves both apps do the same thing, and native tests keep the accessibility and visual gates.

| Layer | Tool | Covers |
|---|---|---|
| Journeys on iPhone, iPad, Android | Maestro, `e2e/flows/<journey>.yaml`, one file for every platform | user paths and spoken labels |
| Screen states, accessibility audits, large text, macOS, system UI | XCUITest (XCTest), Compose UI tests with `enableAccessibilityChecks()` on the emulator, UI Automator for widgets and system dialogs; no Espresso tests | what Maestro cannot check ([0022](0022-accessibility.md), [research](../research/repo/native-ui-tests.md)) |
| Pixels | swift-snapshot-testing (Swift Testing), Roborazzi | visual regressions |
| Logic | Swift Testing, JUnit on the JVM | domain, decoding, formatting |
| Web | Playwright | journeys, ARIA snapshots, gallery screenshots and the web gates ([research](../research/server/agent-verification.md)) |

- Journey ids: [glossary](../glossary.md#data).
- Flows run against Prism in static mode on `openapi.mock.json`, so they exercise the real HTTP client. Debug builds read the launch arguments `apiBase`, `scenario` and `route` (`ProcessInfo.arguments` / `UserDefaults` on iOS, intent extras on Android); a scenario name is a fixture name. XCUITest sets the same keys through `launchArguments` and keeps the in-process fixture transport, which reads the same named examples from `openapi.mock.json`, so a scenario has one data source.
- Test ids are kebab-case and identical on both platforms (`accessibilityIdentifier`, `testTag` with `testTagsAsResourceId` set once at the root). Ids avoid regex characters.
- The Maestro CLI is pinned in mise. CI turns off its analytics, update check and AI notice.
- Free CLI only; Maestro Cloud is never used.
- PRs run flows tagged `smoke`: a step in the `ios` job and an `e2e-android` job on Linux with KVM. A nightly run covers every flow in light and dark and a second locale, and does not block merges.
- Each check lives in one layer; a Maestro flow never re-asserts what an audit or snapshot covers.
- Maestro screenshots are never a visual gate; snapshots stay with swift-snapshot-testing and Roborazzi.
- Agents verify text first, pixels second: ARIA snapshots on the web and the UI tree on native (`inspect_screen`, `android layout`, the XCUITest hierarchy, Roborazzi `dumpUiTree`); pixels only against committed baselines ([native research](../research/repo/native-agent-verification.md)).
- Every state renders from a named scenario: `?scenario=` and a `/__gallery` route on the web (dev only), the launch argument `route` opening a gallery screen in Debug builds.
- A model reviewing screenshots against a written rubric is advisory and never a gate.
- Baselines change only through a dedicated update command, in their own commit, accepted by the owner; an agent never updates a baseline to make a test pass.
- The Maestro MCP (`maestro mcp`) is a personal opt-in pinned to the mise version; its cloud tools stay unauthenticated ([0047](0047-agent-tools-and-mcp.md)).

## Consequences

- Smoke journeys are a third PR check on native apps, next to the accessibility audits and snapshots ([0023](0023-motion.md)).
- From M4 the apps read the real API in some flows, so `inspect_screen` output carries on-chain strings and is untrusted ([0047](0047-agent-tools-and-mcp.md)).
- CI time budgets are measured in M0.
- Related: [0019](0019-ios-stack.md), [0020](0020-android-stack.md), [0037](0037-ci-and-supply-chain.md).
