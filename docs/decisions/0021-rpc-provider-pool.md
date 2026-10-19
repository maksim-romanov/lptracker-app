# 0021 · RPC provider pool per chain

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every quantity comes from RPC ([0007](0007-data-rule-and-read-block.md)). Single providers lag, rate-limit and fail. DefiLlama's SDK solves this at scale; its known pain points are random provider rotation, implicit block-range limits, silently zeroed log ranges and keys in source.

## Options

- **One RPC URL per chain**.
- **viem `fallback` transport as is**.
- **A managed pool with health checks and scoring**.

## Decision

Chosen **a managed pool**, implemented as `ViemChainReader` in `packages/infra`:

- Ordered URLs per chain: operator URLs first, the chain file's `publicRpcs` after, and an optional archival pool preferred for historical calls and logs.
- A median-block health check at startup and on an interval evicts nodes more than the chain file's `maxHeadLagBlocks` behind the median.
- Per-URL scoring by latency, errors and HTTP 429, with backoff, instead of random rotation.
- Per chain: `maxBatchGas` (Multicall3 batches sized by estimated gas) and deployment block, `maxBlockRange`, per-method timeouts, concurrency limits for calls and logs.
- Failures return a structured list of `{ host, error }`.
- A missing log range is an error, never zero positions.
- All settings live in typed `instance.config` with env interpolation for keys; no keys in source.

## Consequences

- Self-hosters can run on public RPCs and add their own URLs for quality.
- Settings reference: [providers and cache](../concepts/providers-and-cache.md).
- Related: [0015](0015-redis-cache-behind-port.md).
