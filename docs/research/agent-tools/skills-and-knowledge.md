---
app: repo
topic: Web3 agent skills and knowledge packs
checked: 2026-10-01
---

# Web3 agent skills and knowledge packs

Ready-made skills, plugins, MCP servers and `llms.txt` indexes for coding agents, judged for VoidX: a read-only LP tracker (Uniswap V3/V4, EVM, Bun/TS, viem) that ships its own `.agents/skills` and subagents ([ADR 0024](../../decisions/0024-agent-setup-and-ai-policy.md), [Claude Code setup](../claude-code/setup-notes.md)).

## Decisions

- We vendor nothing into `.agents/skills/` for now. The candidates either target writing contracts, swaps or trading, which VoidX does not do, or carry a license that conflicts with the MIT annotation on `.agents/**` in `REUSE.toml`. [2][7][8][9]
- We never commit a third-party plugin marketplace or remote MCP server to project config (`.claude/settings.json`, `.mcp.json`). Remote skill text changes without review, and ETHSKILLS tells agents to fetch more remote `SKILL.md` files and POST feedback without asking. Contributors may install these for themselves. [1][3]
- We point agents at official `llms.txt` indexes in `research-app` and `integrations/AGENTS.md`: viem, Uniswap developers, Foundry (`llms.txt`, `llms-full.txt`, per-page `.md`), ethereum.org developer docs. They are maintained by the projects themselves and contain no instructions to the agent. [4][5][6][12]
- We list Context7 as an optional docs MCP for contributors, not a project dependency. It indexes viem and the Uniswap repos, but its entries carry no version, so a fact still needs the official page or source as its citation. [10][11]
- We accept no contract address from a knowledge pack. ETHSKILLS `addresses` lists Uniswap V2–V4 per chain, last fully verified 2026-03-03. Our rule requires a source URL that contains the address, so the official deployment page is the source. [13]
- The `protocol-reviewer` agent references Uniswap's `v4-security-foundations` permission-flag risk matrix (MIT, v1.1.0) as a cross-check for hook risk. It does not override the hook-bit rules in [Uniswap audit notes](../uniswap/audit-notes.md), and it does not cover how a hook changes LP fee accrual. [14]
- The token spam and decimals rules cite Trail of Bits' `token-integration-analyzer` weird-ERC20 list (bytes32 symbols, decimals from 2 to 24, rebasing, fee-on-transfer, several addresses for one asset) as a reference. We restate it in our own words and copy no text, because the license is CC-BY-SA-4.0. [8][15]
- A new `add-protocol` skill borrows these patterns:
  - a promptfoo eval suite per skill, gated in CI, with a version bump on every skill change (Uniswap AI) [16];
  - "never hallucinate a contract address": an agent checks each address with `eth_getCode` plus a known view call (ETHSKILLS) [13];
  - `allowed-tools` limited to what the step needs. Uniswap's `liquidity-planner` grants `curl`, `cast`, WebSearch and WebFetch, which an integration skill must not have [3].
  It writes `TODO` and stops on an unknown address or start block, as `AGENTS.md` requires.

## Facts that constrain us

| Pack | Maintainer | License | Fresh (last seen) | Fit for VoidX |
|---|---|---|---|---|
| ETHSKILLS (`ethskills.com`, `austintgriffith/ethskills`) | Austin Griffith | MIT | commit 2026-08-20 | General Ethereum knowledge; static markdown served from a URL; 24+ skills [1][2] |
| Uniswap AI (`Uniswap/uniswap-ai`) | Uniswap Labs | MIT | commit 2026-09-29 | Swaps, hooks, CCA, LP *creation* deep links; no position reading or fee math [3][7][16] |
| OpenZeppelin skills | OpenZeppelin | AGPL-3.0 | active | Contract setup, upgrades and review; not for our code [9] |
| OpenZeppelin Contracts MCP | OpenZeppelin | repo has LICENSE + NOTICE | active | Generates contracts only; hosted at `mcp.openzeppelin.com` [17] |
| Cyfrin `solskill` | Cyfrin (Patrick Collins) | AGPL-3.0 | active | Solidity and Foundry standards plus BattleChain; not for our code [18] |
| Trail of Bits `skills` | Trail of Bits | CC-BY-SA-4.0 | active, 7.3k stars | `building-secure-contracts` (11 skills), `entry-point-analyzer`, `differential-review` [8] |
| Chainlink agent skills | Chainlink Labs org, "community examples, not a product" | MIT | active | CRE, CCIP, Data Feeds, VRF; none relevant now [19] |
| thirdweb MCP | thirdweb | n/a (hosted) | — | Secret key in the URL, write tools (wallets, transactions); out of scope [20] |

