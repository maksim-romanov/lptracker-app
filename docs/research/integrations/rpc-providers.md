---
app: integrations
topic: RPC providers and configuration
checked: 2026-10-20
---

# RPC providers and configuration

Whether VoidX ships provider presets or a combined free and paid list, how keys are placed, and what the official instance may send where. Reads fetched 2026-10-20 unless a source says otherwise. Anything not stated by a source is marked *proposal* or *unverified*. Conflicts with current docs are flagged under Open questions, not resolved.

## Decisions

### Presets, lists and where each lives

- We ship presets as URL templates in an example `instance.config`, not in chain files and not in code. A template has the form `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`; the operator copies the vendors they pay for. Reason: the hostname, the key position and the key scope differ per vendor, so a preset is documentation for operators, not data the server trusts. Templates with one key for all four chains are possible for Alchemy, Infura, dRPC and Ankr only; QuickNode and Chainstack issue a key per endpoint, so they need one full URL per chain. [1][2][3][4][5][6]
- We name one env var per vendor key (`ALCHEMY_KEY`, `INFURA_KEY`), and one env var per chain only for vendors whose URL is per endpoint (`QUICKNODE_URL_8453`). Reason: the same split Ponder (`PONDER_RPC_URL_<chainId>`) and the DefiLlama SDK (`<CHAIN>_RPC`, comma-separated) use for full URLs; Safe's web app uses one Infura token for all chains. VoidX reads these only through `${...}` interpolation inside `instance.config`, as ADR 0021 requires. [7][8][9]
- We do not ship a combined list of paid plus free RPCs. A public fallback list is the one reason `chainlist`-style data exists; DefiLlama's SDK pulls it from chainlist.org at every publish, and `ethereum-lists/chains` mixes in key placeholders, wss URLs and gateways that do not serve reads. Both are leads, never inputs (chain-parameters already says this). [8][10]
- We accept a keyless community endpoint only through a separate, maintainer-allowlisted field, not through `publicRpcs`. *Proposal*, needs an owner decision because it widens the rule "official chain docs only". Admission rule: (1) https only; (2) the operator publishes a privacy statement we can quote; (3) it passes the public RPC probe; (4) it is flagged `community` and sorted after `publicRpcs`; (5) the official instance does not use it for owner-specific reads (see Privacy). Today only PublicNode meets (2), with a 24-hour retention statement. [11][12]

### Key placement

- We support a per-URL `headers` map in `instance.config.providers` (values interpolated like URLs) and prefer it where the vendor allows it, so the key is not in the URL path. Alchemy takes `Authorization: Bearer <key>` on `https://eth-mainnet.g.alchemy.com/v2`; QuickNode takes `x-token: <token>`; dRPC names a `Drpc-Key` header; Chainstack takes HTTP basic auth on a host with no key. Infura documents the key in the path only. viem's `http()` passes `fetchOptions.headers` through, so the pool needs no vendor code. [1][3][4][5][6][13]
- We redact header values as well as URL paths in logs and in the `{ host, error }` list. ADR 0040 and providers-and-cache only mention URLs; header keys need the same rule. [14]

### Order and health

- We keep the order in ADR 0021: operator URLs, then `publicRpcs`, then allowlisted community URLs. Within a tier we rank by measured score, never by random choice. Rotki picks randomly among weighted public nodes after its own nodes; DefiLlama's known pain point is random rotation, which ADR 0021 already rejects. [15][14]
- We take viem's `fallback({ rank })` defaults only as a reference for score weights, not as the health check: stability 0.7, latency 0.3, `sampleCount` 10, `timeout` 1,000 ms, ping `net_listening`, `retryCount` 3 across all transports. That ping proves liveness, not head lag, so the median-head eviction in ADR 0021 stays. [16]
- We set default `maxBlockRange` in a preset to 1,000 and rely on the automatic halving, because the only documented getLogs ranges are Ankr 1,000 (Public), 3,000 (Freemium), 10,000 (Premium) and Alchemy's PAYG "10,000 blocks, or any range returning at most 10,000 logs"; Alchemy's free-tier range is documented only as "small". [17][18]
- We treat any Public-tier batch size as a hard limit: Ankr Public allows 10 requests per JSON-RPC batch, while the chain-parameters probe step 7 tests 100. Presets set the batch size per URL. [17]

