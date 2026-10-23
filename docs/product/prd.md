# Product requirements

What VoidX is for, for whom and how far the first release goes. Why it exists: [problem](problem.md).

## Users

- **LPs** who want every position in one place and a push when one goes out of range.
- **Integration contributors** who add protocols and chains, mostly with AI coding agents ([add a protocol](../guides/add-a-protocol.md)).
- **Self-hosters** who run their own instance for privacy.

## Principles

- The phone is the primary client; the web follows the same data.
- Push tells you when to look, so you do not have to check.
- Widgets answer the common question without opening the app.
- Watching needs no wallet connection and no account.

## Jobs to be done

| Job | Use case |
|---|---|
| Morning check of all my positions | [UC-01](use-cases/UC-01-see-all-positions.md) |
| Hear when a position leaves its range | [UC-02](use-cases/UC-02-out-of-range-alert.md) |
| Decide what to do with one position | [UC-03](use-cases/UC-03-inspect-a-position.md) |
| Find a position that is not in my wallet | [UC-04](use-cases/UC-04-find-a-staked-position.md) |
| Get warned before a position leaves its range | [UC-05](use-cases/UC-05-early-warning.md) |
| Glance at my positions without opening the app | [UC-06](use-cases/UC-06-glance-widget.md) |

## MVP scope

| Area | In the MVP |
|---|---|
| Protocols | Uniswap V3, Uniswap V4 |
| Chains | Ethereum, Arbitrum, Base, Optimism |
| Values | Token amounts per position, owed fees per token, range in pool price terms; USD prices and totals as estimates, marked partial when a token is unpriced ([prices](../concepts/prices-and-logos.md)) |
| Clients | Web (SSR), iOS, iPadOS, macOS, widgets; Android after the MVP ([ADR 0056](../decisions/0056-android-after-the-mvp.md)) |
| Access | Watch-only addresses; guest mode; passkey accounts for sync and push |
| Alerts | Range exit and re-entry; no push on macOS |
| Plans | Guest 1 wallet, Free 3, Pro 25 with early warnings; Pro granted manually ([plans](../concepts/plans-and-entitlements.md)) |
| Hosting | Official instance and self-hosting |

Rewards are part of the model from the start ([position model](../concepts/position-model.md)), so staked positions need no contract change when they arrive.

## After the MVP

- **Aero** (the merged Aerodrome and Velodrome): added after the Aero launch as its own integration, through a research gate on the live contracts ([research/aero](../research/aero/audit-notes.md)). Brings gauge custody and rewards.
- PnL and history.
- Payments for Pro (app stores, web, crypto).
- Wallet connection and transactions.
- Vault and ALM positions (Arrakis, Gamma).
- Off-chain incentives (Merkl).
- Non-EVM chains. The wire format keeps them possible ([ADR 0010](../decisions/0010-wire-contract.md)).
