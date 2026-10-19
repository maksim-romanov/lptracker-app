---
app: repo
topic: Data and analytics MCP servers
checked: 2026-10-01
---

# Data and analytics MCP servers

Which data MCP servers help contributors' agents research protocols, find pools and test wallets, debug discovery and cross-check our numbers. Also covers whether any of them could be a runtime source. All facts are for the hosted services as of 2026-10-01; none of them publish a versioned API for the MCP layer.

## Decisions

### Scope
- We list data MCP servers only as optional contributor tools for development and verification. None is ever in the request path or the worker. Every useful one needs a personal key, OAuth or per-call payment, which breaks the zero-paid-keys budget. CoinGecko and DEX Screener terms also forbid redistributing their API. [2][13][14][19][ADR 0032]
- We treat third-party numbers as evidence, never as expected values. Tests and golden snapshots come only from RPC cassettes, and a cross-check goes in the PR description. This follows the data rule ("the chain supplies every quantity") and ADR 0009. [ADR 0009]
- We don't check in a shared MCP config (`.mcp.json`). Contributors add servers in their user scope, because each server needs a personal key or OAuth. ADR 0024 keeps one vendor-neutral instruction source, and the docs only point to these tools. [1][9][ADR 0024]
- We never send a user's watched address (from a bug report, support thread or log) to a hosted MCP. Agents use test wallets from `voidx find-wallets` or public protocol wallets. Every server below runs remotely or calls a remote API, so the address leaves the machine. Dune does not document whether `is_private` defaults to private, so a query that contains an address may be public. [4][ADR 0040]

### Recommended (document as optional)
- **The Graph Subgraph MCP** is the first tool for debugging discovery. `get_top_subgraph_deployments` finds the subgraphs for a contract on a chain (e.g. which v4-subgraph deployment indexes a PositionManager). `get_schema_*` and `execute_query_*` run the same `owner_in` query the `subgraph-third-party` source sends. It is Apache-2.0 and maintained by GraphOps. Contributors use their own Gateway key, which is free up to 100k queries a month; never the instance key. [8][9][10][11][ADR 0008]
- **Dune MCP** (official, remote) is for maintainers who already pay for Dune. It lets them cross-check a position's collected fees from decoded `Collect` events, find wallets with V4 positions for cassettes, and size a protocol before a new-integration issue. It is not a contributor default: the free plan is view-only with no API, query endpoints need Analyst or above, and credits follow compute. [1][2][3]
- **Allium MCP** is the only server with a ready-made independent LP position view. Its DeFi positions API covers Uniswap V2/V3/V4 and PancakeSwap V3 on 21 chains, with tick range, unclaimed fees, amounts and `in_range`. It is the best second opinion on our owed-fee and amount math. It is pay-per-call (about $0.02–0.03, USDC over x402/MPP, no account) or OAuth/key. Use it only with test wallets. [25][26][27]
- **CoinGecko MCP**, the keyless remote at `mcp.api.coingecko.com/mcp`, is for sanity checks on prices and for finding pools and DEX pairs for a token. It needs no key, has shared rate limits, and its output stays in the chat, so attribution and redistribution terms do not bite. [13][14]

### Not recommended
- We skip community DefiLlama MCPs (dcSpark: 9 commits, 9 stars). DefiLlama's free API is keyless and documented, and an agent can call `/pools` and `coins` directly. DefiLlama ships no official MCP. [16][17]
- We skip Heurist Mesh. It is a credit-billed gateway over other providers (DexScreener, CoinGecko, GMGN, Zerion), which adds a hop that also sees wallet addresses, and it has no LP position data. [20][21][22]
- We skip DEX Screener MCPs. No official server exists; the API is keyless at 60 req/min, and its terms forbid making the API available to third parties. [18][19]
- We skip Bitquery: the trial lasts 7 days with 100 MCP credits, and the $39 plan is personal use only. We skip Nansen: every tool call costs credits, and labels and smart-money data don't serve LP math. [23][24][28]
- We skip GoldRush: `covalenthq/goldrush-mcp-server` was archived on 2026-02-24, while the docs still point to `npx @covalenthq/goldrush-mcp-server@latest`. [29][30]
- We skip Codex. Its official MCP (`docs.codex.io/mcp`) searches docs only. The data MCP (`Codex-Data/codex-mcp`, ISC, stdio) needs a key, and the free plan has 10k requests a month after a $1 signup fee. [31][32][33]
- We skip Moralis (no MCP found in current docs or under `MoralisWeb3`; plans start at $149/month) and Revert (no public position API documented). [34][36]

