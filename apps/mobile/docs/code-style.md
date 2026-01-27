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

- **Files**: kebab-case (`positions.screen.tsx`, `wallet.repository.ts`)
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
