# 0007 · The index finds positions, the chain supplies every quantity

- Status: proposed
- Deciders: Maksim Romanov

## Context

Indexes lag, differ in schema and miss custody changes; chain reads are exact but cannot discover Uniswap V4 positions. A read that silently misses data would show a position as gone and fire false alerts.

## Options

- **Index for identifiers, chain for quantities**, reads pinned to one block.
- **Everything from the index**: simpler, but lagging and inconsistent numbers.

## Decision

Chosen **index for identifiers, chain for quantities**, because it is exact where it matters and still discovers every position.

- `PositionRef` has no quantity fields.
- The chain file's `readPolicy` tag (`safe`, `finalized` or `latest`) picks the block. `readBlock` is resolved once per snapshot from the pool's median head for that tag and pinned by block hash: every `eth_call` passes `{ blockHash }` (EIP-1898), so one snapshot never mixes forks across providers.
- Every ref is verified at `readBlock` along its custody chain (`ownerOf`, staking contract, LP `balanceOf`). The result is `verified`, `burned` (known "nonexistent token" reverts only) or `moved`.
- Refs from earlier snapshots are kept and re-verified (sticky refs), so an index that runs ahead of or behind `readBlock` never drops a position.
- Logs between `indexBlock` and `readBlock` fill the gap (hybrid mode). Past `maxIndexLagBlocks` the source is refused and the scope reports `INDEX_STALE`.
- `closed` comes only from `burned` or `moved`. An RPC error makes the scope `failed`; a failed scope is never presented as zero or closed positions.
- USD prices are not quantities. They are external estimates with a source, a confidence and an age ([0045](0045-token-prices.md)); a value derived from one is labelled as such.

## Consequences

- Values trail the protocol's own UI by the `readPolicy` lag; chains whose lag exceeds full-node state history set `requiresArchive`.
- The worker diffs only scopes that were `ok` in both reads ([0017](0017-state-model.md)).
- Off-chain rewards (Merkl and similar) would break the rule and are out of the MVP.
