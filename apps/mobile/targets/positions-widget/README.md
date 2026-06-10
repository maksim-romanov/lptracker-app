# Positions Widget

iOS home-screen widget for the Depthly app. SwiftUI + WidgetKit + AppIntents on iOS 18+.

## Local dev

```bash
cd apps/mobile && bun expo run:ios
```

Widgets do not work in Expo Go — only in a dev client build.

## Configuration

User adds widget → taps it → "Edit Widget" → picks a Following position. The picker (`PositionQuery`) reads the snapshot file from the App Group container.

## Snapshot

Read by `SnapshotStore.load()` from:
`group.com.depthly.app.shared/widget-snapshot.json`

Written by the RN app via the `widget-bridge` Expo module on every TanStack Query refetch.

## File layout

See [Swift conventions doc](../../docs/swift-conventions.md) for naming, structure, and anti-patterns. Top-level folders:

- `Sources/Configuration/` — Widget + AppIntent + AppEntity + Query
- `Sources/Timeline/` — Provider, Entry, SnapshotStore
- `Sources/Models/` — Codable snapshot types (discriminated extension union)
- `Sources/Rendering/` — SwiftUI views (Common, Small, Medium, Protocols/UniswapV3)
- `Sources/DesignSystem/` — color tokens, fonts, spacing
- `Sources/Utilities/` — pure helpers (RangeMath, ColorHex)

## Tooling

Swift code is checked by `swift-format` and `swiftlint`:

```bash
brew install swift-format swiftlint
```

Both are wired into the repo's pre-commit hooks.
