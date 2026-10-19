# 0035 · Migrations, backups and retention

- Status: proposed
- Deciders: Maksim Romanov

## Context

Postgres holds accounts, watchlists, snapshots, the alert outbox and the job queue ([0030](0030-postgres-as-the-database.md)). Server and worker can run different versions during a deploy, and self-hosters upgrade without us.

## Options

- **Migrate on boot** from each process.
- **One-off migration job** with expand and contract steps.

## Decision

Chosen **a one-off migration job**, because concurrent boots must never race on schema changes.

Migrations:

- Generated with drizzle-kit and committed; never `drizzle push`.
- Expand then contract: a release only adds; removal comes one release later.
- Run by a one-off `migrate` job under a Postgres advisory lock, with its own `lock_timeout`, before the new server and worker start.
- Rollback redeploys the previous image; there are no down-migrations.
- Job payloads carry a version field `v`, so a job queued by the old version still runs after a deploy.

Backups:

- Official instance: point-in-time recovery, or a nightly `pg_dump` to object storage kept 30 days.
- A CI job restores the latest backup into a scratch database every month and runs a smoke query.
- Self-hosters get `bun run voidx backup` and `bun run voidx restore` (*planned*).

Retention:

| Data | Kept |
|---|---|
| Logs | 14 days |
| `alert_events` | 90 days |
| Snapshots | Latest per watch target |
| Deleted accounts | Purged at once, with cascades to watchlists, devices, sessions, alert rules and events |

## Consequences

- Every schema change needs two releases to remove anything.
- A restore that fails the monthly test pages the maintainer ([0034](0034-observability.md)).
