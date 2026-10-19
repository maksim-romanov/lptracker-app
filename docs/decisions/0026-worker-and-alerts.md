# 0026 · Worker refreshes watch targets and sends confirmed alerts

- Status: proposed
- Deciders: Maksim Romanov

## Context

Signed-in accounts get alerts when a position leaves or re-enters its range. Many accounts watch the same addresses, index sources fail, and prices jitter at range boundaries; naive diffs produce duplicate work and false alerts.

## Options

- **Refresh per account and diff raw results**.
- **Refresh per shared watch target, diff only successful scopes, confirm transitions**.

## Decision

Chosen **shared watch targets with confirmed transitions** in `worker`:

- The job queue and the scheduler arrive in M3.5 with the price and logo jobs ([0045](0045-token-prices.md), [0046](0046-token-logos.md)); watch targets and alerts follow in M5.
- One worker replica now; one scheduler tick per minute runs under a Postgres advisory lock, which makes more replicas safe. It selects due watch targets with `FOR UPDATE SKIP LOCKED`, enqueues `refresh:{target}:{bucket}` jobs in the Postgres job queue ([0028](0028-server-stack.md)) and sets a jittered `next_due_at`: 5 minutes when a position is within 10% of the range width from a bound, otherwise 15 minutes.
- A watch target is an (address, deployment) pair derived from watchlists × enabled deployments, never a stored counter.
- Each refresh stores the latest snapshot and a coverage map; comparison follows the [data rule](../concepts/data-rule.md#failure-is-not-absence).
- A transition alerts after 2 consecutive reads, or at once when the tick is past the bound by at least one tick spacing; the same transition then waits 30 minutes per (rule, position).
- `alert_events` has a unique key per (rule, position, transition, epoch), where `epoch` is the per-(rule, position) transition sequence number, and an outbox, so retries never send twice.
- The worker publishes `position.changed { ref, version }` for open web pages; `version` is the snapshot's readBlock.
- MVP alert rules: range exit and re-entry for every account, fast and uncapped with the 30-minute cooldown above; early warnings ("within X% of the range edge") only for accounts with `alerts.early_warning` ([0043](0043-plans-and-entitlements.md)).

## Consequences

- One refresh per address and deployment, however many accounts watch it.
- Outages never produce "closed" or "out of range" alerts.
- Related: [0014](0014-push-via-onesignal.md), [0015](0015-redis-cache-behind-port.md), [0017](0017-state-model.md).
