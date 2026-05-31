# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Codename:** `mars-909`. All workspace package scopes use `@mars-909/*`.

## Big Picture

DeFi portfolio monitoring platform. Data flows **Blockchain → Subgraphs (The Graph) → Hono API → Mobile app**.

- **`apps/server`** — Hono API on Bun. Clean Architecture (Domain → Data → Application → Presentation). Valibot validation, tsyringe DI, neverthrow `Result` types, opossum circuit breakers + Redis caching for external providers.
- **`apps/mobile`** — Expo / React Native (RN 0.83, React 19). DDD modules with tsyringe DI, react-native-unistyles + `@grapp/stacks` for styling, expo-router, MobX stores, TanStack Query.
- **`apps/subgraphs/*`** — The Graph indexers in AssemblyScript (currently `uniswap-v3`).
- **`packages/theme`** — Design tokens consumed by mobile.
- **`packages/typescript-config`** — Shared `tsconfig` bases.

Per-app guidance lives in [apps/server/CLAUDE.md](../apps/server/CLAUDE.md) and [apps/mobile/CLAUDE.md](../apps/mobile/CLAUDE.md) — read those before editing inside an app.

## Documentation

Full index: [docs/README.md](../docs/README.md).

- [docs/architecture.md](../docs/architecture.md), [docs/code-style.md](../docs/code-style.md), [docs/codegen.md](../docs/codegen.md), [docs/subgraphs.md](../docs/subgraphs.md)
- Mobile: [apps/mobile/docs/](../apps/mobile/docs/) (architecture, code-style, styling, commands)
- Server: [apps/server/docs/](../apps/server/docs/) (architecture, api)

## Conventions to know up-front

- **TypeScript naming** — types prefixed `T` (`TPosition`), interfaces `I` (`IRepository`), enums `E` (`EChainId`), DI tokens `SCREAMING_SNAKE_CASE` (`POSITIONS_REPOSITORY`).
- **File naming** — components/screens `PascalCase.tsx`, hooks `camelCase.ts`, everything else `kebab-case.ts` (with suffixes like `.repository.ts`, `.usecase.ts`, `.store.ts`).
- **DI** — use Symbol tokens for replaceable dependencies; the server uses child containers for chain-specific isolation.
- **No `React.FC`** — declare components as `const Foo = function ({ ... }: Props) { ... }`.

## Rules

- Run `bun run typecheck` after code changes (Turbo runs it across all workspaces).
- `bun run codegen` regenerates server types (GraphQL from subgraph schemas + OpenAPI from Valibot) **before** mobile types (`openapi-typescript` against the server's emitted OpenAPI). Order is enforced in `turbo.json` (`mobile#codegen` depends on `server#codegen`) — run from the repo root, not per-app.
- Lint with Biome (`bun run lint` / `lint:fix`); config in root `biome.json`.

## Commands

```bash
# Setup
bun install

# Dev
bun run dev              # All dev servers (Turbo)
bun run dev:ios          # Server + iOS
bun run dev:android      # Server + Android

# Quality
bun run lint             # Biome
bun run lint:fix
bun run typecheck        # tsc --noEmit across workspaces
bun run codegen          # Server then mobile (turbo-ordered)

# Subgraphs (Docker required)
bun run graph:up         # Start local Graph Node + IPFS + Postgres
bun run graph:down
bun run graph:build      # AssemblyScript compile
bun run graph:test
```

Filter Turbo to one workspace: `turbo run <task> --filter=server` (or `--filter=@mars-909/subgraph-uniswap-v3`, etc.).
