---
app: integrations
topic: Aerodrome and Velodrome (Aero)
checked: 2026-09-30
---

# Aerodrome and Velodrome (Aero)

Input for the research gate after the Aero launch. Re-check every fact against the live contracts first: the merger changes contracts, tokens and emissions.

## Decisions

- Wait for Aero (2026-10-21) before building; old pools stop emitting after migration. [4][5]
- Position ids include the position manager: `<npm>:<tokenId>` for CL, `<lpToken>:wallet` or `<lpToken>:gauge` for v2 pools, because Base runs several CL factories with their own NPMs and an owner can hold the same LP in the wallet and a gauge. [1]
- Discover unstaked CL positions by `rpc-enumeration` on every NPM; discover staked CL positions from NPM `Transfer(from = owner)` logs into an address where `voter.isGauge` is true, then confirm with `stakedContains`. Sugar only for v2 pools. [1][2]
- A Sugar answer at `MAX_POSITIONS` is `failed` with `INDEX_TRUNCATED`, never `ok`. [2]
- Staked CL positions skip fee math and report fee accrual `redirected`; the NPM keeps a stale `feeGrowthInsideLast` while the NFT sits in the gauge, which would show phantom fees. [1]
- Read the reward token from each gauge (`rewardToken()`); never hardcode AERO or VELO. [1][4]
- Mark pre-migration deployments `read-only` and name the Aero contracts in `supersededBy`.

## Facts that constrain us

- Base CL factories and NPMs, as of the check (verify after launch): `0x5e7B…`/`0x8279…`, `0xaDe6…`/`0xa990…`, `0xf8f2…`/`0xe1f8…`, each with its own gauge factory. [1]
- `LpSugar._positions` pages by pools, not positions; one owner scan walks every pool of every factory (`MAX_ITERATIONS = 30000`), dozens to hundreds of `eth_call`s, each bound by the provider's gas cap. Results stop at `MAX_POSITIONS = 200` with no truncation signal. [2]
- Sugar is redeployed often; its `Position` struct keeps growing (locker, unlocks_at, alm, root); contracts are unverified Vyper. Pin a Sugar address and ABI per deployment with `fromBlock`; source is `deployments/<chain>.env` at a commit; allow `verified: false` for aggregator contracts. [2]
- Unstaked CL fees are already net of `unstakedFee`: pool fee growth counts only unstaked liquidity. Show `unstakedFee` in the display descriptor; never subtract it twice. [1]
- Gauge versions differ: some `earned()` include `rewards[tokenId]`, some do not; Gauges V3 add a minimum stake time with an early-exit penalty; a killed gauge (`voter.isAlive = false`) stops emissions but accrued rewards stay claimable. Carry `gaugeAlive`, `minStakeEndsAt`, `penaltyBps` in the extension. [1]
- Reward tokens differ by chain and time: XVELO on Superchain leaf chains, AERO after the merger. [4]
- v2 pools: principal = `balance × reserve / totalSupply` from `getReserves()`, same for stable and volatile; wallet fees = `claimable{0,1} + balance × (index − supplyIndex) / 1e18`; gauge LP fees are redirected. Pool fields: `stable`, `fee` from `factory.getFee(pool, stable)`. [3]
- Slipstream swap fees are dynamic; the pool identity is (factory, tickSpacing); pools are CREATE2 clones per factory, derived with `factory.getPool(t0, t1, tickSpacing)`. [1]
- Slipstream core is GPL and gauges are BUSL: port math from MIT sources only. [1]
- OP Stack `readPolicy` reads may need archive state: declare `rpc:archive`.
- Sugar also returns ALM and launcher-locker positions; they are out of scope (vision excludes ALM).

## Test wallets needed

One cassette per NPM generation and gauge version, plus: staked, unstaked, out-of-range, closed and burned positions; a killed gauge; a pool with no gauge; a position inside its minimum-stake window; v2 stable and volatile, wallet and gauge in the same pool; an owner with more than 200 positions; pre- and post-migration pools; Velodrome on Optimism and one leaf chain.

## Open questions

- Which contracts, factories and Sugar version Aero ships on each of its chains.
- Whether Velodrome remains a separate brand after the merger.

## Sources

1. aerodrome-finance/slipstream — https://github.com/aerodrome-finance/slipstream (README, `contracts/gauge/CLGauge.sol`)
2. velodrome-finance/sugar — https://github.com/velodrome-finance/sugar (`contracts/LpSugar.vy`, `deployments/*.env`)
3. velodrome-finance contracts (v2 pools) — https://github.com/velodrome-finance/contracts
4. Aero launch update — https://aero.xyz/articles/aero-launch-update-all-systems-go
5. Aero launches on seven chains — https://cryptobriefing.com/aero-launches-seven-chains-arbitrum
