# Security — Depthly

## Secrets
- No hardcoded secrets. Config via env; each app ships `.env.example`.
- API keys (Context7, Exa, provider RPC keys, `APPSIGNAL_PUSH_API_KEY`) live in env / local config, never committed.
- Subgraph packages hold no secrets — only public chain addresses in `networks.json`.

## Input validation
- Validate untrusted input at the boundary with **Valibot** (`presentation/` schemas) — these are also the OpenAPI source of truth.
- Don't trust client-supplied wallet addresses / params. The SSR app treats Telegram `initData` as an **origin gate only**, not authentication.

## External providers
- All outbound provider calls go through `BaseExternalProvider` (opossum circuit breaker + `rate-limiter-flexible` + Redis cache). Never bypass it for "just one call".
- On-chain reads in subgraphs: use `try_<method>()`, never the throwing form.

## Error hygiene
- Errors returned as `DomainError` and mapped in `error-mapper.ts`. Don't leak provider internals or stack traces to responses — map to a stable `{ code, message }`.

## No SQL in the app layer
Data comes from The Graph + Redis cache, so classic SQLi/ORM guidance doesn't apply. The real boundary risks here are **unvalidated params** and **leaking upstream error detail** — focus there.

## If a security issue is found
Stop, fix CRITICAL before continuing, rotate any exposed secret, sweep for the same pattern. `security-reviewer` agent is available.
