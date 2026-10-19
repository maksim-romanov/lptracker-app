---
app: server
topic: OSS building blocks for prices and logos
checked: 2026-10-01
---

# OSS building blocks for prices and logos

Which ready-made libraries and services the `PriceSource` port and the logo re-hosting described in [token-prices.md](token-prices.md) can reuse on Bun/TypeScript, and what we write ourselves. License rules come from [ADR 0016](../../decisions/0016-licensing-and-dco.md): only MIT/Apache in MIT packages, no GPL or BUSL in MIT packages. [ADR 0036](../../decisions/0036-integration-trust.md) governs outbound URLs.

## Decisions

### Prices
- We write our own thin DefiLlama coins client (`fetch` plus a schema-validated response) because there is no maintained, licensed client. `@defillama/sdk` 5.0.236 has no license field, pulls in ethers, axios, the AWS S3 client and Elasticsearch, and is a toolkit for writing adapters, not a coins API client. [1][2]
- We don't plan to self-host a DefiLlama price server, because `DefiLlama/defillama-server` returns 404 and its public "server" repositories (yield, pegged assets, bridges, and so on) contain no coins service. [3][4]
- We read Chainlink feeds with viem 2.57.1 (MIT) `readContract`/`multicall` and a hand-written `as const` ABI of `latestRoundData`, `getRoundData`, `decimals` and `description`. We never import `@chainlink/contracts`, because its 1.5.0 package is BUSL-1.1, and ADR 0016 treats ABIs as facts, not code. [5][6]
- We port the pool price math (`sqrtPriceX96` to price, tick to price, `FullMath`) per file from MIT sources with SPDX headers, as ADR 0016 already requires. `@uniswap/v3-sdk` 3.31.5 and `@uniswap/v4-sdk` 2.4.1 are MIT, but both depend on `@uniswap/v3-periphery` 1.4.4, which is GPL-2.0-or-later, and they also pull in ethers v5 and jsbi. [7][8][9][10]
- `@uniswap/sdk-core` 7.19.4 (MIT) has no GPL dependencies, but we still don't import it, because it brings ethers v5, big.js and jsbi only for `Token`/`Price` classes that we model with bigint. [11]
- We use `@uniswap/token-lists` 1.0.0-beta.35 (MIT, no runtime dependencies) for the schema and types, and `ajv` 8.20.0 (MIT) to validate every fetched list, as the token-lists README recommends. [12][13][14]
- We don't adopt a "price oracle aggregator" library. We found none that is maintained and licensed to fit, and the median, bounds and fallback logic from token-prices.md is small and specific to us. We write it ourselves in the MIT `packages/core`.

### Images
- We decode, resize and re-encode logos with `sharp` in the AGPL `apps/server` (or the worker), because sharp is Apache-2.0, supports Bun through Node-API v9 (`bun add sharp`), and strips all metadata on output by default. Its prebuilt libvips binaries are LGPL-3.0, so sharp stays out of MIT packages. [15][16][17]
- We keep sharp's safety defaults: `limitInputPixels` 268402689 (we set it lower), `failOn: 'warning'` and `unlimited: false`, because the docs recommend the `'warning'` level for untrusted input. We decode only the first frame. [18]
- We rasterize SVG logos to PNG or WebP and never serve SVG, so an SVG can never run script on our origin. sharp's libvips `svgload` uses librsvg and blocks SVGs over 10 MB by default, so we need neither `@resvg/resvg-js` nor DOMPurify. [19][15]
- We skip `@resvg/resvg-js` (MPL-2.0), because its latest stable is 2.6.2 from 2024-03-26 and 2.7.0 has stayed alpha since 2025-01. [20][21]
- We skip DOMPurify 3.4.16 (MPL-2.0 OR Apache-2.0) on the server, because rasterizing makes it unnecessary and on Bun it would need a DOM such as jsdom or happy-dom. [22]
- We don't run imgproxy (Apache-2.0) or thumbor (MIT) by default. Logos are a few hundred small files that the worker processes once, so a separate image service is an extra container with no benefit. imgproxy stays an option for operators, since it has signed URLs and checks dimensions before decoding. [23][24]
- We return `logo: null` for tokens without a logo and let the clients draw a fallback (initials on a colour derived from the chain and address), because every fallback library we checked fits badly. `boring-avatars` 2.0.4 (MIT) needs React. `jdenticon` 3.3.0 (MIT) makes identicons, not token marks. `ethereum-blockies-base64` 1.0.2 (MIT) has not been updated since 2018. [25][26][27]
- We ship no placeholder hashes in the MVP. If we add them later, we use `thumbhash` 0.1.1 (MIT) rather than `blurhash` 2.0.5 (MIT), because most logos are transparent and only ThumbHash encodes alpha. [28][29][30]

### Storage and serving
- We store logo bytes in Postgres `bytea`, keyed by the sha256 of the output bytes, with `STORAGE EXTERNAL`. A 64–256 px WebP is a few KB, well under the 1 GB field limit. TOAST would otherwise try to compress data that is already compressed, and a self-hoster needs no extra service. [31]
- We serve logos at `/api/v1/logos/<sha256>.<ext>` with `Cache-Control: public, max-age=31536000, immutable` and an ETag equal to the hash. Token responses carry the hashed URL, so a changed logo gets a new URL. The token-to-logo mapping is served with a short `max-age` and `stale-while-revalidate`. [32]
- We keep an S3-compatible backend as an optional later adapter, behind the same `LogoStore` port, using Bun's built-in `Bun.S3Client`, which supports R2, MinIO, Backblaze B2 and others. [33]
- We never make MinIO a documented default: the repository was archived on 2026-04-25 and the community edition ships as source only. For operators we name SeaweedFS (Apache-2.0), RustFS (Apache-2.0) or Garage (AGPLv3). Garage has no S3 ACLs, so we serve through our own origin, not public buckets. [34][35][36][37][38]

