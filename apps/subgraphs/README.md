# Subgraphs

The Graph indexers, one package per protocol (`uniswap-v3/`, `uniswap-v4/`). They listen to
on-chain events and store them in a queryable database. Build with the Graph CLI:
`bun run codegen`, `build`, `test`.

## Rule #1: don't hand-copy contract data

Event signatures, addresses and start blocks go into `subgraph.yaml` straight from the
deployed contract, never typed from memory or a website. One wrong character and the subgraph
indexes nothing, silently. Use `cast` to read them.

## cast (Foundry)

`cast` reads any deployed contract's ABI, events and source by address. It's a local dev tool,
not a project dependency.

Install with `brew install foundry`. It pulls readable data from Etherscan and live state from
an RPC node, so it needs an Etherscan API key (one key covers every EVM chain). Ours lives in
`uniswap-v4/.env` (gitignored). Load it first:

```sh
set -a; source apps/subgraphs/uniswap-v4/.env; set +a
```

Unverified contracts show only raw bytes. Big protocols (Uniswap, Aerodrome) are always
verified.

## Getting contract data

```sh
ADDR=0x...

# Event signatures to paste into subgraph.yaml:
cast interface $ADDR --chain mainnet | grep "event "

# Full source, to see how the protocol works:
cast etherscan-source $ADDR --chain mainnet -d ./ref

# Check a topic0 hash:
cast sig-event "Swap(bytes32 indexed id, address indexed sender, ...)"

# Read live state before adding a contract call in a handler:
cast call $ADDR "positions(uint256)(...)" <id> --rpc-url https://eth.llamarpc.com

# Deploy block, for startBlock:
curl "https://api.etherscan.io/v2/api?chainid=1&module=contract&action=getcontractcreation&contractaddresses=$ADDR&apikey=$ETHERSCAN_API_KEY"
```

Other chains: use `--chain base` (8453), `--chain arbitrum`, and the matching `chainid` in the
curl. Same key.

Then save the ABI into `abis/`, put the signatures, address and start block into `subgraph.yaml`
and `networks.json`, and run `bun run codegen && build && test`. Codegen re-checks the
signatures against the ABI.

## Why ABIs are committed

The build reads `abis/*.json` from disk, offline, and the deploy uploads them to IPFS, so they
have to be in the repo for builds to be reproducible. `cast` fetches an ABI once; `abis/` is
where it's kept. Don't fetch ABIs at build time.

## Adding a protocol

1. Get the addresses and chain (project docs or block explorer).
2. Read the source (`cast etherscan-source`) and decide how to track positions: event-only, or
   per-event contract reads. See `uniswap-v4` for the event-only approach.
3. Pull the ABIs (`cast interface`) into `abis/`, signatures into `subgraph.yaml`.
4. Get the start block (`getcontractcreation`).
5. Copy the `uniswap-v4` package layout, then codegen / build / test.

## Gotchas we've hit

- Native ETH is `address(0)`: hardcode its symbol and decimals, don't call `ERC20.symbol()` on
  it.
- Old tokens (MKR, DGD) return `bytes32` symbol/name, not `string`. Without the
  `ERC20SymbolBytes` / `ERC20NameBytes` fallback they index as `UNKNOWN`. Both v3 and v4
  handle it.
- `startBlock` is the contract's creation block. Set it too late and you silently miss early
  data.
- New words from ABIs can fail the cspell pre-push hook; add them to `cspell-words.txt`.
