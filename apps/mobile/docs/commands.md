# Commands

## Development

```bash
# Start Expo dev server
bun dev

# Run on iOS simulator
bun dev:ios

# Run on Android emulator
bun dev:android

# Forward host dev-server ports to the Android device/emulator
# (server: 3000, tokens-data: 3100 — required for API calls to reach
# the Mac from inside the device)
adb reverse tcp:3000 tcp:3000
adb reverse tcp:3100 tcp:3100

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
