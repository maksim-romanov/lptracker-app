---
app: integrations
topic: Chain parameters (how to fill a chain file)
checked: 2026-10-20
---

# Chain parameters

Method for filling `integrations/chains/eip155-<id>.json` ([integration model](../../concepts/integration-model.md#chain-file)) for any EVM chain, plus proposed values for Ethereum, Arbitrum One, Base and OP Mainnet. Tags that are measured or proposed by us, not stated by a source, are marked *proposal* or *unverified*.

## Decisions

### Read tag and archive

- We pick `readPolicy.tag: safe` where `safe` trails head by 60 s or less (Base, OP Mainnet: 32 s measured), and `latest` where it trails more (Ethereum: about 10 min, Arbitrum One: about 14 min). Owner decision 2026-10-20: values follow the protocol's own UI, accepting that a rare reorg (Ethereum) or sequencer fault (Arbitrum) shows a value for one snapshot that the next one corrects. `finalized` is never used for reads; it adds another epoch on Ethereum and tens of minutes on rollups. [1][2][3][4]
- We treat `finalized` as the choice for chains where `safe` is unsupported, unreliable or hours behind. On OP Stack, `safe` timing depends on the chain's batcher (minutes on OP Mainnet, up to hours on chains tuned for cost), so a new OP Stack chain gets a measured `safe` lag, not the OP Mainnet number. [3]
- We set `requiresArchive` from a probe, not from the client name:
  1. `lagBlocks = ceil(upper-bound lag of the tag in seconds / blockTime)`.
  2. Run probe step 4 on every non-archive URL. If any URL fails `eth_call` at `head - 2 x lagBlocks`, set `requiresArchive: true`; otherwise `false`.
  3. The 128-block geth window is a floor, not the answer: Nitro also keeps 30 minutes, and providers run other clients. Measured on 2026-10-20 (below), all four official or community public RPCs answer at their `safe` block, so all four are `false`. [5][6][7][12]
- We recompute `requiresArchive` and both lag fields whenever `blockTime` changes. Base documents a move from 2 s to 200 ms canonical blocks (Denim, no mainnet date), which multiplies every block-denominated lag and window by 10. [8]
- We do not use op-geth to reason about OP Stack retention: the OP docs mark it end-of-support and cannot follow the Karst hardfork; op-reth without `--prune.*` flags is a full archive. [9]

### Lag fields from block time

- We derive both fields from seconds, not from block counts: `maxHeadLagBlocks = max(2, ceil(T_head / blockTime))` with `T_head = 30 s`, and `maxIndexLagBlocks = ceil(T_index / blockTime)` with `T_index = 600 s`. *Proposal*; no source sets these targets. The head target is about 2.5 Ethereum slots, loose enough for normal propagation delay between providers. The index target is the 15-minute ref-cache horizon of the integration model rounded down. [10][11]
- We cap `maxIndexLagBlocks` at `3 x maxBlockRange` of the chain's weakest public RPC (1,000 in the providers example gives 3,000), because the gap between `indexBlock` and `readBlock` is filled with `eth_getLogs` and a gap that needs more pages than that cannot finish inside the 8 s request deadline. *Proposal.* [10][11]
- We measure `blockTime` as `(timestamp(head) - timestamp(head - N)) / N` with `N >= 1000`, over two samples an hour apart, then round to a documented value. Rollup header timestamps have whole-second resolution, so one sample over few blocks is wrong on Arbitrum. Official statements: Ethereum slot 12 s, OP Mainnet and Base 2 s; Arbitrum One has no block time in the official docs I could fetch. [8][13][14][15]
- We keep `snapshotTtlSeconds: 20` on all four chains. `safe` itself only moves about once per epoch on Ethereum, so a shorter TTL re-reads the same block. *Proposal.* [10]

### Where each field comes from

| Field | Source, in this order | Check before merge |
|---|---|---|
| `caip2`, chain id | The chain's own docs, then `ethereum-lists/chains` `_data/chains/eip155-<id>.json` (first-come ids; deprecated chains are never deleted) [16][17] | `eth_chainId` of every public RPC equals the id |
| `name`, `nativeCurrency` | Same file; confirm in chain docs | Decimals 18 unless the chain docs say otherwise |
| `wrappedNative` | Chain docs; on OP Stack the WETH9 predeploy `0x4200...0006` [18][19]; Ethereum and Arbitrum from the Arbitrum useful-addresses/chain-info pages [20][21] | `eth_getCode` non-empty, `symbol()` and `decimals()` answer, and a DefiLlama price resolves (see below) |
| `multicall3` | `mds1/multicall3` `deployments.json` (array of `{ name, chainId, url }`); OP Stack preinstall list [22][23][24] | `eth_getCode(0xcA11bde05977b3631167028862bE2a173976CA11)` is non-empty and its runtime codehash equals Ethereum's. Mismatch: stop and ask (mds1 names Ancient8 as a known wrong deployment). Do not copy a chain's own "Multicall" row: Arbitrum's useful-addresses page lists `0x842eC2c7...4EB2` as "L2 Multicall", not the canonical address [20][22] |
| `publicRpcs` | Official chain docs only; https only; write nothing about limits that the docs do not state [25][26][27] | Probe below |
| `explorer` | Chain docs; templates from EIP-3091 | See explorer decision |
| `priceIds.defillama` | The prefix `coins.llama.fi` accepts, not the `/v2/chains` display name | `coins.llama.fi/prices/current/<prefix>:<wrappedNative>` returns `WETH` |
| `priceIds.coingecko` | `asset_platforms` `id` where `chain_identifier` equals the chain id | Id exists in the live list |
| `logo` | See logo decision | Licence note in the PR |

- We take the DefiLlama value from the coins API prefix. Live check on 2026-10-20: prefixes `ethereum`, `arbitrum`, `base`, `optimism` priced each chain's WETH, while `api.llama.fi/v2/chains` names the same chains `Ethereum`, `Arbitrum`, `Base`, `OP Mainnet` (and lists `Optimism` twice), and returns `gecko_id: null` for Base. [28][29]
- We take the CoinGecko platform id from `/asset_platforms`, matched on `chain_identifier`. Live on 2026-10-20: 1 is `ethereum`, 42161 is `arbitrum-one`, 8453 is `base`, 10 is `optimistic-ethereum`. [30][31]
- We store explorer base URLs and the four EIP-3091 paths (`/block/{id}`, `/tx/{hash}`, `/address/{address}`, `/token/{address}`), because Etherscan-family and Blockscout explorers listed in `ethereum-lists` declare `standard: EIP3091`. The EIP is Stagnant, so the probe opens one of each template. [17][32]
- We take chain logos from the chain's own brand kit when its terms allow redistribution, else from `ethereum-lists/chains` icons or `trustwallet/assets`; both repositories are MIT, but that licence covers the repository, not the artwork, which stays the project's trademark. The PR records the source URL and the licence or brand-terms URL. We do not hotlink DefiLlama, CoinGecko or Etherscan images. [33][34][30]
- We reject a candidate public RPC that is not in the chain's own docs. Ethereum has no official public RPC; the one candidate in `ethereum-lists` that this research can name is `https://ethereum-rpc.publicnode.com`, a community provider with no limits found in its docs. It stays `TODO` until the owner approves a provider. [17][25]

### Public RPC probe (run before adding a URL)

Each step is one JSON-RPC call; record the result and the date in the PR.

1. `eth_chainId` equals the chain id. Some providers answer with an error body and HTTP 200, so check the body.
2. `eth_blockNumber` is within `maxHeadLagBlocks` of a second provider's head.
3. `eth_getBlockByNumber("safe", false)` and `("finalized", false)` return a block below head. The spec says an unresolvable tag answers like an unknown block, so an error or null means no support. The lag in seconds is `head.timestamp - tag.timestamp`. [1][35]
4. `eth_call` to Multicall3 `getBlockNumber()` with `{ blockHash }` of the `safe` block (EIP-1898) succeeds, then repeat at `head - lagBlocks`, `head - 1000` and `head - 100000`. The deepest success is the node's state depth; below `lagBlocks` means `requiresArchive: true` for that URL. [5][36]
5. `eth_getCode(multicall3)` is non-empty at head.
6. `eth_getLogs` for the wrapped-native `Deposit` topic over 100, 1,000, 2,000, 5,000 and 10,000 blocks; the largest range that succeeds with no result-count error is the URL's `maxBlockRange`. Then one query from `fromBlock` near the oldest deployment of the family: failure there means the URL cannot serve `rpc-logs` from `fromBlock`. [10][37]
7. A JSON-RPC batch of 100 `eth_call`s works or the URL is marked non-batching.
8. At most 20 sequential requests to observe `429` and `Retry-After`; the rate limit is not discovered by flooding a public endpoint.

### Proposed values

| Field | Ethereum | Arbitrum One | Base | OP Mainnet |
|---|---|---|---|---|
| `caip2` | `eip155:1` | `eip155:42161` | `eip155:8453` | `eip155:10` |
| `slug` *proposal* | `ethereum` | `arbitrum` | `base` | `optimism` |
| `name`, native | Ethereum, ETH 18 | Arbitrum One, ETH 18 | Base, ETH 18 | OP Mainnet, ETH 18 |
| `wrappedNative` | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | `0x82aF49447D8a07e3bd95BD0d56f35241523fBab1` | `0x4200000000000000000000000000000000000006` | `0x4200000000000000000000000000000000000006` |
| `multicall3` | `0xcA11bde05977b3631167028862bE2a173976CA11` (listed; getCode not run) | same (listed; getCode not run) | same (listed; getCode not run) | same (listed; getCode not run) |
| `readPolicy.tag` | `latest` | `latest` | `safe` | `safe` |
| Block time used | 12 s (measured 12.05) | 0.25 s (measured 0.252) | 2 s (measured) | 2 s (measured) |
| `safe` lag measured 2026-10-20 | 52 blocks, 624 s | 3,316 blocks, 837 s | 16 blocks, 32 s | 16 blocks, 32 s |
| Deepest `eth_call` on the public RPC | under 1,000 blocks (PublicNode asks for a token for archive) | 10,000 blocks; 100,000 fails (`missing trie node`) | 100,000 blocks or more | 100,000 blocks or more |
| `requiresArchive` | `false` (measured) | `false` (measured) | `false` (measured) | `false` (measured) |
| `maxHeadLagBlocks` | 3 | 120 | 15 | 15 |
| `maxIndexLagBlocks` | 50 | 2,400 | 300 | 300 |
| `snapshotTtlSeconds` | 20 | 20 | 20 | 20 |
| `publicRpcs` | `TODO` (no official) | `https://arb1.arbitrum.io/rpc` | `https://mainnet.base.org` | `https://mainnet.optimism.io` |
| `explorer` base | `https://etherscan.io` | `https://arbiscan.io` | `https://basescan.org` | `https://optimistic.etherscan.io` |
| `priceIds.defillama` | `ethereum` | `arbitrum` | `base` | `optimism` |
| `priceIds.coingecko` | `ethereum` | `arbitrum-one` | `base` | `optimistic-ethereum` |
| `logo` | `TODO` | `TODO` | `TODO` | `TODO` |
| `status` | `active` | `active` | `active` | `active` |

One sample each, with `latest`, `safe` and `eth_call` by `blockHash` against PublicNode, `arb1.arbitrum.io`, `mainnet.base.org` and `mainnet.optimism.io`; repeat the probe in M1a before relying on it.

## Facts that constrain us

- **Tag meaning (Ethereum execution-apis).** `finalized` is "crypto-economically secure", not re-orgable "outside of manual intervention"; `safe` is "protected from re-orgs under an honest-majority assumption and certain synchronicity assumptions". An unresolvable tag answers like an unknown block. [1]
- **Ethereum timing.** Slot 12 s, epoch 32 slots (384 s). Arbitrum's docs put Ethereum `finalized` at "roughly two epochs (~64 slots, ~13 minutes)" and `safe` at "roughly one epoch (~32 slots)". [13][2]
- **`safe` is changing on Ethereum.** Many nodes return the last justified checkpoint for `safe`; a Fast Confirmation Rule would make it the last fast-confirmed block, about 13 s behind head, with no hard fork, but client support (Lodestar furthest, Lighthouse, Prysm and Teku in development) and release versions are not stated. A `safe` lag measured today can shrink without a chain-file change; the tag choice stays valid. [38]
- **Arbitrum (Nitro).** `latest` is the sequencer's soft confirmation; `safe` and `finalized` are the batch's parent-chain `safe` and `finalized` status, so Arbitrum sets no distances of its own. The finality deep-dive gives 12-15 minutes for parent-chain data finality on Ethereum. [2][39]
- **OP Stack.** Unsafe = `latest` (about 2 s on OP Mainnet); safe = batch data in an Ethereum block ("a few minutes", batcher-configured, possibly hours on other chains); finalized = that Ethereum block finalized (15-30 min from submission, 13-19 min after the batch lands). Safe blocks can be downgraded to unsafe if the Ethereum block reorgs. Base's RPC docs list `safe` and `finalized` as supported tags. [3][27]
- **Rollup lag in blocks (derived).** OP Mainnet `finalized` at 2 s per block is about 450-900 blocks; Arbitrum `finalized` at 0.25 s and 13 min is at least about 3,100 blocks. Both exceed 128. [3][2]
- **State windows.** geth path scheme: persistent state "128 blocks in the past"; `--history.state=0` keeps all history after a full sync, `--gcmode archive` indexes historical state, and `--history.trienode` defaults to disabled so historical `eth_getProof` is unavailable. geth 1.14 made path the default for new full nodes (secondary source). reth: archive by default, `--full` and `--minimal` keep a 10,064-block window. Nitro: `execution.caching.state-scheme` defaults to `hash`; `block-count` default 128 and `block-age` default 30 min are minimums kept in memory; `state-history` applies to the path scheme only; `execution.caching.archive` keeps all states; path scheme needs Nitro 3.9 or later per a search snippet (*unverified*). OP docs: historical `eth_call` needs a full archive node, historical proofs do not. [5][6][7][9][40]
- **Public RPC terms.** Arbitrum: "No uptime, latency, or rate-limit guarantees", no WebSocket, no IPv6. OP Mainnet: "rate limited", no WebSocket. Base: HTTP only, rate limits not stated. None states an `eth_getLogs` range or its archive depth. Third-party guidance puts typical ranges at 2,000 (Base's advice), 10,000 (QuickNode, Chainstack) and as low as 50 on some free endpoints. [25][26][27][37]
- **Multicall3.** Canonical address `0xcA11...CA11`, listed for 1, 10, 8453 and 42161 in `deployments.json`. Arbitrum One needed 14,345,935 gas for its deployment, so chains with different gas accounting cannot use the presigned transaction and must predeploy. The deployer key is compromised, so any address that is not on the list or a predeploy is untrusted. [22][23]
- **ethereum-lists/chains.** One file per chain `eip155-<id>.json`; `rpc` entries can carry key placeholders and wss URLs, and the list is community-edited, so it is a lead for chain id, explorers and icons and never a final source for RPCs. Icons are IPFS-hosted, at most 250 kB, png, jpg or svg. [16][17]
- **Etherscan V2.** One key covers 60+ EVM chains through `chainid`; the supported-chains page marks Base and OP Mainnet as paid only. Relevant only if a feature calls the explorer API; explorer links need no key. [41][42]
- **Rollup sequencer outage.** Core already reads the Chainlink `sequencerUptime` feed on L2s; the chain file needs no extra field. [10]

## Open questions

- Whether range alerts on `latest` chains wait for a second snapshot that agrees, so a reorged value never sends a push. Decide in the M5a spec.
- Base Denim (200 ms): mainnet date, and whether `safe`/`finalized` timing changes. The page says each block goes through its own lifecycle and gives nothing more. [8]
- Which public RPC, if any, the project is willing to name for Ethereum, given the "official docs only" rule.
- `T_head = 30 s`, `T_index = 600 s` and the `3 x maxBlockRange` cap are our targets; they need a check against a week of real head-lag data from the pool once M1a runs.
- Logo licensing: no brand-kit terms were read for Ethereum, Arbitrum, Base or Optimism; each needs a written redistribution check before bundling.
- Multicall3 runtime codehash comparison and the probe were not run against live RPCs in this research (the fetch tool cannot POST); the table's `multicall3` row rests on `deployments.json` only.
- The integration model says chain-file URLs are "https only"; `ethereum-lists` mixes in wss URLs. The probe and the pool must ignore them.
- `snapshotTtlSeconds` 20 versus a `safe` tag that moves per epoch: whether a longer TTL for Ethereum saves RPC budget without staler values.

## Sources

1. Ethereum execution-apis, `BlockTag` schema — https://raw.githubusercontent.com/ethereum/execution-apis/main/src/schemas/block.yaml
2. Arbitrum docs, Finality and chain reorganizations — https://docs.arbitrum.io/how-arbitrum-works/reference/finality-and-reorgs
3. Optimism docs, Transaction finality — https://docs.optimism.io/stack/transactions/transaction-finality
4. Arbitrum docs, Troubleshooting building (block tags) — https://docs.arbitrum.io/for-devs/troubleshooting-building
5. geth docs, Archive nodes (path scheme, `--history.state`, `--gcmode archive`) — https://geth.ethereum.org/docs/fundamentals/archive
6. reth docs, Pruning (archive, `--full`, `--minimal`, 10,064 blocks) — https://reth.rs/run/storage/pruning
7. Arbitrum docs, Nitro CLI flags reference (read 2026-10-20; first 100,000 characters) — https://docs.arbitrum.io/run-arbitrum-node/nitro/cli-flags-reference
8. Base docs, 200ms native blocks (Denim) — https://docs.base.org/upgrades/denim/200ms-blocks
9. Optimism docs, Archive node (op-reth, op-geth end of support) — https://docs.optimism.io/node-operators/guides/management/archive-node
10. VoidX, Providers and cache — ../../concepts/providers-and-cache.md; Integration model — ../../concepts/integration-model.md
11. VoidX, ADR 0021 RPC provider pool — ../../decisions/0021-rpc-provider-pool.md
12. EIP-1898, block parameter by hash — https://eips.ethereum.org/EIPS/eip-1898
13. ethereum.org, Proof of stake (12 s slots, 32-slot epochs) — https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/
14. Optimism docs, Transaction finality (OP Mainnet "one block per two seconds") — same as 3
15. Arbitrum docs, Block numbers and time — https://docs.arbitrum.io/build-decentralized-apps/arbitrum-vs-ethereum/block-numbers-and-time
16. ethereum-lists/chains README — https://github.com/ethereum-lists/chains
17. ethereum-lists/chains data — https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/eip155-1.json (also `eip155-10.json`, `eip155-8453.json`, `eip155-42161.json`)
18. Optimism specs, Predeploys (WETH9 at `0x4200...0006`) — https://specs.optimism.io/protocol/predeploys.html
19. Base docs, Predeploys — https://docs.base.org/specifications/base-protocol/execution/predeploys
20. Arbitrum docs, Useful addresses — https://docs.arbitrum.io/build-decentralized-apps/reference/useful-addresses
21. Arbitrum docs, Chain info (L1 and L2 WETH) — https://docs.arbitrum.io/for-devs/dev-tools-and-resources/chain-info
22. mds1/multicall3 README — https://raw.githubusercontent.com/mds1/multicall3/main/README.md
23. mds1/multicall3 `deployments.json` — https://raw.githubusercontent.com/mds1/multicall3/main/deployments.json
24. Optimism specs, Preinstalls (Multicall3) — https://specs.optimism.io/protocol/preinstalls.html
25. Arbitrum docs, Node providers (public RPC terms) — https://docs.arbitrum.io/build-decentralized-apps/reference/node-providers
26. Optimism docs, Networks (public RPC "rate limited") — https://docs.optimism.io/superchain/networks
27. Base docs, Connect to Base and RPC overview — https://docs.base.org/get-started/connect-to-base ; https://docs.base.org/base-chain/api-reference/rpc-overview
28. DefiLlama chains API (read 2026-10-20) — https://api.llama.fi/v2/chains
29. DefiLlama coins API probe (read 2026-10-20) — https://coins.llama.fi/prices/current/optimism:0x4200000000000000000000000000000000000006
30. CoinGecko docs, Asset platforms list — https://docs.coingecko.com/reference/asset-platforms-list
31. CoinGecko `asset_platforms` (read 2026-10-20) — https://api.coingecko.com/api/v3/asset_platforms
32. EIP-3091, block explorer API routes — https://eips.ethereum.org/EIPS/eip-3091
33. ethereum-lists/chains licence (MIT) — https://raw.githubusercontent.com/ethereum-lists/chains/master/LICENSE
34. trustwallet/assets licence (MIT) — https://raw.githubusercontent.com/trustwallet/assets/master/LICENSE
35. Optimism docs and Base RPC overview list `safe` and `finalized` — see 3, 27
36. OP docs on historical `eth_call` needing an archive node — see 9
37. Third-party `eth_getLogs` limit guidance (secondary): https://docs.chainstack.com/docs/understanding-eth-getlogs-limitations ; https://support.quicknode.com/articles/3261121056-understanding-the-10-000-block-range-limit-for-querying-logs-and-events
38. Dwellir, Ethereum safe block and Fast Confirmation Rule (secondary, 2026-09-07) — https://www.dwellir.com/blog/ethereum-safe-block-fast-confirmation
39. Arbitrum docs, Finality deep dive — https://docs.arbitrum.io/how-arbitrum-works/deep-dives/finality
40. Arbitrum docs, Run a full node (HashDB, PathDB, archive; search snippet) — https://docs.arbitrum.io/run-arbitrum-node/run-full-node
41. Etherscan docs, API V2 — https://docs.etherscan.io/etherscan-v2
42. Etherscan docs, Supported chains — https://docs.etherscan.io/supported-chains
