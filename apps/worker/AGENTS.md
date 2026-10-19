# worker

Background refresh, prices, logos and alerts. Design and plan: `docs/research/worker/` and, once approved, `docs/specs/worker-plan.md`. Worker: [ADR 0026](../../docs/decisions/0026-worker-and-alerts.md).

Every command and check here is *planned*.

## Commands

- `bun run check` — `codegen`, `typecheck`, `lint`, `test` for this app.
- `bun run dev` — worker on replayed cassettes, a fake clock and a logging Notifier.

## Rules

- Code style: [code-style](../../docs/concepts/code-style.md#typescript). *Convention* where no lint rule exists.
- Use core use cases (`refreshTarget`, `evaluateAlerts`); never read chains or index sources directly. Enforced by dependency-cruiser: the worker imports no integration-kit reader.
- Wire dependencies only in `src/root.ts`; each job gets `{ ...root, jobId, logger }` ([0005](../../docs/decisions/0005-dependency-injection.md)). Enforced by dependency-cruiser.
- The unit of work is a watch target, never an account. *Convention.*
- Diff rule: [data rule](../../docs/concepts/data-rule.md#failure-is-not-absence). Enforced by worker tests on failed-scope cassettes.
- Alerts are sent from the outbox and retried from it, never re-derived. Enforced by the unique `alert_events` key.
- The job queue lives in Postgres; retries come only from its attempts with jittered backoff; jobs have deterministic ids and a deadline shorter than their lock ([resilience](../../docs/concepts/resilience.md)). Enforced by job tests.
- One scheduler tick per minute under a Postgres advisory lock, so several worker replicas never schedule twice. Enforced by a two-replica test.
- Every outbound port call takes an `AbortSignal` from the job deadline. Enforced by port types.
- Feature flags are evaluated once at job start and stored in the job payload. Enforced by job tests.

## Stop and ask

- A change needs a new alert rule type or a new table.
