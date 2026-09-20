---
name: subgraph-deploy
description: Use when deploying or updating the Uniswap V3 subgraph to The Graph Studio (mainnet, arbitrum, base, optimism, polygon, unichain), or when changing schema/handlers and rolling out a new version. Covers pre-flight checks, deploy commands per chain, and the two required URL updates in the server so it queries the new version.
---

# Deploy / update the Uniswap V3 subgraph

Six deploy targets, each its own Studio slug:

| Chain         | Script                     | Studio slug              |
| ------------- | -------------------------- | ------------------------- |
| Mainnet       | `bun run deploy:mainnet`   | `uniswap-v-3-mainnet`     |
| Arbitrum One  | `bun run deploy:arbitrum`  | `uniswap-v-3-graph`       |
| Base          | `bun run deploy:base`      | `uniswap-v-3-base`        |
| Optimism      | `bun run deploy:optimism`  | `uniswap-v-3-optimism`    |
| Polygon       | `bun run deploy:polygon`   | `uniswap-v-3-polygon`     |
| Unichain      | `bun run deploy:unichain`  | `uniswap-v-3-unichain`    |

Only mainnet/arbitrum/base currently have a corresponding `graph.url` entry actually read by the server (see "Post-deploy" below) — confirm whether the chain you're deploying is one the server queries before assuming the sync step applies.

## Pre-flight (run from `apps/subgraphs/uniswap-v3/`)

1. `bun run codegen` — regenerates `generated/` from schema + ABIs. Required only if `schema.graphql`, `subgraph.yaml`, or any ABI changed.
2. `bun run build` — must succeed before deploy. Treat AS warnings as errors.
3. `bun run test` — matchstick tests must pass. If you added a new handler or branch, add a test for it first.
4. **On-chain sanity check** — verify `address`, `startBlock`, and event signatures against the live chain, never from memory. See the section below. This is the single most costly thing to get wrong: a bad `startBlock` silently indexes an empty subgraph, and you pay for it.
5. Confirm you are authenticated: `graph auth <DEPLOY_KEY>` once per machine. Deploy key comes from Studio dashboard.

## On-chain sanity check (README Rule #1)

matchstick does **not** verify the manifest — it trusts whatever `subgraph.yaml`/`networks.json` say. So before a deploy that changes an address, `startBlock`, or event, confirm each against the chain. This is a one-time pre-deploy check, not CI. `cast` (Foundry) is already the documented tool; the Etherscan key lives in `apps/subgraphs/uniswap-v4/.env`.

```sh
set -a; source apps/subgraphs/uniswap-v4/.env; set +a   # loads ETHERSCAN_API_KEY (one key, all chains)
```

**startBlock = contract creation block.** `cast` has no command for this — `cast creation-code`/`constructor-args` return bytecode/args, not the block — so use Etherscan v2 `getcontractcreation`, which returns it directly (chainid: mainnet 1, arbitrum 42161, base 8453):

```sh
curl -s "https://api.etherscan.io/v2/api?chainid=42161&module=contract&action=getcontractcreation&contractaddresses=<ADDR>&apikey=$ETHERSCAN_API_KEY" \
  | jq -r '.result[0].blockNumber'
```

The free key covers mainnet + arbitrum but **not base** (`NOTOK … upgrade your api plan`). For base, use pure `cast` — binary-search the first block with code against a base RPC (no API key needed):

```sh
ADDR=0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1; RPC=https://mainnet.base.org
lo=1; hi=$(cast block-number --rpc-url $RPC)
while [ $((hi-lo)) -gt 1 ]; do mid=$(((lo+hi)/2));
  c=$(cast code $ADDR --rpc-url $RPC --block $mid 2>/dev/null);
  if [ "$c" = "0x" ] || [ -z "$c" ]; then lo=$mid; else hi=$mid; fi; done
echo "creation block = $hi"
```

Note: a **pruned** RPC returns `0x` for old blocks and gives a false (too-high) result — sanity-check the block's timestamp matches the protocol's known launch era. Verified reference values: mainnet NPM `12369621`+, arbitrum `173`, base `1371714`.

**Event signatures** must match the ABI exactly — one wrong type and that handler never fires:

```sh
cast interface <ADDR> --chain arbitrum | grep "event "   # diff against subgraph.yaml eventHandlers
```

Confirm the substitution actually lands before deploying:

```sh
bunx graph build --network base && grep -E "address:|startBlock:" build/subgraph.yaml
git checkout -- subgraph.yaml   # --network rewrites the root manifest in place; restore the mainnet default
```

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

### 1. `apps/server/scripts/refresh-graphql-schema.ts`

