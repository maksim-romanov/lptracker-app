# ios-app

SwiftUI app for iOS, iPadOS and macOS, plus widgets. Design and plan: `docs/research/ios-app/` and, once approved, `docs/specs/ios-app-plan.md`. Stack: [ADR 0019](../../docs/decisions/0019-ios-stack.md).

## Commands (*planned*)

- `bun run check` — `codegen`, `typecheck`, `lint`, `test`; wraps `tuist generate`, `xcodebuild test`, `swiftlint --strict`. Needs macOS and Xcode.

## Rules

- Code style: [code-style](../../docs/concepts/code-style.md#swift). *Convention* where no lint rule exists.
- Change `Project.swift` and run `tuist generate`; never edit `*.xcodeproj` or `*.xcworkspace`. Enforced by both being gitignored.
- Feature modules import only Domain and DesignSystem; only the app target imports Data and APIClient. Enforced by the Tuist target graph.
- Decoding never fails on an unknown `type`, `kind` or `status`; unknown families render from the display descriptor. Enforced by golden decode tests.
- Accessibility and motion rules: [ADR 0022](../../docs/decisions/0022-accessibility.md), [ADR 0023](../../docs/decisions/0023-motion.md); enforced on PRs by `performAccessibilityAudit()`, snapshot tests and smoke journeys; hitch metrics gate releases.
- Build settings, entitlements and `Info.plist` change only in `Project.swift`, never through Xcode MCP tools; `tuist generate` overwrites them. *Convention.*

## Tools

Docs: Tuist [`llms.txt`](https://docs.tuist.dev/llms.txt); Apple APIs through Xcode documentation search (`xcrun mcpbridge`) or sosumi, citing the developer.apple.com page. Optional: MobileBuildMCP to build, run and drive the app; gates stay CLI commands. Setup: [CONTRIBUTING.md](../../CONTRIBUTING.md#recommended-tools).

## Stop and ask

- A screen needs data the API does not return.
- A new third-party dependency.
