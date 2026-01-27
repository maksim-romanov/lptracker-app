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
bun check

# Lint and fix code
bun check:fix
```

## From Monorepo Root

```bash
# Start mobile dev server
bun run dev --filter=@matrapp/mobile

# Run iOS
bun run dev:ios --filter=@matrapp/mobile

# Run Android
bun run dev:android --filter=@matrapp/mobile
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
