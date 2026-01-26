# Getting Started

## Requirements

- [Bun](https://bun.sh/) >= 1.3.6
- Node.js >= 18 (for some tooling)
- Xcode (for iOS development)
- Android Studio (for Android development)

## Installation

```bash
bun install
```

## Development

### Start API Server

```bash
bun run dev
```

The server runs with hot reload on file changes.

### Start Mobile App

**iOS:**
```bash
bun run dev:ios
```

**Android:**
```bash
bun run dev:android
```

## Common Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all dev servers |
| `bun run dev:ios` | Start server + iOS app |
| `bun run dev:android` | Start server + Android app |
| `bun run build` | Build all packages |
| `bun run check` | Lint with Biome |
| `bun run check:fix` | Lint and auto-fix |
| `bun run codegen` | Generate types (see [codegen.md](./codegen.md)) |

## Project Structure

```
apps/
├── server/     # Hono API server
├── mobile/     # Expo React Native app
└── subgraphs/  # The Graph indexers

packages/
└── typescript-config/  # Shared TS config
```