## Facts that constrain us

| Server | Maintainer, license | Transport | Auth, cost | Useful tools |
|---|---|---|---|---|
| Dune [1][2][5][6] | Dune, hosted | Streamable HTTP `api.dune.com/mcp/v1` | OAuth (PKCE) or `x-dune-api-key`; Analyst plan or above; trial 2,500 credits for 14 days; MPP pay-per-request without an account | 30 tools: `searchTablesByContractAddress`, `createDuneQuery`, `executeQueryById`, `getExecutionResults`, `getUsage` |
| Graph Subgraph MCP [9][10][11] | GraphOps, Apache-2.0 | SSE `subgraphs.mcp.thegraph.com/sse` via `mcp-remote`, or local stdio | `Bearer <Gateway key>`; 100k queries/month free, then $2 per 100k | `search_subgraphs_by_keyword`, `get_top_subgraph_deployments`, `get_schema_by_*`, `execute_query_by_*`, `get_deployment_30day_query_counts` |
| Allium [25][26][27] | Allium, hosted | `mcp.allium.so`; installer `npx @allium-labs/mcp install` | OAuth or Bearer key; or pay per call in USDC at `agents.allium.so` (3 req/s) | SQL explorer, realtime prices, balances, DeFi positions; selectable toolsets |
| CoinGecko [13][15] | CoinGecko, Apache-2.0 (in `coingecko-typescript`) | Remote `/mcp` or `/sse`; local `@coingecko/coingecko-mcp` | Keyless remote with shared limits; the Pro remote and the local package need a key | prices, markets, onchain pools and tokens |
| Bitquery [23] | Bitquery, hosted | `mcp.bitquery.io` | OAuth 2.1; trading MCP from $15/month | about 173 tools; trades, OHLC, transfers |
| Nansen [28] | Nansen, hosted | `mcp.nansen.ai/ra/mcp` | OAuth or key; credits per tool | labels, PnL, flows, DEX trades |
| Heurist [20][21] | heurist-network, MIT | `mesh.heurist.xyz/mcp/`, SSE or stdio | `X-HEURIST-API-KEY`; $1 = 100 credits | 30+ agents; Zerion wallet holdings |

- The Graph Token API docs now redirect to Pinax (`app.pinax.network`). It covers Ethereum, Base, Arbitrum One and Solana with JWT auth. We found no Token API MCP in the current Graph docs. [12]
- The Graph and Dune also ship agent skills (`duneanalytics/skills` with the `dune` CLI; Subgraph and Substreams skills). Uniswap ships `Uniswap/uniswap-ai` (MIT): skills for V4 hook development and swaps, not data. [5][8][35]
- Data freshness: Bitquery says "near real time"; Codex says under 1 s. Dune, Allium and the Graph MCP publish no freshness figure. Pin the block when you compare with our `readBlock`. [23][33]

