# 0040 · Privacy of watched addresses

- Status: proposed
- Deciders: Maksim Romanov

## Context

Watch-only tracking means the server learns which addresses a person follows and can link them to an account, a device and an IP. Public addresses are easy to reverse from an unsalted hash.

## Decision

- Addresses in logs, metrics and Redis keys are an HMAC with an instance secret, never raw and never a plain hash.
- Guests' watchlists live in a signed cookie or on the device; the server stores nothing about guests beyond short-lived cache entries.
- Push payloads carry an opaque alert id; the app fetches details itself ([0014](0014-push-via-onesignal.md)). Guests are never registered with OneSignal; accounts opt in with consent.
- Billing providers (after the MVP) receive only the opaque account UUID: no addresses, no email ([0043](0043-plans-and-entitlements.md)).
- URLs that contain provider keys are redacted in logs and errors; `/healthz/deps` is not public.
- Retention follows [0035](0035-data-lifecycle.md).
- Account deletion is available in the app and on the web, as both stores require, and cascades to watchlists, devices, sessions, alert rules and events.
- The privacy notice states that RPC providers and The Graph see the addresses the server queries; self-hosting with one's own RPC is the privacy option ([0013](0013-official-and-self-hosted-instances.md)).
- Price and logo providers (Chainlink via RPC, DefiLlama, GeckoTerminal, CoinGecko and 1inch when configured, token lists and logo hosts) see only token ids the worker requests, never addresses or client IPs. Logos are served from our own origin ([prices and logos](../concepts/prices-and-logos.md)).
- The notice states that a user's own AI agent, through a future VoidX MCP server, sends what it reads to that user's AI provider ([0047](0047-agent-tools-and-mcp.md)).

## Consequences

- Support cannot look up a user by address in logs without the instance secret.
- Rotating the HMAC secret breaks correlation across the rotation, which is accepted.
