# Depthly

DeFi portfolio monitoring — track your LP positions, accumulated fees, and on-chain holdings across multiple networks in one place.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![Swift](https://img.shields.io/badge/Swift-F05138?logo=swift&logoColor=white)](https://swift.org)
[![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org)

## Stack

Hono API on Bun · The Graph subgraphs (AssemblyScript) · React Native 0.83 / Expo 55 / React 19 · Turborepo · Home-screen widgets via SwiftUI/WidgetKit (iOS) and Jetpack Glance (Android), shipped through an Expo Module bridge

## Requirements

- [Bun](https://bun.sh) ≥ 1.3.6
- Xcode (iOS) / Android Studio (Android)
- Docker (only for running subgraphs locally)

## Quickstart

```bash
bun install
bun run dev:ios      # or dev:android — boots mobile + server + tokens-data
```

See [CLAUDE.md](CLAUDE.md) for architecture, conventions, and the full command list. Per-app guidance lives in `apps/server/CLAUDE.md` and `apps/mobile/CLAUDE.md`.
