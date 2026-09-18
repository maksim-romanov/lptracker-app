---
name: subgraph-deploy
description: Use when deploying or updating the Slipstream (Aerodrome/Velodrome) subgraph to The Graph Studio (base, optimism), or when changing schema/handlers and rolling out a new version. Covers pre-flight checks, the on-chain sanity check for NFPM + CLFactory + Voter, and deploy commands.
---

# Deploy / update the Slipstream subgraph

Two deploy targets, each its own Studio slug:

| Chain    | Script                    | Studio slug           |
| -------- | ------------------------- | ---------------------- |
| Base     | `bun run deploy:base`     | `slipstream-base`      |
| Optimism | `bun run deploy:optimism` | `slipstream-optimism`  |

**No server sync step today** — nothing in `apps/server` queries this subgraph yet. If that changes, mirror the "Post-deploy: sync server URLs" section from the `uniswap-v3` package's `subgraph-deploy` skill.

## Pre-flight (run from `apps/subgraphs/slipstream/`)

1. `bun run codegen` — regenerates `generated/` from schema + ABIs. Required only if `schema.graphql`, `subgraph.yaml`, or an ABI changed.
2. `bun run build` — must succeed before deploy.
3. `bun run test` — matchstick tests must pass. New handler or branch → add a test for it first.
4. **On-chain sanity check** (below).
5. Confirm you're authenticated: `graph auth <DEPLOY_KEY>`.

## On-chain sanity check

Three contracts to verify per chain, not one: `NonfungiblePositionManager`, `CLFactory` (the gate `voter.ts` uses), and `Voter`. Etherscan key lives in `apps/subgraphs/uniswap-v4/.env` (shared across packages):

```sh
set -a; source apps/subgraphs/uniswap-v4/.env; set +a
```

- **Base has two quirks the other packages don't:** `getcontractcreation` isn't on the free Etherscan tier for Base (chainid 8453) — binary-search the creation block instead (`cast code <addr> --rpc-url <RPC> --block N`, see the `uniswap-v3` skill for the exact script). `CLGauge` is a CREATE2 clone and isn't on Sourcify — fetch its ABI via Etherscan `getabi` (`action=getabi&address=…&chainid=8453`), not `cast etherscan-source`.
- **Optimism (chainid 10)** has no special-casing — `getcontractcreation` works normally.
- **Only the newest generation per chain is indexed.** Slipstream has been redeployed multiple times on both chains; confirm the NFPM/CLFactory addresses in `networks.json` are still the current generation before deploying, not an address from memory or an old PR.
- **Voter's `poolFactory` gate is network-specific and lives in code, not `networks.json`** (`networks.json` only substitutes data-source `address`/`startBlock`) — `src/voter.ts` selects it via `dataSource.network()`. If you're changing which factory is gated, verify against live `GaugeCreated` logs on-chain, not just the ABI.

Event signatures must match exactly:

```sh
cast interface <ADDR> --chain base | grep "event "   # diff against subgraph.yaml eventHandlers
```

## Deploying

```bash
bun run deploy:base
# or deploy:optimism
```

## Checklist

- [ ] `bun run codegen` (if schema/yaml/ABI changed)
- [ ] `bun run build` passes
- [ ] `bun run test` passes
- [ ] On-chain sanity check: NFPM + CLFactory + Voter addresses/start blocks verified as the **current generation**
- [ ] `voter.ts`'s per-network `poolFactory` gate re-confirmed if touched
- [ ] `networks.json` reviewed
- [ ] `bun run deploy:<chain>` succeeded

## Common pitfalls

Same as `uniswap-v3`/`uniswap-v4`: lowering `startBlock` after deploy forces a slow re-sync; test the reverted branch of any new `try_<method>` call in matchstick. Specific to this package: deploying against an **old** generation's NFPM/CLFactory (rather than the current one in `networks.json`) silently indexes nothing useful — always re-verify which generation is current before a deploy, protocols redeploy Slipstream without much notice.
