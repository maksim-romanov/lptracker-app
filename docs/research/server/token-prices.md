---
app: server
topic: Token prices
checked: 2026-10-01
---

# Token prices

Post-MVP input for the `PriceSource` port ([ADR 0011](../../decisions/0011-token-amounts-not-usd.md)): USD prices for ERC-20s (incl. long-tail) on Ethereum, Arbitrum, Base, Optimism, with zero paid keys required.

## Decisions

### Sources
- We read core-asset prices (ETH, BTC, major stables) from Chainlink Data Feeds with `eth_call` through the existing RPC pool, because they need no key and cost only RPC calls, which self-hosters already have. We use only feeds rated Low or Medium risk and check `updatedAt` against the feed heartbeat, because Chainlink rates feeds by market risk and asks consumers to add freshness checks, bounds and fallbacks. [9]
- We use the DefiLlama coins API (free, keyless) as the default aggregator for everything else, because it batches `{chain}:{address}` keys, has current, historical, `batchHistorical`, `chart` and `block` endpoints, and needs no key. Pro costs $300/month, six times our whole budget, so it is never required. [1][2][ADR 0032]
- We add CoinGecko only when the operator configures a Demo key, because the docs require a key (`x-cg-demo-api-key`), Demo allows 100 calls/min and 10k calls/month, prices update every 60 s, and the terms require "Powered by CoinGecko" attribution and forbid redistributing API access. [3][4][5][6][8]
- We price long-tail tokens from Uniswap pools as a last resort: the pool price at `readBlock` against a core asset, and only above a minimum liquidity. We already read `sqrtPriceX96` for every position, so a token paired with a priced core asset costs no extra call. Pool-derived prices always get `confidence: low`. [11]
- We don't use V3 `observe()` TWAPs by default, because a pool keeps a single observation until someone raises its cardinality, so most long-tail pools have no usable history. V4 has no built-in oracle in the core hook lifecycle. [11][12]
- We exclude Pyth Hermes, because it has required an API key since 2026-08-26. We also exclude 0x and other quote-based pricing, because 0x says quote-only use hits its limits and asks price-only users to contact sales. [10][17]
- We keep Alchemy Prices as an optional operator source, not a default. It costs 40 CU per call of up to 25 addresses and 3 networks, so 30M free CU a month is about 750k calls, but it needs a key. We skip Moralis (paid plans from $149/month). [13][14][15][16]

### Resolution
- We fall back per token, not per batch. The old `TokenPriceResolver` returned DefiLlama's partial map as soon as the call succeeded, so tokens missing from DefiLlama were never asked of CoinGecko. It also defaulted a missing `confidence` to 0.99, never applied a threshold and did not map Optimism. [20]
- We keep a per-token chain of sources with a confidence per source. When at least two sources answer we take the median; a spread above the configured tolerance, or a jump against the last good price beyond a bound, downgrades the price to `low` and keeps the last good value. This follows Chainlink's "value bounds, caps, circuit breakers, freshness checks, fallback behavior" advice for single-source data. [9]
- We never hard-peg stablecoins to $1. They are priced like any other token and flagged `depegged` past a band, because Chainlink advises peg protection and a valuation ceiling for stables. [9]
- We map bridged variants (USDC vs USDC.e) as separate price ids, never merged, because Chainlink warns that wrapped and bridged assets can deviate from their underlying in extreme events. [9]
- We price native ETH (`slip44:60`) with the WETH price on the same chain. The tokens stay separate in the position model; only the price id is shared. [position-model]
- We keep per-chain price ids in the chain file (`priceIds`): the DefiLlama chain slug (`ethereum`, `arbitrum`, `base`, `optimism`), the CoinGecko platform id and the Chainlink feed addresses for core assets, because the old code hard-coded three chains and missed Optimism. [20]
- We price only `verified` tokens (curated lists), plus unverified tokens whose price has `confidence` ≥ the threshold and pool liquidity above the minimum. Spam tokens stay unpriced, because an aggregator returns a number for any token with a pool. [position-model][18]

### Budget, cache, output
- We cache a price for 60 s and serve stale-while-revalidate up to a configured max age (15 min by default). Past that the price is `stale` and never enters totals. 60 s matches the CoinGecko Demo and GeckoTerminal update interval. [4][7]
- The worker refreshes prices once per interval for the union of tokens across all snapshots, in batches, and requests never call price APIs. The cost then grows with the number of distinct tokens, not requests, and no single user's token set reaches a third party. [ADR 0040]
- An unpriced token shows its amount only, with no `$0`. Totals sum only the priced parts and carry `partial: true` and the count of unpriced tokens, because failure is not absence. [data-rule][ADR 0011]
- For history (later PnL), we use DefiLlama `batchHistorical` (arrays of timestamps per coin) and `block/{chain}/{timestamp}`, plus Chainlink `getRoundData` at archive blocks for core assets. We store the first price we see per token, day and source in Postgres, so it is never fetched twice. [1][9]
- We re-host logos. The server fetches them from the Uniswap token list `logoURI` first (mostly CoinGecko hosts), then from Trust Wallet `blockchains/<chain>/assets/<checksum>/logo.png`, validates, resizes and serves them from our origin with a content hash. Hotlinking would expose client IPs to third parties, and the old code's 1inch URL was keyed by address only, not by chain. [18][19][20][ADR 0040]

