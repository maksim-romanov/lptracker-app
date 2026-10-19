# 0028 · Server stack and topology

- Status: proposed
- Deciders: Maksim Romanov

## Context

One maintainer runs the official instance, and self-hosters run the same code. The server serves the web UI and the JSON API from the same use cases; background work must not slow requests.

## Options

- **Separate web, API, indexer and notification services**.
- **Modular monolith: one server process plus one worker process**.

## Decision

Chosen **a modular monolith**:

- Runtime Bun; HTTP framework Hono.
- API schemas in Zod 4 with `@hono/zod-openapi`; `openapi.json` is generated and committed ([0010](0010-wire-contract.md)).
- Postgres with Drizzle for durable state ([0030](0030-postgres-as-the-database.md)).
- The job queue lives in Postgres, like Solid Queue in Rails 8: jobs commit in the same transaction as the data they come from, and backups include them. The queue library (pg-boss or graphile-worker) is chosen in the M3.5 research gate. Redis serves cache, rate limits and pub/sub (`EventBus`); never the job queue ([0015](0015-redis-cache-behind-port.md)).
- `server` serves web pages ([0018](0018-web-ssr-hotwire.md)) and `/api/v1` in one process; both render the same presentation DTOs.
- `worker` runs price and logo jobs, scheduled refreshes and alerts ([0026](0026-worker-and-alerts.md)).

## Consequences

- Self-hosting is two processes, Postgres and Redis, started by docker compose.
- A Redis job queue becomes worth it only at tens of thousands of jobs per second; switching is an adapter change behind `JobQueue`.
- Web and API split into separate apps only when their scaling needs diverge.
- Related: [0004](0004-ports-and-adapters.md), [0005](0005-dependency-injection.md).
