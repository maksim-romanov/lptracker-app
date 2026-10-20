# Glossary

One term per concept. Code identifiers, docs and UI copy use these words and no synonyms.

## Integrations

| Term | Meaning | Avoid |
|---|---|---|
| **Integration** | A family folder or a chain file: the unit a community PR adds. | plugin, connector |
| **Core** | `packages/core`: domain, ports, use cases. | |
| **Core packages** | `packages/core`, `packages/contracts`, `packages/infra`: what an integration PR never edits. | |
| **ProtocolAdapter** | The port a family implements; built with `defineProtocol` from `integration-kit`. | createXAdapter |
| **Family** | One adapter implementation shared by every protocol with the same contracts. MVP: `uniswap-v3`, `uniswap-v4`. Folder `integrations/protocols/<family>/`. | protocol type |
| **Protocol** (`protocolId`) | A user-facing brand of a family, e.g. `uniswap-v3`, later `aerodrome-cl`. | brand, dex |
| **Fork** | A family folder whose manifest has `extends: <family>`; no adapter code, optional `overrides`. | clone |
| **Deployment** | One protocol on one chain: contract role tuples with block ranges, index sources, staking plugin, status. | instance, market |
| **Chain** | A network described by `integrations/chains/<chain file>.json`. | network (in code) |
| **Manifest** | `manifest.json` of a family: identity, lifecycle, owners, dependencies, overrides, `kitApiVersion`. | |
| **Index source** | How position refs are found: `rpc-enumeration`, `rpc-logs`, `aggregator`, `subgraph-third-party`, `subgraph-own`. | indexer (for all of them) |
| **Staking plugin** | Reads staked custody, rewards and fee mode: `none` (MVP), `v3-staker` (planned), `gauge` (after the Aero launch), `masterchef` (planned). | farm adapter |
| **Lifecycle** | Maturity of a family: `development`, `alpha`, `beta`, `stable`, `unmaintained`, `deprecated`. See [state model](concepts/state-model.md). | |
| **Quality tier** | `bronze`, `silver`, `gold`, `platinum`; bronze is the merge gate. | level |
| **Cassette** | Recorded RPC or HTTP responses that CI replays instead of calling the network; folder `cassettes/`. | mock, fixture |
| **Agent checkpoint** | The plan an agent posts on an accepted *New integration* issue before any code; with the issue it is the spec ([add a protocol](guides/add-a-protocol.md#4-agent-checkpoint)). | |
| **Test wallet** | A known owner address whose positions a cassette records. | |
| **kitApiVersion** | Version of `integration-kit` a manifest targets. Not the wire `apiVersion`. | |

## Data

| Term | Meaning | Avoid |
|---|---|---|
| **Data rule** | The index finds positions; the chain supplies every quantity. See [data rule](concepts/data-rule.md). | |
| **PositionRef** | An identifier plus custody chain from an index source. Never carries quantities. | |
| **Sticky ref** | A ref from an earlier snapshot, kept and re-verified even when no index source returns it. | |
| **Verification result** | Outcome of checking a ref at readBlock: `verified`, `burned`, `moved`. An RPC error is not a result; it fails the scope. | |
| **Position** | The normalized shape every protocol reduces to; every number derived on the server. | |
| **Custody** | Who holds the position token: `wallet`, `v3-staker`, `gauge`, `masterchef`, … (open set). | |
| **Principal** | Tokens deposited in a position. | liquidity amounts |
| **Owed fees** | Swap fees earned and not yet collected. Present only when fee accrual is `claimable`. | unclaimed fees |
| **Reward** | Tokens a staked position earns, read on chain by the staking plugin. None in the MVP. | emissions (in code), incentives |
| **Fee accrual** | Where swap fees go: `claimable`, `redirected`, `compounded`, `unknown`. | |
| **amountsConfidence** | `normal` or `low`; `low` when a V4 hook can bypass the pool curve on swaps. | |
| **readPolicy** | Chain file field choosing the block tag reads use: `safe`, `finalized` or `latest`. | finality depth |
| **indexBlock** | The latest block an index source has processed. | |
| **readBlock** | The block, resolved once per snapshot from the pool's median head for the chain's `readPolicy` tag and pinned by hash (EIP-1898). | |
| **Scope** | The result of one deployment in one response, with a status. | partial failure |
| **Truncated** | Scope flag: more positions exist than the [per-scope cap](concepts/providers-and-cache.md#request-budget) returned. | |
| **Snapshot** | Positions for one (deployment, owner) at one readBlock. | |
| **Watch entry** | One address on one chain, CAIP-10. | |
| **Watch target** | An (address, deployment) pair the worker refreshes, derived from watchlists × enabled deployments. | subscription |
| **Watchlist** | The watch entries one account or guest follows. | portfolio (for the list of addresses) |
| **Wallet** | One address counted once across all EVM chains (each non-EVM namespace separately); the unit of plan limits. | |
| **Paused wallet** | A wallet above the current plan limit: read-only, not monitored, no alerts. | |
| **Portfolio** | All positions of a watchlist at a moment. | |
| **Epoch** | Per (alert rule, position) transition sequence number; part of the alert outbox key. | window |
| **Extension** | Opaque `{ type, version, data }` a family attaches to a position. | |
| **Journey** | A user path tested end to end; its id is the Maestro flow name, the Playwright tag and the native test name ([ADR 0048](decisions/0048-e2e-testing.md)). | scenario (that is a fixture name) |
| **Display descriptor** | Generic render instructions every client supports; labels carry `labelKey` for translation. | |
| **Price** | A token's USD price at a time, with its sources, `confidence` and age; an external estimate, never a chain quantity. See [prices and logos](concepts/prices-and-logos.md). | price feed (for our output) |
| **Price source** | One provider in the per-token fallback chain: `chainlink`, `defillama`, `coingecko`, `oneinch`, `geckoterminal`, `dexscreener`, `pool`. | oracle (for all of them) |
| **Confidence** | `normal` or `low` on a price; `low` for pool-derived prices and for sources that disagree or jump. | |
| **Stale price** | A price older than its maximum age; shown with its age, left out of totals. | |
| **Sequencer uptime feed** | The Chainlink feed an L2 price read checks first; a down or just-restarted sequencer makes the price stale. | |
| **Unpriced token** | A token with no usable price; shows its amount only, never `$0`. | zero-value token |
| **Total** | A USD sum over priced tokens with `partial` and `unpricedCount`; `partial: true` when any token is unpriced or stale. | |
| **Token class** | `default`, `non_default` or `blocked`; only `default` tokens are priced. Separate from the position verification result. | whitelist, blacklist |
| **Unlisted badge** | The client mark on a non-`default` token. | verified/unverified (for tokens) |
| **Spam flag** | A token or position flag set from list signals such as Trust Wallet `spam`; spam is hidden by default. | |
| **Logo** | A token image re-hosted from our origin as WebP, addressed by its hash (`logo: { hash }`); `null` when none. | icon (in code) |
| **Monogram** | The client-drawn fallback for `logo: null`: up to 3 symbol characters on a design-token palette colour picked by address hash, plus the chain badge. | |
| **Fetch guard** | The rules every worker fetch of a third-party URL passes: https, host allowlist, private IPs blocked, no redirects, size and time caps. | |

## Identifiers

| Id | Grammar | Example |
|---|---|---|
| Chain | CAIP-2 | `eip155:8453` |
| Chain file name | CAIP-2 with `:` replaced by `-` | `eip155-8453.json` |
| Watch entry | CAIP-10 | `eip155:8453:0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B` |
| Deployment | `<protocolId>@<caip2>` | `uniswap-v3@eip155:8453` |
| Deployment file name | `<protocolId>@<chain file name>` | `uniswap-v3@eip155-8453.json` |
| Token | CAIP-19 | `eip155:8453/erc20:0x4200000000000000000000000000000000000006` |
| Native token | CAIP-19 with SLIP-44; never merged with the wrapped token | `eip155:8453/slip44:60` |
| Pool | `<caip2>/<protocolId>/pool/<address>`; V4 uses the bytes32 `poolId` | `eip155:1/uniswap-v4/pool/0x21c6…` |
| Position ref, NFT | `<caip2>/<protocolId>/<contract>:<tokenId>` | `eip155:8453/uniswap-v3/0x03a520b3…:912345` |
| Position ref, LP token | `<caip2>/<protocolId>/<lpToken>:<custody>`, custody `wallet` or `gauge` | `eip155:8453/aerodrome/0x6cDc…:gauge` |

Position ids use characters `[A-Za-z0-9._:-]`. Addresses are opaque strings on the wire; EVM addresses are EIP-55 checksummed. An ENS name resolves once to an address (ENSIP-11 coin type per chain) and is kept only as a label.

## People

| Term | Meaning |
|---|---|
| **Owner** | Maksim Romanov; the only person who sets a spec or plan to `status: approved`. |
| **Maintainer** | A person with merge rights; listed in CODEOWNERS. |
| **Integration owner** | A person named in a manifest's `owners`; mentioned by a bot on changes, not a CODEOWNER. |
| **Position owner** | The watched address holding a position (`Position.owner`). |

## Product and hosting

| Term | Meaning |
|---|---|
| **Guest** | Someone using VoidX without an account; the watchlist lives on the device or in a signed cookie. |
| **Account** | A passkey-backed identity that syncs the watchlist and receives alerts. |
| **Plan** | Guest, Free or Pro: a set of default entitlement values. See [plans](concepts/plans-and-entitlements.md). |
| **Entitlement** | A key with a value an account may use, e.g. `wallets.max`; resolved on the server. |
| **Grant** | A record giving an account a plan or entitlement from a source (admin, trial, store, …) for a period. |
| **Depthly** | The brand; VoidX is its product. Owns the domain. |
| **Public origin** | The instance URL, `instance.config` `publicOrigin` ([ADR 0044](decisions/0044-domain-as-configuration.md)). |
| **RP ID** | The WebAuthn relying-party id passkeys bind to, `instance.config` `rpId` ([ADR 0044](decisions/0044-domain-as-configuration.md)). |
| **Official instance** | The publisher's server at the public origin: native passkeys, push through the publisher's OneSignal app, enforced `minClientVersion`. |
| **Self-hosted instance** | Any other server: sign-in from store apps through the system browser, no push until a relay exists. |
| **Lite mode** | Self-hosting without Redis ([roadmap](roadmap.md)). |
| **Research gate** | See [workflow](workflow.md#research-gate). |
| **Feature flag** | A switch defined in `flags/manifest.json` and evaluated through OpenFeature; `release.*` flags are temporary, `kill.*` and `ops.*` permanent. See [feature flags](concepts/feature-flags.md). |
| **Kill switch** | A permanent flag that turns off an integration, a deployment or a chain's sync without a deploy. |

## Design

| Term | Meaning | Avoid |
|---|---|---|
| **Ghost** | The design language: colour-block position cards on a native shell ([0055](decisions/0055-ghost-design-language.md)). | |
| **Scheme** | A set of colours for light and dark; the MVP default is Dragonfruit (light) and Neon Night (dark). | palette (in code), theme (for the colour set) |
| **Theme** | Light or dark. | mode |
| **Fill** | One of the four rotating card colours of a scheme. | |
| **Ink** | The text colour on a fill, picked by contrast. | |
| **Cards**, **Rows** | The two portfolio views; Cards is a wrapping grid. | list |
| **Drawer**, **Spotlight** | The web position-detail animations: Drawer for Cards, Spotlight for Rows ([0055](decisions/0055-ghost-design-language.md)). | |