## Facts that constrain us
- DefiLlama (2026-10): the docs list only `https://api.llama.fi` as the free base URL; the old code used `coins.llama.fi`. Free rate limits are "Standard", with no published number. The docs do not define `confidence` or the `searchWidth` default. [1][20]
- CoinGecko (2026-10): Demo is 10k credits/month and 100/min, attribution required; Basic is $35/month for 100k credits and 300/min. Even failed 4xx/5xx calls count against the limit. `simple/token_price` takes up to 515 addresses on Demo. The onchain `token_price` endpoint takes up to 100 addresses only on Analyst ($129) or above. Stored data must be refreshed at least every 24 h. [3][4][5][7][8]
- The rate-limit page mentions a "keyless public API" with IP-shared limits; the Demo auth page says to sign up for a key. The two pages contradict each other. [5][6]
- Chainlink: feeds are rated Low, Medium, High, Very High, New Token, Custom, Deprecating or Unrated. Consumers must add their own staleness and bound checks. [9]
- Uniswap v3: an arithmetic-mean tick TWAP gives a geometric-mean price. The observation buffer holds up to 65,535 entries but starts at 1. [11]
- Alchemy Prices: `by-address` takes up to 25 addresses across 3 networks per call and returns `lastUpdatedAt` and a per-token `error`. The free tier is 30M CU/month at 500 CU/s; pay-as-you-go costs $0.525 per 1M CU. [13][14][15]
- The Uniswap Labs Default list v22.21.0 (2026-09-23) covers chains 1, 10, 8453 and 42161. Its `logoURI`s point mostly to `assets.coingecko.com` and `coin-images.coingecko.com`, some to `ipfs://` and TrustWallet raw GitHub. [18]
- The Trust Wallet assets repo is MIT for scripts and docs. The logos are the projects' marks, and new tokens with minimal circulation are not accepted, so long-tail coverage is thin. [19]

## Open questions
- **Conflict:** ADR 0032 caps "RPC providers and The Graph" at $50; price APIs and the extra Chainlink/pool RPC reads are not in its scope or in the cost-unit metering in providers-and-cache.md. Should the budget and metering cover price sources?
- **Conflict:** the data rule says "the chain supplies every quantity". Off-chain aggregator prices break that unless prices are declared non-quantities. The owner should decide.
- **Conflict:** ADR 0040's privacy notice names only RPC providers and The Graph. Price and logo providers see token sets (not addresses); should the notice list them?
- **Conflict:** ADR 0015 and providers-and-cache.md have no cache layer for prices or logos. The TTLs above need adding there.
- CoinGecko terms §4.1.6 forbid redistributing API access. Is serving CoinGecko-derived prices through our public `/api/v1` to third-party clients redistribution? Needs a reading of the terms or a question to CoinGecko.
- DefiLlama's `confidence` semantics, `searchWidth` default, free rate limit and redistribution terms are undocumented on the current pages. Measure in a spike and ask DefiLlama.
- Is the keyless CoinGecko API usable for self-hosters (see the contradiction above)? What is Demo's historical depth? The pricing page's "60 sec" cell looks misparsed.
- We could not verify these this pass (web search budget exhausted): CoinMarketCap DEX API, Codex, Mobula, Zerion pricing, RedStone, Odos, the Uniswap routing API, the 1inch Spot Price API (portal DNS failed), Chainlink L2 sequencer-uptime feeds on Arbitrum, Base and Optimism, and a V4 oracle hook in v4-periphery.
- Thresholds are undecided: the minimum pool liquidity in USD, the agreement tolerance, the depeg band and the jump bound. A spike on recorded cassettes should set them.
- How to price V4 pools with delta-returning hooks (bits 2–3): exclude them from pool-derived pricing?
- Rebasing and fee-on-transfer tokens: aggregators price per unit, which is fine for display. Does PnL need a share-based price (e.g. wstETH vs stETH)?

## Sources
1. DefiLlama API docs (free) — https://api-docs.defillama.com/llms-free.txt
2. DefiLlama Pro API — https://api-docs.defillama.com/llms-pro.txt
3. CoinGecko API pricing — https://www.coingecko.com/en/api/pricing
4. CoinGecko, Coin price by token addresses — https://docs.coingecko.com/reference/simple-token-price
5. CoinGecko, Common errors and rate limit — https://docs.coingecko.com/docs/common-errors-rate-limit
6. CoinGecko, Demo API authentication — https://docs.coingecko.com/v3.0.1/reference/authentication
7. CoinGecko onchain token price — https://docs.coingecko.com/reference/onchain-simple-price
8. CoinGecko API terms — https://www.coingecko.com/en/api_terms
9. Chainlink, Selecting quality data feeds — https://docs.chain.link/data-feeds/selecting-data-feeds
10. Pyth, Hermes — https://docs.pyth.network/price-feeds/core/api-instances-and-providers/hermes
11. Uniswap v3 price oracles — https://developers.uniswap.org/docs/protocols/v3/concepts/price-oracles
12. Uniswap v4 hooks — https://developers.uniswap.org/docs/protocols/v4/concepts/hooks
13. Alchemy, Token prices by address — https://www.alchemy.com/docs/data/prices-api/prices-api-endpoints/prices-api-endpoints/get-token-prices-by-address
14. Alchemy, Compute unit costs — https://www.alchemy.com/docs/reference/compute-unit-costs
15. Alchemy pricing — https://www.alchemy.com/pricing
16. Moralis pricing — https://moralis.com/pricing/
17. 0x pricing — https://0x.org/pricing
18. Uniswap Labs Default token list — https://tokens.uniswap.org/
19. Trust Wallet assets — https://github.com/trustwallet/assets
20. Old implementation — /Users/maksimromanov/code/personal/voidapp/apps/tokens-data/src/features/{prices,logos}
