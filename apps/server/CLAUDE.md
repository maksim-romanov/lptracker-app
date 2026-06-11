# CLAUDE.md — apps/server

See [docs/architecture.md](docs/architecture.md) for feature modules, child-container DI, and Q128 fee math.

## Rules specific to this app

- **Use cases return `Result<T, DomainError>` (neverthrow).** Throwing in business logic is a bug — routes do `result.match(...)` and let `error-mapper.ts` translate to HTTP.
- **One error class per feature.** Never reuse another feature's error type. Cross-feature failures go through the gateway use case in `src/app/`.
- **External providers are wrapped** in opossum circuit breakers + `rate-limiter-flexible` + Redis cache before the call site. New providers must follow `shared/providers/BaseExternalProvider`.
- **Route schemas live in `presentation/`** as Valibot — they are the source of truth for OpenAPI (`bun run codegen` regenerates `openapi/`). The hand-written `docs/api.md` is gone on purpose; consume `openapi/openapi.json` directly.
