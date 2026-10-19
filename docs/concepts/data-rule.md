# Data rule

**The index finds positions; the chain supplies every quantity.** An index source returns `PositionRef`s, which have no quantity fields, so the rule is a type, not a convention ([ADR 0007](../decisions/0007-data-rule-and-read-block.md)).

## Blocks

| Block | Meaning |
|---|---|
| `indexBlock` | Latest block the index source has processed, reported with its answer |
| `readBlock` | Resolved once per snapshot from the RPC pool's median head for the chain file's `readPolicy` tag (`safe`, `finalized` or `latest`), then pinned by block hash |

Every `eth_call` in a snapshot passes the block as `{ blockHash }` (EIP-1898), so one snapshot never mixes forks across providers. A chain whose `readPolicy` reaches further back than full nodes keep state sets `requiresArchive: true`.

## Discovery then verification

1. Each index source in the deployment's `index[]` returns refs for the requested owners in one batched call.
2. Refs from the owner's earlier snapshots are added (sticky refs), so a position the index missed or has not seen yet is still checked.
3. If `indexBlock < readBlock`, owner-filtered logs for the deployment's contracts fill the gap. If `indexBlock > readBlock`, sticky refs cover positions that left after `readBlock`.
4. Every ref is verified at `readBlock` along its custody chain, and gets one result:

| Result | When | Effect |
|---|---|---|
| `verified` | Custody chain leads to the watched address | Quantities are read |
| `burned` | The known revert for a missing token: `NOT_MINTED` (V4), `nonexistent token` / `invalid token ID` (V3) | Position `closed` |
| `moved` | The token exists but custody no longer leads to the watched address | Position `closed` |

An RPC error is not a result: the deployment's scope becomes `failed`. `closed` comes only from `burned` or `moved`, never from an index gap or a failed call.

5. Quantities are read at `readBlock` through Multicall3.

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

## Fee math

All fee growth differences wrap modulo 2²⁵⁶, as the contracts do; JavaScript `BigInt` does not wrap, so the kit's math helpers do it. Division is floor division.

| Family | Owed fees per token |
|---|---|
| V3-style (`uniswap-v3`, Slipstream) | `tokensOwed + L × ((feeGrowthInside_now − feeGrowthInsideLast) mod 2²⁵⁶) / 2¹²⁸`. `feeGrowthInside_now` comes from the pool's `feeGrowthGlobal` and both ticks' `feeGrowthOutside` at the current tick. `tokensOwed` alone is stale: it updates only on a poke, burn or collect. |
| `uniswap-v4` | `((getFeeGrowthInside − feeGrowthInsideLast) mod 2²⁵⁶) × L / 2¹²⁸`. `feeGrowthInsideLast` comes from `StateView.getPositionInfo` with key (owner = PositionManager, tickLower, tickUpper, salt = `bytes32(tokenId)`). V4 has no `tokensOwed`. |

- A result above 2²⁵⁵ after the wrap means the inputs are inconsistent: fee accrual is `unknown`, no `owed` amounts.
- Formulas follow the MIT `v3-sdk` (`TickLibrary`, `PositionLibrary`) and the MIT-licensed V4 math files; code is ported, never imported ([ADR 0016](../decisions/0016-licensing-and-dco.md)).

## V4 hooks

Hook permissions are the low 14 bits of the hook address; they are read from the address, with no RPC call.

| Bits set | Meaning | Effect |
|---|---|---|
| 0 or 1 | Add or remove liquidity returns a delta | Fee accrual `unknown`, no `owed` amounts |
| 2 or 3 | Swap returns a delta; the hook can bypass the pool curve or take a cut | Also `amountsConfidence: low` |

A reviewed list of hooks may lift these flags per hook address.

## Prices

Prices are not quantities. A USD price is an external estimate carrying `source`, `confidence` and `asOf`; amounts stay exact and come from the chain. A missing price is a missing value, never zero ([prices and logos](prices-and-logos.md)).

## Staked custody

When custody is a gauge (after the Aero launch), fee math is skipped: fee accrual is `redirected` because staked fees go to voters. Rewards come from the staking plugin.
