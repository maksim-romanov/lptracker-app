# CLAUDE.md — apps/subgraphs/uniswap-v4

The Graph subgraph indexing Uniswap V4 LP positions and live pool state, on the same 6 chains as `uniswap-v3` (see `networks.json`). AssemblyScript gotchas: `.claude/rules/assemblyscript.md` (auto-loads when editing `src/`).

Not consumed anywhere yet — `packages/catalog`'s `PROTOCOLS_META` has no `uniswap-v4` entry, so neither `apps/server` nor `apps/mobile` queries it (see root `CLAUDE.md`).

## How v4 tracking differs from v3

Singleton `PoolManager` emits every pool's events — one static data source, no per-pool template. Positions are tracked event-only: `ModifyLiquidity.liquidityDelta` accumulated and joined to an NFT via `tokenId = uint256(salt)`. `subgraph.yaml` has two data sources: `PoolManager` (`src/pool-manager.ts`) and `PositionManager` (`src/position-manager.ts`, `Transfer` only).

## Edit cycle

```bash
bun run codegen
bun run build
bun run test
```

## Deploying

Use the `subgraph-deploy` skill (this package's own — checks both `PoolManager` and `PositionManager` on-chain).
