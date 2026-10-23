# Providers and cache

How the server reads chains and index sources, what it keeps, and what it may spend ([ADR 0021](../decisions/0021-rpc-provider-pool.md), [ADR 0015](../decisions/0015-redis-cache-behind-port.md), [ADR 0032](../decisions/0032-deployment-and-cost.md)). Timeouts, retries, breakers and shedding are in [resilience.md](resilience.md).

## Read block

- The chain file sets `readPolicy.tag`: `safe`, `finalized` or `latest`. Fixed block depths are not used, because block times range from 12 s (Ethereum) to 0.25 s (Arbitrum).
- `readBlock` is resolved once per (request, chain): the lowest head for that tag among at least two pool endpoints not evicted for lag, so every endpoint asked has the block. Its number and hash are recorded, and every scope and owner of that chain in the request uses it.
- Every `eth_call` passes `{ blockHash, requireCanonical: true }` (EIP-1898), so a request never mixes forks across providers and never reads a non-canonical block.
- An endpoint answering "header not found" or "unknown block" has not seen the block yet: the call moves to another endpoint, and the answer does not count toward that endpoint's breaker.
- A chain whose read lag exceeds what full nodes keep sets `requiresArchive: true`; its pool then reads from archival URLs only.

## RPC pool per chain

Configured in `instance.config.providers`, never in global environment variables; keys are interpolated from the environment.

| Setting | Meaning |
|---|---|
| `urls` | Ordered: operator URLs first, then the chain file's `publicRpcs` |
| `archival` | Pool preferred for historical calls and logs |
| `maxBatchGas` | Estimated gas per Multicall3 batch; batches are sized by gas, not by call count |
| `maxBlockRange` | Largest `eth_getLogs` range, per URL; halved automatically when a provider rejects a range |
| `timeouts`, `concurrency` | Per method; separate limits for calls and logs |
| `limits` | The provider plan's quotas, below |

`ChainReader` behaviour:

- Every minute reads each URL's head; a URL more than the chain file's `maxHeadLagBlocks` behind the median is evicted until it catches up (eviction uses the median; `readBlock` uses the lowest remaining head).
- Scores each URL by latency, errors and 429s; backs off a rate-limited URL instead of rotating at random.
- A call returning `success=false` with empty data is ambiguous (out of gas or revert) and is retried alone.
- Fails with a list of `{ host, error }`; keys are redacted from URLs.

## Provider quotas and budget

Each operator states their plans in `instance.config.providers.<name>.limits`:

| Field | Paid RPC example | Public RPC example |
|---|---|---|
| `requestsPerSecond` | 25 | 5 |
| `computeUnitsPerMonth` | 30 000 000 | — |
| `maxBlockRange` | 2 000 | 1 000 |
| `maxBatchGas` | 50 000 000 | 10 000 000 |

- Outbound calls pass a token bucket at 80% of `requestsPerSecond`.
- Every RPC, Graph and price-source call reports cost units, including the Chainlink and pool reads made for prices.
- The official instance's budget for external APIs (RPC, The Graph, price sources) is $50 per month; price sources use free tiers only, with the operator's own 1inch and CoinGecko Demo keys. Alerts fire at 50% and 80%; at 100% the `ops.brownout` flag turns on ([brownout](resilience.md#inbound-protection)), with scope code `BUDGET_EXHAUSTED` for skipped work.
- Subgraph queries are batched by owners (`owner_in`, up to 100), so The Graph stays within its free tier of 100,000 queries a month; the overage price is unverified ([index sources](../research/integrations/index-sources.md#facts-that-constrain-us)).

## Cache

Redis-compatible (Redis or Valkey), used for cache, rate limits and pub/sub (`EventBus`); never the job queue; the job queue lives in Postgres ([ADR 0028](../decisions/0028-server-stack.md)). Keys carry a version prefix; an owner in a key is always `{hmac(owner)}`, never the address ([ADR 0040](../decisions/0040-privacy.md)). Redis runs `maxmemory-policy volatile-lru`, so only keys with a TTL are evicted and budget counters, which have none, never are.

| Entry | Key | Lifetime |
|---|---|---|
| Immutable reads: decimals, symbol, token order, fee tier, tick spacing | chain + contract + call | Forever |
| Position refs from the index | `refs:v1:{deploymentId}:{hmac(owner)}` | 15 minutes; last good value kept up to 24 h |
| Sticky refs | `sticky:v1:{deploymentId}:{hmac(owner)}` | 30 days after the last `verified`; pruned earlier once closure holds at `finalized` ([data rule](data-rule.md#discovery-then-verification)). In Redis until M3.5, with a TTL and so evictable, which leaves discovery to the index alone; from M3.5 Postgres holds them for watch targets |
| Snapshot | `snap:v1:{deploymentId}:{hmac(owner)}`; value holds `readBlock`, `blockHash`, `fetchedAt` | Chain file `snapshotTtlSeconds` (default 20) |
| Logs | contract + topics | By covered block ranges up to `safe`/`finalized`; each range stores its edge block hashes |
| Negative results | unknown token or pool, address with no positions | 60 seconds |
| Price | token id | [prices and logos](prices-and-logos.md#refresh-and-cache) |
| Price not found | token id, for tokens on no curated list | 72 hours |
| Logo index | token id → logo hash | Rebuilt daily by the worker; logo bytes live in Postgres |
| Single-flight lock | request key | Lease of the remaining deadline + 1 s ([resilience](resilience.md#idempotency-and-deduplication)) |
| Budget counters | `budget:v1:{period}:{subject}`, no TTL | Until the server deletes past periods |

Rules:

- For watched targets, Postgres snapshots are authoritative; Redis holds a read-through copy.
- An empty or malformed discovery answer never overwrites the last good value, unless the chain confirms it (zero `balanceOf`, or a second source agrees).
- A missing log range is recorded as missing, never as "no logs". A range whose edge hash no longer matches, or a log with `removed: true`, invalidates that range.
- When Redis is unavailable the server runs degraded, with an in-memory rate limiter and no cache; readiness does not change.
- Budget counters fail closed: when one cannot be read or incremented, the work it would pay for is skipped with scope code `BUDGET_EXHAUSTED`.

## Request budget

| Limit | Value |
|---|---|
| Addresses per guest request | 5 |
| Deadline per portfolio request | 8 seconds; unfinished scopes return `failed` with `TIMEOUT` |
| Requests per minute | 60 per guest IP, 120 per account |
| Cost units | 1 unit per deployment, charged on a cache miss only; 300 per hour per guest IP, 1 000 per account, 600 per queried address across all callers |
| Aggregation | One page load counts as one aggregation, however many frames it loads |
| Refs verified per scope (discovery cap) | 2 000, newest first; above that the scope is `truncated` |
| Positions per scope (display cap) | 500, counted after dropping positions with zero liquidity and zero owed amounts; above that the scope is `truncated`; empty positions hidden unless `include=empty` |
