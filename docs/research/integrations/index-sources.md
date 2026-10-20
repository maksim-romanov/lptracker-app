---
app: integrations
topic: Index sources
checked: 2026-10-20
---

# Index sources

Input for the `index[]` of a deployment ([integration model](../../concepts/integration-model.md#index-sources), [ADR 0008](../../decisions/0008-pluggable-discovery.md)). An index only discovers `PositionRef`s; every value is read from chain at `readBlock` ([data rule](../../concepts/data-rule.md)). So an index may be stale or incomplete but never wrong in a way that shows a number.

## Decisions

- Choose the source for a new family in this order and stop at the first that works: (1) `rpc-enumeration` if the position manager is ERC721Enumerable; (2) `aggregator` if the protocol ships a lens contract that lists an owner's positions; (3) `subgraph-third-party` that passes the checklist below, with `rpc-logs` behind it; (4) `rpc-logs` alone, only when the scan from `fromBlock` fits the request budget at the smallest `maxBlockRange` in the pool; (5) `subgraph-own`. A full-history log scan is the costliest keyless option: thousands of `eth_getLogs` calls on a first lookup at 2,000 blocks per call, which is why ADR 0008 puts the V4 subgraph first. Cheapest means fewest calls per first lookup, then no key, no vendor and no new deployment to operate. [8][11]
- Always list a `rpc-logs` fallback behind a subgraph, as ADR 0008 says, and record `maxBlockRange` per URL in the instance config, because a free RPC key can allow as few as 10 blocks per `eth_getLogs` call. [11][12]
- Reference a subgraph by its **subgraph ID** on the Graph gateway (`/subgraphs/id/<SUBGRAPH_ID>`), never by an `api.studio.thegraph.com` URL, which is "for testing only" and rate-limited. A deployment ID pins one version and goes stale when the publisher ships a new one. [3][6]
- Store in `index[]` only `{ kind, network/subgraph reference, schema version, source URL }`; the key and the gateway host come from `instance.config` ([ADR 0013](../../decisions/0013-official-and-self-hosted-instances.md)). Every subgraph reference needs a source URL (hard rule on addresses applies in spirit). [3]
- Accept a third-party subgraph only if it passes the checklist below; record the result and date in the integration's research file. The checklist is the fit gate for `subgraph-third-party`. [1][2][7]
- Treat `subgraph-third-party` data as untrusted hints: verify every ref on chain (`ownerOf`, liquidity) in `snapshot`, never trust the subgraph's owner or amounts, and let empty answers keep the last good value. [data rule](../../concepts/data-rule.md) [ADR 0008](../../decisions/0008-pluggable-discovery.md)
- Allow `subgraph-own` only when (a) no third-party index passes the checklist for a chain we ship, (b) `rpc-logs` cannot cover the owner scan within the request budget (for example gauge-custodied NFTs with no `Transfer` to the owner), and (c) the owner approves a new deployment cost. A family needing it is a change reviewed like core ([integration model](../../concepts/integration-model.md#index-sources)). [8]
- Before writing `subgraph-own`, consider a keyless or cheaper alternative first: Envio HyperSync as an event source, or a Ponder or HyperIndex app, instead of Graph Node mappings. Never fork GPL subgraph code (Uniswap `v4-subgraph` is GPL-3.0); write the schema from scratch. [uniswap audit notes](../uniswap/audit-notes.md) [9]
- Do not use hosted-service, Alchemy Subgraphs or Studio test URLs in any deployment; the first two are shut down. [4][5]
- Dune and Allium are cross-check tools for a human or agent doing research, never an index source: they are query products with their own keys and quotas. (Not verified in this pass; no source read.)

## Where an agent finds an existing index

| Place | How to search | State (2026-10) |
|---|---|---|
| The Graph Explorer (decentralized network on Arbitrum One) | Filter by indexed network; paste a contract address in the search bar to list every subgraph indexing it; sort by most queried or most curated. A subgraph page shows Subgraph ID, current deployment ID, query URL, curation signal, indexers. [2] | Alive. Needs a Studio API key. [3] |
| Protocol docs | Uniswap lists v4 `DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G` and v3 `5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`, both linked to the Explorer on Arbitrum One as the publishing network. The page lists no per-chain IDs for Base, Optimism or Arbitrum. [7] | Alive; Uniswap says these are public deployments, not official, possibly unmaintained. [7] |
| Goldsky | Public endpoint `https://api.goldsky.com/api/public/<project_id>/subgraphs/<name>/<version-or-tag>/gn`; its docs use a community project example `uniswap-v3-base/1.0.0`. [10] | Alive; Alchemy's recommended replacement. [5] |
| Ormi (0xGraph, ex-Satsuma, took over Alchemy and Chainstack subgraphs) | Dashboard; endpoint host `api.subgraph.ormilabs.com`. Docs say Uniswap v4 on Base is already indexed. [13][14] | Alive, but paid since 2026-07-01 (below). |
| Envio HyperIndex / HyperSync | Not a registry; a tool to build an index or read raw events. | Alive; token required (below). [9] |
| Messari standardized subgraphs | Listed in The Graph docs as reusable schemas. About 198 of roughly 210 stayed active after a year-end 2024 cull. [15] | Not deprecated in the sources found; no 2026 maintenance statement. Do not rely on them for owner lookups. |
| Hosted service (`api.thegraph.com`) | n/a | Shut down 2024-06-12. [4] |
| Alchemy Subgraphs | n/a | Shut down 2025-12-08; Alchemy points to Goldsky. [5] |
| Dune, Allium | n/a | Cross-check only; not read. |

## Evaluation checklist for a third-party index

Record each answer with the date in the integration's research file.

| Check | How to test | Pass |
|---|---|---|
| Owner field | Schema has an `owner` (or equivalent) on the position/NFT entity; query `positions(where: { owner_in: [...] }, first: 1000)`. Use `id_gt` paging, not `skip`, which The Graph docs say performs poorly. [1] | Works for 100 owners in one call |
| Lowercase addresses | Owner stored as string; compare lowercase. | Matches the sample owner |
| Lag | `_meta { block { number hash timestamp } hasIndexingErrors }` versus the chain head from our `ChainReader`. [1] | Lag threshold decided by the owner (open question); `hasIndexingErrors` false |
| Chain coverage | One subgraph per chain; find each ID separately (Uniswap says each version on each chain has its own subgraph). [7] | All four MVP chains or the missing chain covered by `rpc-logs` |
| Contract coverage | Subgraph indexes our `contracts[]` addresses and `fromBlock`s, including every generation. [7] | Addresses match our deployment tuples |
| Operator and SLA | Graph network: independent indexers, no SLA; Goldsky advertises 99.99% uptime for its service [5]; Ormi paid tiers state rate limits only [14]. | Operator named in the research file |
| Cost | Graph: 100,000 free queries a month, then paid in GRT or card; the overage price is on `thegraph.com/studio-pricing` and not read. [3] Goldsky public endpoints: default 50 requests per 10 s [10]. Ormi: see below. | Fits the $50 a month budget ([providers](../../concepts/providers-and-cache.md#provider-quotas-and-budget)) |
| Auth | Graph gateway needs an API key (path or bearer header); keys can be limited by domain, subgraph and USD per month. [3][6] | Key declared in `dependencies` |
| Schema stability | Subgraph ID stays, deployment ID changes per version; read `_meta.deployment` (IPFS CID of `subgraph.yaml`) and store it. A change in CID or schema opens a review. [1][7] | Version pinned and logged |
| Licence | Querying a public endpoint is not copying code. Forking code is: `v4-subgraph` is GPL-3.0, so `subgraph-own` starts from scratch. [uniswap audit notes](../uniswap/audit-notes.md) | No copied mappings |
| Reorgs | `block` argument by hash is reliable only for final blocks; non-final results can be affected by reorgs. [1] Discovery therefore may lag a reorg; chain verification at `readBlock` is the correction. | Accepted because values come from chain |
| Burned or transferred NFTs | Uniswap `v4-subgraph` sets `owner = to` on every transfer, so a burned position ends with owner `0x0…0` and a sold one moves to the buyer. [uniswap audit notes](../uniswap/audit-notes.md) Test with a known burned token. | Burned token not returned for the old owner |
| Missing owner | Subgraph with no owner field (for example pool-level only) | Fail: use another source |

## Facts that constrain us

- The Graph: Free Plan 100,000 queries a month, then Growth Plan billed monthly in GRT or by card; keys are required to query; gateway format `https://gateway.thegraph.com/api/<API_KEY>/subgraphs/id/<SUBGRAPH_ID>` (key may also be a bearer token). New subgraphs publish on Arbitrum One. Checked 2026-10-20. [3][6][4]
- The `$2 per 100,000` overage figure used in [providers](../../concepts/providers-and-cache.md) was only found on third-party pricing sites; the official docs defer to `thegraph.com/studio-pricing`. Unverified. [3]
- Graph pagination: sort defaults to `id` ascending; use `id_gt`; `skip` performs poorly. The docs read did not state a maximum `first` (commonly 1000; unverified). [1]
- Goldsky: Starter plan is a one-time $100 credit with no monthly allowance; Scale gives 3 free active subgraphs and about 100K free entities; query pricing was not on the page read. Public endpoints default to 50 requests per 10 s, raised through support. [10][16]
- Ormi: pricing pages conflict. One page (title "effective April 1") lists a free Developer tier of 1 subgraph and 1 request per second; the page effective 2026-07-01 says the free Developer and Pay-Go plans are gone, leaving a 14-day trial then Production $75 a month per subgraph (15 requests per s). Treat Ormi as paid. [14]
- Envio HyperSync and HyperRPC reject requests without a token (HTTP 401); a personal account gets one free token; the free rate limit is per 60 s window and not stated in the docs read. Its supported-networks page does not list tiers for chains 1, 10, 8453 or 42161. [9][17]
- `eth_getLogs` limits (checked 2026-10-20):

| Provider or endpoint | Limit | Source |
|---|---|---|
| Alchemy free tier | 10 blocks per call on Ethereum, Base, Optimism, Arbitrum; unlimited on pay-as-you-go; response capped at 150 MB | [11] |
| Base docs | Keep `fromBlock`-`toBlock` under 2,000 blocks; `mainnet.base.org` limits not stated | [12] |
| Arbitrum public `https://arb1.arbitrum.io/rpc` | "No uptime, latency, or rate-limit guarantees"; no log limits stated | [18] |
| QuickNode (Optimism) | 10,000 blocks per call | [19] |
| Infura (page for Sei and Celo, generic) | 10,000 results and 10 s per query | [20] |
| PublicNode, `mainnet.optimism.io`, Ethereum public endpoints, `mainnet.base.org` | Not found in official docs. Unverified; probe at runtime | n/a |

  The consequence: no published, stable cap exists for keyless endpoints. `ChainReader` must discover the cap by halving on rejection, which [providers](../../concepts/providers-and-cache.md) already specifies.

## Open questions

- Which lag (blocks or seconds) is acceptable for a subgraph to stay in `index[]`; the evicting threshold needs an owner decision.
- The v4 subgraph IDs for Base, Optimism and Arbitrum One; the Uniswap page lists one v4 ID only. Search the Explorer by PoolManager/PositionManager address on each chain and record IDs, indexer counts and signal.
- Official overage price per query on The Graph, and whether the $50 monthly budget in [providers](../../concepts/providers-and-cache.md) still holds.
- Whether Envio's free HyperSync tier can serve an owner-filtered `Transfer` scan for the official instance without a paid plan.
- The real `eth_getLogs` caps of PublicNode, `mainnet.optimism.io` and `mainnet.base.org`; measure them with a small probe script during M1a.
- Whether Goldsky community subgraphs carry the 50 requests per 10 s limit and who maintains them.
- Ponder as a `subgraph-own` alternative: not researched here (no source read).
- Messari standardized subgraph health in 2026: only 2025 sources found.

## Sources

1. The Graph docs, GraphQL API (pagination, `_meta`, `block` argument, `_change_block`) — https://thegraph.com/docs/en/subgraphs/querying/graphql-api/
2. The Graph docs, Explorer (filters, curation, indexers) — https://thegraph.com/docs/en/subgraphs/existing-subgraphs/explorer/
3. The Graph docs, Subgraph Studio (Free and Growth plan) — https://thegraph.com/docs/en/subgraphs/providers/subgraph-studio/introduction/ ; querying from an application — https://thegraph.com/docs/en/subgraphs/querying/from-an-application/
4. The Graph, Sunrise FAQ and hosted service sunset (2024-06-12) — https://thegraph.com/docs/en/sunrise/ ; https://thegraph.com/blog/sunsetting-hosted-service/
5. Alchemy Subgraphs deprecation notice (2025-12-08, Goldsky partnership) — https://www.alchemy.com/docs/alchemy-subgraphs/deprecation-notice
6. The Graph docs, managing API keys — https://thegraph.com/docs/en/subgraphs/providers/subgraph-studio/managing-api-keys/
7. Uniswap developer docs, subgraphs overview — https://developers.uniswap.org/docs/ecosystem/subgraphs/overview
8. Integration model, Index sources — docs/concepts/integration-model.md; ADR 0008 — docs/decisions/0008-pluggable-discovery.md
9. Envio, HyperSync API tokens — https://docs.envio.dev/docs/HyperSync/api-tokens
10. Goldsky docs, GraphQL endpoints — https://docs.goldsky.com/subgraphs/graphql-endpoints ; FAQ — https://docs.goldsky.com/faq
11. Alchemy docs, `eth_getLogs` on Base (limit table) — https://alchemy.com/docs/chains/base/base-api-endpoints/eth-get-logs
12. Base docs, `eth_getLogs` — https://docs.base.org/base-chain/api-reference/ethereum-json-rpc-api/eth_getLogs
13. Ormi docs, migrate Alchemy subgraphs — https://ormilabs.com/docs/subgraphs/migrate-alchemy-subgraphs
14. Ormi docs, pricing (effective 2026-07-01) — https://ormilabs.com/docs/billing-and-pricing/pricing ; querying a subgraph — https://ormilabs.com/docs/subgraphs/query-data/querying-a-subgraph.md
15. Messari January 2025 update (The Graph forum) — https://forum.thegraph.com/t/messari-january-2025-update/6338 ; standard subgraphs — https://thegraph.com/docs/en/subgraphs/existing-subgraphs/standard-subgraphs
16. Goldsky pricing summary — https://docs.goldsky.com/pricing/summary
17. Envio, HyperSync supported networks — https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks
18. Arbitrum docs, node providers (public RPC) — https://docs.arbitrum.io/build-decentralized-apps/reference/node-providers
19. QuickNode Optimism error reference (10,000-block cap, via search snippet) — https://www.quicknode.com/docs/optimism/error-references
20. Infura `eth_getLogs` constraints (via search snippet; Sei page) — https://docs.infura.io/reference/sei/json-rpc-methods/eth_getlogs/
