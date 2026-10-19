# 0008 · Pluggable discovery, cheapest source by default

- Status: proposed
- Deciders: Maksim Romanov

## Context

Protocols expose positions differently: Uniswap V3 NFTs are enumerable, Uniswap V4 NFTs are not, and staked Aerodrome and Velodrome NFTs sit in gauges. Writing and paying for our own subgraph per family and chain is the most expensive option.

## Options

- **Own subgraphs everywhere**: one schema, high build, deploy and query cost.
- **Pluggable sources per deployment**, cheapest that works by default.

## Decision

Chosen **pluggable sources**. `integration-kit` provides the `PositionIndex` sources:

- `rpc-enumeration`: `balanceOf` + `tokenOfOwnerByIndex` on a contract.
- `rpc-logs`: owner-filtered `Transfer` logs from the contract's `fromBlock`; needs no key.
- `aggregator`: a protocol's lens contract, e.g. Sugar (post-Aero, classic pools only).
- `subgraph-third-party`: someone else's subgraph mapped to `PositionRef`.
- `subgraph-own`: ours, in `integrations/subgraphs/<family>`.

A deployment lists one or more sources. MVP defaults: Uniswap V3 `rpc-enumeration`; Uniswap V4 `subgraph-third-party` (the official v4-subgraph) with `rpc-logs` as the keyless fallback. Aerodrome and Velodrome wait for the Aero launch ([0050](0050-mvp-scope.md)).

Subgraph queries are always batched by owner (`owner_in`, at most 100 owners), refs are cached with a last-good value and the gap is filled by `rpc-logs`, which keeps the official instance inside The Graph's free query tier.

## Consequences

- Switching a deployment's source is a config change.
- Discovery results keep a last-good value that empty or malformed answers never overwrite (a DefiLlama practice).
- A third-party subgraph needs a Graph API key; a deployment declares it in `dependencies`. Without it the instance falls back to `rpc-logs`, or reports `not_configured` when no fallback is listed.
