# tokens-data

Standalone Hono service on Bun that produces token metadata (logos, prices, meta, stablecoin classification). Runs as a sidecar to `server` in dev; its output is consumed by `server#codegen`.

## Scripts

```bash
bun run dev              # Watch mode
bun run start            # Production
bun run codegen          # Emit OpenAPI spec to generated/openapi.json
bun run typecheck
bun run lint
```
