# Providers and cache

How the server reads chains and index sources, what it keeps, and what it may spend ([ADR 0021](../decisions/0021-rpc-provider-pool.md), [ADR 0015](../decisions/0015-redis-cache-behind-port.md), [ADR 0032](../decisions/0032-deployment-and-cost.md)). Timeouts, retries, breakers and shedding are in [resilience.md](resilience.md).

## Read block

- The chain file sets `readPolicy.tag`: `safe`, `finalized` or `latest`. Fixed block depths are not used, because block times range from 12 s (Ethereum) to 0.25 s (Arbitrum).
- `readBlock` is resolved once per snapshot as the median of the pool's heads for that tag; its number and hash are recorded.
- Every `eth_call` in the snapshot passes `{ blockHash }` (EIP-1898), so one snapshot never mixes forks across providers.
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

- Every minute reads each URL's head; a URL more than the chain file's `maxHeadLagBlocks` behind the median is evicted until it catches up.
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
- Subgraph queries are batched by owners (`owner_in`, up to 100), so The Graph stays within its free tier: 100,000 queries a month free, then $2 per 100,000.

## Cache

Redis-compatible (Redis or Valkey), used for cache, rate limits and pub/sub (`EventBus`); never the job queue; the job queue lives in Postgres ([ADR 0028](../decisions/0028-server-stack.md)). Keys carry a version prefix; addresses in keys are HMAC'd ([ADR 0040](../decisions/0040-privacy.md)).

| Entry | Key | Lifetime |
|---|---|---|
| Immutable reads: decimals, symbol, token order, fee tier, tick spacing | chain + contract + call | Forever |
| Position refs | deployment + owner | 15 minutes; last good value kept up to 24 h |
| Snapshot | `snap:v1:{deploymentId}:{owner}`; value holds `readBlock`, `blockHash`, `fetchedAt` | Chain file `snapshotTtlSeconds` (default 20) |
| Logs | contract + topics | By covered block ranges up to `safe`/`finalized`; each range stores its edge block hashes |
| Negative results | unknown token or pool, address with no positions | 60 seconds |
| Price | token id | [prices and logos](prices-and-logos.md#refresh-and-cache) |
| Price not found | token id, for tokens on no curated list | 72 hours |
| Logo index | token id → logo hash | Rebuilt daily by the worker; logo bytes live in Postgres |
| Single-flight lock | request key | Until the request completes |

Rules:

- For watched targets, Postgres snapshots are authoritative; Redis holds a read-through copy.
- An empty or malformed discovery answer never overwrites the last good value, unless the chain confirms it (zero `balanceOf`, or a second source agrees).
- A missing log range is recorded as missing, never as "no logs". A range whose edge hash no longer matches, or a log with `removed: true`, invalidates that range.
- When Redis is unavailable the server runs degraded, with an in-memory limiter and no cache; readiness does not change.

## Request budget

| Limit | Value |
|---|---|
| Addresses per guest request | 5 |
| Deadline per portfolio request | 8 seconds; unfinished scopes return `failed` with `TIMEOUT` |
| Requests per minute | 60 per guest IP, 120 per account |
| Cost units | 1 unit per deployment, charged on a cache miss only; 300 per hour per guest IP, 1 000 per account, 600 per queried address across all callers |
| Aggregation | One page load counts as one aggregation, however many frames it loads |
| Positions per scope | 500; above that the scope is `truncated`; empty positions hidden unless `include=empty` |
