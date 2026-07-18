# CLAUDE.md — apps/mobile

React Native 0.83 / Expo 55 / React 19. See [docs/architecture.md](docs/architecture.md) for the full write-up.

## Layout

- `src/app/` — expo-router entry.
- `src/core/` — shared infra: DI container, theme setup, TanStack Query, API client.
- `src/{wallets,membership,onboarding,positions,widgets}/` — feature modules, layered `di/ → domain/ → data/ → application/ → presentation/`.
- `src/features/uniswap-v3/` — protocol plugin, exports only a barrel façade.
- `src/positions/` — protocol-agnostic shell (`IProtocolPlugin<T>` contract, gateway repo).
- `modules/widget-bridge/`, `targets/positions-widget/` — native iOS widget (Expo module + SwiftUI target via `@bacons/apple-targets`).

## Notes

- Business logic stays in use cases, not components — screens resolve a store/use case from DI and render.
- DI: Symbol tokens per module (`SCREAMING_SNAKE_CASE`), registered in each module's `di/register.ts`.
- Naming (`T`/`I`/`E` prefixes, kebab-case + role-suffix files) is a real, consistently-followed convention here — unlike `apps/server`.
- The protocol-plugin façade (`features/<protocol>` barrel only) is convention, not Biome-enforced — review imports manually.
- Widget data flow, App Group ID, and Swift conventions: [docs/widget-silent-push.md](docs/widget-silent-push.md), [docs/swift-conventions.md](docs/swift-conventions.md).

## Android device → host ports

```bash
adb reverse tcp:3000 tcp:3000   # server
adb reverse tcp:3100 tcp:3100   # tokens-data
```

## Commands

```bash
bun run dev:ios / dev:android
bun run codegen
bun run typecheck
```
