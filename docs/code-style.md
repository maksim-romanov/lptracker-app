# Code Style

## Language

All documentation and code comments must be in **English only**.

## File Naming

- **Components & Screens** — `PascalCase.tsx` (e.g. `PositionCard.tsx`, `WalletsScreen.tsx`)
- **Hooks** — `camelCase.ts` matching export name (e.g. `usePositionsQuery.ts`)
- **Everything else** — `kebab-case.ts` (e.g. `wallet.repository.ts`, `fee-math.ts`)

> See [apps/mobile/docs/code-style.md](../apps/mobile/docs/code-style.md#file-naming) for detailed suffix conventions (`.repository.ts`, `.usecase.ts`, `.store.ts`, etc.).

## TypeScript Naming

- **Types** — `T` prefix: `TPosition`, `TWallet`
- **Interfaces** — `I` prefix: `IRepository`, `ICache`
- **Enums** — `E` prefix: `EChainId`, `EStatus`
- **DI Tokens** — `SCREAMING_SNAKE_CASE`: `POSITIONS_REPOSITORY`

## Linting

Project uses **Biome** for linting and formatting:

```bash
bun run lint         # Check for issues
bun run lint:fix     # Auto-fix issues
```

Biome config is in `biome.json` at the root.