### Privacy rule for the official instance

- We state in the privacy notice what is verified: a provider sees every address and contract call the server sends, with the server's IP, never the user's IP (the server makes the call). It also sees which addresses were queried together, which links them to one request pattern. This is true of every option below, including a private relay. *Derived from how the server calls*, no provider source states it. [14]
- We pick providers for the official instance only if their terms or privacy statement says what RPC traffic they keep. At 2026-10-20 none of Alchemy, Infura, QuickNode, dRPC or Chainstack gave a quotable retention statement for RPC request content or addresses in pages we could read (see Facts). The decision is therefore blocked on reading each vendor's terms; until then the notice says "providers may log queried addresses". [19][20][21]
- We do not use a privacy relay to claim anonymity. 1RPC says it keeps no relayed metadata and runs in a Trusted Execution Environment, but its policy page is dated March 2023 and names no audit. Cost and read support unverified. [22]
- We do not use Flashbots Protect or MEV Blocker as read endpoints. Both are transaction-submission services in their own docs, VoidX never sends transactions, and ethereum-lists lists them only because they speak JSON-RPC. [23][24]
- We tell self-hosters the privacy option is their own node (geth/reth/Nitro per chain-parameters), or one provider they trust; a split across providers is not documented by any source as a privacy technique, so we do not recommend it.

## Facts that constrain us

### How others configure RPC

| Project | Pattern | Version / date |
|---|---|---|
| viem `http` | No `url` means `chain.rpcUrls.default.http[0]`; docs "highly recommend" an authenticated URL. `retryCount` 3, `retryDelay` 150 ms with exponential backoff, `batch` off, `fetchOptions` for auth headers. | current docs [13] |
| viem `fallback` | `rank` default `false`; see Decisions for weights; `shouldThrow` decides whether to stop or move on. | current docs [16] |
| Ponder | `rpc` is a URL, an array, or a viem transport (`fallback`, `loadBalance`, `rateLimit` from `@ponder/utils`); examples use `PONDER_RPC_URL_<chainId>`; "Most Ponder apps require a paid RPC provider"; `id` must equal the endpoint's chain id because it is part of the RPC cache key. Docs do not say what happens when `rpc` is omitted. | `ponder.sh` docs, 0.10 renamed `networks` to `chains` [7] |
| DefiLlama SDK | `<CHAIN>_RPC`, comma-separated, also `SDK_` and `LLAMA_SDK_` prefixes; `<CHAIN>_RPC_MULTICALL_V3` overrides the multicall address; `<CHAIN>_MULTICALL_CHUNK_SIZE` caps batch size; built-in `providers.json` refreshed from chainlist.org on every publish. | README [8] |
| Rotki | Own nodes first; else a built-in list of public nodes, each with a weight (likelihood of use) and an enable toggle; the page says public nodes "are sometimes busy or down". | docs [15] |
| Blockscout | `ETHEREUM_JSONRPC_HTTP_URL`, `ETHEREUM_JSONRPC_FALLBACK_HTTP_URL` (empty by default), separate `..._TRACE_URL` and `..._FALLBACK_TRACE_URL`; one primary plus one fallback, no pool. | docs [25] |
| Safe web app | Build-time `NEXT_PUBLIC_INFURA_TOKEN` (one vendor token for all chains); a per-Safe RPC override is stored in the browser. Seen on forks of the repo, upstream not read. | *unverified* [26] |

Not found with primary sources: Uniswap interface, Rabby, Rainbow, Frame, Otterscan, The Graph indexer configs. The one Uniswap hit is a vendor blog that names QuickNode as a provider, not a config. Do not treat these as researched.

### Keyless Ethereum mainnet endpoints (2026-10-20)

