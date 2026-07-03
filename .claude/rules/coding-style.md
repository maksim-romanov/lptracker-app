# Coding Style — Depthly

TypeScript monorepo on **Bun** (`bun`, never npm/yarn here). **Biome** is linter + formatter (root `biome.json`): `bun run lint` / `lint:fix`. Run `bun run typecheck` after every change.

## Naming (TypeScript only)
- Types → `T` prefix: `TPosition`, `TPoolState`
- Interfaces → `I` prefix: `IRepository`, `IListPositionsScope`
- Enums → `E` prefix: `EChainId`
- DI tokens → `SCREAMING_SNAKE_CASE` Symbols: `CHAIN_CONTEXT`, `WALLETS_REPOSITORY`

These prefixes do **not** apply to Swift (iOS widget — see `apps/mobile/docs/swift-conventions.md`) or AssemblyScript (subgraphs).

## File naming
- Components / screens: `PascalCase.tsx`
- Hooks: `camelCase.ts`
- Everything else: `kebab-case.ts` with role suffixes: `.repository.ts`, `.usecase.ts`, `.store.ts`, `.error.ts`, `.entry.ts`

## Components
- No `React.FC`. Declare `const Foo = function ({ ... }: Props) { ... }` and let React infer the return type.
- **Exception — Hono/JSX (server):** arrow form `const Foo = ({ ... }: Props) => (...)`. Biome's `useArrowFunction` governs JSX files and overrides the global convention.

## Validation
- **Valibot, not Zod.** Route schemas live in `presentation/` and are the source of truth for OpenAPI (`bun run codegen`). Validate untrusted input at the boundary.

## Errors & logging
- Server business logic returns `Result<T, DomainError>` (neverthrow) — throwing in a use case is a bug. Full pattern: `error-handling.md`.
- Never `console.log` in app code (Biome bans it). Use the injected/module logger — see `logging.md`.

## Interfaces & DI tokens
Don't write an interface per class — `I`-interface only for multi-impl / plugin contracts; single-impl deps stay concrete. And **don't tokenize everything**: inject by class by default (`@inject(ClassName)`), add a `Symbol` DI token only for a real reason — scoped binding, a `useValue` non-class value, or a mocked cross-module boundary. See `architecture.md`.

## Immutability
Create new objects, don't mutate.
```ts
// wrong
user.name = name; return user;
// right
return { ...user, name };
```

## Comments (personal rule)
**Write self-documenting code — the default is zero comments.** Clear names, small functions, and obvious structure carry the meaning; if you reach for a comment to explain *what* the code does, rename or refactor instead.

Comments are a rare exception, only for what the code genuinely can't say itself: a hidden constraint, a subtle invariant, a non-obvious "why" (e.g. a workaround for an upstream bug). No narrative comments, no restating the PR description, no "why X instead of Y" essays, no section banners. If in doubt, leave it out.

## Hygiene
- Delete dead code immediately after refactoring — no backward-compat stubs.
- Remove unused imports in the same change.
- Generated files are never hand-edited (paths in `architecture.md`).

## AssemblyScript (subgraphs) is not TypeScript
See `apps/subgraphs/*/CLAUDE.md`: `let` not `const`, `BigInt.zero()`, `try_<method>()` for reverting calls, explicit null checks. Biome style rules are intentionally disabled there — don't "fix" them.
