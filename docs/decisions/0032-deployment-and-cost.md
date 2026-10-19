# 0032 · One VM with docker compose and a hard external API budget

- Status: proposed
- Deciders: Maksim Romanov

## Context

One maintainer runs the official instance. The same compose file must serve self-hosters. RPC and subgraph usage is the only cost without a ceiling; at 1,000 watch targets on 4 chains, background refresh alone reaches millions of RPC calls a month.

## Options

- **One VM with docker compose**: server, worker, Postgres, Redis.
- **Managed platform** (containers plus managed Postgres and Redis) from day one.
- **Several server replicas behind a load balancer** from day one.

## Decision

Chosen **one VM with docker compose**, because it is the cheapest setup that matches self-hosting exactly and one scheduler needs no coordination.

- Services: `server`, `worker` (one worker replica now; the advisory lock makes more replicas safe, [0026](0026-worker-and-alerts.md)), Postgres ([0030](0030-postgres-as-the-database.md)), Redis for cache, rate limits and pub/sub (`EventBus`); never the job queue ([0015](0015-redis-cache-behind-port.md)).
- Hosting: one VM at €15–35 a month, set at deploy; Postgres on the same VM with backups to object storage ([0035](0035-data-lifecycle.md)).
- A hard external API budget for the official instance, metered per provider in cost units, with brownout at the limit ([brownout](../concepts/resilience.md#inbound-protection), [flags](../concepts/feature-flags.md)). Budget and alert thresholds: [providers and cache](../concepts/providers-and-cache.md#provider-quotas-and-budget).
- Price sources stay on free tiers with operator keys ([0045](0045-token-prices.md)); subgraph queries are batched by owner ([The Graph quota](../concepts/providers-and-cache.md#provider-quotas-and-budget)).

## Consequences

- Scale to server replicas only when one VM's CPU or memory stays above 70% at peak; one worker replica now, and the advisory lock makes more replicas safe.
- Breaker state and the in-memory rate-limit fallback are per process; replicas multiply them, which is accepted.
- Raising the budget is a config change, not a code change.
