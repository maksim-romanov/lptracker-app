# Roadmap

Every milestone in the table is in the MVP; this is the order. The web proves the architecture first. The native apps start in parallel on a mock API generated from the contract. Every app, and every area of one not yet researched, starts with the [research gate](workflow.md#research-gate).

| Milestone | Server and web | Apps | Operations |
|---|---|---|---|
| **M0 · Skeleton** | Repo, mise, Turborepo tasks `codegen typecheck lint test check`, dependency-cruiser, `core` ports, draft `contracts` and `openapi.json`, manifest JSON schemas | Tuist and Gradle skeletons, design-token pipeline, UI kit v0, E2E harness (Maestro) on the mock API | `.claude/` setup, CI on pull requests |
| **M1 · Thin slice** | `uniswap-v3` on Ethereum and Arbitrum: RPC enumeration, token amounts and owed fees, Redis cache, SSR page with cached scopes and lazy frames for misses, one failed scope shown next to the other. Kit: scaffold, record and replay, bronze checks, draft `add-protocol` skill | Portfolio screen (Cards and Rows) on mock data; UI kit: Ghost card, range bar, status chip ([0055](decisions/0055-ghost-design-language.md)) | Deploy pipeline, Postgres backups with a restore test |
| **M2 · Architecture test** | Base and Optimism as chain files only (Base has its own position manager address); `uniswap-v4` as the second family (third-party subgraph plus `rpc-logs`, hooks, native ETH). The diff stays in `integrations/`, with zero core changes | Render an unknown family from the display descriptor; golden decode tests | ADRs move from `proposed` to `accepted` |
| **M3 · Full data scope** | Both families on all four chains; silver and gold tiers; PR bot | Position detail (Drawer on Cards, Spotlight on Rows, bottom sheet on phones) and range view | |
| **M3.5 · USD** | Worker job queue and scheduler for price and logo jobs; price sources and logo pipeline; USD values, partial totals, re-hosted logos ([prices and logos](concepts/prices-and-logos.md)) | USD values, unpriced and monogram states | Price source cost metering |
| **M4 · Contract and accounts** | Freeze the domain ([ADR 0044](decisions/0044-domain-as-configuration.md)) and `/api/v1` with oasdiff, `/api/v1/meta`, passkeys, watchlist sync; plans, wallet limits and manual Pro grants; signed-in reads live like guest reads | iOS and Android on the real API; sign-in | SLOs and alerts |
| **M5 · Background** | Watch targets, stored snapshots, range alerts through OneSignal, early-warning alerts for Pro | Push handling (not macOS), alert settings | External API budget alerts and brownout |
| **M6 · Breadth** | Self-hosting guide, lite mode, push relay design | Widgets, iPadOS and macOS polish | |

M2 is the test of the integration promise: if `uniswap-v4` needs a core change, the abstraction is fixed before M3.

## After the MVP: personalisation

A setting for the colour scheme ([0055](decisions/0055-ghost-design-language.md)).

## After the MVP: payments

RevenueCat, Stripe Billing and web-only crypto passes become grant sources ([plans](concepts/plans-and-entitlements.md#billing-after-the-mvp)).

## After the MVP: Aero

Aerodrome and Velodrome merge into Aero. Once Aero is live: research gate on the deployed contracts, Sugar and rewards ([research/aero](research/aero/audit-notes.md)), then the `gauge` staking plugin and the Aero families.
