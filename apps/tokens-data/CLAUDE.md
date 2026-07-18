# CLAUDE.md — apps/tokens-data

Standalone Hono/Bun sidecar producing token metadata. Runs alongside `apps/server` in dev; its output is consumed only through `server#codegen` (see root `CLAUDE.md`'s codegen chain).

Same shape as `apps/server` — Hono + Valibot, error handling and logging conventions in `.claude/rules/error-handling.md` and `.claude/rules/logging.md`.

## Commands

```bash
bun run dev
bun run codegen
bun run typecheck
```
