# Code Style

## Language

All documentation and code comments must be in English only.

## Import Order

1. React / React Native
2. Expo modules
3. Third-party libraries
4. Core imports (using path aliases)
5. Local imports

```typescript
import React from "react";
import { View, Text } from "react-native";

import { useRouter } from "expo-router";
import { useStyles } from "react-native-unistyles";

import { container } from "core/di";
import { StyleSheet } from "core/presentation/theme";

import { PositionCard } from "./components/PositionCard";
```

## Styling

Use `react-native-unistyles` for all styles:

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
}));
```

Theme types are augmented in `src/types/unistyles.d.ts`.

## Naming Conventions

### File Naming

#### Components & Screens — PascalCase

- `PositionCard.tsx` — UI component
- `WalletsScreen.tsx` — screen component
- `PositionCardSkeleton.tsx` — skeleton/loading variant
- `withAuth.tsx` — higher-order component
- `WalletCardMenu.ios.tsx` — platform-specific variant

#### Hooks — camelCase

- `usePositionsQuery.ts` — matches export name

#### Domain & Infrastructure — kebab-case with suffix

- `positions.repository.ts` — data access
- `delete-wallet.usecase.ts` — business logic
- `token-price.service.ts` — domain service
- `wallets.store.ts` — state management
- `position.events.ts` — domain events
- `position.error.ts` — error classes
- `auth.middleware.ts` — middleware
- `positions.keys.ts` — React Query keys
- `walletCardMenu.types.ts` — co-located types
- `gateway.d.ts` — generated type declarations

#### Special Files

- `tokens.ts` — DI token definitions (Symbols)
- `register.ts` — DI module registration
- `index.ts` — barrel exports
- `_layout.tsx` — Expo Router layout
- `+not-found.tsx` — Expo Router 404

### Directory Naming

- Lowercase, kebab-case when multi-word (e.g. `nonfungible-positions/`)
- Feature modules live at `src/` root level (`wallets/`, `positions/`, `core/`)
- DDD layers as subdirectories: `di/`, `domain/`, `data/`, `application/`, `presentation/`

### TypeScript Naming

- **Types/Interfaces**: PascalCase with `T` prefix for types (`TPosition`, `IWalletState`)
- **Enums**: PascalCase with `E` prefix (`ENetworkQuality`, `EErrorCode`)
- **DI Tokens**: SCREAMING_SNAKE_CASE (`POSITIONS_REPOSITORY`, `WALLET_SERVICE`)

## Error Classes

Each module defines its own error class:

```typescript
export class PositionsError extends Error {
  constructor(
    public readonly code: PositionsErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "PositionsError";
  }

  static isInstance(value: unknown): value is PositionsError {
    return value instanceof PositionsError;
  }
}
```

## Screen Components

Keep screens thin - delegate to stores and hooks:

```typescript
export function PositionsScreen() {
  const { theme } = useStyles();

  return (
    <SafeAreaView style={styles.container(theme)}>
      {/* UI components */}
    </SafeAreaView>
  );
}
```
