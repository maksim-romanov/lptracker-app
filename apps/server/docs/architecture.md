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

## Imports

Cross-layer imports use Node subpath imports declared in `package.json#imports` — not
`tsconfig#paths`, which only the compiler understands. `tsc`, the Bun runtime, `Bun.build`
and Storybook's Vite all resolve them natively, so no resolver plugin is wired anywhere.

```ts
import { PositionSchema } from "#shared/contracts";        // crosses into shared/
import { listPositions } from "#app/positions/list-positions";
```

| Rule | |
| --- | --- |
| Crossing out of `app/`, `features/` or `shared/` | `#<layer>/...` |
| Staying inside one layer or feature | relative (`../presentation/mappers/...`) |
| Sibling components in `presentation/web/views/` | relative — proximity is the signal |

Two constraints on `package.json#imports`:

- **Every key resolves to exactly one file.** Bun 1.3.x does not fall through an array of
  targets the way Node does — it takes the first and gives up. So patterns end in `.ts`.
- **Directory modules need an explicit key**, listed before the pattern (exact keys win):
  `"#shared/contracts": "./src/shared/contracts/index.ts"`. Adding a new `index.ts` entry
  point means adding a key. That list is the module's public surface — keep it short.

Biome sorts `#` specifiers after relative ones; `bun run lint:fix` settles it.

## Dependency rules

`.dependency-cruiser.mjs` encodes the layering so a violation fails CI instead of living in
someone's head — editors auto-write relative specifiers even when a subpath import is shorter,
so the `#` convention above would otherwise decay.

```sh
bun run lint:deps   # runs in CI and on pre-push
```

| Rule | |
| --- | --- |
| `cross-layer-needs-subpath-import` | leaving `app/`/`features/`/`shared/` must use `#…`, not `../..` |
| `features-are-isolated` | a feature never reaches into a sibling — aggregate in `app/` |
| `domain-is-pure` | `domain/` imports nothing from `data/`, `app/`, `presentation/`, `di/` |
| `data-does-not-know-callers` | `data/` may use `domain/` only |
| `app-does-not-know-transport` | use cases don't touch HTTP — `presentation/schemas/` is the exception, it is the feature's contract shape |
| `shared-is-generic` | `shared/` cannot depend on a feature or the gateway |
| `no-circular`, `no-unresolvable`, `not-to-dev-dep` | |

The ruleset passes with no exceptions and no baseline file. Keep it that way: when a rule fires,
either the code is misplaced or the rule is wrong — both are worth fixing at the time. If a rule
genuinely needs an exception, put a `pathNot` with a comment in the rule so the reason lives in
code, rather than recording the violation in a generated list.

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
