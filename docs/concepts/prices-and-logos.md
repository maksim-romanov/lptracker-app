# Prices and logos

How the server prices tokens in USD and serves their logos ([ADR 0045](../decisions/0045-token-prices.md), [ADR 0046](../decisions/0046-token-logos.md)). Wire fields are in [position-model.md](position-model.md#position).

## Price sources

Tried in order per token; a source that is rate-limited, breaker-open or has no answer passes the token to the next.

| # | Official instance | Self-hosted, zero keys |
|---|---|---|
| 1 | Chainlink Data Feeds, read through the RPC pool | Chainlink |
| 2 | DefiLlama coins API (`coins.llama.fi`) | DefiLlama |
| 3 | CoinGecko with a Demo key | GeckoTerminal public API |
| 4 | 1inch Spot Price with a free key | Pool-derived |
| 5 | GeckoTerminal public API | Keyless CoinGecko (`source: coingecko`), behind `ops.prices.coingeckoKeyless` |
| 6 | Pool-derived | DEX Screener, behind `ops.prices.dexscreener` |

- Keys live in `instance.config.prices`; a source without its key is skipped.
- Base URLs are configurable per source.

### Chainlink

- ETH, BTC and stablecoins use Ethereum mainnet feeds on every chain. L2 feeds are used only for assets with no mainnet feed.
- Only feeds of category Low or Medium are used.
- Read `latestRoundData`, never `latestAnswer`. A price is `stale` when `updatedAt` is older than the feed's heartbeat.
- An L2 feed first reads the chain's sequencer uptime feed. The price is `stale` when `answer == 1` or `now − startedAt ≤ 3600 s`; on Arbitrum `startedAt == 0` counts as down.

### Pool-derived

- Route through the chain's core assets (WETH, USDC) and take the most liquid Uniswap V3 or V4 pool across fee tiers, at `readBlock`.
- Spot price from `slot0`; no TWAP, because most pools keep one observation and V4 has no oracle.
- Each side of the pool must hold at least $5,000. V4 pools with hook bits 2 or 3 are excluded ([data rule](data-rule.md#v4-hooks)).
- The result always has `confidence: low`.

## Resolution

- Two or more answers: the median. A spread above `prices.agreementTolerance`, or a move above `prices.jumpBound` against the last good price, sets `confidence: low` and keeps the last good value.
- DefiLlama's `confidence` field is ignored: it reads 0.99 for USDC and meme tokens alike.
- Stablecoins are priced like any token; `depegged` is set outside `prices.depegBand`.
- USDC and USDC.e are different tokens with different prices.
- Native ETH (`slip44:60`) uses the WETH price of the same chain; the tokens stay separate.
- Only `default`-class tokens are priced. `non_default` and `blocked` tokens show amounts only.
- Threshold values: [ADR 0045](../decisions/0045-token-prices.md#consequences).

## Refresh and cache

- The worker refreshes every token in the price index once a minute, batched per source. A request that meets a token with no cached price returns it unpriced and enqueues `price:{tokenId}`; requests never call a price API.
- A cached price is refreshed after 60 s and keeps `status: fresh` up to 15 minutes old. Older, it is `stale`: shown with its age, excluded from totals.
- The last good price per token is kept in Postgres, so the jump check and stale serving survive restarts.
- "Not found" is cached for 72 h for tokens on no curated list. A `default` token is retried on the next refresh.
- Every source call reports cost units against the external API budget ([providers and cache](providers-and-cache.md#provider-quotas-and-budget)).

## Values and totals

- A value is amount × price, computed on the server as an exact decimal string; clients only format it.
- Which tokens count and how `partial` is set: [position model](position-model.md#limits).

## Logo sources

Looked up by chain id and address, never by symbol. First match wins.

1. Maintainer override file in `integrations/` (native ETH, WETH, broken upstream logos).
2. Uniswap Labs Default token list.
3. Superchain token list (Optimism, Base).
4. SmolDapp tokenAssets (`logo-128.png`).
5. Trust Wallet assets, one asset at a time; assets with status `spam` or `abandoned` are skipped and flag the token `spam`.
6. LiFi `/v1/tokens`, the long-tail fallback.

CoinGecko's public lists join after a legal reading of their terms. DefiLlama icons and the 1inch token API are not used.

## Logo index

- The worker rebuilds the index daily from the lists, with `If-None-Match`, for tokens in the price index. A `logo: null` response enqueues `logo:{tokenId}`; the daily run covers the rest.
- Every list is validated against the `@uniswap/token-lists` schema before use.
- Stored logos are re-checked weekly. A miss is retried after 24 h, backing off to 7 days.

## Fetch guard

- `https` only, hosts from `instance.config.logos.allowHosts`; `ipfs://` only through the one configured gateway.
- DNS is resolved first; private, loopback, link-local and metadata ranges are rejected for A and AAAA; the connection goes to the checked IP; redirects are not followed.
- 5 s and 512 KB per fetch. The type comes from magic bytes, never from `Content-Type`.

## Processing and serving

- SVG with `<script>`, `<foreignObject>`, `<image>` or a non-fragment `href` is rejected; other SVG is rasterized under a timeout set in the M3.5 spike.
- sharp decodes with `limitInputPixels` 4096², `failOn: 'warning'`, first frame only.
- Output: square WebP at 64, 128 and 256 px, never upscaled, metadata stripped, named by SHA-256, stored in Postgres (`bytea`, `STORAGE EXTERNAL`).
- `GET /api/v1/logos/<hash>/<size>.webp` with `Cache-Control: public, max-age=31536000, immutable`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'`.
- Clients never load a third-party image URL.

## Clients

- `logo: null`: draw the [monogram](../glossary.md#data).
- The monogram is also the placeholder while a logo loads and when it fails: the web renders it server-side in a fixed-size box with the sized `<img>` on top and fades the image in with the `fast` token; native image loaders show it in both slots. No shimmer or animated placeholder ([libraries.dev audit](../research/agent-tools/libraries-dev-audit.md)).
- Every logo sits on a design-token backplate with a hairline ring, so one image works in light and dark.
- Alt text is empty when the symbol is shown next to the logo, and `<symbol> <name>` when the logo stands alone.
