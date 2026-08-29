# CLAUDE.md

Guidance for Claude Code when working in this repository.

> **Brand:** `Depthly`. Workspace package scopes are `@depthly/*`.

## Big picture

DeFi portfolio monitoring. Data flows **Blockchain → Subgraphs (The Graph) + tokens-data → Hono API → Mobile app**.

Bun workspaces (`apps/*`, `apps/subgraphs/*`, `packages/*`) + Turborepo. Read the relevant subdirectory's `CLAUDE.md` before editing there — each is self-contained for that area's stack.

| Path | What it is |
| --- | --- |
| [`apps/server`](apps/server/CLAUDE.md) | Hono API on Bun. Clean Architecture (domain → data → app → presentation), tsyringe DI, neverthrow `Result` error handling. Also serves a small Tailwind/HTMX SSR web app. |
| [`apps/mobile`](apps/mobile/CLAUDE.md) | React Native 0.83 / Expo 55 / React 19. DDD feature modules, tsyringe DI, MobX + TanStack Query, react-native-unistyles. Ships an iOS home-screen widget. |
| [`apps/tokens-data`](apps/tokens-data/CLAUDE.md) | Standalone Hono/Bun sidecar producing token metadata; consumed only via `server#codegen`. |
| [`apps/landing`](apps/landing/CLAUDE.md) | 11ty static site with a custom esbuild pipeline and a WebGL particle hero. |
| [`apps/subgraphs`](apps/subgraphs/CLAUDE.md) | The Graph indexers in AssemblyScript — [`uniswap-v3`](apps/subgraphs/uniswap-v3/CLAUDE.md), [`uniswap-v4`](apps/subgraphs/uniswap-v4/CLAUDE.md). |
| `packages/catalog` | Network + protocol reference data. |
| [`packages/theme`](packages/theme/CLAUDE.md) | Design tokens, generated via Style Dictionary — shared across `apps/mobile`, `apps/server`'s `/app`, and the iOS widget. |
| `packages/protocol-math` | Uniswap v3 tick/price math + number formatting. |
| `packages/logger` | `logtape` wrapper used by `server` and `tokens-data`. |
| `packages/typescript-config` | Shared `tsconfig` bases. |

**v4 isn't wired up above the subgraph yet:** `packages/catalog`'s `PROTOCOLS_META` only registers `uniswap-v3`. Neither `apps/server` nor `apps/mobile`'s protocol-plugin registry can reference v4 until a `uniswap-v4` entry is added there — the v4 subgraph itself is deployed and indexing, it's just not consumed anywhere yet.

## Codegen chain

Enforced in `turbo.json`, **run from the repo root only**, never per-app:

1. `@depthly/theme#codegen` — emits shared design tokens (JS, CSS, iOS colorset) from `packages/theme`.
2. `tokens-data#codegen` — emits token metadata.
3. `server#codegen` — GraphQL types from subgraph schemas + OpenAPI from Valibot routes; consumes tokens-data's output and `@depthly/theme`'s CSS.
4. `mobile#codegen` — `openapi-typescript` against server's OpenAPI + tokens-data's types.

Generated files are gitignored/deny-listed — don't hand-edit them.

## Commands

```bash
bun install

bun run dev              # all dev servers (Turbo)
bun run dev:ios          # mobile (iOS) + server + tokens-data sidecars
bun run dev:android      # mobile (Android) + server + tokens-data sidecars

bun run lint             # Biome
bun run lint:fix
bun run typecheck        # tsc --noEmit across workspaces
bun run codegen          # tokens-data → server → mobile, turbo-ordered

bun run graph:up         # local Graph Node + IPFS + Postgres (Docker)
bun run graph:down
bun run graph:build
bun run graph:test
```

Filter Turbo to one workspace: `turbo run <task> --filter=server` (or `--filter=@depthly/subgraph-uniswap-v3`, etc.).