## Open questions
- **Conflict check (ADR 0024):** does a documented MCP list belong in `AGENTS.md` (100-line cap), in `docs/workflow.md` or in a skill? ADR 0024 does not mention MCP servers. The owner should decide where it lives.
- **ADR 0009:** should `voidx find-wallets` use Dune or Allium (paid, needs a key) or stay RPC-only? An MCP-only path would make finding test wallets depend on paid accounts.
- **ADR 0040** covers the server's processing only. Should `AI_POLICY.md` or `CONTRIBUTING.md` carry the "no user addresses in hosted tools" rule? Today no doc states it.
- What does Dune's `is_private` default to on API-created queries, and on which plans? It is not documented. [4]
- Allium DeFi positions: freshness, how it treats hooks with bits 0–3, and whether "unclaimed fees" includes uncomputed pending growth. Check against a cassette before trusting a mismatch. [26]
- GoldRush: the archived repo and the live docs disagree. Is the npm package still maintained? [29][30]
- Not verified this pass (web search budget exhausted): Arkham MCP, community DEX Screener and Uniswap MCPs, Moralis MCP's current location, Heurist's last commit date, and the full tool list of CoinGecko's keyless remote MCP.

## Sources
1. Dune MCP — https://docs.dune.com/docs/agents/mcp.md
2. Dune pricing FAQ — https://docs.dune.com/learning/how-tos/pricing-faqs.md
3. Dune API billing — https://docs.dune.com/api-reference/overview/billing.md
4. Dune create query — https://docs.dune.com/api-reference/queries/endpoint/create.md
5. Dune CLI and skills — https://docs.dune.com/docs/agents/cli-and-skills.md
6. Dune MPP — https://docs.dune.com/docs/agents/mpp.md
7. kukapay/dune-analytics-mcp (MIT, 2 tools, stdio) — https://github.com/kukapay/dune-analytics-mcp
8. The Graph Subgraph MCP — https://thegraph.com/docs/en/subgraphs/tooling/subgraph-mcp/introduction/
9. Subgraph MCP for Claude — https://thegraph.com/docs/en/subgraphs/tooling/subgraph-mcp/claude/
10. graphops/subgraph-mcp — https://github.com/graphops/subgraph-mcp
11. Subgraph Studio pricing — https://thegraph.com/studio-pricing/
12. Pinax Token API — https://app.pinax.network/docs/api/
13. CoinGecko MCP server — https://docs.coingecko.com/docs/mcp-server
14. CoinGecko API terms — https://www.coingecko.com/en/api_terms
15. coingecko-typescript — https://github.com/coingecko/coingecko-typescript
16. DefiLlama API (free) — https://api-docs.defillama.com/llms-free.txt
17. dcSpark/mcp-server-defillama — https://github.com/dcSpark/mcp-server-defillama
18. DEX Screener API reference — https://docs.dexscreener.com/api/reference
19. DEX Screener API terms — https://docs.dexscreener.com/api/api-terms-and-conditions
20. heurist-mesh-mcp-server — https://github.com/heurist-network/heurist-mesh-mcp-server
21. Heurist Mesh MCP — https://docs.heurist.ai/heurist-mesh/mcp.md
22. Heurist credits — https://docs.heurist.ai/protocol-overview/credits.md
23. Bitquery MCP — https://docs.bitquery.io/docs/usecases/MCP/
24. Bitquery pricing — https://bitquery.io/pricing
25. Allium MCP — https://docs.allium.so/ai/mcp
26. Allium DeFi positions — https://docs.allium.so/api/developer/defi-positions/overview.md
27. Allium machine payments pricing — https://docs.allium.so/ai/machine-payments/endpoints-pricing.md
28. Nansen MCP — https://docs.nansen.ai/mcp/overview
29. covalenthq/goldrush-mcp-server — https://github.com/covalenthq/goldrush-mcp-server
30. GoldRush MCP docs — https://goldrush.dev/docs/goldrush-mcp-server
31. Codex docs MCP — https://docs.codex.io/agents/docs-mcp.md
32. Codex-Data/codex-mcp — https://github.com/Codex-Data/codex-mcp
33. Codex pricing — https://codex.io/pricing
34. Moralis pricing — https://docs.moralis.com/get-started/pricing.md
35. Uniswap/uniswap-ai — https://github.com/Uniswap/uniswap-ai
36. Revert docs — https://docs.revert.finance/
