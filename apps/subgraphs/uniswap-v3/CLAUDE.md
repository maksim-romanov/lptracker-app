# CLAUDE.md — apps/subgraphs/uniswap-v3

The Graph subgraph indexing Uniswap V3 LP positions, live on 6 chains (see `networks.json`). AssemblyScript gotchas: `.claude/rules/assemblyscript.md` (auto-loads when editing `src/`).

## Key files

- `schema.graphql`, `subgraph.yaml`, `networks.json` — entities, manifest, per-chain addresses/`startBlock`.
- `src/nonfungible-position-manager.ts` — event handlers.
- `src/utils/{pool,token}.ts` — `getOrCreate*` helpers.

## Edit cycle

```bash
bun run codegen   # after schema.graphql / subgraph.yaml / abis/ changes
bun run build
bun run test
```

## Deploying

Multi-step, easy to half-forget — use the `subgraph-deploy` skill rather than running `graph deploy` ad hoc. It also covers the two `apps/server` cross-references (`codegen.ts`, `features/uniswap-v3/data/constants/networks.ts`) that must stay in sync after a redeploy.
