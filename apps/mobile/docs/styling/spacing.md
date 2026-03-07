# Spacing, Radius & Breakpoints

## Spacing Scale

4px base unit:

- `none` — 0px
- `xxs` — 2px (micro spacing)
- `xs` — 4px (icon gaps)
- `sm` — 8px (inline elements)
- `md` — 12px (card padding)
- `lg` — 16px (section padding)
- `xl` — 20px (comfortable)
- `2xl` — 24px (relaxed)
- `3xl` — 32px (loose)
- `4xl` — 40px (section gaps)
- `5xl` — 48px (large sections)
- `6xl` — 64px (hero spacing)
- `7xl` — 80px (extra large)
- `8xl` — 96px (maximum)

```typescript
padding: theme.spacing.md,    // 12px
marginBottom: theme.spacing.lg, // 16px
```

## Border Radius

- `none` — 0px (sharp corners)
- `xs` — 4px (subtle rounding)
- `sm` — 8px (light rounding)
- `md` — 12px (cards)
- `lg` — 16px (modals)
- `xl` — 20px
- `2xl` — 24px
- `3xl` — 32px (pill-like)
- `full` — 9999px (circles)

```typescript
borderRadius: theme.radius.md, // 12px
```

## Breakpoints

Responsive design breakpoints:

- `xs` — 0px+ (small phones)
- `sm` — 576px+ (large phones)
- `md` — 768px+ (tablets)
- `lg` — 992px+ (large tablets)
- `xl` — 1200px+ (desktop)

```typescript
const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.md,
    variants: {
      md: { padding: theme.spacing.xl },
    },
  },
}));
```
