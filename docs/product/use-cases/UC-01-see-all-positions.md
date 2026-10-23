---
id: UC-01
title: Morning check of all my positions
status: draft
priority: P1
platforms: [web, iPhone, iPad, Mac]
related: [UC-02, UC-03, UC-04]
---

# UC-01 Morning check of all my positions

**Situation.** Dana provides liquidity from one wallet: ETH/USDC on Uniswap V3 (Arbitrum), USDC/USDT on V4 (Base), WBTC/ETH on V3 (Ethereum), and a small ETH/OP position on Optimism. On the train to work she wants to know where she stands. That means four protocol sites built for a laptop, an explorer, and the sums by hand.

| Without VoidX | With VoidX |
|---|---|
| Four desktop-style sites on a phone, numbers copied into a sheet, about 15 minutes `[illustrative]` | Add the address once; every morning one native list, under a minute `[illustrative]` |
| "Is anything out of range?" means opening each position | The summary says "3 of 4 in range" and the banner names the fourth |
| Owed fees live in four places | Owed fees per token on every row, a USD total as an estimate |

**Intent.** When I start the day, I want one list of every position with its range status and fees, so I see what needs me without opening four apps.

**Scope.** Starts: the LP adds a wallet, or opens the app with wallets already watched. Ends: the LP knows what needs attention. Not covered: moving funds or signing; there is no wallet connection. Guarantee: watching needs no account; every amount comes from the chain.

## Main scenario

1. The LP enters an address or an ENS name once.
2. The app reads the wallet on every supported chain and protocol; results appear scope by scope.
3. The app shows the portfolio: positions with token amounts, owed fees and range status.
4. The app summarises: how many positions are in range, and a banner names the ones that are not.
5. The LP narrows the list by wallet, chain, protocol or status, and opens a position that needs attention (UC-03).

## Extensions

- 1a. The input is not an address and the name does not resolve: the app says what a valid address looks like. ↩ 1
- 1b. The wallet is already watched: the app says so and offers to show it. ✔
- 1c. The plan's wallet limit is reached: the app names the limit and the next step. ✖
- 2a. One chain fails: the other chains show, the failed one is named with Retry. ↩ 3
- 3a. A token has no price: its amount shows, the USD total is marked partial, never `$0`. ↩ 4
- 3b. The wallet has no positions: the app says what VoidX reads. ✔

## Open questions

None.
