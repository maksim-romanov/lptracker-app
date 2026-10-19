---
app: server
topic: Prices and logos in real products
checked: 2026-10-01
---

# Prices and logos in real products

How open-source wallets and portfolio apps get prices and logos, read from their source on 2026-10-01 (default branches unless a tag is named). This extends [token-prices.md](token-prices.md) and does not repeat its source choices.

## Decisions

Ranked reusable patterns, most valuable first:

1. We model price sources as an ordered list of oracle instances behind one interface (`query_current_price`, `rate_limited_in_last`, `is_penalized`), skipping rate-limited or penalized sources and trying the next. We keep the list and its instances in one immutable state object that we swap atomically. This is Rotki's `CurrentOracleState` design, proven on the same source mix we picked. Rotki is AGPL-3.0 Python, so we port the pattern, not the code. [1][2][3]
2. We use Rotki's Uniswap oracle as the model for pool-derived prices: route through per-chain routing assets (Arbitrum and Optimism: WETH, USDC, USDT; Base: WETH, USDC; Ethereum: WETH, DAI, USDT), pick the V3 pool with the highest liquidity across fee tiers, use spot `sqrtPriceX96`, and reject pools below a single-side USD floor. Rotki's floor is $5,000 (`SINGLE_SIDE_USD_POOL_LIMIT`), which gives us a starting value for the open "minimum liquidity" threshold in token-prices.md. [4][5]
3. We cache "not found" separately from prices, with a much longer TTL. Safe's gateway defaults to 300 s for prices, 100 s for native coins, 30 s for configured high-refresh tokens and 72 h (`NOT_FOUND_PRICE_TTL_SECONDS=259200`) for not-found. Without a negative cache, spam tokens would re-query every source on every refresh. [6]
4. We use `@uniswap/token-lists` (MIT, no runtime deps) for the `TokenList` types, the JSON schema (validate with ajv plus ajv-formats) and `diffTokenLists`/`getVersionUpgrade`, so we can log list changes between refreshes. We validate every fetched list before trusting it. [7][8][9]
5. We gate "verified" on how many curated lists agree, not on one list. MetaMask's token API accepts a token only if it appears in at least `occurrenceFloor` aggregator lists: 3 by default, with per-chain overrides from `/v1/suggestedOccurrenceFloors`. We can apply the same rule to the Uniswap default list, Tokenlistooor, CoinGecko and Trust Wallet lists. [10]
6. We keep a three-state token class, `default | non_default | blocked`, plus a separate spam flag, following Uniswap's `TokenList` enum and `getTokenListFromSafetyLevel`: only positive verification gives `default`, and unknown is never treated as safe. Zerion does the same with `is_trash`, `verified` and `displayable`, and hides trash by default (`filter[trash]=only_non_trash`). This backs the "price only verified tokens" rule in token-prices.md. [11][12][13]
7. We render a missing or failed logo as a deterministic placeholder: up to 3 symbol characters on a background colour seeded from name or symbol, plus a chain badge. This is Uniswap's `TokenLogo` fallback. The server returns `logo: null` rather than a generic image, so clients can draw it. [14]
8. We serve logos from our own origin at one stable per-token URL, `/{chainId}/{address}.png`, backed by an ordered source chain. MetaMask proxies every icon through `static.cx.metamask.io/api/v1/tokenIcons/{chainIdDecimal}/{lowercaseAddress}.png`. Rainbow signs every remote image through imgix with size and format params and swaps in its own CDN host. Our source order is the Uniswap list `logoURI`, then SmolDapp tokenAssets (`assets.smold.app/token/{chainId}/{address}/logo-128.png`, MIT, 32/128 px PNG plus SVG), then the Trust Wallet repo. [15][16][17][18][19]

Also:
- We don't depend on Trust Wallet's `tokenlist.json` for membership, because the Ethereum file's timestamp is 2021-11-09. We use only its per-asset `logo.png` files. [20]
- We don't adopt DeBank (Rabby's backend) or Zerion as default sources, because both need a paid key. DeBank reports `price: 0` for "no data", which is the ambiguity our data rule forbids. [21][13]