| Endpoint | Who | What the sources say |
|---|---|---|
| `https://ethereum-rpc.publicnode.com` | PublicNode (Allnodes) | Privacy policy: "not store your IP address or any data for more than 24 hours" and "IP addresses are not connected or correlated to wallet addresses". Site says "privacy first", lists no limits, and shows an archive access option (cost unstated). Limits and archive depth not documented; chain-parameters measured under 1,000 blocks of `eth_call` depth on one sample. [11][12][27] |
| `https://eth.drpc.org` | dRPC | Listed by ethereum-lists. dRPC free tier (keyed) is 210M CU per 30 days, about 2,100 CU/s; the rate-limit docs state 120,000 CU/min per IP, reduced under load to a floor of 50,400; trace, debug and filter methods are disabled on the free tier (blog, 2025-06). Keyless limits not separated in what we read. [10][28][29] |
| `https://rpc.ankr.com/eth` | Ankr | Public tier: about 1,800 requests/min "guaranteed" across endpoints, batch 10, `eth_getLogs` range 1,000, 200,000 logs per response. Public plan can be used without signing in; whether `eth` needs a key was not stated. Ankr states transaction data is stored "in anonymized form" and can be associated with an Ethereum address (premium context). [17][30][31] |
| `https://eth.llamarpc.com` | LlamaNodes | Third-party pages call it live in July 2026; no first-party limits, privacy or deprecation notice found. Compatibility issues with some tooling are reported (secondary). Not evaluated. [32] |
| `https://cloudflare-eth.com` | Cloudflare | Listed by ethereum-lists. Cloudflare's migration guide says the legacy gateway hostnames are being phased out (search snippet, no date). The current Ethereum Gateway doc (updated 2026-08-14) is an account product: 15 gateways and 500,000 included requests on Free, Pro and Business. Treat the keyless hostname as unreliable. [10][33][34] |
| `https://rpc.flashbots.net`, `https://rpc.mevblocker.io` | Flashbots, CoW | Transaction submission with MEV protection; no read-method statement in the docs. Not read endpoints. [23][24] |
| `https://1rpc.io/eth` | 1RPC (Automata) | Not in the ethereum-lists file read; relay claims only. [22] |

Other entries in the same ethereum-lists file (Tenderly gateway, Blocknative Boost, securerpc, xrpc.cl, blockreq, swiftnodes with a `?key=` query) were not researched.

### Provider URLs and key placement, chains 1, 42161, 8453, 10

| Vendor | URL | Key | Source |
|---|---|---|---|
| Infura | `https://mainnet.infura.io/v3/<key>`, `https://arbitrum-mainnet.infura.io/v3/<key>`, `https://base-mainnet.infura.io/v3/<key>`, `https://optimism-mainnet.infura.io/v3/<key>` | Path only; no header documented | [2] |
| Alchemy | `https://eth-mainnet.g.alchemy.com/v2/<key>` or `https://eth-mainnet.g.alchemy.com/v2` with header | Path, or `Authorization: Bearer <key>`; an access key also works in the header. Hosts for 42161, 8453 and 10 *unverified* (not fetched). | [1] |
| QuickNode | `https://<endpoint-name>.<network>.quiknode.pro/<token>/` | Token in path, or `x-token: <token>`; regenerating a token invalidates the old one at once; per-endpoint, so no single key covers four chains | [3] |
| dRPC | `https://lb.drpc.live/ethereum/<key>`; the dashboard URL uses a `dkey` query parameter instead; names for 42161, 8453, 10 *unverified* | Path, `dkey` query, or `Drpc-Key` header (header syntax beyond the name not seen) | [4] |
| Ankr | `rpc.ankr.com/eth/<key>`; names for the other three chains *unverified* | Path | [31] |
| Chainstack | `https://<network>.core.chainstack.com/<key>`, or `https://ethereum-mainnet.core.chainstack.com` with basic auth | Path or HTTP basic auth (docs warn that anyone who sees a URL with the key has access) | [5][6] |

Keys in a path or query string appear in any log that records URLs, including proxies and the provider's own dashboards; a header does not. Alchemy states this reason itself. [1]

### Free-tier limits, as published (each row dated at its source)

