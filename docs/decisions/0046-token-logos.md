# 0046 · Token logos re-hosted from our origin, built from keyless lists

- Status: proposed
- Deciders: Maksim Romanov

## Context

Every token row needs a logo on four clients. Single providers cover only part of the long tail, third-party image URLs leak client IPs and token sets ([0040](0040-privacy.md)), and fetching arbitrary image URLs from the server is an SSRF and decoder risk. Research: [token-logos](../research/server/token-logos.md), [OSS building blocks](../research/server/prices-and-logos-oss.md).

## Options

- **A worker-built logo index from keyless lists, re-encoded and served from our origin**.
- **Hotlink upstream URLs**: no work, but leaks client data, breaks when hosts change, and serves unchecked SVG.
- **Probe providers per request** (the old `tokens-data` service): slow, and leaks token sets on every page load.

## Decision

Chosen **a worker-built index served from our origin**, because clients then contact only our server and every image is checked once.

- Sources are looked up by chain id and address, never by symbol, in the order in [prices and logos](../concepts/prices-and-logos.md#logo-sources); CoinGecko's lists join only after a legal reading of its terms.
- The worker is the only fetcher, behind the fetch guard. Requests read the index; a missing logo returns `logo: null` and queues a job.
- SVG is never served. Every image is re-encoded with sharp to WebP at 64, 128 and 256 px, named by its SHA-256, stored in Postgres and served with immutable caching.
- A logo never makes a token `default`; the unlisted badge shows either way.
- Clients draw a monogram when `logo` is null.

## Consequences

- No extra service for self-hosters: logos live in Postgres; an S3-compatible store can come later behind a `LogoStore` port.
- sharp ships LGPL libvips binaries, so it runs only in AGPL apps ([0016](0016-licensing-and-dco.md)).
- Logo fetches pass the fetch guard; the host allowlist is `instance.config.logos.allowHosts`, defaulting to a maintainer list ([0036](0036-integration-trust.md)).
- A new token shows a monogram until its queued logo job finishes.
