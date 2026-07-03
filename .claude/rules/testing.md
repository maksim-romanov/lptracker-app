# Testing — Depthly

## Runners (what actually exists — don't invent others)
- **server** — `bun test` (Bun's built-in runner).
- **subgraphs** — matchstick-as. `bun run graph:test` from root (or `bun run test` in the package). Handlers tested with mocked contract calls (`createMockedFunction`, `try_*` paths). Fixtures in `tests/*-utils.ts`.
- **mobile / tokens-data** — no test harness yet. Don't silently add one; if a change needs coverage, propose the setup first.

## Required after any code change
- `bun run typecheck` (Turbo, all workspaces).
- `bun run lint` (Biome).
- Subgraphs, after schema/`subgraph.yaml`/ABI change: `bun run codegen && bun run build && bun run test`. Handlers-only change: `build` + `test`.

## TDD
Available via `superpowers:test-driven-development`. Encouraged for bugfixes: write a failing test that reproduces, then fix. Not mechanically gated on a fixed coverage %.

## What good server tests look like
- Test the `Result` contract: assert `isOk()`/`isErr()` and the `error.code`, not thrown exceptions.
- Mock external clients (GraphQL/RPC) and provider boundaries.
- Independent, no shared state; names describe behavior; cover happy path **and** the error path.
