# 0015 · Redis-compatible cache and rate limits behind ports

- Status: proposed
- Deciders: Maksim Romanov

## Context

A portfolio request fans out to every deployment of every watched address. Without a shared cache and request budget, one script querying many addresses exhausts RPC and Graph quotas for everyone.

## Options

- **Redis-compatible store for cache, rate limits and pub/sub; job queue in Postgres**.
- **One Redis for cache and queue**: the queue needs no eviction, the cache needs LRU eviction; one instance cannot serve both.
- **In-process cache only**: no sharing between server and worker, no pub/sub.

## Decision

Chosen **a Redis-compatible store (Redis or Valkey) behind the `Cache` and `EventBus` ports, with the job queue in Postgres** ([0028](0028-server-stack.md)), because the cache can then use LRU eviction without risking jobs. Losing Redis is never fatal: the server runs degraded with an in-memory limiter and no cache.

Cache layers:

| Layer | Key | Lifetime |
|---|---|---|
| Immutable reads (decimals, symbol, token order, fee tier, tick spacing) | chain + contract + call | forever |
| Position refs | deployment + owner | [providers and cache](../concepts/providers-and-cache.md#cache); last good value kept, never overwritten by an empty or malformed answer |
| Snapshots | `snap:v1:{deploymentId}:{owner}`; the value holds readBlock, block hash and fetch time | chain file `snapshotTtlSeconds` (default 20) |
| Logs | contract + topics | stored by covered block ranges; only gaps are fetched |
| Prices, "not found" prices, logo index | token id | written by the worker only; lifetimes in [prices and logos](../concepts/prices-and-logos.md#refresh-and-cache) |

Identical in-flight requests share one single-flight lock. Every portfolio request has a budget: address cap for guests, a deadline, request-rate limits, and a separate cost budget charged only on cache misses ([resilience](../concepts/resilience.md)). Unfinished scopes return `failed` with code `TIMEOUT`. Postgres is authoritative for the snapshots of watched targets; Redis is read-through.

## Consequences

- Server and worker share results; repeated reads of the same whale address cost one RPC round.
- Self-hosters run one more service until lite mode (M6) replaces it with an in-memory cache and Postgres `LISTEN/NOTIFY`.
- Key names carry a version prefix so a format change never reads stale shapes.
- Related: [0021](0021-rpc-provider-pool.md), [0028](0028-server-stack.md).
