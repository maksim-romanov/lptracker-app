---
name: subgraph-deploy
description: Use when deploying or updating the Uniswap V3 subgraph to The Graph Studio (mainnet, arbitrum, base), or when changing schema/handlers and rolling out a new version. Covers pre-flight checks, deploy commands per chain, and the two required URL updates in the server so it queries the new version.
---

# Deploy / update the Uniswap V3 subgraph

Three deploy targets, each its own Studio slug:

| Chain         | Script               | Studio slug             |
| ------------- | -------------------- | ----------------------- |
| Mainnet       | `bun run deploy:mainnet`  | `uniswap-v-3-mainnet`   |
| Arbitrum One  | `bun run deploy:arbitrum` | `uniswap-v-3-graph`     |
| Base          | `bun run deploy:base`     | `uniswap-v-3-base`      |

## Pre-flight (run from `apps/subgraphs/uniswap-v3/`)

1. `bun run codegen` — regenerates `generated/` from schema + ABIs. Required only if `schema.graphql`, `subgraph.yaml`, or any ABI changed.
2. `bun run build` — must succeed before deploy. Treat AS warnings as errors.
3. `bun run test` — matchstick tests must pass. If you added a new handler or branch, add a test for it first.
4. Verify `networks.json` has correct `address`/`startBlock` for the target chain. If not, fix before deploying.
5. Confirm you are authenticated: `graph auth <DEPLOY_KEY>` once per machine. Deploy key comes from Studio dashboard.

## Deploying

Studio prompts for a version label (e.g. `v0.0.35`). Bump the patch number unless schema changed — bump minor for schema changes.

```bash
bun run deploy:mainnet
# or deploy:arbitrum / deploy:base
```

After deploy, Studio returns a query URL like:
```
https://api.studio.thegraph.com/query/120331/uniswap-v-3-mainnet/v0.0.35
```

Copy this URL — you need it in two places below.

## Post-deploy: sync server URLs (CRITICAL)

The server has hardcoded references to the Studio version. Without these updates the server keeps querying the old version, and codegen-generated types may diverge from runtime data.

### 1. `apps/server/codegen.ts`

Update the `schema` field for `uniswap-v3`:

```ts
"uniswap-v3": {
  schema: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-mainnet/vX.Y.Z",
  headers: { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` },
},
```

Note: codegen reads from ONE chain (currently mainnet). If the schema is identical across chains, mainnet is enough. If schemas diverge per chain, this is a deeper change — surface that.

### 2. `apps/server/src/features/uniswap-v3/data/constants/networks.ts`

Update `graph.url` for the chain you redeployed:

```ts
const MAINNET_NETWORK = {
  // ...
  graph: { url: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-mainnet/vX.Y.Z" },
};
```

Repeat for arbitrum/base entries when you redeploy those.

### 3. Regenerate server types

From the repo root:

```bash
bun run codegen
```

This re-runs `graphql-codegen` against the new schema URL and propagates types into `apps/server/src/features/uniswap-v3/data/gql/` and downstream via OpenAPI into mobile.

### 4. Type-check

```bash
bun run typecheck
```

If the schema changed (added/removed fields, renamed entities), the server queries in `apps/server/src/features/uniswap-v3/data/positions.repository.ts` will likely need edits. Fix them, then `typecheck` again.

## Checklist

- [ ] `bun run codegen` (in subgraph dir, if schema/yaml/ABI changed)
- [ ] `bun run build` passes
- [ ] `bun run test` passes
- [ ] `networks.json` reviewed
- [ ] `bun run deploy:<chain>` succeeded, Studio gave a new version URL
- [ ] `apps/server/codegen.ts` schema URL updated
- [ ] `apps/server/src/features/uniswap-v3/data/constants/networks.ts` graph.url updated for the redeployed chain(s)
- [ ] `bun run codegen` at repo root
- [ ] `bun run typecheck` at repo root
- [ ] Server query files in `data/positions.repository.ts` adjusted if schema changed

## Common pitfalls

- **Indexing starts from `startBlock`, not block 0.** Lowering `startBlock` after deploy requires a re-sync — Studio will reindex from the new lower block, which can take hours. Don't lower it casually.
- **Reverted contract calls.** If you added a new `try_<method>` call, test the reverted branch in matchstick (`createMockedFunction(...).reverts()`).
- **AS compile errors after `codegen`.** Usually means `schema.graphql` or `subgraph.yaml` has a type the generated bindings can't satisfy. Read the build output — the line is in `generated/`.
- **Forgetting `bun run codegen` at the repo root after URL changes.** Server will use stale types and runtime URLs out of sync.
