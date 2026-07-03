# Logging — Depthly

Structured logging everywhere: `logger.<level>("message", { ...metadata })`. Never a bare interpolated string, never `console.log` (Biome bans it in app code).

## Server / tokens-data — `@depthly/logger` (LogTape)
- Obtain at **module top level**: `const logger = getLogger(["server", "v3", "repo"])`. Category array namespaces the log (`["server", <feature>, <layer>]`).
- Boot: `installLogger({ app: "server" })` in `index.ts`; `app.use("*", requestLogger({ app: "server" }))` adds the Hono request logger.
- **Request context** (`requestId`, `method`, `url`, `userAgent`) is attached automatically via AsyncLocalStorage (`withContext`) — don't thread it manually.
- Levels: `debug` (dev tracing) · `info` (normal ops, request start/complete, data fetched) · `warning` (partial degradation, e.g. dropped positions) · `error` (failed op / caught exception) · `fatal` (catastrophic → Appsignal).
- Sinks: console (JSON in prod, pretty in dev) + Appsignal for fatal/errors when `APPSIGNAL_PUSH_API_KEY` is set. Config via `LOG_LEVEL` / `NODE_ENV` / `DEBUG`.

## Mobile — `react-native-logs` (`ReactNativeLogger`)
- Injected via DI token `LOGGER`; namespace with `.extend("ApiClient")`. Base use case auto-extends with its class name.
- Levels: `debug` · `info` · `warn` · `error` · `critical`. Dev shows all; prod = error+critical only (async, non-blocking).

## Where to log
- **At the origin**: repository catch block logs the failure with domain context before returning `err(...)` / throwing — `logger.error("getWalletPositions failed", { chainId, owner, error })`.
- **At the boundary**: `error-mapper.ts` logs only truly unhandled errors.
- A `Result` does not log itself. If you return `err(...)` without logging, log at the point you have the most context.

## Conventional metadata fields
`requestId`, `chainId`, `owner`/address, `error` (the Error/DomainError object), and metrics (`count`, `dropped`, `total`, `durationMs`). Prefer these keys so logs stay queryable.
