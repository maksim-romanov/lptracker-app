# 0039 · One error model from ports to clients

- Status: proposed
- Deciders: Maksim Romanov

## Context

Failures come from many places (RPC, index sources, cache, database, validation) and reach three clients. Swallowed errors in the earlier project hid real failures; clients must never mistake an error for "no positions".

## Options

- **Ad hoc errors** per route and adapter.
- **Typed port errors mapped to scope codes and RFC 9457 responses.**

## Decision

Chosen **typed errors with one mapping**.

- Ports throw typed errors with an open uppercase `code`, e.g. `RPC_ERROR`, `INDEX_STALE`, `TIMEOUT`, `NOT_CONFIGURED`, `KILLED`, `INDEX_TRUNCATED`, `BUDGET_EXHAUSTED`.
- Inside a portfolio, a code maps to the scope status given in the [state model](../concepts/state-model.md) (usually `failed`; `NOT_CONFIGURED` → `not_configured`, `INDEX_TRUNCATED` → `ok` with `truncated: true`); the rest of the response still returns ([concepts/data-rule.md](../concepts/data-rule.md)).
- Request-level HTTP errors use RFC 9457 problem details (`type`, `title`, `status`, `code`, `detail`), never a bare string. `type` is built from `publicOrigin` (`<publicOrigin>/problems/<slug>`, [0044](0044-domain-as-configuration.md)); clients branch on `code`, never on `type`. A plan limit is `409` with type slug `plan-limit` and `key`, `upgradeAvailable`, and `limit` and `usage` for counted keys ([0043](0043-plans-and-entitlements.md)); a guest query that exceeds the limit succeeds with a `planLimit` notice instead of an error (*proposed*).
- Request-level codes:

| Code | Status | When |
|---|---|---|
| `VALIDATION_FAILED` | 422 | Body or query fails the schema |
| `INVALID_ADDRESS` | 422 | An address is not a valid CAIP-10 or EVM address; `detail` names it |
| `RATE_LIMITED` | 429 | Request or cost-unit limit hit; with `Retry-After` ([resilience](../concepts/resilience.md#inbound-protection)) |
| `CONCURRENCY_LIMITED` | 429 | More than the concurrent aggregations allowed per caller |
| `SHED` | 503 | Load shedding; with `Retry-After` |
| `PLAN_LIMIT` | 409 | Plan limit, type slug `plan-limit` |
| `UNAUTHENTICATED` | 401 | Account route without a session |
| `CSRF_FAILED` | 403 | Form token missing or wrong |
| `IDEMPOTENCY_IN_PROGRESS` | 409 | Same `Idempotency-Key` still running |
| `IDEMPOTENCY_MISMATCH` | 422 | Key reused with another body |
| `CLIENT_TOO_OLD` | 426 | Below `minClientVersion` |
| `NOT_FOUND` | 404 | Unknown route or resource |
| `INTERNAL` | 500 | Anything unmapped; logged with a trace id |

- Errors are never swallowed: every catch either maps, retries within policy, or rethrows.
- Logs record the code, the dependency and the HMAC'd subject, never raw addresses or keys ([0040](0040-privacy.md)).
- Clients show a message for known codes and a generic one for unknown codes; they never crash on a new code. iOS throws untyped errors carrying the `code`; Android returns a sealed `Outcome` with an open `ErrorCode`; cancellation always propagates ([code style](../concepts/code-style.md)).

## Consequences

- Adding a code is additive; removing one needs `/api/v2` ([0010](0010-wire-contract.md)).
- Chaos tests assert the code each injected fault produces.
