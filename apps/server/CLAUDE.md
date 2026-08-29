# CLAUDE.md — apps/server

Hono API on Bun. See [docs/architecture.md](docs/architecture.md) for the full write-up.

## Layout

- `src/di/` — DI container root; each feature has its own `di/`.
- `src/features/*/` — self-contained modules (`uniswap-v3`, `token-prices`, `tokens-meta`, `icons`), layered `domain → data → app → presentation`.
- `src/app/` — cross-feature aggregation.
- `src/shared/` — base classes (errors, external-provider base, cache).
- `src/presentation/` — API routes (`v1/`) + an SSR web app (Tailwind/HTMX/Stimulus).

Error handling and logging conventions are in `.claude/rules/error-handling.md` and `.claude/rules/logging.md` (auto-load when you edit this app).

## Notes

- Per-chain isolation uses a child DI container per chain (`features/uniswap-v3/di/containers.ts`) rather than branching on `chainId` inline.
- Valibot route schemas are the OpenAPI source of truth — `bun run codegen` regenerates `openapi/` from them.
- `T`/`I`/`E` naming prefixes are used inconsistently here — don't treat it as a rule the way `apps/mobile` does.

## Commands

```bash
bun run dev
bun run codegen
bun run test
bun run typecheck
```
