---
app: server
topic: Token price providers
checked: 2026-10-01
---

# Token price providers

Second pass on [token-prices.md](token-prices.md): it fills that file's open questions on providers and ranks the source chain. Architecture, cache and resolution rules stay there. Live probes below were single keyless GETs on 2026-10-01; they prove the endpoint answered then, not a guaranteed limit.

## Decisions
- We call DefiLlama at `https://coins.llama.fi`, configurable, because on 2026-10-01 `coins.llama.fi/prices/current/...` answered keyless and `api.llama.fi/prices/current/...` returned 404, even though the free docs list only `api.llama.fi`. [1][P]
- We don't treat DefiLlama `confidence` as a spam or quality filter. It came back as 0.99 for USDC, DEGEN (Base) and PEPE alike, and neither the docs nor the code define it: the `DefiLlama/defillama-server` repo returns 404 on GitHub. Our own pool-liquidity check decides whether a long-tail token is priced. [1][2][P]
- We read ETH, BTC and stablecoin prices from Ethereum-mainnet Chainlink feeds for all four chains. We use L2 feeds only for assets that have no mainnet feed. L2 feed answers then depend on the sequencer, and mainnet answers don't. [3]
- When we do read an L2 feed, we first read that chain's sequencer uptime feed and mark the price `stale` if `answer == 1` (down) or if `now - startedAt ≤ 3600 s`. On Arbitrum, `startedAt == 0` means the feed is uninitialised and counts as down. Feed proxies: Arbitrum `0xFdB631F5EE196F0ed6FAa767959853A9F217697D`, Base `0xBCF85224fc0756B9Fa45aA7892530B47e10b6433`, OP `0x371EAD81c9102C9BF4874A9075FFFf170F2Ee389`. [3]
- We generate the chain file's Chainlink `priceIds` at build time from the per-network JSON in reference-data-directory, keeping `proxyAddress`, `decimals`, `heartbeat`, `threshold` and `feedCategory`, and we drop entries that are not `low` or `medium`. The JSON has these fields (Base ETH/USD: proxy `0x50015f8b…3a8b`, heartbeat 1200 s, threshold 0.15 %, category `low`). We never read the registry at runtime, because it is an undocumented Vercel host. [4]
- We read staleness from `updatedAt` in `latestRoundData`, never from `latestAnswer`, because `latestAnswer` has no timestamp. We ignore `answeredInRound`, which is deprecated. [5]
- For V4 pool-derived prices we read `slot0` through `StateView` at `readBlock` and never use a TWAP, because v4-periphery ships no oracle or TWAP hook. Its `src/hooks` holds only `permissionedPools`, and `src/lens` holds `ReservesLens`, `StateView` and `V4Quoter`. [6]
- We add the GeckoTerminal public API as the keyless DEX-price source after DefiLlama. It needs no key, takes up to 30 addresses per call on `simple/networks/{network}/token_price`, and caches for 60 s. At its limit of "approximately 10 calls/minute" one worker process can price about 300 tokens a minute. [7][8]
- We keep keyless CoinGecko (`api.coingecko.com`, no key) as a best-effort, off-by-default source, and CoinGecko stays Demo-key-only as a default. The keyless API answered on 2026-10-01 and the rate-limit page describes it as IP-shared, but the key-setup page lists no keyless tier. [9][P]
- We add DexScreener only as the last keyless fallback, behind a flag. It needs no key and returns `priceUsd` with `liquidity.usd` per pair. Its terms allow commercial use but let it "suspend or terminate your access … at any time, with or without notice", and the docs don't publish the limit for `tokens/v1`. [10][11][P]
- On the official instance we add the 1inch Spot Price API as the second opinion for long-tail tokens. Its free plan gives 100k calls/month at 60/min with a key and covers chains 1, 10, 8453 and 42161. One batched call per minute uses 43.2k calls/month, which is within free. [12][13]
- We don't use the Uniswap Trading API for prices. It needs a key (6 req/s), and each quote is for one pair and amount, so it doesn't batch. It is free, but it is built for swaps. [14]
- We don't pay for a price API on the official instance. Every paid tier worth having costs at least half the $50 total that ADR 0032 already gives to RPC and The Graph. Free tiers of DefiLlama, GeckoTerminal, a CoinGecko Demo key, 1inch and Alchemy cover one refresh a minute. [15][16][17][18][ADR 0032]
- We skip Mobula, Codex, Zerion, Moralis, GoldRush and Birdeye as defaults. Their free tiers are too small for a per-minute refresh (Mobula 10k credits at 1 RPS, Codex 10k at a $1 signup, Zerion 2k/day), trial-only (GoldRush 14 days), paywalled (Moralis token prices are Pro-only) or unverified (Birdeye pricing returned 403). [16][17][19][20][21]

