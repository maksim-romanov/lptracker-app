# CLAUDE.md — apps/mobile

See [docs/architecture.md](docs/architecture.md) for the DDD module layout, the file-naming suffix table, the multi-protocol plugin pattern, and DI tokens.

## Rules specific to this app

- **Business logic stays in use cases, not in React components.** Screens are thin: resolve the store/hook, render. If a component file contains a Result-mapping or a network call, move it.
- **Modules don't share error types.** Each feature owns its `*.error.ts`. Cross-feature work goes through the gateway (`positions/` shell).
- **Plugin façade is the only entry point.** Import `features/<protocol>` (the barrel), never deep paths — enforced by Biome `noRestrictedImports` in root `biome.json`.

## Android device → host ports

When running on a physical Android device or non-localhost emulator, forward both backend ports so API + tokens-data calls reach the Mac:

```bash
adb reverse tcp:3000 tcp:3000   # server
adb reverse tcp:3100 tcp:3100   # tokens-data
```

## Widget extension (`targets/positions-widget`)

Native iOS widget for one followed LP position. Built with `@bacons/apple-targets` (CNG-compatible — never eject). Data flow: RN app writes a JSON snapshot to the App Group via the `widget-bridge` native module; the SwiftUI widget reads it on every timeline reload.

- Swift conventions: [docs/swift-conventions.md](docs/swift-conventions.md). TypeScript conventions (`T`/`I`/`E` prefixes, kebab-case files) do **not** apply to Swift.
- App Group: `group.com.depthly.app.shared`
- Widget kind: `depthly.position`
- Refresh trigger: TanStack Query refetch success path. Future silent-push plan: [docs/widget-silent-push.md](docs/widget-silent-push.md).
