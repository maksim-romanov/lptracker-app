# CLAUDE.md

This file provides guidance to Claude Code when working in the Slipstream subgraph.

## What this package is

The Graph subgraph indexing **Slipstream** concentrated-liquidity LP positions — the
Uniswap-V3-fork AMM shared by **Aerodrome (Base)** and **Velodrome (Optimism)**. One package,
two networks (like `uniswap-v3`): `bun run deploy:base` / `deploy:optimism`, addresses in
`networks.json`. AssemblyScript handlers compile to WASM and run inside Graph Node.

Slipstream preserves the Uniswap V3 interface, so this package is a V3 fork with two twists:

- **Pools are keyed by `int24 tickSpacing`, not a fee tier.** `NFPM.positions()` returns
  `tickSpacing` where V3 returns `fee`; `CLFactory.getPool(token0, token1, tickSpacing)`.
  The swap fee is dynamic (SwapFeeModule) and is deliberately not indexed.
- **Gauge staking.** LPs stake the position NFT into a per-pool `CLGauge` to earn AERO/VELO.
  On stake the NFT is transferred to the gauge, so the plain NFPM `Transfer` would set
  `owner` to the gauge address. The `CLGauge.Deposit` event restores `owner` to the real
  staker and sets `staked = true` + `gauge`. `Withdraw` clears it.

## Key files

- `schema.graphql` — `Token`, `Pool` (`tickSpacing`), `Position` (`staked`, `gauge`)
- `subgraph.yaml` — NFPM + Voter data sources, `CLGauge` dynamic template
- `networks.json` — per-chain addresses and `startBlock`
- `src/nonfungible-position-manager.ts` — `handleTransfer` / `handleIncreaseLiquidity` /
  `handleDecreaseLiquidity` / `handleCollect` (position lifecycle, tickSpacing-keyed pools)
- `src/voter.ts` — `handleGaugeCreated`: spawns a `CLGauge` template, gated to the CL
  `poolFactory` this subgraph indexes (skips basic-pool and other-deployment gauges)
- `src/gauge.ts` — `handleDeposit` / `handleWithdraw`: stake state + real-owner recovery
- `src/utils/{pool,token}.ts` — lazy `getOrCreate*` helpers
- `tests/*.test.ts` — matchstick-as tests

## Deployments (this is the tricky part)

Slipstream has been redeployed several times on each chain — each generation has its **own**
`CLFactory` + `NonfungiblePositionManager`. This package indexes the **newest generation per
network only**:

| Network | NFPM (indexed) | CLFactory (`voter.ts` gate) | Voter | NFPM creation block |
|---|---|---|---|---|
| base (Aerodrome) | `0xe1f8cd9AC4e4A65F54f38a5CdAfCA44f6dD68b53` | `0xf8f2eB4940CFE7d13603DDDD87f123820Fc061Ef` | `0x16613524e02ad97eDfeF371bC883F2F5d6C480A5` | `44394730` |
| optimism (Velodrome) | `0xf7f8ccce99Ca2896eC75D3A399D152dB96808399` | `0xe13Dd1fbA721Aa81a1826D9523AC9BC7d260c879` | `0x41C914ee0c7E1A5edCD0295623e6dC557B5aBf3C` | `150584118` |

The **Voter** is single/shared across all generations on a chain; `handleGaugeCreated` filters
by `poolFactory`. Because that gate address differs per network, `voter.ts` selects it via
`dataSource.network()` — the one constant that `networks.json` can't substitute (it only
substitutes data-source `address`/`startBlock`).

Older generations (e.g. Base NFPM `0x827922686190790b37229fd06084350E74485b72`) are **not**
indexed — adding them means extra NFPM data sources **and** namespacing `Position.id` by NFPM,
since each NFPM restarts `tokenId` at 1 and ids would collide. The `positions()` struct is
identical across Base and Optimism NFPMs, so one ABI serves both networks.

## Fetching ABIs on Base

`cast interface <addr> --chain base` and the Etherscan v2 `getabi` endpoint both work with the
key in `../uniswap-v4/.env`. Two gotchas:

- `getcontractcreation` is **not** on the free tier for Base (chainid 8453) — get creation
  blocks by binary-searching `cast code <addr> --block N` instead.
- `CLGauge` is a CREATE2 clone and is not on Sourcify; fetch its ABI via Etherscan `getabi`
  (`action=getabi&address=…&chainid=8453`), not the Sourcify `v2/contract` endpoint.

AssemblyScript gotchas (not TypeScript, `let` not `const`, `BigInt.zero()`, revert-safe `try_*`) are in `.claude/rules/assemblyscript.md` — auto-loads when editing `src/`. One addition specific to this package: TS-LSP `i32`/`changetype`/`Cannot find module` diagnostics are false positives here (AS builtins + pre-codegen generated modules).

## Edit cycle

After changing `schema.graphql`, `subgraph.yaml`, or any ABI in `abis/`:

```bash
bun run codegen   # graph codegen — regenerates generated/ from schema + ABIs
bun run build     # graph build — compiles AS to WASM
bun run test      # matchstick
```

When changing only handlers in `src/` (no schema/yaml change), `codegen` is not needed, just
`build` + `test`.

## Deploying

Use the `subgraph-deploy` skill (this package's own). The server doesn't consume this subgraph yet; if that changes, wire the Studio URL the same way `uniswap-v3` does (`apps/server/codegen.ts` + the feature's `data/constants/networks.ts`) and add that sync step to the skill.
