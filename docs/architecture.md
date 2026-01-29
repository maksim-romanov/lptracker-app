# Architecture

## Overview

MatrApp is a DeFi portfolio monitoring platform built with Clean Architecture principles.

## Project Structure

```
apps/
├── server/      # Hono API - serves normalized position data
├── mobile/      # Expo React Native app
└── subgraphs/   # The Graph indexers (AssemblyScript)
packages/
├── theme/       # Design tokens (colors, spacing, typography)
└── typescript-config/
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Server | Hono + Valibot validation |
| Mobile | React Native 0.81 + Expo 54 |
| Styling | react-native-unistyles + @grapp/stacks |
| DI | tsyringe |
| Blockchain | viem |
| Indexing | The Graph |
| Monorepo | Turborepo |
| Linting | Biome |

## Clean Architecture Layers

Each app follows strict layer separation:

- **Domain** - Core entities and business rules
- **Data** - Repositories, clients, data transformation
- **Application** - Use cases orchestrating business logic
- **Presentation** - API routes / UI components, validation, error mapping

## Data Flow

```
Blockchain Events
      ↓
The Graph Subgraphs (indexing)
      ↓
Hono API Server (normalization)
      ↓
Mobile App (presentation)
```

## Package Dependencies

```
@matrapp/theme ← apps/mobile
@matrapp/typescript-config ← all packages
```
