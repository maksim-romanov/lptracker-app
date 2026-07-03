# CLAUDE.md

This file provides guidance to Claude Code when working in the Uniswap V4 subgraph.

## What this package is

The Graph subgraph indexing Uniswap V4 LP positions and live pool state on Ethereum
mainnet only. v4 uses a singleton `PoolManager` that emits every pool's events, so there
is one static data source per contract and no dynamic pool templates.

## Key files

- `schema.graphql` — entities (`Token`, `Pool`, `Position`)
- `subgraph.yaml` — two data sources: `PoolManager` (Initialize/ModifyLiquidity/Swap) and
  `PositionManager` (Transfer)
- `networks.json` — mainnet addresses and `startBlock` (PoolManager 21688329, PositionManager 21689089 — each contract's real creation block)
- `src/pool-manager.ts` — `handleInitialize`, `handleModifyLiquidity`, `handleSwap`
- `src/position-manager.ts` — `handleTransfer`
- `src/utils/{pool,token,position}.ts` — `getOrCreate*` helpers + `saltToTokenId`
- `tests/*.test.ts` — matchstick-as tests

## How v4 tracking works

- A pool is a `bytes32 PoolId`; the `Initialize` event carries the full `PoolKey`
  (currency0/1, fee, tickSpacing, hooks) + starting price/tick — no contract call needed.
- Positions are tracked event-only: `ModifyLiquidity.liquidityDelta` is accumulated, joined
  to an NFT via `tokenId = uint256(salt)` and gated by `sender == PositionManager`
  (`0xbd21…ee9e`). The PositionManager sets `salt = bytes32(tokenId)` (verified in source).
- `PositionManager` emits no liquidity events — only `Transfer` (owner/mint/burn).
- Native ETH is `currency0 == address(0)`; its `Token` is hardcoded ETH/Ether/18.
- Legacy tokens (MKR, DGD…) return `bytes32` symbol/name; `token.ts` falls back to the
  `ERC20SymbolBytes`/`ERC20NameBytes` ABIs and trims null padding, so they resolve instead
  of becoming `UNKNOWN`.

## AssemblyScript gotchas

Same as the v3 package: not TypeScript; `let` not `const`; null-check nullable entity
fields; `BigInt.zero()`; revert-safe `try_*` for contract calls. Biome rules are disabled
for this package intentionally.

## Edit cycle

After changing `schema.graphql`, `subgraph.yaml`, or any ABI:

```bash
bun run codegen   # regenerates generated/ — also validates event signatures vs ABIs
bun run build     # compiles AS to wasm
bun run test      # matchstick
```

When changing only `src/`, `codegen` is not needed — just `build` + `test`.

## Deploying

Mainnet only. Deploy with `bun run deploy:mainnet` after building. Post-deploy server URL
synchronization (if/when the server consumes v4) follows the same pattern as v3 — see the
v3 package's `subgraph-deploy` skill.