## Facts that constrain us
- Rotki `develop`: the default current-price order is Kraken, DefiLlama, CoinGecko, UniswapV2, UniswapV3. Cryptocompare, Alchemy, Moralis and Birdeye exist but are opt-in or need keys. The pipeline is cache (300 s, LRU 1024) → manual prices → fiat → special assets → oracles → `ZERO_PRICE`. If any asset in a multi-asset valuation is unpriced, the whole aggregate returns `None`, not a partial. Special assets (Yearn vaults, stETH, Curve, Balancer and Uniswap LP tokens, wrapped BTC) are priced from their underlying. [1][2]
- MetaMask core (`assets-controllers`, main): prices come from `price.api.cx.metamask.io` (`/v3/spot-prices`, 160 chains listed) with retries, a circuit breaker and a 5 s "degraded" threshold. Rates poll every 180 s. The token list from `token.api.cx.metamask.io` is about 1.6 MB, needs a 10 s timeout and is cached for 4 h. Detection checks balances in batches of 1,000 and adds only non-zero balances. On chains the price API does not support, tokens simply have no price. [10][22][23][24]
- Safe client gateway: prices from CoinGecko (`PRICES_PROVIDER_API_KEY` optional); Zerion is an alternative balances provider at 2 calls per 10 s. [6]
- Uniswap interface (main): logos come from Uniswap's own REST data API; results are "best-effort" and matched back by `chainId + normalized address`. In v4.266.1 the web app built a logo URI list: token list `logoURI` (IPFS converted to HTTP), then `raw.githubusercontent.com/Uniswap/assets/master/blockchains/{network}/assets/{checksum}/logo.png`. [25][26]
- Uniswap token list schema: 1–10,000 tokens; name ≤ 60 chars, symbol ≤ 20, decimals 0–255; ≤ 10 tags per token; extensions ≤ 10 properties, 3 levels deep. Token logos should be 64×64 SVG or PNG. Package version 1.0.0-beta.35. [8][9]
- Tokenlistooor (SmolDapp): a fork of Uniswap token lists that aggregates about 40 generators (CoinGecko, 1inch, Paraswap, Yearn, Curve, Uniswap and others) across 25+ chains. It regenerates weekly, versions itself automatically and is MIT. [17]
- Trust Wallet assets: logos are 256×256 lowercase-`png`. Listing needs ≥ 10,000 holders and 15,000 transactions (airdrops excluded) plus a non-refundable fee. The CDN is `assets-cdn.trustwallet.com/blockchains/{chain}/assets/{checksum}/logo.png`. [20][27]
- Revert Lend `V3Oracle.sol` (BUSL-1.1, so pattern only) runs modes `CHAINLINK_TWAP_VERIFY`, `TWAP_CHAINLINK_VERIFY`, `CHAINLINK` and `TWAP`, with per-token `maxDifference`, `maxFeedAge`, `twapSeconds` (0 = spot) and an L2 sequencer-uptime check with a 600 s grace period. It is the on-chain form of our "median plus spread downgrade" rule. [28]
- Frame gets prices pushed over a websocket from its own Pylon service; nothing there is reusable without that service. [29]
- DeBank OpenAPI (Rabby's data source, via `api.rabby.io`): `TokenObject` carries `price` (0 = no data), `logo_url`, `is_verified`, `is_core` and `is_wallet`. Pro allows 100 req/s; units are bought in the dashboard. [21][30]

## Open questions
- **Conflict (with token-prices.md):** its logo chain is Uniswap list, then Trust Wallet. Decision 8 inserts SmolDapp tokenAssets between them. The owner should confirm.
- Rotki drops the whole aggregate when one asset is unpriced; token-prices.md and ADR 0011 keep a `partial: true` total. We keep ours, but should the UI mark partial totals as prominently as Rotki's refusal does?
- Should a 72 h negative cache apply only to tokens not in any verified list? A newly listed verified token would otherwise stay unpriced for up to 3 days.
- MetaMask's per-chain `suggestedOccurrenceFloors` values are served by an API, not in source. What floor fits our 4 chains and our list set? Spike on real lists.
- Not verified this pass (no web search left; the repos are closed or paths changed): Rainbow's token metadata and logo fallback, Coinbase Wallet, Zapper, Zerion's free tier, Rabby's low-value folding threshold, Rotki's penalty constants, Safe's code path for not-found prices, and Uniswap's current "unknown token" warning copy.
- Image validation limits for re-hosting (max bytes, allowed MIME types, SVG sanitising or rasterising): none of the sources publish theirs. Decide in the logo spike.

## Sources
1. Rotki `inquirer.py` — https://github.com/rotki/rotki/blob/develop/rotkehlchen/inquirer.py
2. Rotki `oracles/structures.py` — https://github.com/rotki/rotki/blob/develop/rotkehlchen/oracles/structures.py
3. Rotki licence (AGPL-3.0) — https://github.com/rotki/rotki/blob/develop/LICENSE.md
4. Rotki Uniswap oracle — https://github.com/rotki/rotki/blob/develop/rotkehlchen/chain/ethereum/oracles/uniswap.py
5. Rotki oracle constants — https://github.com/rotki/rotki/blob/develop/rotkehlchen/chain/ethereum/oracles/constants.py
6. Safe client gateway configuration — https://github.com/safe-global/safe-client-gateway/blob/main/src/config/entities/configuration.ts
7. Uniswap token-lists README — https://github.com/Uniswap/token-lists
8. token-lists schema — https://github.com/Uniswap/token-lists/blob/main/src/tokenlist.schema.json
9. token-lists `index.ts` and `package.json` — https://github.com/Uniswap/token-lists/blob/main/src/index.ts
10. MetaMask `token-service.ts` — https://github.com/MetaMask/core/blob/main/packages/assets-controllers/src/token-service.ts
11. Uniswap `dataApi/types.ts` — https://github.com/Uniswap/interface/blob/main/packages/uniswap/src/features/dataApi/types.ts
12. Uniswap `getCurrencySafetyInfo.ts` — https://github.com/Uniswap/interface/blob/main/packages/uniswap/src/features/dataApi/utils/getCurrencySafetyInfo.ts
13. Zerion, list wallet positions — https://developers.zerion.io/reference/listwalletpositions
14. Uniswap `TokenLogo.tsx` — https://github.com/Uniswap/interface/blob/main/packages/uniswap/src/components/CurrencyLogo/TokenLogo.tsx
15. MetaMask `assetsUtil.ts` — https://github.com/MetaMask/core/blob/main/packages/assets-controllers/src/assetsUtil.ts
16. Rainbow `imgix.ts` — https://github.com/rainbow-me/rainbow/blob/develop/src/handlers/imgix.ts
17. SmolDapp tokenLists — https://github.com/SmolDapp/tokenLists
18. SmolDapp tokenAssets — https://github.com/SmolDapp/tokenAssets
19. Uniswap Labs Default list — https://tokens.uniswap.org/
20. Trust Wallet Ethereum tokenlist.json — https://github.com/trustwallet/assets/blob/master/blockchains/ethereum/tokenlist.json
21. DeBank Cloud docs — https://docs.cloud.debank.com/en/llms-full.txt
22. MetaMask `TokenRatesController.ts` — https://github.com/MetaMask/core/blob/main/packages/assets-controllers/src/TokenRatesController.ts
23. MetaMask `codefi-v2.ts` — https://github.com/MetaMask/core/blob/main/packages/assets-controllers/src/token-prices-service/codefi-v2.ts
24. MetaMask `TokenListController.ts`, `TokenDetectionController.ts` — https://github.com/MetaMask/core/tree/main/packages/assets-controllers/src
25. Uniswap `useCurrencyInfo.ts` — https://github.com/Uniswap/interface/blob/main/packages/uniswap/src/features/tokens/useCurrencyInfo.ts
26. Uniswap interface v4.266.1 `useCurrencyLogoURIs.ts` — https://github.com/Uniswap/interface/blob/v4.266.1/src/lib/hooks/useCurrencyLogoURIs.ts
27. Trust Wallet listing requirements — https://developer.trustwallet.com/developer/new-asset/requirements.md
28. Revert Lend `V3Oracle.sol` — https://github.com/revert-finance/lend/blob/main/src/V3Oracle.sol
29. Frame `externalData/assets` — https://github.com/floating/frame/blob/develop/main/externalData/assets/index.ts
30. Rabby constants — https://github.com/RabbyHub/Rabby/blob/develop/src/constant/index.ts
