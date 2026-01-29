# Code Style

## Language

All documentation and code comments must be in **English only**.

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components, Screens | PascalCase | `PositionsScreen.tsx`, `PositionCard.tsx` |
| Everything else | kebab-case | `wallet.repository.ts`, `tokens.ts` |

## TypeScript Naming

| Type | Convention | Example |
|------|------------|---------|
| Types | PascalCase + `T` prefix | `TPosition`, `TWallet` |
| Interfaces | PascalCase + `I` prefix | `IWalletState` |
| Enums | PascalCase + `E` prefix | `ENetworkQuality`, `EErrorCode` |
| DI Tokens | SCREAMING_SNAKE_CASE | `POSITIONS_REPOSITORY`, `WALLET_SERVICE` |

## Linting

Project uses **Biome** for linting and formatting:

```bash
bun run check        # Check for issues
bun run check:fix    # Auto-fix issues
```

Biome config is in `biome.json` at the root.
