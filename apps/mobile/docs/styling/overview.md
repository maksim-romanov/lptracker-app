# Styling Guide

## Overview

The mobile app uses a layered theming system:

1. **@mars-909/theme** - Shared design tokens (colors, spacing, typography)
2. **react-native-unistyles** - Runtime styling with theme access
3. **@grapp/stacks** - Layout components (Box, Stack, Columns)

## Theme Configuration

Theme is configured in `src/core/presentation/theme/unistyles.ts`:

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

Current theme: **Neon** (Uniswap-inspired hot pink `#FF007A`)

## Topics

- [Colors](colors.md) - Material Design 3 color tokens
- [Typography](typography.md) - Font variants and Text component
- [Spacing](spacing.md) - Spacing scale, border radius, breakpoints
- [Layout](layout.md) - @grapp/stacks (Box, Stack, Columns)

## Complete Example

```typescript
import React from "react";
import { Text, View } from "react-native";
import { Box, Stack } from "@grapp/stacks";
import { useStyles } from "react-native-unistyles";

import { StyleSheet } from "core/presentation/theme";

export function PositionCard({ title, value }: Props) {
  const { theme } = useStyles();

  return (
    <View style={styles.card}>
      <Stack space={2}>
        <Text style={[styles.label, { color: theme.onSurfaceVariant }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: theme.onSurface }]}>
          {value}
        </Text>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.surfaceVariant,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  label: {
    ...theme.typography.label,
  },
  value: {
    ...theme.typography.headline,
  },
}));
```
