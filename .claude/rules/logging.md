---
paths:
  - "apps/server/src/**"
  - "apps/tokens-data/src/**"
---

# Logging

Both backends use `@depthly/logger` (a thin `@logtape/logtape` wrapper) — install once at startup via `installLogger`/`requestLogger` (see either app's `src/index.ts`), don't reach for `console.log` or a different logging lib.

- Level comes from `LOG_LEVEL`/`DEBUG`/`NODE_ENV` env vars, resolved by `readEnvConfig()` in `packages/logger/src/config.ts` — don't hardcode a level in application code.
- An Appsignal sink (`createAppsignalSink`) is wired in automatically when `APPSIGNAL_PUSH_API_KEY` is set (production). `consoleSink` is the local/dev fallback.
