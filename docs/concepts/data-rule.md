# Data rule

**The index finds positions; the chain supplies every quantity.** An index source returns `PositionRef`s, which have no quantity fields, so the rule is a type, not a convention ([ADR 0007](../decisions/0007-data-rule-and-read-block.md)).

## Blocks

| Block | Meaning |
|---|---|
| `indexBlock` | Latest block the index source has processed, reported with its answer |
| `seenAtBlock` | On each `PositionRef`: the block at which the source saw the owner holding it |
| `readBlock` | Resolved once per (request, chain) and pinned by block hash ([how](providers-and-cache.md#read-block)). Every scope of that chain, and every owner in it, reads at the same `readBlock` |

## Discovery then verification

A core use case runs these steps per deployment; the adapter supplies `discover` and `snapshot` ([architecture](../architecture.md#reading-a-portfolio)).

1. Each index source in the deployment's `index[]` returns refs for the requested owners in one batched call, newest first: the highest `tokenOfOwnerByIndex` index first, or descending token id from a subgraph.
2. Sticky refs are merged in: refs verified for this owner in earlier snapshots, so a position the index missed is still checked. Where they live and when they are pruned: [providers-and-cache.md](providers-and-cache.md#cache).
3. If `indexBlock < readBlock`, owner-filtered logs for the deployment's contracts fill the blocks from `indexBlock + 1` to `readBlock`. `rpc-logs` fills only this gap behind a working index; a full scan from `fromBlock` runs only in the worker ([ADR 0008](../decisions/0008-pluggable-discovery.md)).
4. Up to the [discovery cap](providers-and-cache.md#request-budget), every ref is verified at `readBlock` along its custody chain, and gets one result:

| Result | When | Effect |
|---|---|---|
| `verified` | Custody chain leads to the watched address | Quantities are read |
| `not_yet` | `seenAtBlock > readBlock` and custody does not lead to the owner at `readBlock` | Left out of this snapshot; counts as neither closed nor absent; the ref is kept |
| `burned` | A sticky ref whose custody read reverts with a text on the family's revert list | Position `closed` |
| `moved` | A sticky ref whose token exists but custody no longer leads to the watched address | Position `closed` |

- A new index ref (not verified for this owner before) that fails custody is dropped, never shown as `closed`, because the index may be stale.
- An RPC error is not a result: the deployment's scope becomes `failed`. `closed` comes only from `burned` or `moved`, never from an index gap or a failed call.
- A sticky ref is pruned only after its `burned` or `moved` result holds at the chain's `finalized` block, so a reorg on a `latest` chain cannot lose a position.

5. Quantities are read at `readBlock` through Multicall3.
6. Positions with `liquidity == 0` and every owed amount zero are dropped before the display cap; they return only with `include=empty`. The rest, newest first, fill the scope up to the display cap; past either cap the scope is `ok` with `truncated: true` and `INDEX_TRUNCATED`.

### Burned detection

The family manifest lists the revert texts that mean "this token does not exist". The kit decodes `Error(string)` from the revert data and matches it case-insensitively against that list; a custom error matches by selector. Anything else, including an empty revert, is `RPC_ERROR`.

| Family | Revert list |
|---|---|
| `uniswap-v3` | `Invalid token ID` (NonfungiblePositionManager `positions`), `ERC721: owner query for nonexistent token` (OpenZeppelin 3.4 `ownerOf`), `ERC721: invalid token ID` (OpenZeppelin 4.x) |
| `uniswap-v4` | `NOT_MINTED` (solmate ERC721 `ownerOf`) |

## Multicall

- Batches are sized by estimated gas per provider, not by call count, so no batch hits a provider's `eth_call` gas cap.
- `success = false` with empty return data is ambiguous (revert or out of gas): that call is retried alone before it counts.
- Immutable reads (decimals, token order, tick spacing) come from the cache ([providers-and-cache.md](providers-and-cache.md)).

## Hybrid mode and lag

- An index source that lags less than the chain file's `maxIndexLagBlocks` is used up to its `indexBlock`; RPC logs cover the rest.
- Past `maxIndexLagBlocks` the scope is `failed` with code `INDEX_STALE`. It never returns zero positions instead.
- A discovery source keeps its last good answer; an empty or malformed answer never overwrites it unless the chain confirms it (zero `balanceOf`).

## Failure is not absence

A failed or missing read is a scope status, never an empty list. The worker diffs only scopes that were `ok` in both snapshots and carries earlier state forward for the rest ([ADR 0026](../decisions/0026-worker-and-alerts.md)). `empty` and `closed` are defined in [position-model.md](position-model.md#position).

## Principal math

Principal comes from the position's liquidity `L`, the pool's `sqrtPriceX96` (never the rounded tick) and `getSqrtRatioAtTick` of both ticks, through `SqrtPriceMath.getAmount0Delta` and `getAmount1Delta` with `roundUp = false` (floor), as the `v3-sdk` `Position` does. Below the range all principal is `token0`, above it `token1`. Principal never includes `tokensOwed`.

## Fee math

All fee growth differences wrap modulo 2²⁵⁶, as the contracts do; JavaScript `BigInt` does not wrap, so the kit's math helpers do it. Division is floor division.

| Family | Owed fees per token |
|---|---|
| V3-style (`uniswap-v3`, Slipstream) | `tokensOwed + L × ((feeGrowthInside_now − feeGrowthInsideLast) mod 2²⁵⁶) / 2¹²⁸`. `feeGrowthInside_now` comes from the pool's `feeGrowthGlobal` and both ticks' `feeGrowthOutside` at the current tick. `tokensOwed` alone is stale: it updates only on a poke, burn or collect. |
| `uniswap-v4` | `((getFeeGrowthInside − feeGrowthInsideLast) mod 2²⁵⁶) × L / 2¹²⁸`. `feeGrowthInsideLast` comes from `StateView.getPositionInfo` with key (owner = PositionManager, tickLower, tickUpper, salt = `bytes32(tokenId)`). V4 has no `tokensOwed`. |

- A result above 2²⁵⁵ after the wrap means the inputs are inconsistent: fee accrual is `unknown`, no `owed` amounts.
- Formulas follow the MIT `v3-sdk` (`TickLibrary`, `PositionLibrary`, `SqrtPriceMath`) and the MIT-licensed V4 math files; code is ported, never imported ([ADR 0016](../decisions/0016-licensing-and-dco.md)).

## V4 hooks

Hook permissions are the low 14 bits of the hook address; they are read from the address, with no RPC call.

| Bits set | Meaning | Effect |
|---|---|---|
| 0 or 1 | Add or remove liquidity returns a delta | Fee accrual `unknown`, no `owed` amounts |
| 2 or 3 | Swap returns a delta; the hook can bypass the pool curve or take a cut | Fee accrual `unknown`, no `owed` amounts, and `amountsConfidence: low` on the principal, because pool price and fee growth may not reflect what the position would receive |

A reviewed list of hooks may lift these flags per hook address.

## Prices

Prices are not quantities. A USD price is an external estimate carrying `source`, `confidence` and `asOf`; amounts stay exact and come from the chain. A missing price is a missing value, never zero ([prices and logos](prices-and-logos.md)).

## Staked custody

When custody is a gauge (after the Aero launch), fee math is skipped: fee accrual is `redirected` because staked fees go to voters. Rewards come from the staking plugin.
