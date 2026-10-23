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
- The chain file's `readPolicy` tag (`safe`, `finalized` or `latest`) picks the block. `readBlock` is resolved once per (request, chain) as the lowest head for that tag among at least two endpoints, so every endpoint has it, and pinned by block hash: every `eth_call` passes `{ blockHash, requireCanonical: true }` (EIP-1898), so one request never mixes forks across providers. Every scope and owner of that chain in the request reads at the same block. "Header not found" retries another endpoint and is not a breaker failure. A chain uses `safe` when it trails head by 60 s or less, else `latest`, because values should follow the protocol's own UI: Ethereum and Arbitrum `safe` trail by 10 to 14 minutes, Base and OP Mainnet by 32 s ([chain parameters](../research/integrations/chain-parameters.md)). On `latest` a rare reorg shows a value for one snapshot until the next one corrects it.
- Every ref is verified at `readBlock` along its custody chain (`ownerOf`, staking contract, LP `balanceOf`). The result is `verified`, `not_yet` (the index saw the ref at a `seenAtBlock` above `readBlock`; neither closed nor absent), `burned` (only a revert on the family's revert list) or `moved`. `burned` and `moved` apply only to refs verified for this owner before; a new index ref that fails custody is dropped.
- Refs from earlier snapshots are kept and re-verified (sticky refs), so an index that runs behind `readBlock` never drops a position. A sticky ref is pruned only once its closure holds at `finalized`.
- Logs between `indexBlock` and `readBlock` fill the gap (hybrid mode). Past `maxIndexLagBlocks` the source is refused and the scope reports `INDEX_STALE`.
- `closed` comes only from `burned` or `moved`. An RPC error makes the scope `failed`; a failed scope is never presented as zero or closed positions.
- USD prices are not quantities. They are external estimates with a source, a confidence and an age ([0045](0045-token-prices.md)); a value derived from one is labelled as such.

## Consequences

- Values trail the protocol's own UI by the `readPolicy` lag; chains whose lag exceeds full-node state history set `requiresArchive`.
- On a `latest` chain the pinned block can be reorged out, and calls by its hash then fail; the snapshot resolves `readBlock` again once before its scope fails.
- The worker diffs only scopes that were `ok` in both reads ([0017](0017-state-model.md)).
- Off-chain rewards (Merkl and similar) would break the rule and are out of the MVP.
