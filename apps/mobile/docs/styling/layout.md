# Layout (@grapp/stacks)

Stacks provides layout primitives with automatic spacing.

## Box

Container with padding and gap support:

```typescript
import { Box } from "@grapp/stacks";

<Box padding={4} paddingX={6}>
  {/* 16px vertical, 24px horizontal padding */}
</Box>
```

## Stack

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

## Columns

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

## Stacks Spacing

Stacks uses the base unit (4px). Values multiply:

- `1` — 4px
- `2` — 8px
- `3` — 12px
- `4` — 16px
- `6` — 24px
- `8` — 32px
