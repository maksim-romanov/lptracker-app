# Vision

## Problem

Liquidity providers spread positions across protocols and chains. Each protocol shows only its own positions, staked positions disappear from wallet views, and range status, owed fees and rewards need several apps to check.

## Product

VoidX is an open-source platform for tracking and, later, interacting with smart contracts. The first product tracks LP positions for any address, on the web, iOS, iPadOS, macOS and Android, with alerts when a position leaves or re-enters its range.

## Users

- **LPs** who want every position in one place and a push when one goes out of range.
- **Integration contributors** who add protocols and chains, mostly with AI coding agents.
- **Self-hosters** who run their own instance for privacy.

## MVP scope

| Area | In the MVP |
|---|---|
| Protocols | Uniswap V3, Uniswap V4 |
| Chains | Ethereum, Arbitrum, Base, Optimism |
| Values | Token amounts per position, owed fees per token, range in pool price terms; USD prices and totals as estimates, marked partial when a token is unpriced ([prices](concepts/prices-and-logos.md)) |
| Clients | Web (SSR), iOS, iPadOS, macOS, Android, widgets |
| Access | Watch-only addresses; guest mode; passkey accounts for sync and push |
| Alerts | Range exit and re-entry; no push on macOS |
| Plans | Guest 1 wallet, Free 3, Pro 25 with early warnings; Pro granted manually ([plans](concepts/plans-and-entitlements.md)) |
| Hosting | Official instance and self-hosting |

Rewards are part of the model from the start ([position model](concepts/position-model.md)), so staked positions need no contract change when they arrive.

## After the MVP

- **Aero** (the merged Aerodrome and Velodrome): added after the Aero launch as its own integration, through a research gate on the live contracts ([research/aero](research/aero/audit-notes.md)). Brings gauge custody and rewards.
- PnL and history.
- Payments for Pro (app stores, web, crypto).
- Wallet connection and transactions.
- Vault and ALM positions (Arrakis, Gamma).
- Off-chain incentives (Merkl).
- Non-EVM chains. The wire format keeps them possible ([ADR 0010](decisions/0010-wire-contract.md)).

## What must stay true

- Adding a chain or protocol is adding an integration. Core never changes; apps need at most minimal, optional changes ([ADR 0006](decisions/0006-integration-unit.md)).
- Every quantity a user sees comes from the chain, computed once on the server; USD prices are labelled estimates ([ADR 0003](decisions/0003-server-owns-protocol-logic.md), [ADR 0007](decisions/0007-data-rule-and-read-block.md)).
- Every client is semantic, accessible (WCAG 2.2 AA) and smooth ([ADR 0022](decisions/0022-accessibility.md), [ADR 0023](decisions/0023-motion.md)).
