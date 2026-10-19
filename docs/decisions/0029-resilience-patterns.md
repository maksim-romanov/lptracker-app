# 0029 · Resilience patterns on every call path

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every portfolio request fans out to RPC endpoints, index sources and caches across four chains, and the worker repeats that on a schedule. Providers rate-limit, lag and fail; a guest can trigger expensive reads. Without explicit limits, one slow provider or one abusive caller takes the instance down and burns the RPC budget.

## Options

- **Ad hoc handling per adapter**: each adapter picks its own timeouts and retries.
- **One policy stack per dependency, built in the composition root**, with deadlines, one retry layer, breakers, bulkheads, inbound limits, idempotency and degraded answers.
- **A service mesh or gateway** (Envoy) owning resilience.

## Decision

Chosen **one policy stack per dependency built in `createRoot`**, because it works the same on the official and self-hosted instances without extra infrastructure, and agents can see and test every policy in one place. Patterns follow the AWS Builders' Library (timeouts, jittered backoff, retry budgets), the Google SRE book (overload handling, client throttling, SLO burn rates), RFC 5861 (stale caching) and the IETF RateLimit and Idempotency-Key drafts. Order per outbound call: a pool-level retry that picks the next endpoint → a per-endpoint breaker → bulkhead → timeout. Library: cockatiel for timeout, breaker and bulkhead; the retry budget and "429 opens the breaker" are our own code on top. rate-limiter-flexible for inbound limits; deterministic job ids in the Postgres queue. `Idempotency-Key` applies to account `/api/v1` mutations, HTML forms carry a hidden token, and auth ceremonies are never replayed. Parameters live in [concepts/resilience.md](../concepts/resilience.md).

## Consequences

- Every port method takes an `AbortSignal`; deadlines propagate from the request.
- Retries happen in one layer only: the provider pool in `packages/infra`, or the job queue in the worker.
- Failures degrade to scopes with last-good data instead of errors ([0007](0007-data-rule-and-read-block.md)).
- Liveness never depends on a provider, so a provider outage never restarts the fleet.
- Chaos tests on cassettes keep the policies honest ([0009](0009-record-replay-verification.md)).
- Breaker state is per process; instances do not coordinate through Redis.
- A gateway can be added in front later without changing the application policies.
