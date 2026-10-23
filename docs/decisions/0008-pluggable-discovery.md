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

A deployment lists one or more sources. MVP defaults: Uniswap V3 `rpc-enumeration`; Uniswap V4 `subgraph-third-party` (the official v4-subgraph) with `rpc-logs` filling its gap, and `rpc-logs` as the keyless source once the worker has backfilled it. Aerodrome and Velodrome wait for the Aero launch ([0050](0050-mvp-scope.md)).

A new family takes the first source that works, in this order: `rpc-enumeration`, `aggregator`, `subgraph-third-party` with `rpc-logs` behind it, `rpc-logs` alone with the worker backfilling from `fromBlock`, `subgraph-own`. A full-history log scan ranks below a subgraph because its cost grows with the chain's age. A third-party subgraph is used only after it passes the checklist in [index sources research](../research/integrations/index-sources.md#evaluation-checklist-for-a-third-party-index). It is referenced by Subgraph ID on The Graph gateway; hosted-service, Studio test and Alchemy Subgraph URLs are never used. `subgraph-own` needs the owner's approval and is written from scratch.

Subgraph queries are always batched by owner (`owner_in`, at most 100 owners), refs are cached with a last-good value and the gap is filled by `rpc-logs`, which keeps the official instance inside The Graph's free query tier.

In a request, `rpc-logs` only fills the gap from a working index's `indexBlock` to `readBlock`. A full scan from `fromBlock` runs only in the worker (M3.5), because thousands of `eth_getLogs` calls do not fit the 8 s deadline.

## Consequences

- Switching a deployment's source is a config change.
- Discovery results keep a last-good value that empty or malformed answers never overwrite (a DefiLlama practice).
- A third-party subgraph needs a Graph API key; a deployment declares it in `dependencies`. On an instance without the key, the scope is `not_configured` unless its worker has backfilled `rpc-logs` for that deployment; a self-hosted instance without a worker therefore shows Uniswap V4 as `not_configured`.
