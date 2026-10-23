# Resilience

How the server and worker stay up and cheap when dependencies fail ([ADR 0029](../decisions/0029-resilience-patterns.md)). Cache layers, quotas and the RPC pool are in [providers-and-cache.md](providers-and-cache.md).

## Policies per call

Every outbound call runs one policy stack, built in `createRoot`, in this order: **pool-level retry (picks the next endpoint) → per-endpoint circuit breaker → bulkhead → timeout**. Cockatiel supplies the breaker, bulkhead and timeout; the retry budget and "429 opens the breaker" are our own code on top. Breaker state stays in process.

| Dependency | Timeout | Retry | Breaker | Bulkhead |
|---|---|---|---|---|
| RPC endpoint (multicall) | 2.5 s | ≤3 attempts across endpoints, reads only | per endpoint; ejects it from the pool | 8 concurrent per endpoint |
| Subgraph | 3 s | ≤3 attempts | per deployment | 4 per deployment |
| OneSignal | 5 s | via the job, not in process | one | 4 |
| Postgres | `statement_timeout` 2 s server, 30 s worker | none | none | pool 10 server, 5 worker |
| Redis | 250 ms per command | none | none | client pool |

- **Breaker:** opens at 50% failures over 30 s with at least 5 requests, or after 5 consecutive failures on a quiet host; half-open after 10 s growing to 5 min, one probe. A 429 opens it at once for the `Retry-After` period.
- **Not a failure:** "header not found" or "unknown block" for a pinned `readBlock` means the endpoint lags; the pool retries another endpoint and the breaker does not count it ([read block](providers-and-cache.md#read-block)).
- **Retry:** full jitter, `random(0, min(cap, 100 ms × 2ⁿ))`, cap 2 s on the server and 30 s in the worker. Retries stay under 10% of calls per dependency. Honour `Retry-After`; skip a retry that would not fit the remaining deadline.

## Deadlines

- An inbound request creates a `Deadline` (8 s for a portfolio request) and passes its `AbortSignal` through the use case into every port.
- A child timeout is `min(remaining − 300 ms reserved for rendering, the dependency's timeout)`, derived only with `Deadline.child()`.
- A scope that runs out of time returns `failed` with `TIMEOUT`, plus last-good data if the cache has it.

## One retry layer

Retries happen only in the provider pool in `packages/infra` (outbound calls) and, in the worker, only through the job queue's attempts. Use cases, HTTP handlers and clients never retry, because stacked layers multiply attempts.

## Jobs

- The queue lives in Postgres; the library is chosen in the worker's research gate ([ADR 0028](../decisions/0028-server-stack.md)).
- One scheduler tick per minute runs under a Postgres advisory lock and claims due targets with `FOR UPDATE SKIP LOCKED` on `watch_targets.next_due_at` (jittered). Several worker replicas never schedule the same target twice.
- Job ids are deterministic: `refresh:{target}:{bucket}`. Payloads carry a `v` field so jobs survive a deploy with mixed versions.
- A job's deadline is shorter than its lock.

## Inbound protection

| Mechanism | Setting |
|---|---|
| Rate limits | Requests and cost units in [providers-and-cache.md](providers-and-cache.md#request-budget); Redis counters, in-memory fallback when Redis is down. Budget counters fail closed to `BUDGET_EXHAUSTED` ([cache](providers-and-cache.md#cache)) |
| 429 responses | `Retry-After`, `RateLimit-Policy` and `RateLimit` headers |
| Concurrency per caller | 2 concurrent aggregations per IP or account |
| Load shedding | 200 in-flight requests per server process; guests shed from 70%, accounts at 100%; also when event-loop delay exceeds 200 ms |
| Priority | Account interactive, then guest interactive, then worker refresh |
| Brownout | `ops.brownout`: cache-first answers and background refresh slowed to 60 min; no fan-out refresh on cache miss for guests |

CSRF protection for forms is in [ADR 0038](../decisions/0038-auth-sessions-csrf.md).

## Idempotency and deduplication

- `Idempotency-Key` (a UUID, namespaced by session) is required on account mutations under `/api/v1`. HTML forms send the same key as a hidden form token.
- Portfolio query POSTs and auth ceremonies are excluded; responses that contain tokens are never replayed.
- Keys live in Postgres with the request fingerprint, the response and a lease; a crashed request's lease expires instead of leaving the key stuck. Stored for 24 h. In progress → 409; reused with another body → 422.
- Identical in-flight reads share one result through the single-flight lock. The lock is a lease of the holder's remaining deadline + 1 s, so a crashed holder frees it. A waiter whose own deadline ends first returns the scope `failed` with `TIMEOUT` and last-good data, never waits past its deadline.
- Alerts go through an outbox row unique on `(rule, position, transition, epoch)`; the OneSignal call carries its own idempotency key.

## HTTP caching and streams

- `/api/v1` GETs carry `ETag` and `Cache-Control: private, max-age=15, stale-while-revalidate=60`; token and chain metadata `public, max-age=86400`. Guest POST reads revalidate with `knownVersion` in the body and get `{ notModified: true }`.
- SSE routes send `Cache-Control: no-cache, no-transform` and `X-Accel-Buffering: no`, skip compression, disable Bun's idle timeout and heartbeat every 15 s. The edge must serve HTTP/2, because browsers allow six HTTP/1.1 connections per origin.

## Health and shutdown

| Endpoint | Checks |
|---|---|
| `/livez` | Process is up; never touches a dependency |
| `/readyz` | The process is not draining; from M3.5 also Postgres answers within 250 ms. Redis is not checked; its loss runs degraded |
| `/healthz/deps` | Breaker states; authenticated, informational, never used for restarts |

On SIGTERM: `/readyz` returns 503, wait 5 s, stop accepting connections and let requests finish, close SSE with a `retry:` hint, close the worker after active jobs, all within 25 s.

## Cost

- Reads are pinned to one `readBlock` per request and chain, so they cache.
- The worker skips chains with no new block and refreshes only watched, active positions.
- SSE fans out through one Redis subscriber per process; connections per IP are capped.

## Operating it

- Metrics, logs and alerting follow [ADR 0034](../decisions/0034-observability.md): a small set of capped labels, one maintainer's worth of dashboards.
- SLIs: guest portfolio lookups that finish within 8 s, and the share of them with every scope complete; alerts delivered within 5 minutes of a transition. Burn-rate alerts need a minimum event count.
- Page a human only for: external probe on `/readyz` down, outbox older than 10 minutes, queue lag, budget at 80%. Everything else goes to a daily digest.
- Chaos tests wrap the cassette transport to inject latency, 429 with `Retry-After`, 5xx, truncated multicalls and hangs, and assert deadlines, budgets, breakers and degraded answers.
