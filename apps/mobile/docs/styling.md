# Styling Guide

## Overview

The mobile app uses a layered theming system:

1. **@matrapp/theme** - Shared design tokens (colors, spacing, typography)
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

## Color Tokens

Material Design 3 semantic naming:

| Token | Usage |
|-------|-------|
| `primary` | Primary brand color |
| `onPrimary` | Text/icons on primary |
| `primaryContainer` | Primary surface variant |
| `secondary` | Secondary accent |
| `surface` | Card/container backgrounds |
| `onSurface` | Primary text color |
| `surfaceVariant` | Subtle surface distinction |
| `background` | Screen background |
| `outline` | Borders, dividers |
| `error` / `success` / `warning` | Semantic states |

Current theme: **Neon** (Uniswap-inspired hot pink `#FF007A`)

## Spacing Scale

4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | No spacing |
| `xxs` | 2px | Micro spacing |
| `xs` | 4px | Minimal (icon gaps) |
| `sm` | 8px | Tight (inline elements) |
| `md` | 12px | Compact (card padding) |
| `lg` | 16px | Default (section padding) |
| `xl` | 20px | Comfortable |
| `2xl` | 24px | Relaxed |
| `3xl` | 32px | Loose |
| `4xl` | 40px | Section gaps |
| `5xl` | 48px | Large sections |
| `6xl` | 64px | Hero spacing |
| `7xl` | 80px | Extra large |
| `8xl` | 96px | Maximum |

```typescript
// Usage
padding: theme.spacing.md,    // 12px
marginBottom: theme.spacing.lg, // 16px
```

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `none` | 0px | Sharp corners |
| `xs` | 4px | Subtle rounding |
| `sm` | 8px | Light rounding |
| `md` | 12px | Default (cards) |
| `lg` | 16px | Medium (modals) |
| `xl` | 20px | Large |
| `2xl` | 24px | Extra large |
| `3xl` | 32px | Pill-like |
| `full` | 9999px | Circles |

```typescript
borderRadius: theme.radius.md, // 12px
```

## Typography

6 semantic variants using Satoshi font:

| Variant | Size | Weight | Usage |
|---------|------|--------|-------|
| `display` | 36px | 700 | Hero text, splash screens |
| `headline` | 22px | 600 | Screen titles, section headers |
| `bodyLarge` | 16px | 400 | Emphasized paragraphs |
| `body` | 14px | 400 | Default text, descriptions |
| `bodySmall` | 12px | 400 | Secondary info, timestamps |
| `label` | 12px | 500 | Buttons, tabs, form labels |

```typescript
// Usage
<Text style={theme.typography.headline}>Screen Title</Text>
<Text style={theme.typography.body}>Description text</Text>
```

## @grapp/stacks Layout

Stacks provides layout primitives with automatic spacing.

### Box

Container with padding and gap support:

```typescript
import { Box } from "@grapp/stacks";

<Box padding={4} paddingX={6}>
  {/* 16px vertical, 24px horizontal padding */}
</Box>
```

### Stack

Vertical/horizontal stacking with consistent gaps:

```typescript
import { Stack } from "@grapp/stacks";

// Vertical stack (default)
<Stack space={4}>
  <Card />
  <Card />
</Stack>

// Horizontal stack
<Stack horizontal space={2}>
  <Button />
  <Button />
</Stack>
```

### Columns

Horizontal layout with flexible widths:

```typescript
import { Columns, Column } from "@grapp/stacks";

<Columns space={4}>
  <Column width="1/3">
    <Label />
  </Column>
  <Column width="2/3">
    <Input />
  </Column>
</Columns>
```

### Stacks Spacing

Stacks uses the base unit (4px). Values multiply:

| Value | Result |
|-------|--------|
| `1` | 4px |
| `2` | 8px |
| `3` | 12px |
| `4` | 16px |
| `6` | 24px |
| `8` | 32px |

## Breakpoints

Responsive design breakpoints:

| Name | Min Width | Target |
|------|-----------|--------|
| `xs` | 0px | Small phones |
| `sm` | 576px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 992px | Large tablets |
| `xl` | 1200px | Desktop |

```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.md,
    // Responsive overrides
    variants: {
      md: { padding: theme.spacing.xl },
    },
  },
}));
```

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
