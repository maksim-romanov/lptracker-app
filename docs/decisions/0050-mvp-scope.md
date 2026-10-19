# 0050 · MVP covers Uniswap V3 and V4 on four chains; Aero waits for its launch

- Status: proposed
- Deciders: Maksim Romanov

## Context

The first request named Uniswap V3 and V4, Aerodrome and Velodrome on Ethereum, Arbitrum, Base and Optimism. Aerodrome and Velodrome merge into Aero on 2026-10-21: VELO converts into AERO, emissions change and old pools stop emitting, so contracts and rewards built against today's deployments would be rebuilt weeks later ([research/aero](../research/aero/audit-notes.md)).

## Options

- **All four protocols on four chains in the MVP**: the full first request, with Aero work redone after the merge.
- **Uniswap V3 on Base only**: the smallest MVP, but it never tests the integration promise.
- **Uniswap V3 and V4 on four chains; Aero after its launch**: two families with different discovery, custody and hooks.

## Decision

Chosen **Uniswap V3 and V4 on Ethereum, Arbitrum, Base and Optimism**, because two families that differ in discovery (enumerable vs not), native ETH and hooks test the integration promise ([0006](0006-integration-unit.md)) without building against contracts about to change.

- Families `uniswap-v3` and `uniswap-v4`; chains as chain files only.
- Aero families and the `gauge` staking plugin come after the Aero launch, through a research gate on the deployed contracts, Sugar and rewards.
- Rewards stay in the position model from the start, so Aero needs no contract change ([position model](../concepts/position-model.md)).

## Consequences

- The MVP has no staked custody; `staking: none` everywhere.
- M2 adds `uniswap-v4` as the architecture test ([roadmap](../roadmap.md)).
- Users of Aerodrome or Velodrome wait for the post-launch integration.
