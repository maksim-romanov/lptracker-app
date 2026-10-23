# Architecture

What exists and how it fits together. Reasons live in the linked ADRs.

## System

```mermaid
flowchart TB
  web[Web browser<br/>SSR + Hotwire]
  ios[ios-app<br/>iOS · iPadOS · macOS]
  android[android-app<br/>after the MVP]
  server[apps/server<br/>HTML + /api/v1 + SSE]
  worker[apps/worker<br/>refresh · prices · logos · alerts]
  pg[(Postgres)]
  redis[(Redis)]
  index[Index sources<br/>RPC · subgraphs]
  rpc[EVM RPC pool]
  push[OneSignal]
  prices[Price and logo sources]
  web --> server
  ios --> server
  android -.-> server
  server --> pg & redis & index & rpc
  worker --> pg & redis & index & rpc
  worker --> push --> ios
  push -.-> android
  worker --> prices
```

- `server` serves HTML pages and fragments, the JSON API, the SSE stream and re-hosted logos (`/api/v1/logos`) from one process ([ADR 0028](decisions/0028-server-stack.md), [ADR 0046](decisions/0046-token-logos.md)).
- `worker` refreshes watch targets, prices and the logo index, and sends alerts ([ADR 0026](decisions/0026-worker-and-alerts.md), [ADR 0045](decisions/0045-token-prices.md), [ADR 0046](decisions/0046-token-logos.md)).
- Dashed lines are planned after the MVP ([ADR 0056](decisions/0056-android-after-the-mvp.md)).
- Clients are thin: they format values the server derived ([ADR 0003](decisions/0003-server-owns-protocol-logic.md)).
- Push goes through OneSignal behind the `Notifier` port ([ADR 0014](decisions/0014-push-via-onesignal.md)).

## Packages and dependency direction

```mermaid
flowchart TB
  server[apps/server] --> contracts & infra & core
  worker[apps/worker] --> infra & core
  server -. generated registry .-> integrations
  worker -. generated registry .-> integrations
  infra[packages/infra · AGPL] --> core
  infra --> kit
  integrations[integrations/* · MIT] --> core & kit
  kit[packages/integration-kit · MIT] --> core
  contracts[packages/contracts · MIT] --> core
  cli[tools/voidx-cli · AGPL] --> kit & infra
  core[packages/core · MIT]
```

| Package | Owns | License |
|---|---|---|
| `packages/core` | Domain types, ports, use cases (`core/domain`, `core/ports`, `core/use-cases`). Imports nothing outside itself. | MIT |
| `packages/contracts` | Zod DTOs, generated `openapi.json`, golden fixtures | MIT |
| `packages/integration-kit` | `defineProtocol`, index sources, staking plugins, math, conformance suite, record and replay | MIT |
| `packages/infra` | Transports, repositories, cache, event bus, job queue, notifier, `instance.config` | AGPL-3.0-or-later |
| `packages/design-tokens` | DTCG tokens for colour, type, spacing, motion, icons | MIT |
| `integrations/` | Protocol families, chain files, own subgraphs | MIT |
| `tools/voidx-cli` | The `voidx` developer CLI ([ADR 0053](decisions/0053-developer-cli.md)) | AGPL-3.0-or-later |
| `e2e/` | Maestro flows for every app ([ADR 0048](decisions/0048-e2e-testing.md)); not a package | MIT |

Rules, enforced by dependency-cruiser (*planned*):

- `core` imports nothing outside itself.
- Integrations import only `core` ports and `integration-kit`; never `infra`, never each other.
- MIT packages never import AGPL packages.
- Only `apps/*` know concrete infrastructure; they wire it in `createRoot` ([ADR 0005](decisions/0005-dependency-injection.md)).

## Reading a portfolio

The core use case `readPortfolio` orchestrates every step; the adapter only implements `discover` and `snapshot` ([integration model](concepts/integration-model.md#adapter)). Steps and results: [data rule](concepts/data-rule.md#discovery-then-verification).

```mermaid
sequenceDiagram
  participant C as Client
  participant U as readPortfolio (core use case)
  participant R as Redis
  participant A as Adapter (family)
  participant I as Index source
  participant Ch as ChainReader
  C->>U: POST /api/v1/portfolio/query {addresses}
  U->>Ch: heads of ≥2 endpoints per chain
  Ch-->>U: readBlock { number, hash } per chain
  par one task per deployment
    U->>R: snapshot (deployment, hmac(owner))?
    R-->>U: hit, or miss with single-flight lease
    U->>A: discover(ctx, owners)
    A->>I: refsOf(owners), newest first
    I-->>A: PositionRef[] with seenAtBlock + indexBlock
    A-->>U: index refs
    U->>R: sticky refs (deployment, hmac(owner))
    U->>U: merge index refs and sticky refs
    opt indexBlock < readBlock
      U->>Ch: getLogs(indexBlock+1 .. readBlock)
      Ch-->>U: gap refs
    end
    U->>A: snapshot(ctx, refs)
    A->>Ch: custody at readBlock (verify)
    A->>Ch: liquidity, ticks, fee growth via Multicall3
    A-->>U: results + Position[] + display descriptor
    U->>R: store snapshot, update sticky refs
  end
  U-->>C: positions, pools, tokens, scopes
```

A deployment that fails or passes the deadline becomes a scope with status `failed`; the rest of the portfolio still returns ([concepts/data-rule.md](concepts/data-rule.md#failure-is-not-absence)).

## Where to read next

| Topic | Doc |
|---|---|
| Index, chain and blocks | [concepts/data-rule.md](concepts/data-rule.md) |
| What clients receive | [concepts/position-model.md](concepts/position-model.md) |
| What an integration is | [concepts/integration-model.md](concepts/integration-model.md) |
| Lifecycle and statuses | [concepts/state-model.md](concepts/state-model.md) |
| RPC pool and caching | [concepts/providers-and-cache.md](concepts/providers-and-cache.md) |
| Failure handling and cost | [concepts/resilience.md](concepts/resilience.md) |
| Feature flags | [concepts/feature-flags.md](concepts/feature-flags.md) |
| Plans and limits | [concepts/plans-and-entitlements.md](concepts/plans-and-entitlements.md) |
| Each app | `apps/<app>/docs/` |
