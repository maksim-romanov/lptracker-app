---
app: server
topic: Token logos
checked: 2026-10-01
---

# Token logos

ERC-20 logos for Ethereum, Arbitrum, Base and Optimism, from several keyless providers with fallback, re-hosted by `server` for web, iOS and Android. This file extends the logo decision in [token-prices.md](token-prices.md) and replaces its two-source chain with the one below.

## Decisions

### Sources (all keyless, all keyed by `chainId` + address, never by symbol)
- We build a logo index in the worker from token lists, refreshed daily with `If-None-Match`, instead of probing providers per request. The old resolver called up to three hosts in sequence for each token on the request path, then redirected the client to the third-party URL. [29]
- Our order of precedence is:
  1. A maintainer override file in the repo (native ETH, WETH, tokens with broken upstream logos).
  2. The Uniswap Labs Default list, which is curated and covers chains 1, 10, 8453 and 42161. [1]
  3. The Superchain token list for Optimism and Base, whose logos live in the repo as `data/<SYMBOL>/logo.svg`. [4][5]
  4. The CoinGecko per-platform lists at `tokens.coingecko.com/<platform>/all.json`: keyless, 1,000+ tokens per chain, refreshed on 2026-09-30. [7]
  5. SmolDapp tokenAssets at `assets.smold.app/token/<chainId>/<lowercase address>/logo-128.png`: MIT, keyless and active (commits on 2026-09-30). [14][15]
  6. Trust Wallet at `blockchains/<ethereum|arbitrum|base|optimism>/assets/<EIP-55 checksum>/logo.png`. [9][10]
- We use LiFi `GET /v1/tokens?chains=<id>` as the long-tail source, last in order. It needs no key (100 req/min), and one call per chain per day stays far below that limit. Its `logoURI`s point to arbitrary hosts (DeBank, IPFS, project domains), so they go through the full fetch guard below. [16][17][18]
- We read Trust Wallet per asset, not from its per-chain `tokenlist.json`, because the Base list is from 2024 and holds 8 tokens. [13]
- We skip a Trust Wallet asset whose `info.json` status is `spam` or `abandoned`, and we treat those statuses as a spam signal for the token. The repo is actively marking fakes such as "FAKE USDC" and "FAKE U5DT". [10][12]
- We don't use DefiLlama icons (`icons.llamao.fi`). It has no documented API and no license file, and it only re-serves Uniswap, Sushi, 1inch and CoinGecko data we already read. [21]
- We don't use the 1inch Token API. Its docs sit behind the business portal, the old `tokens.1inch.io/<address>.png` URL has no chain in it (the old code's bug), and the keyless `tokens.1inch.io/v1.2/<chainId>` answers but is undocumented legacy. [19][20][29]
- We don't use the paid CoinGecko `/token_lists/{platform}/all.json`, because it needs a Pro key. The public lists in step 4 are the same format. [6]

### Fetch guard (the worker is the only fetcher)
- We fetch only `https` (plus `ipfs://` through one configured gateway), only from a host allowlist in config, with DNS resolved first. We reject private, loopback, link-local and metadata ranges for both A and AAAA records, connect to the validated IP, and follow no redirects, as the OWASP SSRF sheet advises. This matches ADR 0036 for chain-file URLs. [22][ADR 0036]
- We limit each fetch to 5 s and a 512 KB body, aborting the stream when the limit is hit. We decide the type from magic bytes (PNG, JPEG, WebP, GIF, SVG) and ignore the upstream `Content-Type`.
- We never serve SVG. We reject an SVG that holds `<script>`, `<foreignObject>`, `<image>` or any non-fragment `href`, which is SmolDapp's own acceptance rule, then rasterise it with sharp. librsvg blocks network access and external entities but sets no CPU or memory limit, so rasterising runs under a timeout. [14][23][24]
- We decode with sharp `limitInputPixels` of 4096² and the default `failOn: 'warning'`, and we keep only the first frame of an animated image. We never set `unlimited`. [23]

