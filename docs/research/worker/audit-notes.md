---
app: worker
topic: Design audit findings for the worker and data model
checked: 2026-09-30
---

# Design audit findings: worker and data model

Input for the worker's research gate. Findings from the backend, SRE and security audits of the design docs; re-verify each fact before building.

## Decisions

- One scheduler tick per minute under a Postgres advisory lock; claim due targets with `FOR UPDATE SKIP LOCKED` on `watch_targets.next_due_at`, set a jittered next due time, enqueue `refresh:{target}:{bucket}` and remove completed jobs. `Bun.cron` alone runs once per replica and would schedule everything twice. [1][2]
- The job queue lives in Postgres (pg-boss or graphile-worker, chosen here). Payloads carry a `v` field so jobs survive a mixed-version deploy. [1][2]
- Postgres snapshots are authoritative for watched targets; Redis is a read-through copy. Stream event `version` = `readBlock`. [1]
- Watch targets are derived from `watchlist_addresses` × enabled deployments, not kept with a hand-maintained counter; account deletion and new deployments re-derive them. [1]
- Alert confirmation: 2 consecutive reads (or a tick buffer) plus a 30-minute cooldown per (rule, position); `epoch` is the per-(rule, position) transition sequence number in the outbox key. [1]
- A failed scope never counts as a transition; earlier state is carried forward. [1]
- Push payloads carry an opaque alert id only; the app fetches details. An NFT id would reveal the owner through `ownerOf`. [3]
- Migrations: `drizzle-kit generate`, run by a one-shot migrate job under an advisory lock before rollout, never on replica boot, never `push`; expand then contract only; migrations use their own `lock_timeout` instead of the 2 s `statement_timeout`; rollback is redeploying the previous image, no down-migrations. [1][2]
- Backups: nightly `pg_dump` or point-in-time recovery to object storage, a monthly restore test in CI. See ADR 0035. [2]

## Suggested tables

| Table | Key and notes |
|---|---|
| `accounts` | id |
| `passkey_credentials` | credential id, account id |
| `sessions`, `refresh_tokens` | hashed tokens, family id for reuse detection |
| `recovery_codes` | hashed, single use |
| `watchlist_addresses` | (account id, CAIP-10 address), primary key |
| `watch_targets` | unique (address, deployment id); index on `next_due_at` |
| `snapshots` | target id primary key; `read_block`, `block_hash`, `coverage` jsonb, `positions` jsonb |
| `alert_state` | (rule, position): confirmation count, last fired at, epoch |
| `alert_events` | unique (rule, position, transition, epoch); partial index on pending rows (outbox) |
| `idempotency_keys` | (session scope, key); fingerprint, response, `locked_until` lease |

## Facts that constrain us

- `Bun.cron` schedules to the minute, in UTC, once per process. [4]

## Open questions

- pg-boss or graphile-worker: compare maintenance, Bun compatibility, `LISTEN/NOTIFY` wake-up, retry and scheduling features.

## Sources

1. VoidX backend design audit, 2026-09-30 (internal review of docs/)
2. VoidX SRE design audit, 2026-09-30 (internal review of docs/)
3. VoidX security design audit, 2026-09-30 (internal review of docs/)
4. Bun cron — https://bun.com/docs/runtime/cron
