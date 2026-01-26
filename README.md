[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Hono](https://img.shields.io/badge/Hono-E36002?logo=hono&logoColor=white)](https://hono.dev)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![The Graph](https://img.shields.io/badge/The_Graph-6747ED?logo=thegraph&logoColor=white)](https://thegraph.com)

A modular data platform for querying, indexing, and analyzing on-chain positions across multiple networks.

## Overview

ThePlatform provides a unified interface to access position data from decentralized protocols. It handles the complexity of multi-chain indexing, real-time fee calculations, and data normalization — so you can focus on building.

## Platform Structure

```
apps/
├── server      # API layer — serves normalized position data
├── mobile      # Mobile client
└── subgraphs   # Blockchain indexers — event processing pipelines
packages/
└── typescript-config   # Shared compiler settings
```

## Architecture

The platform follows **Clean Architecture** with strict layer separation:

- **Domain** — Core entities and business rules
- **Data** — Repositories, clients, and data transformation
- **Application** — Use cases orchestrating business logic
- **Presentation** — API routes, validation, error mapping

**Key principles:**

- Multi-chain support via isolated dependency containers
- Type-safe error handling with Result types
- DTO pattern for clean API contracts
- OpenAPI-documented endpoints

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Server | Hono |
| Mobile | React Native, Expo, Native Modules (iOS/Android) |
| Validation | Valibot |
| DI Container | TSyringe |
| Blockchain | viem |
| Indexing | The Graph (AssemblyScript) |
| Monorepo | Turborepo |
| Linting | Biome |

## License

[GNU AGPLv3](LICENSE)
