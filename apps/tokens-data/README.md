# tokens-data

Standalone Hono service on Bun that produces token metadata (logos, prices, meta, stablecoin classification). Runs as a sidecar to `server` in dev; its output is consumed by `server#codegen`.

## Scripts

```bash
bun run dev              # Watch mode
bun run start            # Production
bun run codegen          # Emit OpenAPI spec to generated/openapi.json
bun run fetch-stables    # Refresh embedded stablecoin seed
bun run typecheck
bun run lint
```

## Stablecoin seed

`src/features/stables/seeds/stables.json` is an embedded, version-controlled list of `{ chainId, address, symbol }` triples used as the fallback when the live providers (CoinGecko + DefiLlama) are unreachable.

Refresh it on demand:

```bash
bun run fetch-stables
```

The script fetches both providers, merges and dedupes by `chainId:address`, filters to chains in `@mars-909/catalog`, sorts deterministically, and writes the JSON. If both providers fail, the script exits non-zero and the existing seed is preserved.

The runtime `/v1/stables` endpoint serves Redis-cached data with stale-while-revalidate semantics, falling back to the embedded seed when the cache is empty.
