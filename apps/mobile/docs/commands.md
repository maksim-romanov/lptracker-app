# Commands

## Development

```bash
# Start Expo dev server
bun dev

# Run on iOS simulator
bun dev:ios

# Run on Android emulator
bun dev:android

# Lint code
bun lint

# Lint and fix code
bun lint:fix

# Type-check
bun typecheck
```

## From Monorepo Root

```bash
# Start mobile dev server
bun run dev --filter=mobile

# Run iOS
bun run dev:ios --filter=mobile

# Run Android
bun run dev:android --filter=mobile
```

## Code Generation

```bash
# Generate types (from monorepo root)
bun codegen
```

Mobile codegen depends on server codegen completing first.

## Build

Build commands will be added when EAS Build is configured.

```bash
# iOS build (future)
# bun app:build -p ios

# Android build (future)
# bun app:build -p android
```