### Output and serving
- We re-encode every logo to square WebP at 64, 128 and 256 px (never upscaled past the source), strip metadata, and store it under the SHA-256 of the output. WebP decodes natively on iOS 14+, Safari 16+ and Android API 17+. We skip AVIF because Android supports it only from API 31 and the icons are a few KB anyway. [25][26][27]
- We serve `/v1/logos/<hash>/<size>.webp` from our origin with `Cache-Control: public, max-age=31536000, immutable`, `Content-Type: image/webp`, `X-Content-Type-Options: nosniff` and `Content-Security-Policy: default-src 'none'`. Clients never contact third-party logo hosts, which keeps client IPs and token sets private. [ADR 0040]
- The request path only reads the index. A token without a stored logo returns `logo: null` and queues a worker job, so a snapshot never waits on a logo.
- We re-check sources for a stored logo weekly, and a new hash simply replaces the index entry. A miss is retried after 24 h, backing off to 7 days. The old cache kept a `null` for 24 h without backoff. [29]

### Missing logos, spam, dark mode, accessibility
- When `logo` is null, the client draws a monogram: up to 3 characters of the sanitised symbol on a colour chosen by the address hash from the design-token palette. It needs no server image, follows the theme, and gives two fakes with the same symbol different colours. [ADR 0027]
- We never pick a logo by symbol or name. Having a logo does not make a token `verified`, and clients show the unverified badge either way, because an address-keyed source can still carry a copied logo.
- We ship one logo for both themes. Trust Wallet requires logos that work on light and dark backgrounds, so clients draw a design-token backplate and hairline ring behind every logo. [10][ADR 0027]
- The alt text is empty when the symbol is shown next to the logo, and `"<symbol> <name>"` when the logo stands alone, because WAI says an image next to text that already conveys it takes `alt=""`. [28]

## Facts that constrain us
- Uniswap default list v22.21.0 (2026-09-23): most `logoURI`s are on `assets.coingecko.com` or `coin-images.coingecko.com`, some on `s2.coinmarketcap.com`, Trust Wallet raw GitHub and IPFS. The repo is GPL-3.0. The schema recommends 256×256 SVG or PNG and allows `ipfs://`. [1][2][3]
- The token-lists spec says list versions do not protect against malicious updates. [3]
- Trust Wallet (2026-10): the repo is MIT. Logos are `logo.png`, 256×256 recommended, 512×512 max and at most 100 kB. Folders must be checksummed; lowercase is invalid. Listing needs 10k holders and 15k transactions plus a fee, so brand-new tokens are missing. [9][10][11]
- SmolDapp (2026-10): files are `logo-32.png`, `logo-128.png` and `logo.svg`. SVGs are vector-only, under 150 KB, with no scripts, external links or raster images. EVM paths are lowercase. [14]
- LiFi (2026-10): the API key is optional and only raises limits. Unauthenticated non-quote endpoints allow 100 req/min. The token doc page lists `x-lifi-api-key` as a header, but the rate-limit page says it is optional. [16][17]
- CoinGecko terms §6.1–6.2 forbid storing data except a cache refreshed every 24 h, and §9 keeps all rights with CoinGecko. They do not say whether logos are "Data". [8]
- The 1inch keyless list for Base returned 300+ tokens with `logoURI`s on `tokens.1inch.io`, Trust Wallet, CoinGecko and `metadata.coinbase.com`. [20]