## Facts that constrain us
- sharp 0.35.5 (2026-09-27) reads JPEG, PNG, WebP, AVIF, TIFF, GIF and SVG; it needs a runtime with Node-API v9 (Node ≥ 20.9.0, Deno, Bun). [15][16]
- libvips 8.18 `svgload` renders with librsvg. The docs say nothing about how it handles external references (`<image href>`, `xlink:href`). [19]
- `@chainlink/contracts` 1.5.0 is BUSL-1.1 at the package level and depends on nitro, OpenZeppelin and several L2 contract packages. [5]
- Both Uniswap SDKs pull in `@uniswap/v3-periphery` (GPL-2.0-or-later) at runtime. [7][8][10]
- Postgres 18 moves a value out of line once a row exceeds about 2 kB, compressing first under the default `EXTENDED` strategy. [31]

## Open questions
- **Conflict (ADR 0036):** its https allowlist and private-IP block cover chain-file URLs only. Token-list `logoURI`s point to many hosts (CoinGecko CDNs, raw GitHub, `ipfs://`). Should the same allowlist and connect-time IP block apply to logo fetches, and which IPFS gateway goes on the list?
- **Conflict (ADR 0016):** its CI check fails on GPL/BUSL dependencies in MIT packages, but says nothing about LGPL native binaries (sharp's libvips) in AGPL apps. We believe they are compatible; the owner should confirm, and `reuse lint` or the license checker needs an allowance for it.
- Does librsvg as bundled in sharp's prebuilt libvips fetch or read external resources when given a buffer? A spike should feed it SVGs with `http://`, `file://` and `data:` references before we accept SVG input.
- Is the DefiLlama coins server source public anywhere (renamed or moved)? The 404 may mean it went private; ask DefiLlama.
- Web search budget was exhausted this pass. Not checked: other DefiLlama TS clients on npm, Chainlink feed-registry helper packages, the SeaweedFS, RustFS and Garage release cadence, and whether Bun's S3 client handles Garage's signature v4 without ACLs.

## Sources
1. npm, @defillama/sdk — https://registry.npmjs.org/@defillama/sdk/latest
2. DefiLlama SDK repo — https://github.com/DefiLlama/defillama-sdk
3. DefiLlama server repo (404 on 2026-10-01) — https://github.com/DefiLlama/defillama-server
4. DefiLlama repositories matching "server" — https://github.com/orgs/DefiLlama/repositories?q=server
5. npm, @chainlink/contracts — https://registry.npmjs.org/@chainlink/contracts/latest
6. npm, viem — https://registry.npmjs.org/viem/latest
7. npm, @uniswap/v3-sdk — https://registry.npmjs.org/@uniswap/v3-sdk/latest
8. npm, @uniswap/v4-sdk — https://registry.npmjs.org/@uniswap/v4-sdk/latest
9. ADR 0016 — ../../decisions/0016-licensing-and-dco.md
10. npm, @uniswap/v3-periphery — https://registry.npmjs.org/@uniswap/v3-periphery/latest
11. npm, @uniswap/sdk-core — https://registry.npmjs.org/@uniswap/sdk-core/latest
12. npm, @uniswap/token-lists — https://registry.npmjs.org/@uniswap/token-lists/latest
13. Uniswap token-lists README — https://github.com/Uniswap/token-lists
14. npm, ajv — https://registry.npmjs.org/ajv/latest
15. sharp installation — https://sharp.pixelplumbing.com/install
16. sharp repo — https://github.com/lovell/sharp
17. sharp output options — https://sharp.pixelplumbing.com/api-output
18. sharp constructor options — https://sharp.pixelplumbing.com/api-constructor
19. libvips svgload — https://www.libvips.org/API/current/ctor.Image.svgload.html
20. npm, @resvg/resvg-js — https://registry.npmjs.org/@resvg/resvg-js/latest
21. resvg-js releases — https://github.com/thx/resvg-js/releases
22. npm, dompurify — https://registry.npmjs.org/dompurify/latest
23. imgproxy — https://github.com/imgproxy/imgproxy
24. thumbor — https://github.com/thumbor/thumbor
25. npm, boring-avatars — https://registry.npmjs.org/boring-avatars/latest
26. npm, jdenticon — https://registry.npmjs.org/jdenticon/latest
27. npm, ethereum-blockies-base64 — https://registry.npmjs.org/ethereum-blockies-base64/latest
28. npm, thumbhash — https://registry.npmjs.org/thumbhash/latest
29. ThumbHash — https://evanw.github.io/thumbhash/
30. npm, blurhash — https://registry.npmjs.org/blurhash/latest
31. PostgreSQL 18, TOAST — https://www.postgresql.org/docs/current/storage-toast.html
32. MDN, Cache-Control — https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
33. Bun S3 — https://bun.com/docs/runtime/s3
34. MinIO repo — https://github.com/minio/minio
35. SeaweedFS — https://github.com/seaweedfs/seaweedfs
36. RustFS — https://github.com/rustfs/rustfs
37. Garage repo — https://github.com/deuxfleurs-org/garage
38. Garage S3 compatibility — https://garagehq.deuxfleurs.fr/documentation/reference-manual/s3-compatibility/
