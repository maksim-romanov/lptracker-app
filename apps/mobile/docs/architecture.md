# Architecture

## Tech Stack

React Native 0.81 + Expo 54 + TypeScript 5.9 | Unistyles | tsyringe DI | expo-router

See [project architecture](../../../docs/architecture.md) for the full tech stack and monorepo structure.

## Project Structure

```
src/
├── app/                    # Expo Router - ONLY navigation, minimal logic
│   ├── (tabs)/             # Tab navigation (positions, wallets)
│   ├── onboarding.tsx      # Onboarding screen
│   └── _layout.tsx         # Root layout with theme provider
│
├── core/                   # Core domain (shared across features)
│   ├── di/                 # Global DI container & registration
│   └── presentation/       # Shared UI: theme, components, hooks
│       └── theme/          # Unistyles configuration
│
├── positions/              # Feature module: Positions
├── wallets/                # Feature module: Wallets
├── onboarding/             # Feature module: Onboarding
│
└── types/                  # Global type definitions
```

## DDD Module Structure

Each feature module follows this structure:

```
feature/
├── di/
│   ├── tokens.ts           # DI tokens (Symbols)
│   └── register.ts         # Module registration
├── domain/
│   ├── entities/           # Domain entities
│   ├── errors/             # Feature-specific errors
│   └── events.ts           # Feature events
├── data/
│   └── repository.ts       # Data access layer
├── application/
│   ├── usecases/           # Business logic
│   └── handlers/           # Event handlers
├── presentation/
│   ├── stores/             # State stores
│   ├── screens/            # Screen components
│   ├── components/         # UI components
│   └── hooks/              # React hooks
└── index.ts                # Exports register function
```

## Key Patterns

### Framework-Agnostic Business Logic

UI components are thin - business logic lives in use cases, not in React components.

### DI Token Strategy

- **Repositories/Services** → Symbol tokens (replaceable, mockable)
- **Use cases/Events** → Direct class injection (concrete implementations)

```typescript
// Tokens for replaceable dependencies
export const POSITIONS_REPOSITORY = Symbol("POSITIONS_REPOSITORY");
container.register(POSITIONS_REPOSITORY, PositionsRepository);

// Direct injection for concrete implementations
constructor(
  @inject(POSITIONS_REPOSITORY) private readonly repo: PositionsRepository,
) {}
```

## Theme System

The app uses `@depthly/theme` package with Material Design 3 color tokens:

- **5 theme variants**: Ocean, Nebula, Mint, Sunset, Midnight
- **Light/Dark modes** for each variant
- **Unistyles** for runtime theme switching

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface,
    padding: theme.spacing.md,
  },
}));
```

## Navigation

Expo Router with file-based routing:

- `app/_layout.tsx` - Root layout with theme provider
- `app/index.tsx` - Initial redirect
- `app/onboarding.tsx` - Onboarding screen
- `app/(tabs)/` - Tab navigation group

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "core/*": ["./src/core/*"],
    "positions/*": ["./src/positions/*"],
    "wallets/*": ["./src/wallets/*"],
    "onboarding/*": ["./src/onboarding/*"],
    "types/*": ["./src/types/*"]
  }
}
```

## Multi-protocol plugin pattern

Position-related modules use a shell + plugin layout:

- **`positions/` (shell)** owns the protocol-agnostic surface: `IProtocolPlugin<T>` contract,
  `lookupPlugin` helper, `GatewayPositionsRepository`, routing, query keys, shell components
  (`PositionShell`, `PositionListItem`, `PositionDetailShell`, `UnknownPositionBody`),
  and the `FollowingStore` / `FollowingRepository`.
- **`features/<protocol>/` (plugin)** exposes a single `index.ts` exporting a
  `<protocol>Plugin: IProtocolPlugin<T>` object. Each plugin owns its internal VM,
  DTO→VM mapper, presentation components (`ListBody`, `DetailBody`, optional `Strip`),
  and protocol-specific UseCases. Strictly typed against `TPositionByExt<T>`.
- **`app/protocol-plugins.ts`** is a const-object registry keyed by extension type
  and constrained exhaustively against `TKnownProtocolSlug` (from `@depthly/catalog`)
  via TypeScript `satisfies`. Adding a protocol to the catalog without registering a
  mobile plugin produces a compile error.

External consumers must import plugin modules via the façade `features/<protocol>`;
deep imports are forbidden by the Biome `noRestrictedImports` rule in the root
`biome.json`.

See `packages/catalog/README.md` for the "adding a protocol" walkthrough.
