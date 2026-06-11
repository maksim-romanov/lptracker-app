# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Brand:** `Depthly`. All workspace package scopes use `@depthly/*`.

## Big Picture

DeFi portfolio monitoring platform. Data flows **Blockchain → Subgraphs (The Graph) + tokens-data → Hono API → Mobile app**.

- **`apps/server`** — Hono API on Bun. Clean Architecture (Domain → Data → Application → Presentation). Valibot validation, tsyringe DI, neverthrow `Result` types, opossum circuit breakers + Redis caching for external providers.
- **`apps/tokens-data`** — Standalone Hono service on Bun that produces token metadata. Runs as a sidecar to `server` in dev; its output is consumed via `server#codegen` (see Codegen).
- **`apps/mobile`** — React Native 0.83 / Expo 55 / React 19. DDD modules with tsyringe DI, react-native-unistyles + `@grapp/stacks` for styling, expo-router, MobX stores, TanStack Query.
- **`apps/subgraphs/*`** — The Graph indexers in AssemblyScript (currently `uniswap-v3`).
- **`packages/theme`** — Design tokens consumed by mobile.
- **`packages/typescript-config`** — Shared `tsconfig` bases.

Per-app guidance: [apps/server/CLAUDE.md](apps/server/CLAUDE.md), [apps/mobile/CLAUDE.md](apps/mobile/CLAUDE.md), [apps/subgraphs/uniswap-v3/CLAUDE.md](apps/subgraphs/uniswap-v3/CLAUDE.md). Read the relevant one before editing inside an app.

## Conventions to know up-front

- **TypeScript naming** — types prefixed `T` (`TPosition`), interfaces `I` (`IRepository`), enums `E` (`EChainId`), DI tokens `SCREAMING_SNAKE_CASE` (`POSITIONS_REPOSITORY`).
- **File naming** — components/screens `PascalCase.tsx`, hooks `camelCase.ts`, everything else `kebab-case.ts` (with suffixes like `.repository.ts`, `.usecase.ts`, `.store.ts`).
- **DI** — use Symbol tokens for replaceable dependencies; the server uses child containers for chain-specific isolation.
- **No `React.FC`** — declare components as `const Foo = function ({ ... }: Props) { ... }`.

## Rules

- Run `bun run typecheck` after code changes (Turbo runs it across all workspaces).
- `bun run codegen` chain (enforced in `turbo.json`):
  1. `tokens-data#codegen` — emits token metadata.
  2. `server#codegen` — GraphQL types from subgraph schemas + OpenAPI from Valibot; consumes tokens-data output.
  3. `mobile#codegen` — `openapi-typescript` against server's emitted OpenAPI + tokens-data types.

  Run from the repo root, never per-app.
- Generated files (don't hand-edit). `biome.json` and `turbo.json` reference these paths — sync them if any move:
  - server: `src/features/**/gql/`, `openapi/`, `src/features/token-prices/data/tokens-data.generated.ts`
  - mobile: `src/core/api-client/generated/`, `src/features/uniswap-v3/data/generated/`, `src/core/tokens-data/generated.d.ts`
  - tokens-data: `apps/tokens-data/generated/`
- Lint with Biome (`bun run lint` / `lint:fix`); config in root `biome.json`.

## Commands

```bash
# Setup
bun install

# Dev
bun run dev              # All dev servers (Turbo)
bun run dev:ios          # Mobile (iOS) + server + tokens-data sidecars (turbo `with`)
bun run dev:android      # Mobile (Android) + server + tokens-data sidecars

# Quality
bun run lint             # Biome
bun run lint:fix
bun run typecheck        # tsc --noEmit across workspaces
bun run codegen          # tokens-data → server → mobile (turbo-ordered)

# Subgraphs (Docker required)
bun run graph:up         # Start local Graph Node + IPFS + Postgres
bun run graph:down
bun run graph:build      # AssemblyScript compile
bun run graph:test
```

Filter Turbo to one workspace: `turbo run <task> --filter=server` (or `--filter=@depthly/subgraph-uniswap-v3`, etc.).