## Facts that constrain us

| Provider (2026-10) | Key | Free tier | Batch | Our 4 chains | Long-tail | History | ToS / notes |
|---|---|---|---|---|---|---|---|
| DefiLlama coins | no | unpublished "standard" | many `{chain}:{addr}` | yes | yes (DEX-derived) | `historical`, `batchHistorical`, `chart` | terms unpublished; source repo 404 [1][2] |
| Chainlink feeds | no (RPC) | RPC cost only | one `eth_call` per feed | ~100 feeds on Base | no | `getRoundData` | risk tiers in `feedCategory` [3][4] |
| GeckoTerminal public | no | ~10/min | 30 addr | eth, arbitrum, base, optimism | yes (pools) | OHLCV | CoinGecko terms apply; data cached 1 min [7][8] |
| CoinGecko keyless | no | IP-shared, unspecified | as Demo | yes | listed coins only | yes | attribution + 24 h refresh rule [9] |
| CoinGecko Demo | yes | 10k/month, 100/min | 515 addr (`simple`) | yes | listed coins only | yes | "Powered by CoinGecko" [token-prices.md] |
| DexScreener | no | 60/min on profile/boost endpoints; pair endpoints unstated | comma list (max unstated) | yes | yes | no | revocable at will; no attribution clause [10][11] |
| 1inch Spot Price | yes | 100k/month, 60/min | POST list (max unverified) | 1, 10, 8453, 42161 | yes | no | x402 PAYG from $0.00018/call [12][13] |
| Alchemy Prices | yes | 30M CU/month | 25 addr × 3 networks | yes | partial | 5m ≤7 d, 1h ≤30 d, 1d ≤1 y, one token per call | shares CU with Alchemy RPC [18] |
| Uniswap Trading API | yes | free, 6 req/s | none (per quote) | yes | yes | no | swap-oriented [14] |
| CoinMarketCap (+DEX) | yes | 15k credits/month, 50/min | DEX batch exists, size unstated | "Ethereum … and more" | yes (DEX API) | 3 y on free | DEX and CEX share credits; Builder $29 for 150k [15] |
| Mobula | yes (demo keyless, testing only) | 10k credits/month, 1 RPS | 500 tokens | yes | yes | 5 credits per history call | Start-up $50/125k [16] |
| Codex | yes | 10k/month, 5 req/s, $1 signup | batch `getTokenPrices` | 80+ networks | yes, `liquidityUsd` | timestamp / blockNumber | Growth $350/month [17] |
| Zerion | yes | 2k/day, 3 RPS | 100 per page, filter by address | 42 chains | partial | charts hour…max | Builder $149 [19] |
| Moralis | yes | token price not on free | — | yes | yes | block number | Starter $149, price endpoint 50 CU [20] |
| GoldRush (Covalent) | yes | 14-day trial, 25k credits | — | 100+ chains | — | yes | $10/10k credits, Pro $250 [21] |

- The Chainlink sequencer feed on Arbitrum is updated through the Arbitrum inbox, and on OP-stack chains (OP, Base) through `L1CrossDomainMessenger`. The flip transaction executes before anything queued after it. The docs cover only on-chain consumers and give no off-chain guidance. [3]
- The GeckoTerminal marketing page and the API docs both say ~10 calls/min for the public API. The "30 calls/min" figure in the task is not in current docs. [7][8]
- Our 1inch key would be one per operator. The pricing page lists "All APIs included" on free but gives no redistribution or attribution terms. [13]

## Ranked source chain
**Official instance ($50/month total, no extra spend):**
1. Chainlink mainnet feeds (core assets), and L2 feeds gated by the sequencer feed.
2. DefiLlama `coins.llama.fi` (primary aggregator, history).
3. CoinGecko Demo key (second opinion for listed tokens; attribution shown).
4. 1inch Spot Price, free key (second opinion for long-tail tokens).
5. GeckoTerminal public (keyless DEX price, 30 per call).
6. Alchemy Prices, if the RPC pool already has an Alchemy key and CU headroom.
7. Uniswap pool `slot0` at `readBlock` (`confidence: low`).