| Vendor | Limit | Source |
|---|---|---|
| Alchemy | Free: 30M CU/month, 15 req/s (300 CU/s), 5 apps, all mainnets; archive reads draw from the same 30M. PAYG $0.525 per 1M CU. A search snippet reported the docs table says 300M CU and 330 CUPS; the pricing page and docs disagree, re-check in the dashboard. Free-tier `eth_getLogs` range unstated ("small"). | [35][18] |
| Infura | Free: 3,000,000 daily credits, 500 credits/s (older docs said 6,000,000 and 2,000). Archive reads (older than 128 blocks) cost the same as non-archive "currently". | [36] |
| QuickNode | Free Trial: 10M API credits, 15 req/s, one month. Build $49/month: 80M credits, 50 req/s. Archive on free unverified (one third-party guide only). | [37] |
| dRPC | Free: 210M CU per 30 days; 120,000 CU/min per IP; trace/debug/filter disabled. | [28][29] |
| Ankr | Public: about 1,800 req/min, batch 10, range 1,000. Freemium: 200M credits/month, Public rate limits, range 3,000, batch 100. Premium PAYG: $0.10 per 1M credits, 200 credits per EVM request (about $0.00002 per call), range 10,000. | [17] |
| Chainstack | Developer free: 3M request units/month, 25 req/s (pricing-page snippet); archive calls billed at 2 units; archive on Developer unclear. | [38] |

None of these figures is in any chain file; they belong in operator `limits`, per providers-and-cache.

### Privacy statements found

