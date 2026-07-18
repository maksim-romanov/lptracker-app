---
name: add-protocol-subgraph
description: Use when scaffolding a brand-new subgraph package for a protocol not yet indexed (e.g. adding a third protocol alongside uniswap-v3/uniswap-v4). Covers the cast-based contract-data pull, deciding an indexing strategy, and the package layout to copy.
---

# Add a new protocol subgraph

Never hand-type contract data from memory or a block explorer UI — one wrong character and the subgraph indexes nothing, silently. Everything below flows from the deployed contract via `cast` (Foundry; `brew install foundry`).

## 1. Get the addresses and chain

From the protocol's own docs or a block explorer, find the contract address(es) and which chain(s) to index.

## 2. Read the source, pick an indexing strategy

```sh
cast etherscan-source $ADDR --chain mainnet -d ./ref
```

Decide: **event-only** tracking (accumulate state purely from emitted events — see `uniswap-v4`'s `PoolManager`/`PositionManager` for the pattern) or **per-event contract reads** (call back into the contract inside a handler — see `uniswap-v3`). Event-only is cheaper and simpler; only reach for contract reads when the events genuinely don't carry enough state.

## 3. Pull the ABI and event signatures

```sh
set -a; source apps/subgraphs/uniswap-v4/.env; set +a   # loads ETHERSCAN_API_KEY (one key, all EVM chains)

cast interface $ADDR --chain mainnet | grep "event "     # paste into subgraph.yaml eventHandlers
cast sig-event "Swap(bytes32 indexed id, ...)"            # verify a topic0 hash if needed
```

Save the fetched ABI into the new package's `abis/` — it must be committed (builds read it from disk offline; deploy uploads it to IPFS).

## 4. Get the start block

```sh
curl -s "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getcontractcreation&contractaddresses=$ADDR&apikey=$ETHERSCAN_API_KEY" \
  | jq -r '.result[0].blockNumber'
```

`startBlock` is the contract's **creation** block, not an arbitrary early block — too low wastes indexing time, too high silently misses early data. The free Etherscan key doesn't cover every chain (e.g. not Base) — for those, binary-search the first block with code via `cast code $ADDR --rpc-url <RPC> --block <N>` against a chain RPC (see either package's `subgraph-deploy` skill for the exact binary-search snippet).

## 5. Scaffold the package

Copy `apps/subgraphs/uniswap-v4/`'s layout (closer template if going event-only) or `uniswap-v3/`'s (if you need contract reads): `package.json` (scripts, `@graphprotocol/graph-cli`/`graph-ts` deps), `schema.graphql`, `subgraph.yaml`, `networks.json`, `tsconfig.json`, `docker-compose.yml`, `.env.example`. Add the new package to the workspace (it's picked up automatically via `apps/subgraphs/*` in the root `package.json` `workspaces` glob).

## 6. Write handlers, then verify

AssemblyScript, not TypeScript — see either package's `CLAUDE.md` for the gotchas (`let` not `const`, `BigInt.zero()`, `try_<method>()` for revert-safety, nullable entity fields).

```bash
bun run codegen   # regenerates generated/ from schema + ABIs, re-checks signatures
bun run build     # compiles AS to WASM
bun run test      # matchstick-as — write tests for each handler before considering it done
```

## Known gotchas (apply to any new protocol)

- **Native ETH** is `address(0)` — hardcode its symbol/decimals, don't call `ERC20.symbol()` on it.
- **Legacy tokens** (MKR, DGD, …) return `bytes32` symbol/name, not `string` — fall back to the `ERC20SymbolBytes`/`ERC20NameBytes` ABIs (see either package's `src/utils/token.ts`) or they index as `UNKNOWN`.
- New words pulled from ABIs can fail the `cspell` pre-push hook — add them to `cspell-words.txt`.

Once built, add a `deploy-and-sync-subgraph`-style skill for the new package modeled on the existing `subgraph-deploy` skills, and wire up consumption in `packages/catalog`'s `PROTOCOLS_META` + `apps/server`/`apps/mobile` if the new protocol should be user-facing.