`codegen.ts` generates offline from the committed snapshot `apps/server/schema.introspection.json` — it holds no Studio URL and no auth header. The version lives in `SCHEMA_URL` in the refresh script; point it at the new one, then refresh the snapshot from `apps/server`:

```bash
GRAPH_API_KEY=<key> bun run codegen:graphql:refresh   # introspects Studio, rewrites schema.introspection.json
bun run codegen:graphql                               # regenerates src/features/uniswap-v3/data/gql/ from the snapshot
```

Both are outside the root codegen chain — nothing else runs them. Commit the regenerated snapshot and `data/gql/`.

Note: the snapshot is introspected from ONE chain (currently arbitrum, `uniswap-v-3-graph`). If the schema is identical across chains, one is enough. If schemas diverge per chain, this is a deeper change — surface that.

### 2. `apps/server/src/features/uniswap-v3/data/constants/networks.ts`

Update `graph.url` for the chain you redeployed:

```ts
const MAINNET_NETWORK = {
  // ...
  graph: { url: "https://api.studio.thegraph.com/query/120331/uniswap-v-3-mainnet/vX.Y.Z" },
};
```

Repeat for arbitrum/base entries when you redeploy those.

### 3. Regenerate the rest of the chain

From the repo root:

```bash
bun run codegen
```

The GraphQL types already came from step 1; this propagates the change downstream via OpenAPI into mobile.

### 4. Type-check

```bash
bun run typecheck
```

If the schema changed (added/removed fields, renamed entities), the server queries in `apps/server/src/features/uniswap-v3/data/positions.repository.ts` will likely need edits. Fix them, then `typecheck` again.

## Checklist

- [ ] `bun run codegen` (in subgraph dir, if schema/yaml/ABI changed)
- [ ] `bun run build` passes
- [ ] `bun run test` passes
- [ ] On-chain sanity check: `address` / `startBlock` / event signatures verified against the chain (Rule #1) — especially when the target chain or contract changed
- [ ] `networks.json` reviewed
- [ ] `bun run deploy:<chain>` succeeded, Studio gave a new version URL
- [ ] `SCHEMA_URL` in `apps/server/scripts/refresh-graphql-schema.ts` updated, then `bun run codegen:graphql:refresh` + `bun run codegen:graphql` in `apps/server`
- [ ] `apps/server/src/features/uniswap-v3/data/constants/networks.ts` graph.url updated for the redeployed chain(s)
- [ ] `bun run codegen` at repo root
- [ ] `bun run typecheck` at repo root
- [ ] Server query files in `data/positions.repository.ts` adjusted if schema changed

## The `tokensOwed` / `drained` rollout — confirm before deploying

The `drained` position state depends on `tokensOwed0`/`tokensOwed1` and on `closed` no longer
meaning `burned || liquidity == 0`. Nothing above the subgraph can use it until this ships, and
it is not a routine patch deploy. Confirm each of these against Studio before starting, rather
than taking them as settled:

- **It is a full reindex from `startBlock`, on all six chains.** `tokensOwed` is derived per
  event, so no existing entity carries it — the values only exist for events replayed after the
  new handlers are in place. Budget the sync time per chain before you deploy the first one, and
  expect the server to be reading a version that predates the change until the last chain lands.
- **A graft probably cannot save you, and the reason is the schema.** `tokensOwed0`/`tokensOwed1`
  are `BigInt!` (`schema.graphql:31-32`) — non-nullable with no default — so every entity carried
  over the graft point would need a value the base deployment never recorded. Check whether Studio
  accepts the graft at all before planning around one; if it does, verify what it wrote into those
  fields for pre-graft entities rather than assuming zero.
- **A graft cannot lower `startBlock`**, so it is no escape from the reindex either.
- **Studio archives unpublished versions** on its own schedule, so the version you graft from may
  not be there when you need it. Verify the base version is live first.

Until the resync completes, `drained` never reaches a client: the server selects no `tokensOwed`
field and the deployed subgraph still sets `closed = burned || liquidity == 0`.

## Common pitfalls

- **Indexing starts from `startBlock`, not block 0.** Lowering `startBlock` after deploy requires a re-sync — Studio will reindex from the new lower block, which can take hours. Don't lower it casually.
- **Reverted contract calls.** If you added a new `try_<method>` call, test the reverted branch in matchstick (`createMockedFunction(...).reverts()`).
- **AS compile errors after `codegen`.** Usually means `schema.graphql` or `subgraph.yaml` has a type the generated bindings can't satisfy. Read the build output — the line is in `generated/`.
- **Forgetting `bun run codegen` at the repo root after URL changes.** Server will use stale types and runtime URLs out of sync.
