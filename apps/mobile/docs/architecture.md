# Mobile architecture

## Layout

```
apps/mobile/src/
├── app/                      Expo Router — routes only, no business logic
│   ├── _layout.tsx           Root layout (DI bootstrap, theme provider)
│   ├── (app)/                Authenticated drawer (positions, wallets, membership)
│   └── onboarding/
├── core/                     Shared infra (DI, theme, query, services, api-client)
├── positions/                Protocol-agnostic shell (see "Multi-protocol plugin" below)
├── features/                 One folder per protocol plugin (currently uniswap-v3)
├── widgets/                  iOS widget snapshot store + background refresh
├── wallets/ · onboarding/ · membership/   Feature modules (DDD slices)
```

Path aliases are configured in `tsconfig.json` — check there rather than maintaining a separate list.

## DDD feature module

Every module under `src/<feature>/` follows the same slice:

```
<feature>/
├── di/         tokens.ts (Symbols) + register.ts (bindings)
├── domain/     entities, errors (own class per feature), events, interfaces
├── data/       repositories, network DTOs, mappers
├── application/    usecases/, handlers/
└── presentation/   stores/, screens/, components/, hooks/
```

## DI tokens

- **Repositories, services, external clients** → `Symbol` tokens (replaceable, mockable).
- **Use cases, domain events** → direct class injection (concrete).

```ts
export const POSITIONS_REPOSITORY = Symbol("POSITIONS_REPOSITORY");
container.register(POSITIONS_REPOSITORY, PositionsRepository);

constructor(
  @inject(POSITIONS_REPOSITORY) private readonly repo: PositionsRepository,
) {}
```

## File-naming suffix table

`kebab-case.ts` + role suffix is the dominant convention. Components and screens are `PascalCase.tsx`, hooks `camelCase.ts`.

| Suffix              | Role                                     |
|---------------------|------------------------------------------|
| `.repository.ts`    | Data access (interface lives in domain)  |
| `.usecase.ts`       | Single-purpose business operation        |
| `.service.ts`       | Stateless domain helper                  |
| `.store.ts`         | MobX store (presentation)                |
| `.events.ts`        | Domain event types                       |
| `.error.ts`         | Module-owned error class                 |
| `.middleware.ts`    | Hono middleware (server) / RN equivalent |
| `.keys.ts`          | TanStack Query key factories             |
| `.types.ts`         | Co-located types for a single component  |
| `.d.ts`             | Generated declarations only              |
| `tokens.ts`         | DI Symbol declarations                   |
| `register.ts`       | DI bindings (run on module load)         |

## Multi-protocol plugin pattern

Position-related code is a **shell + plugin** layout. The shell is protocol-agnostic; each protocol drops in via a single barrel file.

- **`positions/` (shell)** owns the agnostic surface: `IProtocolPlugin<T>` contract, `lookupPlugin` helper, `GatewayPositionsRepository`, routing, query keys, shell UI (`PositionShell`, `PositionListItem`, `PositionDetailShell`, `UnknownPositionBody`), and the `FollowingStore`/`FollowingRepository`.
- **`features/<protocol>/` (plugin)** exports a single `<protocol>Plugin: IProtocolPlugin<T>`. Each plugin owns its VM, DTO→VM mapper, presentation parts (`ListBody`, `DetailBody`, optional `Strip`), and protocol-specific use cases. Strictly typed against `TPositionByExt<T>`.
- **`app/protocol-plugins.ts`** is a const registry keyed by extension type, exhaustively constrained against `TKnownProtocolSlug` from `@depthly/catalog` via `satisfies`. Adding a protocol to the catalog without registering a plugin is a compile error.

External consumers import via the façade `features/<protocol>`. Deep imports are blocked by Biome `noRestrictedImports` in the root `biome.json`. See `packages/catalog/README.md` for the "adding a protocol" walkthrough.

## Theme

`packages/theme` exports the design tokens. `src/core/presentation/theme/unistyles.ts` registers them with `react-native-unistyles`; layout primitives come from `@grapp/stacks`. Components consume tokens via `StyleSheet.create((theme) => ...)`. The token catalog (spacing scale, color roles, typography variants) is the source of truth — read `packages/theme/src/` rather than mirror docs here.
