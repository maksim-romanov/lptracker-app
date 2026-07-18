---
paths:
  - "apps/server/src/**"
  - "apps/tokens-data/src/**"
---

# Error handling

Both backends follow the same shape, each with its own `src/shared/errors/base.error.ts` defining an abstract `DomainError<TCode>`:

- **Use cases return `Result<T, DomainError>` (neverthrow), never throw.** Throwing out of business logic is a bug in this codebase, not a style nit — the presentation layer expects `.match(...)`/`.isOk()` on the return value.
- **One error class per feature, extending `DomainError`, with a static factory method per error code** — e.g. `PositionError.POSITION_NOT_FOUND(opts)`, `PositionError.GRAPHQL_ERROR(opts)` (backed by a shared `protected static create()` in the base class) plus `PositionError.isInstance(error)`. Don't go back to a generic `new FooError(code, message)` constructor call site, and don't reuse another feature's error type or invent a shared generic `AppError`.
- **Error → HTTP mapping is registry-dispatch, not one mapper per feature in isolation.** The shared `presentation/v1/error-mapper.ts` owns `mapErrorToHttpResponse`/building the actual HTTP response, and loops through a `protocolRegistry`. Each feature contributes a `mapV3Error`-style function (in its own `presentation/error-mapper.ts`) that's registered into that registry — new features add a registry entry, they don't reimplement response-building.
- New external HTTP calls go through `shared/providers/base-external-provider.ts` (opossum circuit breaker + `rate-limiter-flexible`), not a raw `fetch`.

This does **not** apply to `apps/mobile` — mobile uses a different pattern (see `apps/mobile/CLAUDE.md`), don't assume neverthrow `Result` there.
