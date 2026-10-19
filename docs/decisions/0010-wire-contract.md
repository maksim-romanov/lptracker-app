# 0010 · The wire contract

- Status: proposed
- Deciders: Maksim Romanov

## Context

Store apps stay installed for months and may talk to older self-hosted servers. A new family, chain or enum value must never break decoding in an old app.

## Options

- **OpenAPI 3.1 generated from Zod**, open types.
- **Spec-first (TypeSpec)** or **protobuf/Connect**: extra toolchain, poor fit for HTML responses.

## Decision

Chosen **OpenAPI 3.1 generated from Zod with `@hono/zod-openapi`**, committed as `packages/contracts/openapi.json`, because the API is described once in the code that validates it.

- Enumerations are open: `type: string` with `x-known-values`. Clients wrap them (Swift open enums via `anyOf`, Kotlin value classes). Extensions are opaque `{ type, version, data }` plus a display descriptor with `labelKey` and `label`.
- Ids use CAIP-2, CAIP-10 and CAIP-19 ([glossary](../glossary.md)). Watch entries are CAIP-10 per chain. A position ref includes the contract: `<caip2>/<protocolId>/<contract>:<tokenId>`, or `<lpToken>:<custody>` for LP tokens.
- A portfolio response carries `positions`, shared `pools` and `tokens` maps, and `scopes[]`.
- Guests read with `POST /api/v1/portfolio/query`, so addresses stay out of URLs and logs. HTTP caching does not apply to POST, so the body carries `knownVersion` and an unchanged answer is `{ notModified: true }`.
- `GET /api/v1/meta` reports versions, features and auth methods; `/api/v1/meta/chains` and `/api/v1/meta/protocols` serve metadata with ETags. `minClientVersion` is honoured only from the official instance.
- `/api/v1/stream` carries JSON invalidation events for API clients; the web uses `/stream` with HTML Turbo Streams ([0018](0018-web-ssr-hotwire.md)). Receivers re-fetch; native apps poll in the MVP.

## Consequences

- oasdiff blocks breaking changes, including new values in closed enums. `/api/v1` is served for at least 12 months after `/api/v2` ships.
- Swift and Kotlin clients are generated and committed; decode tests with unknown values run on every platform.
