---
app: ios-app
topic: iOS project skeleton (M0)
checked: 2026-09-30
---

# iOS project skeleton (M0)

Scope: what M0 builds for `apps/ios-app`: project generation, module graph, codegen, lint, test harness and toolchain pins. Builds on [audit-notes.md](audit-notes.md). Its test-configuration injection (now launch arguments, see [e2e-testing](../repo/e2e-testing.md)) and the rule that every module is a Tuist target still apply and are not repeated here.

## Decisions
- We generate the project with Tuist (`Project.swift` + `Workspace.swift`, `Tuist.swift` config, helpers in `Tuist/ProjectDescriptionHelpers`) and declare sources with `buildableFolders`, because synchronized folders make adding a file need no regeneration and no manifest edit, which suits agent edits. Buildable folders exist since Tuist 4.62.0. [1][0019]
- We give the app and widget targets `destinations: [.iPhone, .iPad, .mac]`, not the `.iOS` preset, because `.iOS` includes `.macWithiPadDesign` and we ship a native macOS app. The deployment target is `.multiplatform(iOS: "26.0", macOS: "26.0")`. [4][0019]
- We use this M0 module list. Each module is a Tuist `.framework` target in one `Project.swift`, not a local SPM package:
  - Composition roots: `VoidX` (app), `VoidXWidgets` (widget extension).
  - Libraries: `Domain`, `DesignSystem`, `APIClient`, `Data`, `WidgetUI`, `AppIntentsKit`, `FeaturePortfolio` (stub), `FeatureSettings` (stub).
  - Tests: `DomainTests`, `APIClientTests` (golden decode), `DesignSystemSnapshotTests`, `VoidXUITests`.
  - Empty modules still get a target, so the graph ADR 0019 declares exists from day one. [0019]
