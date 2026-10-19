# server

Web UI and public API in one Bun + Hono process. Design and plan: `docs/research/server/` and, once approved, `docs/specs/server-plan.md`. Web: [ADR 0018](../../docs/decisions/0018-web-ssr-hotwire.md).

Every command and check here is *planned*.

## Commands

- `bun run check` — `codegen`, `typecheck`, `lint`, `test` for this app.
- `bun run dev` — server on replayed cassettes and a fake watchlist; no keys needed.
- `bun run test:a11y` — Playwright + axe-core on every page and after frame reloads.
- `bun run test:perf` — Lighthouse CI budgets and INP from [0023](../../docs/decisions/0023-motion.md).
- `bun run test:visual` — ARIA snapshots and gallery screenshots in the pinned Playwright Docker image; `--update` only in a baseline commit the owner accepts.
- Dev only: `?scenario=<fixture>` on any page and `/__gallery` render every state ([0048](../../docs/decisions/0048-e2e-testing.md)).

## Rules

- Code style: [code-style](../../docs/concepts/code-style.md#typescript). *Convention* where no lint rule exists.
- Routes validate input, call a use case, map to a presentation DTO from `packages/contracts`, render HTML or JSON; both take the same DTO. Enforced by dependency-cruiser: views import only `contracts`.
- Wire dependencies only in `src/root.ts` through `createRoot(config, overrides)` ([0005](../../docs/decisions/0005-dependency-injection.md)). Enforced by dependency-cruiser: only `root.ts` imports `infra`.
- Every updatable piece is a `<turbo-frame>` with an id and its own GET route ([ADR 0018](../../docs/decisions/0018-web-ssr-hotwire.md)); Turbo Drive stays off, because frame-scoped updates keep focus and screen-reader position; live updates use only the `reload-frame` action. Enforced by frame tests.
- Stimulus is for behaviour only (copy, toggle orientation); it never fetches domain data. *Convention.*
- Pages work without JavaScript: cached scopes render into the HTML. Enforced by a Playwright run with JavaScript disabled.
- Every outbound port call takes an `AbortSignal` from the request `Deadline` and runs under its dependency's policy stack; retries happen only in the provider pool in `packages/infra` ([resilience](../../docs/concepts/resilience.md)). Enforced by port types, a grep for `retry(` outside adapters, and chaos tests.
- Every route runs under the inbound rate limits and load shedding ([resilience](../../docs/concepts/resilience.md#inbound-protection)). Enforced by middleware tests.
- Account `/api/v1` mutations require `Idempotency-Key`; HTML forms carry a hidden token and a CSRF check. Enforced by route replay tests.
- Every queue and in-memory buffer is bounded. Enforced by lint.
- Feature flags come only from `flags/manifest.json`, with a safe default, branched in the route or `createRoot` ([feature flags](../../docs/concepts/feature-flags.md)). Enforced by the flag manifest check and expiry lint.
- Adding a wallet locks the account row, counts active wallets and inserts in one transaction; over the limit it answers the `plan-limit` problem ([plans](../../docs/concepts/plans-and-entitlements.md#enforcement)). Enforced by the concurrency test.
- `/livez` imports no adapter; SSE routes disable the idle timeout and heartbeat every 15 s. Enforced by route tests.

## Stop and ask

- A change needs a new route or a new field in `packages/contracts`.
- A test needs a live RPC or Graph key.
