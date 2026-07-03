# Error Handling — Depthly

Server and mobile diverge on purpose. Match the app you're editing.

## Server — `Result<T, DomainError>` (neverthrow)
Business logic **never throws** — it returns `ok(...)` / `err(...)`. Throwing in a use case/repository is a bug.

**Base:** abstract `DomainError<TCode, TContext>` (`src/shared/errors/base.error.ts`) carrying `code`, `message`, optional typed `context`, plus static `isInstance` guard.

**One error class per feature** in `features/<name>/domain/errors/*.error.ts`. Never import another feature's error type. Pattern (see `PositionError`):
- `enum XErrorCode` for variants + default message map
- extends `DomainError<XErrorCode>`
- **static factory per code**: `PositionError.POSITION_NOT_FOUND({ context })`, `.GRAPHQL_ERROR({ error, context })`
- `static isInstance(...)` + optional getters (`isNotFound`)

**Flow:**
1. Repository wraps the call in try/catch → `return ok(value)` or `return err(PositionError.GRAPHQL_ERROR({ error, context }))`.
2. Use case chains `if (result.isErr()) return err(result.error)` and propagates.
3. Route: `if (result.isErr()) return mapErrorToHttpResponse(c, result.error)`.

**Mapping → HTTP** (`presentation/v1/error-mapper.ts`): iterates the protocol registry; each protocol supplies `mapError(error)` (`features/<name>/presentation/error-mapper.ts`) switching on `error.code` → `{ status, code, message }`. Unmatched → 500 + `logger.error("unhandled error", { error })`. Register the mapper on the `ProtocolEntry` (`mapError:` field).

**Cross-feature gateway** (`src/app/positions/`): awaits protocols in parallel, does **not** unify error types — collects failures into `partialFailures[]` (protocol + chainId + message), logs each, and still returns success with metadata. The route surfaces partials (e.g. warning header).

**Legit throw sites:** bootstrap/DI only (chain unsupported, RPC config missing). If an exception still reaches a route, it's caught as a generic 500.

## Mobile — throw + TanStack Query
No neverthrow. Repositories **throw**; `useQuery` catches and exposes `isError` / `error`. No central error-mapper, no registry.

- Errors are plain classes: `class LinkingError extends Error` with `code`, optional `context`, `static isInstance`. No generic base, no factory methods.
- Repository throws (`throw this.asError(response, error)`); the query hook's `queryFn` lets it propagate; components read `error` from the hook.
- Still: one `*.error.ts` per feature, modules don't share error types; cross-feature goes through the `positions/` gateway shell.
