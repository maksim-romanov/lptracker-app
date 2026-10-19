---
app: integrations
topic: Uniswap V3 and V4
checked: 2026-09-30
---

# Uniswap V3 and V4

Input for the `uniswap-v3` and `uniswap-v4` families. Formulas live in [data rule](../../concepts/data-rule.md#fee-math); this file records why.

## Decisions

- V3 discovery by `rpc-enumeration`: every Uniswap V3 NPM is OpenZeppelin ERC721Enumerable. Record the NPM per chain; Base's NPM (`0x03a520b3…`) differs from the canonical address used on other chains. [5]
- V4 discovery by the official `v4-subgraph` batched by `owner_in`, with `rpc-logs` (owner-filtered PositionManager `Transfer` logs) as the keyless fallback. [2]
- V3 owed fees = `tokensOwed` + pending computed from fee growth; `tokensOwed` alone is stale. V4 owed fees need the divide by 2¹²⁸. [3][4]
- V4 hook bits 0–1 → fee accrual `unknown`; bits 2–3 → also `amountsConfidence: low`. [6]
- Port math; never import the SDK packages, because they depend on GPL packages. [1]
- V3 Staker and auto-compounders hold the NFT: add a `v3-staker` staking plugin (`deposits(tokenId).owner`, `DepositTransferred` logs); fees stay claimable after withdrawal. Hook-owned V4 liquidity (not held by PositionManager) is out of scope.

## Facts that constrain us

| Repo | License |
|---|---|
| `v3-sdk`, `v4-sdk` | MIT, but depend on `v3-periphery` (GPL-2.0-or-later) and `v3-staker` (GPL-3.0-or-later) |
| `v3-core` | GPL-2.0-or-later (BUSL ended 2023-04-01) |
| `v4-core` | BUSL-1.1 until 2027-06-15, then MIT; `TickMath`, `SqrtPriceMath`, `FullMath`, `Hooks` are already MIT; `Pool.sol` is BUSL |
| `v4-subgraph` | GPL-3.0; never a base for our own subgraph |

[1]

- `v4-subgraph` `Position`: `id`, `tokenId`, `owner` (lowercase string), `origin`, `createdAtTimestamp`; derived `transfers`, `subscriptions`. No pool, tick or liquidity fields. `handleTransfer` sets `owner = to`, so a burned position ends with owner `0x000…0`. Networks include mainnet, arbitrum-one, base, optimism. [2]
- V4 position key in the PoolManager: owner = PositionManager, `tickLower`, `tickUpper`, `salt = bytes32(tokenId)`; read `getPoolAndPositionInfo(tokenId)`, `getPositionLiquidity(tokenId)`, `StateView.getPositionInfo`. [4]
- Dynamic fee pools have `fee == 0x800000`; the current LP fee comes from `StateView.getSlot0`. [4]
- A position with zero liquidity can still have owed fees; a V4 burn can remove liquidity and burn the NFT in one action, so `empty` may never appear before `closed`.
- Burned-token reverts: `NOT_MINTED` (solmate, V4), `ERC721: invalid token ID` / `nonexistent token` (OpenZeppelin, V3).
- Forks need `overrides`: init code hash per deployment, `slot0` and `positions()` tuple shapes (PancakeSwap V3 `feeProtocol` is uint32 and uses MasterChefV3 custody). Slipstream returns `tickSpacing` instead of `fee` and is its own family; PancakeSwap Infinity is not a V4 fork.

## Open questions

- Whether a reviewed-hooks allowlist is worth maintaining in the MVP.

## Sources

1. Uniswap repositories and licenses — https://github.com/Uniswap
2. Uniswap/v4-subgraph — https://github.com/Uniswap/v4-subgraph
3. v3-sdk PositionLibrary / TickLibrary — https://github.com/Uniswap/sdks/tree/main/sdks/v3-sdk
4. V4 docs: StateView, collect and LP fees — https://docs.uniswap.org/contracts/v4/guides/calculate-lp-fees
5. V3 deployments per chain — https://docs.uniswap.org/contracts/v3/reference/deployments
6. V4 Hooks library — https://docs.uniswap.org/contracts/v4/reference/core/libraries/Hooks
