# 0030 · Postgres as the only database

- Status: proposed
- Deciders: Maksim Romanov

## Context

Durable state is small: accounts, passkeys, sessions, watchlists, devices, watch targets, alert rules, latest snapshots, the alert outbox and idempotency results. Hot data lives in Redis ([0015](0015-redis-cache-behind-port.md)). Two processes write concurrently, `server` and `worker`, and the official instance needs more than one server replica.

## Options

- **Postgres** with Drizzle.
- **SQLite** (`bun:sqlite`) with Drizzle: a file, no database container.
- **Both** through Drizzle: SQLite for self-hosting, Postgres for the official instance.

## Decision

Chosen **Postgres**, because:

- server replicas and the worker write concurrently from separate containers; SQLite allows one writer on one host's file;
- the job queue is already in Postgres; lite mode also moves events to `LISTEN/NOTIFY` and drops Redis, so the smallest self-hosted setup is Postgres alone; with SQLite, Redis would always be required;
- managed Postgres with backups exists on every host;
- supporting two databases doubles every migration and test.

## Consequences

- Self-hosting runs a Postgres container; local development starts it with docker compose.
- Scaling the official instance to several server replicas needs no data migration.
- Revisit only if lite mode proves too heavy for self-hosters; libSQL or SQLite would then be a new ADR superseding this one.