**Self-host, zero keys:** Chainlink (RPC) → DefiLlama → GeckoTerminal public → Uniswap pool-derived → optional flags: keyless CoinGecko, DexScreener.

## Open questions
- **Conflict:** the 1inch key and the CoinGecko Demo key are per operator, and ADR 0032 and the provider docs name no price keys. Does the official instance hold these keys, and does metering count them? This extends token-prices.md's budget conflict.
- **Conflict:** token-prices.md says "CoinGecko only when the operator configures a Demo key". This file adds keyless CoinGecko and DexScreener as flagged fallbacks. The owner should confirm.
- Not verified (sites unreachable or unparsed): the Odos `/pricing/token` terms (HTTP 530 on every page), RedStone push-feed addresses and AggregatorV3 compatibility on our 4 chains and whether pull needs a key (docs pages rendered empty), the 1inch Spot Price batch size and ToS, the size limits of CoinMarketCap DEX batches and their per-network coverage, Birdeye EVM pricing (403), and DexScreener `tokens/v1` limits (300/min and 30 addresses are commonly cited but not in the docs we could read).
- The defillama-server repo returns 404. Was it moved, made private or renamed? Without it, `confidence` and the `searchWidth` default stay undocumented. Ask DefiLlama.
- Whether GeckoTerminal public data may be shown in our API falls under CoinGecko's §4.1.6 redistribution question, which token-prices.md already raises.
- What ARB/USD and OP/USD cost if they exist only as L2 feeds: sequencer gating plus an L2 RPC read on each refresh.

## Sources
P. Live keyless probes, 2026-10-01: `coins.llama.fi/prices/current/…`, `api.llama.fi/prices/current/…` (404), `api.coingecko.com/api/v3/simple/price`, `api.geckoterminal.com/api/v2/simple/networks/eth/token_price/…`, `api.dexscreener.com/tokens/v1/base/…`
1. DefiLlama API docs (free) — https://api-docs.defillama.com/llms-free.txt
2. DefiLlama server repo (404 on 2026-10-01) — https://github.com/DefiLlama/defillama-server
3. Chainlink, L2 sequencer uptime feeds — https://docs.chain.link/data-feeds/l2-sequencer-feeds
4. Chainlink reference data directory — https://reference-data-directory.vercel.app/feeds-ethereum-mainnet-base-1.json
5. Chainlink Data Feeds API reference — https://docs.chain.link/data-feeds/api-reference
6. Uniswap v4-periphery `src/` — https://github.com/Uniswap/v4-periphery/tree/main/src
7. GeckoTerminal API swagger — https://api.geckoterminal.com/docs/v2/swagger.json
8. GeckoTerminal DEX API — https://www.geckoterminal.com/dex-api
9. CoinGecko, Common errors and rate limit; Setting up your API key — https://docs.coingecko.com/docs/common-errors-rate-limit ; https://docs.coingecko.com/docs/setting-up-your-api-key
10. DEX Screener API reference — https://docs.dexscreener.com/api/reference
11. DEX Screener API terms — https://docs.dexscreener.com/api/api-terms-and-conditions
12. 1inch Spot Price API — https://business.1inch.com/portal/documentation/apis/spot-price/introduction
13. 1inch Business pricing — https://business.1inch.com/pricing
14. Uniswap API FAQs — https://developers.uniswap.org/docs/trading/swapping-api/faqs
15. CoinMarketCap API pricing — https://coinmarketcap.com/api/pricing/
16. Mobula pricing — https://docs.mobula.io/pricing.md ; https://docs.mobula.io/llms.txt
17. Codex pricing; getTokenPrices — https://www.codex.io/pricing ; https://docs.codex.io/api-reference/queries/gettokenprices
18. Alchemy Prices API (by address, historical) — https://www.alchemy.com/docs/data/prices-api/prices-api-endpoints/prices-api-endpoints/get-historical-token-prices
19. Zerion API pricing; fungibles — https://zerion.io/api ; https://developers.zerion.io/reference/listfungibles
20. Moralis pricing; multiple token prices — https://moralis.com/pricing/ ; https://docs.moralis.com/web3-data-api/evm/reference/get-multiple-token-prices
21. GoldRush pricing — https://goldrush.dev/pricing/
