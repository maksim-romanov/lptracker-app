# Server Architecture

## Tech Stack

- **Runtime** — Bun
- **Framework** — Hono 4.11
- **Validation** — Valibot
- **DI** — tsyringe
- **Error handling** — neverthrow (Result types)
- **Resilience** — opossum (circuit breakers), rate-limiter-flexible
- **Caching** — Redis (3-tier)
- **Blockchain** — viem (RPC multicall), GraphQL (subgraph)
- **API docs** — hono-openapi
- **Codegen** — graphql-codegen, openapi-typescript

## Project Structure

```
src/
├── index.ts                    # Hono app setup, route mounting
├── app/                        # Gateway use cases (cross-feature)
├── di/                         # Root DI registration
├── features/
│   ├── uniswap-v3/             # LP position tracking
│   ├── token-prices/           # Price aggregation
│   └── tokens-meta/            # Token metadata & logos
├── presentation/               # Gateway API routes & schemas
└── shared/                     # Base classes (cache, usecase, errors)
```

## Clean Architecture Layers

Each feature module follows strict layer separation:

```
feature/
├── domain/         # Entities, interfaces, business rules
├── data/           # Repositories, providers, caches, clients
├── app/            # Use cases (orchestration)
├── di/             # tokens.ts + register.ts
└── presentation/   # API routes, Valibot schemas, error mappers
```

## Feature Modules

### uniswap-v3
Tracks Uniswap V3 LP positions across Mainnet, Arbitrum, and Base. Combines subgraph data (positions, pools, tokens) with RPC multicall (pool state, fee calculations). Includes Q128 fixed-point fee math.

### token-prices
Aggregates USD token prices from multiple providers (DefiLlama, CoinGecko) with circuit breakers and rate limiting. Provider fallback: DefiLlama first, CoinGecko on failure.

### tokens-meta
Resolves token logo URLs from OneInch and TrustWallet with provider fallback.

## DI with tsyringe

Each feature has `di/tokens.ts` (Symbol tokens) and `di/register.ts` (bindings):

```typescript
// tokens.ts
export const POSITIONS_REPOSITORY = Symbol("POSITIONS_REPOSITORY");

// register.ts
container.register(POSITIONS_REPOSITORY, { useClass: PositionsRepository });
```

### Child Containers (Multi-Chain)

Uniswap V3 creates child DI containers per chain, isolating chain-specific dependencies (GraphQL client, RPC client, repository):

```typescript
const mainnetContainer = container.createChildContainer();
mainnetContainer.register(CHAIN_CONTEXT, { useValue: mainnetConfig });
```

## Key Patterns

### neverthrow Result Types
All use cases return `Result<T, DomainError>` instead of throwing. Routes check `result.isErr()` and map errors to HTTP responses.

### Circuit Breakers (opossum)
External API providers wrap calls in circuit breakers. Opens after 50% failure rate on 5+ requests, resets after 10-20s.

### 3-Tier Caching
1. **Redis cache** - TTL-based (30-60s) via `BaseCache` abstraction
2. **Feature caches** - Domain-aware partitioning (cached vs uncached items)
3. **Request deduplication** - In-flight tracking prevents duplicate external calls

### RPC Multicall
Viem batches multiple contract calls into single RPC requests, reducing round trips for pool state and fee data.