- PublicNode: 24-hour retention, no IP-to-wallet correlation (policy page). [11]
- 1RPC: "does not store or collect any metadata/data that passes through the relay"; TEE claim; page dated March 2023; no IP statement. [22]
- Ankr: transaction data stored "in anonymized form"; can be associated with an Ethereum address; does not record which private endpoint. [30]
- QuickNode: general policy only: collects IP address and access times; keeps data "in general ... seven years"; RPC traffic and wallet addresses not mentioned. [21]
- MetaMask notice (Infura's owner): Infura is MetaMask's default RPC provider; IP processed "temporarily ... where required"; no Infura-specific retention. [20]
- Alchemy: Terms point to a separate privacy notice that we did not read. dRPC: privacy page returned no body. Chainstack: not read. [19]

## Open questions

- Owner decision: may a chain file or `instance.config` default carry a community keyless endpoint, given chain-parameters says "official docs only" and the integration model says URLs are "https only and maintainer-allowlisted"? The proposal above adds a separate allowlisted field; it conflicts with the plain reading of both.
- Which vendors the official instance uses, and each vendor's written retention policy for RPC request content. Blocked on reading Alchemy's privacy notice, dRPC's policy, Infura's terms, Chainstack's policy.
- PublicNode: rate limits, archive depth and the cost of "Get Archive Access"; no figures in first-party pages.
- Ankr `eth`, `arbitrum`, `base`, `optimism` paths and key requirement; Alchemy and dRPC hostnames for chains 42161, 8453, 10. Confirm in each dashboard before putting them in a template.
- Alchemy free-tier compute unit conflict (30M on the pricing page, 300M in a docs snippet).
- dRPC public (keyless) limits separate from keyed free tier; whether `eth_getLogs` counts as a disabled "filter" method on the free tier.
- LlamaNodes first-party limits, privacy and status.
- Whether the $50 per month external-API budget in providers-and-cache fits one paid RPC vendor with a free-tier backup; needs a request-volume estimate from M1a, not research.
- Config research gaps: Uniswap interface, Rabby, Rainbow, Frame, Otterscan, The Graph indexer, Erigon and reth docs on serving many addresses.
- Whether the pool should use a per-vendor key header when a vendor also accepts the path form (a failed auth may show up as 401 in one form only); test per vendor in M1a.

## Sources

1. Alchemy, How to make HTTP header-based API requests — https://www.alchemy.com/docs/how-to-use-api-keys-in-http-headers
2. Infura (MetaMask Developer), All endpoints — https://docs.infura.io/get-started/endpoints.md
3. QuickNode, Endpoint security (Base page updated 2026-07-10 per search listing) — https://www.quicknode.com/docs/base/endpoint-security
4. dRPC, Getting started: first request — https://drpc.org/docs/gettingstarted/firstrequest (header and URL details read from search excerpts; body not fully fetched)
5. Chainstack, Best practices for securing your endpoint — https://docs.chainstack.com/docs/best-practices-for-securing-your-chainstack-endpoint
6. Chainstack, Authentication methods for different scenarios — https://docs.chainstack.com/docs/authentication-methods-for-different-scenarios
7. Ponder, Chains — https://ponder.sh/docs/config/chains
8. DefiLlama SDK README — https://raw.githubusercontent.com/DefiLlama/defillama-sdk/master/README.md
9. Safe web app fork README (secondary) — https://github.com/Zarigis/web-core
10. ethereum-lists/chains, `eip155-1.json` — https://raw.githubusercontent.com/ethereum-lists/chains/master/_data/chains/eip155-1.json
11. PublicNode privacy policy — https://publicnode.com/privacy
12. PublicNode home — https://www.publicnode.com/
13. viem, HTTP transport — https://viem.sh/docs/clients/transports/http
14. VoidX, ADR 0021, ADR 0040, Providers and cache — ../../decisions/0021-rpc-provider-pool.md ; ../../decisions/0040-privacy.md ; ../../concepts/providers-and-cache.md
15. Rotki docs, Blockchain settings (RPC nodes) — https://docs.rotki.com/usage-guides/settings/blockchain
16. viem, Fallback transport — https://viem.sh/docs/clients/transports/fallback
17. Ankr, Service plans — https://www.ankr.com/docs/rpc-service/service-plans
18. Alchemy support, eth_getLogs free-tier error ("Last updated 1 month ago", undated) — https://support.alchemy.com/articles/1883074130-why-do-i-see-a-free-tier-error-when-calling-eth-getlogs-with-a-large-block-range
19. Alchemy Legal Center (Terms; Privacy Notice not read) — https://legal.alchemy.com/
20. MetaMask privacy notice — https://metamask.io/privacy-notice
21. QuickNode privacy policy — https://www.quicknode.com/privacy
22. 1RPC privacy policy (page says last updated March 2023) — https://www.1rpc.io/privacy
23. Flashbots Protect quick start — https://docs.flashbots.net/flashbots-protect/quick-start
24. MEV Blocker endpoints — https://docs.mevblocker.io/reference/api/transaction-endpoints
25. Blockscout, Client settings — https://docs.blockscout.com/setup/requirements/client-settings
26. Chainstack, Adding a custom RPC endpoint to Safe (secondary) — https://docs.chainstack.com/docs/adding-a-custom-rpc-endpoint-to-safe
27. ethereum.org, PublicNode listing (secondary) — https://ethereum.org/apps/publicnode/
28. dRPC blog, Upcoming changes to the free plan (effective 2025-06-01) — https://drpc.org/blog/upcoming-changes-to-drpcs-free-plan-effective-june-1-2025/
29. dRPC, Rate limiting (limits read from search excerpt; page body truncated) — https://drpc.org/docs/howitworks/ratelimiting
30. Ankr, RPC service overview — https://www.ankr.com/docs/rpc-service/overview/
31. Ankr, Getting started — https://www.ankr.com/docs/rpc-service/getting-started/intro/
32. LlamaNodes (secondary only; first-party site not reachable) — https://github.com/llamanodes
33. Cloudflare, Web3 migration guide (search snippet) — https://developers.cloudflare.com/web3/reference/migration-guide/
34. Cloudflare, Ethereum Gateway — https://developers.cloudflare.com/web3/ethereum-gateway/
35. Alchemy, Pricing (read 2026-10-20) — https://www.alchemy.com/pricing
36. Infura, Pricing — https://docs.infura.io/get-started/pricing.md
37. QuickNode, Pricing (search excerpt) — https://www.quicknode.com/pricing.md
38. Chainstack, Pricing (search excerpt) — https://chainstack.com/pricing/
