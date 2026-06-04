# CLAUDE.md

This file provides guidance to Claude Code when working in the Uniswap V3 subgraph.

## What this package is

The Graph subgraph indexing Uniswap V3 LP positions on mainnet, arbitrum-one, and base. AssemblyScript handlers compile to WASM and run inside Graph Node. Schema is in `schema.graphql`, manifest in `subgraph.yaml`, network configs in `networks.json`.

## Key files

- `schema.graphql` — entities (`Token`, `Pool`, `Position`)
- `subgraph.yaml` — data source manifest (events, handlers, ABIs)
- `networks.json` — per-chain addresses and `startBlock`
- `src/nonfungible-position-manager.ts` — event handlers (`handleTransfer`, `handleIncreaseLiquidity`, `handleDecreaseLiquidity`, `handleCollect`)
- `src/utils/{pool,token}.ts` — lazy `getOrCreate*` helpers
- `tests/*.test.ts` — matchstick-as tests with mocked contract calls

## AssemblyScript gotchas

- **It is NOT TypeScript.** No async/await, no destructuring in function params, no spread, no optional chaining on entity fields. Use `if (x === null)` checks.
- **`let`, not `const`.** Biome rules `useConst`, `useImportType`, `useTemplate`, `noDoubleEquals`, `noShadowRestrictedNames`, `noUnusedImports` are disabled for this package — that's intentional, do not "fix" the style.
- **Entity nullable fields** load as `T | null`. Always null-check before access.
- **No `BigInt(0)`** — use `BigInt.zero()`. No `new BigInt(...)`.
- **Reverted calls** must be handled via `try_<method>()` returning `{ value, reverted }`, never `<method>()` which throws and kills the handler.

## Edit cycle

After changing `schema.graphql`, `subgraph.yaml`, or any ABI in `abis/`:

```bash
bun run codegen   # graph codegen — regenerates generated/ from schema + ABIs
bun run build     # graph build — compiles AS to WASM
bun run test      # matchstick — required to confirm handlers still work
```

When changing only handlers in `src/` (no schema/yaml change), `codegen` is not needed, just `build` + `test`.

## Deploying

Deploy and post-deploy URL synchronization with the server are non-trivial — use the `subgraph-deploy` skill.

## Cross-references in the server

This subgraph is consumed by `apps/server/src/features/uniswap-v3`. Two places reference the deployed Studio URL by version:

- `apps/server/codegen.ts` — `schema` URL used by `graphql-codegen`
- `apps/server/src/features/uniswap-v3/data/constants/networks.ts` — `graph.url` per chain used at runtime

Both must be updated after a redeploy or the server will keep querying the old version.