- We run `tuist inspect dependencies --only implicit` in CI, not `tuist inspect implicit-imports`, because the old command has been deprecated since the unified command shipped (Tuist changelog 2025-12-13). **This conflicts with ADR 0019 and audit-notes.md, which name the deprecated command.** [2][3]
- We add third-party packages (swift-dependencies, swift-sharing, swift-openapi-runtime, swift-openapi-urlsession, swift-snapshot-testing) in `Tuist/Package.swift`. CI runs `tuist install` and then `tuist generate --no-open`, so SPM packages become Xcode targets inside the same graph and the implicit-import check can see them. [5]
- We generate `APIClient` with the CLI `swift-openapi-generator generate --mode types --mode client --access-modifier public --output-directory apps/ios-app/Modules/APIClient/Generated packages/contracts/openapi.swift.json` (open enums as `anyOf`) and commit the output (`Types.swift`, `Client.swift`). `public` is needed because `Data` imports it from another module; the default access level is `package`. We do not use the build plugin, because generated files must be committed and checked for drift. [10][11][0019]
- We install the generator CLI through mise's `spm:` backend (`"spm:apple/swift-openapi-generator" = "<exact tag>"`) so `bun run codegen` needs no hand-written `Package.swift` wrapper. The latest tag seen is 1.13.1. [9][12]
- We let the UI-test mock API live in-process. The composition root reads a launch argument (`scenario`, superseded `VOIDX_API=fixture` env key; see [e2e-testing](../repo/e2e-testing.md)) and builds the generated `Client` with a fixture `ClientTransport` (Debug builds only) instead of `URLSessionTransport`. This makes XCUITest deterministic without a server on the runner. [11][audit-notes]
- We format with `swift format` from the toolchain and lint with `swiftlint --strict`. The toolchain has shipped swift-format since Swift 6 and Xcode 16, so formatting needs no new dependency. SwiftLint carries the rules swift-format lacks: the ADR 0023 custom regex against literal durations, and the opt-in rules `accessibility_label_for_image` and `accessibility_trait_for_button`. SwiftLint rules that overlap with formatting are disabled so the two tools never fight. [13][14][15]
- We use pointfreeco/swift-snapshot-testing 1.19.x through its Swift Testing trait `@Suite(.snapshots(record: .never))` (recording only through `bun run snapshots:record`). It renders SwiftUI views with overridden trait collections (content size categories) from one simulator, which is how ADR 0022 wants accessibility text sizes captured. **This is a new dependency and needs owner sign-off.** [16][0022]
- We pin Tuist and the generator in `mise.toml`, and pin Xcode through `Tuist.swift` `compatibleXcodeVersions`, with CI selecting the Xcode version via `DEVELOPER_DIR`/`xcode-select`. mise cannot install or select Xcode, and Tuist only validates the selected Xcode; it does not pick one (tuist#6063, closed as not planned). [5][8][19]
- We take bundle ids from one helper constant, `bundleIdPrefix = "xyz.depthly.voidx"` (working value, frozen before M4 per ADR 0044):
  - App: `<prefix>`. Widget: `<prefix>.widgets`.
  - App Group: `group.<prefix>`. Keychain group: `$(AppIdentifierPrefix)<prefix>.shared`.
  - M0 signs nothing for devices. The team id arrives with the developer account before TestFlight.

## Facts that constrain us
- **Xcode 27 (27A266a) shipped on 2026-09-14, and iOS/macOS 27.0.1 on 2026-09-28.** The brief says "Xcode 26". The GitHub-hosted `macos-26` image (20260907) defaults to Xcode 26.6 (superseded: [ci](../repo/ci.md) lists 26.4.1 as default and 26.5 as highest), carries iOS/macOS SDKs up to 26.5/26.6, and has no mise or Tuist preinstalled. [17][18]
- The hosted image lists no macOS simulators. macOS tests run natively on the runner (`-destination 'platform=macOS'`); only iOS and iPadOS use simulators (for example iPhone 17 and iPad Air 11-inch on iOS 26.x). [18]
- Tuist CLI moves fast. The latest pre-releases on 2026-09-30 are 4.212.0-canary.9 and 4.211.0-rc.1 (2026-09-28), so we pin an exact stable version rather than `latest`. [6]
- The implicit-dependency check is static analysis: it can miss cases, and it historically missed external (SPM) dependencies (tuist#6697). It complements a correct graph; it cannot replace one. [2][3]
- swift-openapi-generator supports OpenAPI 3.0/3.1 (3.2 preliminary). It has used Swift 6 language mode since 1.13.0 and dropped Swift 6.0 in its CI matrix. [11][12]
- SwiftLint 0.65.1 (2026-08-21) needs Swift 6.1+ to build from source. It has only two accessibility rules, both opt-in, so the ADR 0022 iOS gate rests on `performAccessibilityAudit()` and snapshots, not lint. [14][15]
- swift-snapshot-testing 1.19.0 moved from `isRecording` to `record:` and added Swift Testing attachments (native image attachments on Swift 6.3+). A snapshot must be compared on the same simulator model and OS it was recorded on. [16]
- Tuist publishes agent skills (`npx skills add tuist/agent-skills`) for Claude Code, Codex, Amp and OpenCode. The repo's main documented skill is `migrate`, which does not apply to a greenfield project. [7]

## What "green" means for M0
All of these must pass in order:
1. `mise install`.
2. `tuist install` and `tuist generate --no-open`.
3. `tuist inspect dependencies --only implicit`.
4. `swift format lint --strict --recursive` and `swiftlint --strict`.
5. Codegen drift: rerun the generator, then `git diff --exit-code` on `Generated/`.
6. `xcodebuild test` of the `VoidX` scheme on an iPhone simulator, an iPad simulator and `platform=macOS`. This runs:
   - one Swift Testing test in `DomainTests`;
   - one golden decode test with an unknown enum value;
   - one snapshot of a DesignSystem placeholder at default and AX5 text sizes (iOS);
   - one XCUITest that launches with the `scenario` launch argument and passes `performAccessibilityAudit()` on the placeholder screen.
7. `VoidXWidgets` builds for iOS and macOS.

## Open questions
- Resolved by owner decision 2 in the [M0 spec](../../specs/m0-skeleton.md): `Domain` is a Tuist target tested through `xcodebuild`. ~~Conflict:~~ `apps/ios-app/AGENTS.md` plans `swift test --package-path Packages` for Domain and DesignSystem, and ADR 0019 says `Domain` "runs under `swift test` on any machine". Both imply a local SPM package, but ADR 0019 and audit-notes.md make every module a Tuist target, which `swift test` cannot run. Which one wins, or does `Domain` alone get a thin `Package.swift`?
- **Conflict:** ADR 0019 and audit-notes.md name `tuist inspect implicit-imports`, which is deprecated (see Decisions).
- Xcode 26.6 or Xcode 27 for M0? Hosted runners default to 26.6 today. The date when App Store uploads will require the Xcode 27 SDK was not checked.
- Static or dynamic frameworks: modules shared by the app and the widget extension are duplicated when linked statically. Tuist's guidance was not reachable (403) and is not settled.
- The macOS App Group identifier format (`group.` prefix or team-id prefix) for a multiplatform target sharing one entitlement file.
- Whether to vendor any Tuist agent skill into `.agents/`. That is a change to agent config, so the owner decides.
- tuist.dev returned 403 to direct fetches. The Tuist CI and inspect facts come from search excerpts of those pages; re-verify them before relying on them.

## Sources
1. Tuist: Support for buildable folders in 4.62.0 — https://community.tuist.dev/t/support-for-buildable-folders-in-tuist-4-62-0/723
2. Tuist changelog: unified inspect dependencies command — https://tuist.dev/changelog/2025.12.13-inspect-dependencies
3. Tuist CLI: inspect implicit-imports — https://tuist.dev/en/docs/cli/inspect/implicit-imports
4. Tuist ProjectDescription: Destinations — https://docs.tuist.dev/ko/references/project-description/extensions/destinations
5. Tuist: Continuous Integration guide — https://tuist.dev/en/docs/guides/integrations/continuous-integration
6. Tuist releases — https://github.com/tuist/tuist/releases
7. tuist/agent-skills — https://github.com/tuist/agent-skills
8. Tuist issue 6063, Xcode selection via `.xcode-version` — https://github.com/tuist/tuist/issues/6063
9. mise SPM backend — https://mise.jdx.dev/dev-tools/backends/spm.html
10. swift-openapi-generator: Manually invoking the generator CLI — https://github.com/apple/swift-openapi-generator/blob/main/Sources/swift-openapi-generator/Documentation.docc/Articles/Manually-invoking-the-generator-CLI.md
11. swift-openapi-generator README — https://github.com/apple/swift-openapi-generator
12. swift-openapi-generator releases — https://github.com/apple/swift-openapi-generator/releases
13. swift-format README — https://github.com/swiftlang/swift-format
14. SwiftLint rule directory — https://realm.github.io/SwiftLint/rule-directory.html
15. SwiftLint releases — https://github.com/realm/SwiftLint/releases
16. swift-snapshot-testing — https://github.com/pointfreeco/swift-snapshot-testing
17. Apple Developer releases — https://developer.apple.com/news/releases/
18. GitHub runner image macOS 26 arm64 — https://github.com/actions/runner-images/blob/main/images/macos/macos-26-arm64-Readme.md
19. xcodes — https://github.com/XcodesOrg/xcodes
- [0019] ADR 0019, [0022] ADR 0022, [audit-notes] audit-notes.md — in this repo