## Open questions
- **Conflict:** token-prices.md says "Uniswap first, then Trust Wallet". This file widens that to seven sources. The owner should confirm, and the prices file's logo bullet should then point here.
- **Conflict:** position-model's `Token.logoUrl` is a single URL. Three sizes need `logo: { hash } | null` or a URL template in the wire contract (ADR 0010).
- **Conflict:** ADR 0036 allowlists chain-file URLs only. The logo host allowlist needs its own home (ADR 0036 amendment or providers-and-cache.md). ADR 0015 and providers-and-cache.md have no logo cache layer.
- **Conflict:** ADR 0040's privacy notice. Logo hosts see the worker's token union but no addresses or client IPs. Does the notice need to list them?
- Does re-hosting logos from the public `tokens.coingecko.com` lists (no key, so the API terms may not bind) conflict with CoinGecko §6.2 or §9? The logos are the projects' marks, and Trust Wallet's MIT covers scripts, not marks. Needs a legal reading. Until then CoinGecko could drop below SmolDapp in the order.
- Is the Uniswap GPL-3.0 about the list data or only the build code? Using `logoURI` values as pointers seems fine, but that is unverified.
- Could we drop an unverified token's logo when its perceptual hash matches a verified token's logo at a different address (impersonation)? We need thresholds and cost first.
- Very dark or transparent logos: is the backplate alone enough, or should the worker measure luminance and store a hint?
- Not verified this pass (web search budget ran out): Zerion, Zapper, Rabby/DeBank (`static.debank.com` terms), Rainbow token metadata, Jumper beyond LiFi's `strapi.jumper.exchange` URLs, Dune, and the 1inch API key and free tier.
- The allowlist also has to cover LiFi's many hosts. Should we re-derive it from each day's list, or cap LiFi logos to known CDNs and fall through to the monogram?

## Sources
1. Uniswap Labs Default token list — https://tokens.uniswap.org/
2. Uniswap default-token-list licence — https://api.github.com/repos/Uniswap/default-token-list/license
3. Token lists spec and schema — https://github.com/Uniswap/token-lists
4. Superchain token list repo — https://github.com/ethereum-optimism/ethereum-optimism.github.io
5. Superchain token list — https://static.optimism.io/optimism.tokenlist.json
6. CoinGecko, Token lists (Pro) — https://docs.coingecko.com/reference/token-lists
7. CoinGecko public list, Base — https://tokens.coingecko.com/base/all.json
8. CoinGecko API terms — https://www.coingecko.com/en/api_terms
9. Trust Wallet assets — https://github.com/trustwallet/assets
10. Trust Wallet, repository details — https://developer.trustwallet.com/developer/new-asset/repository_details
11. Trust Wallet, listing requirements — https://developer.trustwallet.com/developer/new-asset/requirements.md
12. Trust Wallet assets commits — https://api.github.com/repos/trustwallet/assets/commits
13. Trust Wallet Base tokenlist.json — https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/tokenlist.json
14. SmolDapp tokenAssets README — https://github.com/SmolDapp/tokenAssets
15. SmolDapp tokenAssets commits — https://api.github.com/repos/SmolDapp/tokenAssets/commits
16. LI.FI, token endpoint — https://docs.li.fi/api-reference/fetch-information-about-a-token
17. LI.FI, rate limits — https://docs.li.fi/api-reference/rate-limits
18. LI.FI tokens, Base — https://li.quest/v1/tokens?chains=8453
19. 1inch Token API — https://business.1inch.com/portal/documentation/apis/tokens/introduction
20. 1inch legacy token list, Base — https://tokens.1inch.io/v1.2/8453
21. DefiLlama icons, token-list source — https://github.com/DefiLlama/icons/blob/v2/src/routes/token-list.ts
22. OWASP SSRF prevention cheat sheet — https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
23. sharp constructor options — https://sharp.pixelplumbing.com/api-constructor
24. librsvg security — https://gnome.pages.gitlab.gnome.org/librsvg/devel-docs/security.html
25. Can I use WebP — https://caniuse.com/webp
26. Can I use AVIF — https://caniuse.com/avif
27. Android, reduce image sizes — https://developer.android.com/develop/ui/views/graphics/reduce-image-sizes
28. W3C WAI, decorative images — https://www.w3.org/WAI/tutorials/images/decorative/
29. Old implementation — /Users/maksimromanov/code/personal/voidapp/apps/tokens-data/src/features/logos
