# Server architecture

## Layout

```
src/
├── index.ts          Hono app, route mounting
├── app/              Gateway use cases — cross-feature aggregation
├── di/               Root container, calls each feature's register()
├── features/         uniswap-v3 · token-prices · tokens-meta
├── presentation/     Gateway routes (per-feature routes live inside the feature)
└── shared/           Base classes: cache, usecase, providers, errors
```

Every feature follows the same DDD slice: `domain/` (entities, error class, interfaces) → `data/` (repository, GraphQL clients, RPC) → `app/` (use cases) → `presentation/` (Hono routes + Valibot schemas + error mapper) → `di/` (`tokens.ts` + `register.ts`).

## Feature modules

- **`uniswap-v3`** — LP positions on Mainnet, Arbitrum, Base. Combines subgraph data (positions, pools, tokens) with `viem` RPC multicall for live pool state + Q128 fixed-point fee math. Per-chain isolation via child containers (see below).
- **`token-prices`** — USD prices. Providers chained DefiLlama → CoinGecko; each wrapped in a circuit breaker + rate limiter.
- **`tokens-meta`** — Logo URLs. Providers chained OneInch → TrustWallet; route returns HTTP 302 to the resolved URL.

## DI

`di/tokens.ts` declares `Symbol`-based tokens for anything replaceable (repositories, providers, clients). `di/register.ts` binds them. Concrete use cases are class-injected directly (no token).

```ts
export const POSITIONS_REPOSITORY = Symbol("POSITIONS_REPOSITORY");
container.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
```

### Per-chain child containers (uniswap-v3 only)

Uniswap V3 talks to a different subgraph + RPC per chain. Instead of branching at the call site, each chain gets its own child container with chain-bound providers:

```ts
const mainnet = container.createChildContainer();
mainnet.register(CHAIN_CONTEXT, { useValue: mainnetConfig });
mainnet.register(GRAPH_CLIENT, { useClass: MainnetGraphClient });
```

The repository resolves dependencies from the matching child container based on the requested `chainId`. This is the reason most uniswap-v3 services are not registered on the root container.