- Uniswap AI plugins: `uniswap-trading` (`swap-integration`, `pay-with-any-token`), `uniswap-hooks` (`v4-hook-generator`, `v4-security-foundations`), `uniswap-driver` (`liquidity-planner`, `swap-planner`), `uniswap-viem` (`viem-integration`), `uniswap-trading-tools`, `uniswap-cca`, `uniswap-permissioned-pools`. Installed with `npx skills add Uniswap/uniswap-ai` or `/plugin marketplace add uniswap/uniswap-ai`. [7][16]
- `liquidity-planner` v0.2.0 calls DexScreener and DefiLlama at runtime and finds token addresses by web search. [3]
- `viem-integration` covers clients, `readContract` and wagmi, and pins no viem version. It says nothing about `getLogs` block ranges or multicall limits, which is exactly what our worker needs. [21]
- ETHSKILLS `indexing` says to use an indexer instead of scanning blocks and limits direct `getLogs` to roughly the last 10K blocks. It also gives Multicall3 at `0xcA11…CA11` on 50+ chains. [22]
- The ETHSKILLS root skill sets a house style ("say 'onchain' not 'on-chain'"). [1]
- Trail of Bits `building-secure-contracts` scanners cover Algorand, Cairo, Cosmos, Solana, Substrate and TON. They do not cover EVM; EVM help comes from the guideline assistants. [15]
- Context7 has `/wevm/viem` (7,314 snippets, updated mid-September 2026), `/uniswap/docs`, `/websites/developers_uniswap`, `/uniswap/sdks`, `/uniswap/v4-core`, `/uniswap/v3-periphery` and `/openzeppelin/uniswap-hooks`, all without versions. [10][11]
- `docs.uniswap.org/llms.txt` redirects (301) to `developers.uniswap.org/llms.txt`, which lists the V3/V4 collect-fees and calculate-LP-fees guides. [5]
- The Foundry docs MCP is at `https://www.getfoundry.sh/api/mcp` and offers `search_docs` and `submit_feedback`. [6]
- `awesome-claude-skills` (ComposioHQ) has no web3 section. The crypto entries in `awesome-mcp-servers` are mostly pay-per-call x402 aggregators. The official Anthropic plugin marketplace shows no web3 plugins. None of the three adds anything usable. [23][24][25]
- Vendoring: an MIT source can live in `.agents/` with a REUSE `override` annotation that names the upstream copyright. AGPL and CC-BY-SA sources cannot sit under the MIT annotation on `.agents/**`. [26]

## Conflicts to flag (not resolved here)

- The ETHSKILLS `indexing` advice ("don't loop through blocks", getLogs for about 10K blocks only) differs from our `rpc-logs` keyless fallback and `rpc-enumeration` discovery in [Uniswap audit notes](../uniswap/audit-notes.md). An agent that loads ETHSKILLS may push toward subgraph-only discovery. [22]
- ETHSKILLS says "onchain"; our glossary and agents write "on chain". [1]

## Open questions

- Does Cyfrin ship a Solodit or Aderyn MCP or skill that is useful for reviewing our adapters? Search budget ran out before this was settled.
- Is there an Ethereum Foundation agent pack beyond `ethereum.org/developers/docs/llms.txt` and the bug-bounty `llms.txt`?
- Should `protocol-reviewer` get a hook-fee-accrual checklist of its own, since `v4-security-foundations` leaves that out?
- Do we pin Context7 library IDs in docs, or only the official URLs?

## Sources

1. ETHSKILLS root skill — https://ethskills.com/SKILL.md
2. austintgriffith/ethskills — https://github.com/austintgriffith/ethskills
3. Uniswap AI liquidity-planner SKILL.md — https://github.com/Uniswap/uniswap-ai/blob/main/packages/plugins/uniswap-driver/skills/liquidity-planner/SKILL.md
4. viem llms.txt — https://viem.sh/llms.txt
5. Uniswap developers llms.txt — https://developers.uniswap.org/llms.txt
6. Foundry docs for agents — https://getfoundry.sh/introduction/agents
7. Uniswap/uniswap-ai — https://github.com/Uniswap/uniswap-ai
8. trailofbits/skills (LICENSE: CC-BY-SA-4.0) — https://github.com/trailofbits/skills
9. OpenZeppelin/openzeppelin-skills — https://github.com/OpenZeppelin/openzeppelin-skills
10. Context7 viem — https://context7.com/wevm/viem
11. Context7 search "uniswap" — https://context7.com/api/v1/search?query=uniswap
12. ethereum.org llms.txt — https://ethereum.org/llms.txt
13. ETHSKILLS addresses — https://ethskills.com/addresses/SKILL.md
14. Uniswap AI v4-security-foundations — https://github.com/Uniswap/uniswap-ai/blob/main/packages/plugins/uniswap-hooks/skills/v4-security-foundations/SKILL.md
15. Trail of Bits building-secure-contracts plugin — https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts
16. Uniswap AI overview (evals, CI) — https://github.com/Uniswap/uniswap-ai/blob/main/docs/OVERVIEW.md
17. OpenZeppelin Contracts MCP — https://github.com/OpenZeppelin/contracts-wizard/tree/master/packages/mcp
18. Cyfrin/solskill — https://github.com/Cyfrin/solskill
19. smartcontractkit/chainlink-agent-skills — https://github.com/smartcontractkit/chainlink-agent-skills
20. thirdweb MCP — https://portal.thirdweb.com/ai/mcp
21. Uniswap AI viem-integration — https://github.com/Uniswap/uniswap-ai/blob/main/packages/plugins/uniswap-viem/skills/viem-integration/SKILL.md
22. ETHSKILLS indexing — https://ethskills.com/indexing/SKILL.md
23. ComposioHQ/awesome-claude-skills — https://github.com/ComposioHQ/awesome-claude-skills
24. punkpeye/awesome-mcp-servers — https://github.com/punkpeye/awesome-mcp-servers
25. anthropics/claude-plugins-official — https://github.com/anthropics/claude-plugins-official
26. VoidX REUSE.toml — ../../../REUSE.toml
