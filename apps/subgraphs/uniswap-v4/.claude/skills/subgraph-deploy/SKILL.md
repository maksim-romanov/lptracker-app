---
name: subgraph-deploy
description: Use when deploying or updating the Uniswap V4 subgraph to The Graph Studio (mainnet, arbitrum, base, optimism, polygon, unichain), or when changing schema/handlers and rolling out a new version. Covers pre-flight checks, deploy commands per chain, and the on-chain sanity check for both PoolManager and PositionManager.
---

# Deploy / update the Uniswap V4 subgraph

Six deploy targets, each its own Studio slug:

| Chain         | Script                     | Studio slug                |
| ------------- | -------------------------- | --------------------------- |
| Mainnet       | `bun run deploy:mainnet`   | `uniswap-v-4-mainnet`       |
| Arbitrum One  | `bun run deploy:arbitrum`  | `uniswap-v-4-arbitrum`      |
| Base          | `bun run deploy:base`      | `uniswap-v-4-base`          |
| Optimism      | `bun run deploy:optimism`  | `uniswap-v-4-optimism`      |
| Polygon       | `bun run deploy:polygon`   | `uniswap-v-4-polygon`       |
| Unichain      | `bun run deploy:unichain`  | `uniswap-v-4-unichain`      |

**No server sync step today** — unlike `uniswap-v3`, nothing in `apps/server` or `apps/mobile` queries v4 yet (`packages/catalog`'s `PROTOCOLS_META` has no `uniswap-v4` entry). If that changes, mirror the "Post-deploy: sync server URLs" section from the `uniswap-v3` package's `subgraph-deploy` skill.

## Pre-flight (run from `apps/subgraphs/uniswap-v4/`)

1. `bun run codegen` — regenerates `generated/` from schema + ABIs. Required only if `schema.graphql`, `subgraph.yaml`, or an ABI changed.
2. `bun run build` — must succeed before deploy. Treat AS warnings as errors.
3. `bun run test` — matchstick tests must pass. New handler or branch → add a test for it first.
4. **On-chain sanity check** (below) — this package has **two** contracts to verify per chain (`PoolManager` and `PositionManager`), not one.
5. Confirm you're authenticated: `graph auth <DEPLOY_KEY>` once per machine.

## On-chain sanity check

matchstick doesn't verify the manifest — it trusts whatever `subgraph.yaml`/`networks.json` say. Before a deploy that changes an address, `startBlock`, or event, confirm each against the chain via `cast` (Foundry). Etherscan key lives in this package's own `.env` (gitignored):

```sh
set -a; source apps/subgraphs/uniswap-v4/.env; set +a   # loads ETHERSCAN_API_KEY (one key, all chains)
```

`startBlock` = contract creation block, for **both** `PoolManager` and `PositionManager` on the chain you're touching:

```sh
curl -s "https://api.etherscan.io/v2/api?chainid=<ID>&module=contract&action=getcontractcreation&contractaddresses=<ADDR>&apikey=$ETHERSCAN_API_KEY" \
  | jq -r '.result[0].blockNumber'
```

Chain IDs: mainnet 1, arbitrum 42161, base 8453, optimism 10, polygon 137, unichain 130. If a chain's Etherscan tier doesn't cover it (e.g. base on the free key), binary-search the creation block via `cast code $ADDR --rpc-url <RPC> --block <N>` instead — see the `uniswap-v3` package's `subgraph-deploy` skill for the exact script.

Event signatures must match the ABI exactly:

```sh
cast interface <ADDR> --chain <chain> | grep "event "   # diff against subgraph.yaml eventHandlers
```

## Deploying

Studio prompts for a version label — bump the patch number unless schema changed, minor for schema changes.

```bash
bun run deploy:mainnet
# or deploy:arbitrum / deploy:base / deploy:optimism / deploy:polygon / deploy:unichain
```

## Checklist

- [ ] `bun run codegen` (if schema/yaml/ABI changed)
- [ ] `bun run build` passes
- [ ] `bun run test` passes
- [ ] On-chain sanity check for **both** `PoolManager` and `PositionManager` on the target chain
- [ ] `networks.json` reviewed
- [ ] `bun run deploy:<chain>` succeeded
- [ ] If v4 has since been wired into `apps/server`/`apps/mobile`: sync their URLs too (see `uniswap-v3`'s skill for the pattern)

## Common pitfalls

Same as `uniswap-v3`: lowering `startBlock` after deploy forces a slow re-sync; test the reverted branch of any new `try_<method>` call in matchstick; AS compile errors after `codegen` usually mean `schema.graphql`/`subgraph.yaml` has a type the generated bindings can't satisfy — read the `generated/` build output line.
