# Position model

What every client receives. The server derives every number; clients format them and nothing else ([ADR 0003](../decisions/0003-server-owns-protocol-logic.md), [ADR 0010](../decisions/0010-wire-contract.md)). Token amounts are exact; USD prices and values are estimates added in M3.5 ([ADR 0011](../decisions/0011-token-amounts-not-usd.md), [prices and logos](prices-and-logos.md)).

## Contract rules

- Enumerations are open: `type: string` with `x-known-values` in OpenAPI. Clients wrap them (Kotlin value classes, Swift open enums) and render unknown values with a generic fallback.
- Amounts are exact decimal strings already scaled by token decimals; the server never rounds. Clients format from the string, never through a fixed-precision number type.
- Identifiers follow the grammars in the [glossary](../glossary.md#identifiers).
- Adding a field is allowed; removing or renaming one needs `/api/v2`. oasdiff blocks breaking changes (*planned*).

## Portfolio response

| Field | Type | Notes |
|---|---|---|
| `positions` | `Position[]` | Empty positions hidden unless `include=empty` |
| `pools` | map of pool id → `Pool` | Shared, sent once |
| `tokens` | map of token id → `Token` | Shared, sent once |
| `prices` | map of token id → `Price` | Priced tokens only, plus stale prices with `status: stale`; `unpricedCount` counts missing and stale |
| `totals` | `{ all, byChain, byOwner }` of `Total` | `byChain` keyed by CAIP-2, `byOwner` by CAIP-10 |
| `scopes` | `Scope[]` | One per deployment asked |
| `planLimit` | `{ key, limit, usage }` | Present when a guest query exceeded the limit (*proposed*) |
| `version` | opaque string | Changes whenever the payload changes; echoed back as `knownVersion`. The only field named `version` |
| `asOf` | timestamp | |

- Guests read with `POST /api/v1/portfolio/query` so addresses stay out of URLs and logs. HTTP caching does not apply to POST: the client sends the last `version` as `knownVersion` and gets `{ notModified: true }` when nothing changed. A query with more addresses than the guest `wallets.max` is answered for the first `wallets.max` with a `planLimit` notice ([plans](plans-and-entitlements.md#enforcement)).
- Accounts read `GET /api/v1/portfolio` with `ETag`. The app, and on Android its refresh worker, read `/api/v1/portfolio/summary` the same two ways and hand it to widgets.

## Position

| Field | Type | Notes |
|---|---|---|
| `ref` | position ref | Stable forever; includes the contract address |
| `kind` | open string | `concentrated-lp`, `full-range-lp`; later `lending`, `vault-share` |
| `protocolId`, `chain` | string, CAIP-2 | |
| `owner` | CAIP-10 | The watch entry |
| `pool` | pool id | |
| `status` | open string | `active`; `empty` = zero liquidity, still held by the owner, may still have owed fees; `closed` = verification result `burned` or `moved` |
| `custody` | open string | `wallet`; later `v3-staker`, `gauge`, `masterchef` |
| `amounts` | `TokenAmount[]` | Principal and owed fees |
| `amountsConfidence` | `normal` \| `low` | `low` when a V4 hook can bypass the pool curve |
| `feeAccrual` | `{ mode, reason }` | `claimable`, `redirected`, `compounded`, `unknown` |
| `rewards` | `Reward[]` | Empty in the MVP |
| `value` | `Total` | Principal, owed fees and rewards in USD |
| `range` | `RangeView` or null | null only for full-range pool shares (v2-style); a V3 position at min/max tick keeps its range |
| `readBlock` | `{ number, hash }` | |
| `extension` | `{ type, schemaVersion, data }` | Opaque, owned by the family |
| `display` | display descriptor | How any client renders family details |

| Type | Fields |
|---|---|
| `TokenAmount` | `token`, `role` (`principal`, `owed`; open), `amount` (exact decimal string, never negative) |
| `Reward` | `token`, `amount`, `source` (the staking contract) |
| `RangeView` | `quote` token, `lower`, `upper`, `current` (pool price in quote), `inverted` (same, other orientation), `barPosition` 0..1, `status` (`in`, `below`, `above`) |
| `Pool` | `token0`, `token1` (ordered), `factory` (the pool's factory or manager contract), `tickSpacing`, `fee` (the current LP fee), `extension`, `display`. Family-only fields go in `extension` and `display`: `uniswap-v4` puts `poolId`, `hooks` and `dynamicFee` there (true when the key's `fee == 0x800000`; `fee` then comes from `StateView.getSlot0`). The shared fields fit every family, so M2 tests the shared model, not only discovery |
| `Token` | `symbol` (sanitized), `decimals` (from the chain's `decimals()`, cached per address; unknown if missing, never guessed), `logo` (`{ hash }` or null; clients load `/api/v1/logos/<hash>/<size>.webp`, size 64, 128 or 256), `class` (`default`, `non_default`, `blocked`; open), `flags` (`rebasing`, `feeOnTransfer`, `spam`) |
| `Price` | `usd` (exact decimal string), `source` (open: `chainlink`, `defillama`, `coingecko`, `oneinch`, `geckoterminal`, `dexscreener`, `pool`), `confidence` (`normal`, `low`), `asOf`, `status` (`fresh`, `stale`), `depegged` |
| `Total` | `valueUsd` (exact decimal string, priced parts only; null when nothing is priced), `partial`, `unpricedCount` |
| `Scope` | `deployment`, `status` (`ok`, `pending`, `failed`, `retired`, `not_configured`), `code` (open uppercase: `INDEX_STALE`, `INDEX_TRUNCATED`, `RPC_ERROR`, `TIMEOUT`, `NOT_CONFIGURED`, `KILLED`, `BUDGET_EXHAUSTED`), `truncated`, `indexBlock`, `readBlock`, `asOf` |

## Range rules

- `current` comes from `sqrtPriceX96`, not the rounded tick.
- In range means `tickLower ≤ tick < tickUpper`.
- `barPosition` is measured in tick space.
- The quote token is chosen by the server: a stablecoin, else WETH or native ETH, else `token0`.

## Tokens and spam

- `class` comes from curated token lists and the maintainer blocklist, never from what a token reports about itself or from having a logo. `default` needs agreement of several curated lists (count set in the M3.5 spike); `blocked` comes from the blocklist; everything else is `non_default`. Clients badge every non-`default` token with the unlisted badge.
- `spam` is a separate signal (a Trust Wallet `spam` or `abandoned` status, a symbol imitating a `default` token). It hides a token like `blocked` does.
- A position whose tokens are both non-`default` is hidden behind a client toggle; anyone can mint a position to any address.
- Only `default` tokens are priced; a stale price stays in `prices` with `status: stale` and is left out of totals ([prices and logos](prices-and-logos.md#values-and-totals)).
- Symbols are sanitized: control characters, zero-width characters, URLs and homoglyph tricks are removed; `bytes32` symbols are decoded.
- Native ETH (V4 `currency = address(0)`) is `eip155:<id>/slip44:60` with 18 decimals and is never merged with WETH; an ETH pool and a WETH pool are different pools.

## Limits

A scope returns at most the [per-scope cap](providers-and-cache.md#request-budget) of positions; beyond that `truncated` is true. Empty positions are hidden unless the request sets `include=empty`.

Invariants, checked by the conformance suite (*planned*):

- `owed` amounts exist only when `feeAccrual.mode` is `claimable`.
- `status` is `closed` only from a `burned` or `moved` verification result.
- `range.lower ≤ range.upper`.
- `ref` is unique and stable across snapshots.
- Every `amount` is ≥ 0.
- Fees are counted once: principal comes from liquidity only and never includes `tokensOwed`; `owed` holds fees and withdrawn principal not yet collected.
- `liquidity == 0` ⇒ no `principal` amounts and `status` is `empty` or `closed`; `liquidity == 0` with every `owed` amount zero ⇒ hidden unless `include=empty` and not counted toward the display cap.
- Replaying the same cassettes gives a byte-identical response.
- A `Total` has `partial` true exactly when `unpricedCount > 0`; only `default` tokens with a `fresh` price add to `valueUsd`.

## Display descriptor

`details[]` of `{ key, labelKey, label, kind, value }` with `kind` an open string (`tokenAmount`, `percent`, `address`, `duration`, `text`; unknown kinds render as `text`), plus `badges[]` of `{ labelKey, label }`. Every client renders it, so a new family shows up with no app release. Clients translate by `labelKey` and fall back to `label`.

## Server metadata and stream

- `GET /api/v1/me` and the `plan-limit` problem: see [plans and entitlements](plans-and-entitlements.md#enforcement).
- `GET /api/v1/meta`: `apiVersion`, `serverVersion`, `minClientVersion` (enforced only from the official instance), `features[]`, auth methods, guest `wallets.max` (*proposed*). Clients gate UI on `features`.
- `GET /api/v1/meta/chains`, `GET /api/v1/meta/protocols`: runtime metadata with ETags; apps bundle a snapshot as fallback.
- `/api/v1/stream` (SSE, JSON): `position.changed { ref, readBlock }` with the readBlock number, `scope.updated { deployment }`, `resync`, heartbeat; monotonic ids for `Last-Event-ID`. Events are invalidation hints; the receiver re-fetches. Native apps poll in the MVP.
- The web page uses `/stream` instead: HTML Turbo Streams with the `reload-frame` action ([ADR 0018](../decisions/0018-web-ssr-hotwire.md)).
