# 0005 · Dependency injection everywhere, pure DI on the server

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every dependency must be swappable for tests and local development, in the spirit of Riverpod overrides. Most code will be written by agents and contributors, so wiring mistakes must surface at compile time.

## Options

- **Pure DI**: a typed composition root per app, no library.
- **Typed container** (Awilix, iti, typed-inject): less hand wiring; Awilix resolves by name at runtime, typed-inject is barely maintained.
- **Decorator container** (tsyringe, InversifyJS): needs decorators and `reflect-metadata`; Bun skips decorator metadata when it is inherited through `tsconfig` `extends`.

## Decision

Chosen **pure DI on the TypeScript server**, because a missing dependency is a `tsc` error, there is no hidden resolution, and agents follow plain function calls reliably.

- Each app has `createRoot(config, overrides)`: the provider graph. `overrides: Partial<Deps>` replaces any provider in tests and local development.
- Per-request dependencies go through Hono `c.var`; per-job dependencies are `{ ...root, jobId, logger }`.
- Integrations never get constructor injection: `adapter.ts` exports `defineProtocol({...})` and receives ports through `AdapterContext` on each call.
- iOS uses swift-dependencies (`withDependencies` for overrides); Android uses Metro (compile-time graph, test graphs with fakes).

## Consequences

- The composition root grows with the app. When `createRoot` exceeds 40 providers, revisit with Awilix (explicit registration) or iti; use cases do not change because they only see plain objects.
- Decorator containers are not used.
