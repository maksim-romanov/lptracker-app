# Architecture — Depthly

DeFi portfolio monitoring. Data flow: **Blockchain → Subgraphs (The Graph) + tokens-data → Hono API → Mobile app.**

## Workspaces
- `apps/server` — Hono API on Bun. Clean Architecture (Domain → Data → Application → Presentation).
- `apps/tokens-data` — standalone Hono service producing token metadata; dev sidecar to server, consumed via `server#codegen`.
- `apps/mobile` — RN 0.83 / Expo 55 / React 19. DDD modules, MobX stores, TanStack Query, expo-router, react-native-unistyles + `@grapp/stacks`.
- `apps/subgraphs/*` — The Graph indexers in AssemblyScript (`uniswap-v3`, `uniswap-v4`).
- `packages/logger` — `@depthly/logger` (LogTape wrapper) for server/tokens-data.
- `packages/theme`, `packages/typescript-config` — design tokens, shared tsconfig bases.

Authoritative deep docs: `apps/server/docs/architecture.md`, `apps/mobile/docs/architecture.md`. This file summarizes and cross-links them.

## Server layers
- **Domain** — entities + `*.error.ts`. No framework imports.
- **Data** — repositories, GraphQL/RPC clients, DTOs (`fromGraphQL` / `toDomain`). Returns `Result<T, DomainError>`.
- **Application** (`app/`) — use cases; the cross-protocol gateway lives in `src/app/positions/`.
- **Presentation** — Hono routes + Valibot schemas (source of truth for OpenAPI) + `error-mapper.ts`.

## DI — tsyringe, two independent decisions

### Interface vs concrete
`I`-interface only for multi-impl / plugin contracts; single-impl deps stay concrete. There is deliberately **no `IRepository` / `IUseCase`** in the codebase.

| Add an `I`-interface | Keep concrete |
|---|---|
| >1 implementation exists or is planned | single implementation |
| plugin/protocol contract (`ProtocolEntry`, mobile protocol plugin) | repositories, use cases, DTOs, mappers |
| pluggable external service (`PriceProvider`) | domain helpers, stateless services |

Abstract base classes (`BaseRepository`, `BaseExternalProvider`) are shared behavior, not contracts.

### Symbol token vs inject-by-class — DON'T tokenize everything
**A `Symbol` DI token is not the default.** Most deps are `@injectable()` / `@singleton()` and injected/resolved **by class** (`@inject(ClassName)` / `container.resolve(ClassName)`) — tsyringe uses the class itself as the key. Add a token only for a concrete reason:

**Use a `Symbol` token WHEN:**
- **Scoped/ambiguous binding** — the same class is bound to a different instance per child-container, so a class key can't disambiguate. Server chain scoping: `CHAIN_CONTEXT`, `GRAPHQL_CLIENT`, `RPC_CLIENT` (mainnet's client ≠ base's). *(server)*
- **Non-class value** — an external instance registered with `useValue`: `REDIS` (server); `GATEWAY_API`, `QUERY_CLIENT`, `LOGGER`, `ALERTS` (mobile).
- **Mockable cross-module boundary** — mobile convention: repositories, cross-cutting services, external clients get tokens so tests swap them (`WALLETS_REPOSITORY`, `FOLLOWING_REPOSITORY`, `LINKING_SERVICE`).

**Inject by class (no token) WHEN:**
- Concrete business logic, single instance: **use cases** and use-case→use-case deps (`resolve(GetWalletPositionsUseCase)`).
- **MobX stores** (`@singleton()`), domain event buses (`AppEvents`).
- Any `@injectable()`/`@singleton()` service/adapter/client that isn't scoped and isn't a mocked boundary — the server resolves even repositories by class (`getContainer(chainId).resolve(PositionsRepository)`).

The two apps weight this differently — match the one you're in:
- **server** — tokens reserved for chain-scoping + `useValue` + a couple of shared singletons (`POSITION_FEES_CACHE`); use cases and repositories resolved by class.
- **mobile** — tokenizes repositories/services/clients as mock boundaries (stated in `apps/mobile/docs/architecture.md:33–45`); use cases, stores, events by class.

If you register a token, it must actually be injected by that token — a token that exists only in `register.ts` while callers `resolve(TheClass)` is dead weight, not indirection.

## Child containers (server)
Per-chain isolation via `container.createChildContainer()` (`features/uniswap-v3/di/containers.ts`). Bound **per-chain via token**: `CHAIN_CONTEXT`, `GRAPHQL_CLIENT`, `RPC_CLIENT`. `PositionsRepository` is also chain-scoped but resolved **by class** from the child container. Registered **globally**: `POSITION_FEES_CACHE`, `REDIS`. Resolve with `getContainer(chainId).resolve(...)`.

## External providers
Never call a provider raw from a use case. All outbound calls go through `shared/providers/BaseExternalProvider`: opossum circuit breaker + `rate-limiter-flexible` + Redis cache. New providers extend it.

## Server ↔ Mobile divergence (intentional)
- Server: `Result<T, DomainError>` everywhere; Mobile: repositories **throw**, TanStack Query catches. See `error-handling.md`.
- Server error base is a generic abstract `DomainError<TCode, TContext>`; mobile errors are plain `class X extends Error`.

## Codegen chain (root only, Turbo-ordered)
1. `tokens-data#codegen` — token metadata
2. `server#codegen` — GraphQL types from subgraph schemas + OpenAPI from Valibot; consumes tokens-data
3. `mobile#codegen` — openapi-typescript against server OpenAPI + tokens-data types

Run `bun run codegen` from repo root, never per-app.

## Generated files (never hand-edit; `biome.json`/`turbo.json` reference these)
- server: `src/features/**/gql/`, `openapi/`, `src/features/token-prices/data/tokens-data.generated.ts`
- mobile: `src/core/api-client/generated/`, `src/features/uniswap-v3/data/generated/`, `src/core/tokens-data/generated.d.ts`
- tokens-data: `apps/tokens-data/generated/`
