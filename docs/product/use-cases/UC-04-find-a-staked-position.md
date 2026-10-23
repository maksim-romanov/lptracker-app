---
id: UC-04
title: Find a position that is not in my wallet
status: draft
priority: P2
platforms: [web, iPhone, iPad, Mac]
related: [UC-01, UC-03]
---

# UC-04 Find a position that is not in my wallet

**Situation.** Dana staked her WBTC/ETH position in a staking contract to earn rewards. The position token left her wallet. Her wallet app no longer lists it, and she is not sure which protocol page holds it. Finding it means a laptop and a browser tab.

| Without VoidX | With VoidX |
|---|---|
| The position looks lost until she remembers the staking contract | It is listed with the others, custody named: "staked in …" |
| Rewards are read in the staking app only | Rewards are read on chain and shown beside owed fees |
| Range alerts miss it, because the wallet no longer holds it | It is watched like any other position (UC-02) |

**Intent.** When a position sits in a staking contract, I want it in the same list as the rest, so nothing I own is invisible.

**Scope.** Starts: the LP watches a wallet that has staked positions. Ends: the staked position is listed with its custody and rewards. Not covered: staking or unstaking. Guarantee: a staked position is never dropped because the wallet does not hold the token. Arrives with the first staking plugin; the MVP reads wallet custody only (`staking: none`, [ADR 0050](../../decisions/0050-mvp-scope.md)).

## Main scenario

1. The LP watches the wallet (UC-01).
2. The app finds the position through an index source that sees staked custody.
3. The app checks it on chain at one block and reads its custody, principal, fees and rewards.
4. The app lists it with the others, with the custody named.
5. The LP opens it (UC-03) and sees rewards next to owed fees.

## Extensions

- 2a. No index source reports it: the app keeps a position seen earlier and re-checks it on chain. ↩ 3
- 3a. The chain says the position was burned or moved: the app drops it from the list. ✔
- 5a. The staking plugin reports no rewards: the rewards section is not shown. ✔

## Open questions

None.
