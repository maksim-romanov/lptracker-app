---
app: ios-app
topic: Design audit findings (input for the research gate)
checked: 2026-09-30
---

# Design audit findings

Findings from the senior iOS review of the design docs, to be confirmed or overturned by the app's research gate.

## Decisions
- We target iOS 26, iPadOS 26 and macOS 26 as minimums, Swift 6 strict concurrency, `@MainActor` models; Xcode and Tuist are pinned in `mise.toml`, because zoom transitions, `@Observable`, `performAccessibilityAudit` and current App Store SDK requirements all need recent OS and toolchain. [owner decision]
- We refresh tokens only in the app; the widget never refreshes. It renders the App Group snapshot the app wrote, because rotating refresh tokens used from two processes trigger reuse detection and log the user out. [1]
- We put push behind a `PushClient` dependency: OneSignal on iOS and iPadOS, no push on macOS in the MVP, because the OneSignal SDK supports iOS and Mac Catalyst but not native macOS apps. [2]
- We call `try await $cache.save()` before `WidgetCenter.reloadTimelines`, because `@Shared(.fileStorage)` delays implicit saves by about one second. [3]
- We declare every module as a Tuist target and run `tuist inspect implicit-imports` (superseded: `tuist inspect dependencies --only implicit`, see skeleton.md) in CI, because a single local Swift package lets code import modules it never declared.
- We emit open enums as `anyOf: [enum, string]` so swift-openapi-generator produces decodable open enums; golden decode tests inject unknown values. [4]
- We format amounts from decimal strings, not `Decimal`, because `Decimal` keeps 38 significant digits and 18-decimal token amounts can exceed that; golden vectors include over-38-digit cases.
- We gate PRs on the accessibility audit and snapshots only; hitch metrics run nightly on a physical device, because simulator hitch numbers on hosted runners are noise.
- We inject UI-test dependencies through launch arguments read by the composition root (launch-environment keys superseded by [e2e-testing](../repo/e2e-testing.md)), because `withDependencies` overrides do not reach the app process XCUITest launches.
- We keep the OFREP Swift provider behind a thin wrapper and budget for a small hand-written OFREP client (one POST), because `ofrep-swift-client-provider` is 0.x with little adoption. [5]

## Facts that constrain us
- App Store: in-app account deletion (guideline 5.1.1(v)), privacy manifests including OneSignal's, OneSignal consent required before registration (guests never registered), a review demo on the official instance, store copy "watch-only tracker, no wallet or trading".
- Entitlements to list per build configuration: `webcredentials` associated domain per RP id (dev, staging, official), App Group, `keychain-access-groups` for app and widget, `NSAllowsLocalNetworking` and `NSLocalNetworkUsageDescription` for LAN self-hosted servers, macOS sandbox `com.apple.security.network.client`, `kSecUseDataProtectionKeychain` on macOS.
- iOS 26 has widget push (`WidgetPushHandler`), budgeted by the system; it needs direct APNs, not OneSignal. It is the M6 path; until then reload widgets after a foreground refresh and when an alert push arrives.
- The widget extension is a second composition root; `AppIntentsKit` belongs in the module graph.
- The Dynamic Type audit is iOS only; the macOS audit covers the other checks.

## Open questions
- String Catalog layout for server `labelKey`s and their English fallbacks.
- Switching servers must clear cached data, the flag snapshot, tokens and the OneSignal login for the previous server; where this lives in the composition root.
- A custom SwiftLint regex rule for literal `.animation(...)` durations.

## Sources
1. OAuth 2.0 Security BCP, refresh token rotation — https://datatracker.ietf.org/doc/html/rfc9700
2. OneSignal macOS setup — https://documentation.onesignal.com/docs/en/macos-app-setup
3. swift-sharing FileStorageKey source — https://github.com/pointfreeco/swift-sharing
4. swift-openapi-generator — https://github.com/apple/swift-openapi-generator
5. OFREP Swift provider — https://github.com/open-feature/ofrep-swift-client-provider
