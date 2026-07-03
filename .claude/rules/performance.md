# Performance — Depthly

## Server / RPC
- Batch on-chain reads with **multicall** — avoid N sequential RPC calls per position.
- Cache expensive provider results in **Redis** (wired through `BaseExternalProvider`); respect the circuit breaker, don't bypass it.
- Fee math (Q128) and tick math are hot paths — see `apps/server/docs/architecture.md`.
- Don't log on the happy hot path at `info` if it fires per-item in a loop; aggregate (`count`, `dropped`, `total`) instead.

## Mobile (RN 0.83 / Hermes)
- Use the `react-native-best-practices` skill for FPS / TTI / re-render / bundle guidance.
- Keep business logic **off** the render path — it lives in use cases; screens render observed store state.
- Watch MobX re-renders and TanStack Query refetch cadence (the iOS widget refresh is tied to refetch success).

## Subgraphs
- Handlers run per-event in WASM — keep them O(1) where possible, reuse `getOrCreate*` helpers, avoid redundant entity loads/saves.

## SSR app (`apps/server` /)
- CSS-first animation; View Transitions for HTMX swaps; GSAP only for the hero modal. Respect `prefers-reduced-motion`; 200–300ms durations.

## Agent model routing (OMC)
That's an orchestration concern handled by `.claude/CLAUDE.md` (haiku/sonnet/opus), not a code rule — kept out of this file on purpose.
