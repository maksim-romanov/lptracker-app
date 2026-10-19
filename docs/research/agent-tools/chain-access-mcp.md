---
app: repo
topic: Chain-access MCP servers and agent SDKs
checked: 2026-10-01
---

# Chain-access MCP servers and agent SDKs

Contributors use these tools to find addresses, start blocks, ABIs and verified sources, and to read state and events. Most "web3 MCP" servers are built for agents that trade, so they hold keys. VoidX only reads.

## Decisions
- We ship a project `.mcp.json` with one server, the Etherscan keyless endpoint `https://mcp-keyless.etherscan.io/mcp` (`"type": "http"`, no headers). It is read-only, needs no key, covers 60+ chains through `chainid`, and includes `get_contract_source`, `get_contract_abi`, `get_contract_creation` and `get_logs`. Together these cover addresses, ABIs and start blocks. [1]
- We keep keys out of `.mcp.json` entirely and don't use `${VAR}` headers there either. An unset variable makes Claude Code print a warning and send the literal `${VAR}` text, and a contributor's key belongs in local scope. [2]
- A contributor can opt in at local scope (`claude mcp add --scope local`) to these servers:
  - Blockscout hosted MCP: `read_contract` gives `eth_call`, and it has `get_contract_abi` and `inspect_contract_code`. It needs a free PRO key. Set `BLOCKSCOUT_DISABLE_COMMUNITY_TELEMETRY=true`. [3][4]
  - Etherscan authenticated MCP: higher limits and PRO tools. [1]
  - Alchemy hosted MCP: OAuth, with `ethCall` and `ethGetLogs` on 100+ chains. [5]
  - Tenderly MCP: paid plan. It traces and simulates; writes go only to Virtual TestNets. [6]

  None of these is in the project file, because each needs an account or a paid plan.
- We don't bundle Blockscout, even though it is the best fit for `eth_call`. Its license is the non-OSI Blockscout Software Licence, the hosted server fails without a PRO key, and telemetry is on by default. [3][4]
- We forbid every server or SDK that takes a private key, mnemonic, wallet secret or signing-capable API secret, or that has a send, sign or write tool:
  - `mcpdotdirect/evm-mcp-server` (`EVM_PRIVATE_KEY`, `EVM_MNEMONIC`)
  - `PraneshASP/foundry-mcp-server` (`PRIVATE_KEY`, `cast_send`, `forge_script`)
  - `web3-mcp` (`ETH_PRIVATE_KEY` and others)
  - thirdweb MCP (secret key in the query string, server-wallet writes)
  - Coinbase AgentKit (CDP API secret, wallet providers)
  - Base MCP and its successor Wallet MCP
  - GOAT SDK

  VoidX never transacts, and an agent with a signer can be steered into transfers by text in its context. [7][8][9][10][11][12][13][14][15]
- We avoid servers that are archived, unofficial and tiny, or off-topic, because each needs a key or trust for no gain over the Etherscan server:
  - GOAT: archived. [14]
  - `base-mcp`: archived on 2026-05-13. [12]
  - `crazyrabbitLTC/mcp-etherscan-server`: Ethereum only, 3 commits. [16]
  - Chainlist MCPs: at most 2 stars. [17]
  - QuickNode `qn-mcp`: manages endpoints and billing; it makes no chain reads. [18]
  - DeMCP: a paid proxy network with no license file. [19]
  - Unofficial Infura and viem MCPs: none is official. [20][21]
- We treat every MCP result as untrusted input. Verified source comments, token names and labels are written by whoever deployed the contract, and Claude Code warns that servers which fetch external content are a prompt-injection path. [2][11]
- We never cite an MCP result as the source URL for an address. `voidx validate` requires a source URL, so the agent cites the explorer page (for example `https://etherscan.io/address/<addr>#code`) or the protocol's docs. [22]

## Facts that constrain us
- **Etherscan MCP** (official, Streamable HTTP, read-only) [1][23]
  - The keyless server exposes 16 of 21 tools on a separate, lower rate limit.
  - The authenticated server at `https://mcp.etherscan.io/mcp` takes `Authorization: Bearer <key>` and counts calls against your API plan.
  - It has no `eth_call` tool.
  - The API free tier allows 3 calls/s and 100k calls/day. On Base (8453) and OP Mainnet (10) only the source code and ABI endpoints are free; Ethereum, Arbitrum and Unichain are free.
  - The CLI `@etherscan/cli` exists for agents that prefer Bash.
- **Blockscout MCP** v0.19.0 (2026-09-08), 45 stars [3][4]
  - Runs over stdio or HTTP; hosted at `https://mcp.blockscout.com/mcp`.
  - The key goes in the `Blockscout-MCP-Pro-Api-Key` header; since v0.19.0 `x-api-key` also works.
  - It has 16 tools; `direct_api_call` reaches any Blockscout endpoint.
  - The license bars hosting the server as a service, and anyone who redistributes modifications needs a commercial license.
- **Alchemy MCP** [5][24]
  - Hosted only: the local npm package `@alchemy/mcp-server` stops working on 2026-09-30.
  - Auth is OAuth 2.1 with PKCE; it exposes 168 tools.
  - The docs say it sends no transactions but supports "smart wallet ... prepared call submission". Which tools those are is unverified.
- **Tenderly MCP**: `https://mcp.tenderly.co/mcp`, OAuth, paid plans only ("contact our sales team"). It has 43 tools; `send_vnet_transaction` impersonates the sender on a VNet. [6]
- **mcpdotdirect/evm-mcp-server**: MIT, 379 stars, npm 2.0.4 (2025-11-26), last commit 2026-06-04. It has 25 tools, including transfers, approvals, contract writes and message signing. [7]
- **foundry-mcp-server**: MIT, 253 stars, last commit 2026-01-17. Its README warns: "Do not add keys with mainnet funds". [8]
- **Claude Code and `.mcp.json`** [2][25]
  - Interactive sessions ask before they start a project server.
  - `claude -p`, the Agent SDK and cloud sessions load project servers without asking, unless a server is listed in `disabledMcpjsonServers`.
  - Managed `allowedMcpServers` and `deniedMcpServers` filter servers by name or URL.
  - Permission rules match `mcp__<server>__<tool>`; a rule with parentheses is skipped.
  - A tool output over 25k tokens is saved to a file. Large verified sources such as the V4 `PoolManager` hit this limit.

## Conflicts with existing docs (owner to decide)
- Resolved by ADR 0036/0047 and `.gitignore`. ADR 0036 and `integration-model.md` stop an integration PR from changing `AGENTS.md`, `CLAUDE.md`, `.agents/` and `.claude/`, but `.mcp.json` is not on that list. A server added to `.mcp.json` runs in cloud and non-interactive agents without a prompt, so it can instruct or exfiltrate from a maintainer's agent. [2][26]
- ADR 0024 cloud setup: any project MCP server also runs in Codex, Copilot and cloud sessions that have no approval prompt. Keeping `.mcp.json` key-free and read-only only limits this exposure. Approving each server remains an open policy question. [2][27]
- `integrations/AGENTS.md` plans `voidx check-address` and `voidx find-deploy-block`. The Etherscan server overlaps with them. The MCP is an aid; the CLI stays the gate. [22]

## Open questions
- Does the keyless Etherscan endpoint keep the free-tier restriction on Base and OP Mainnet? If it does, `get_contract_creation` and `get_logs` fail there and need another route (Blockscout or `cast`).
- Should `cast` (Foundry) become an allowed contributor tool for `eth_call`, `cast logs` and `cast code`? It is a new toolchain dependency, so the owner decides. If yes, `.claude/settings.json` should deny `cast send`, `cast wallet` and `forge script --broadcast`.
- Should `.claude/settings.json` list known signing tool names in `permissions.deny` as a backstop, or should managed `deniedMcpServers` handle it?
- Sourcify has no MCP server in these sources. Is a Sourcify lookup enough as a second verified-source origin?
- Should the planned `voidx` CLI call the Etherscan API v2 directly, which would need a key in `instance.config`?

## Sources
1. Etherscan MCP — https://docs.etherscan.io/build-with-ai/mcp.md
2. Claude Code MCP — https://code.claude.com/docs/en/mcp
3. Blockscout MCP server README — https://github.com/blockscout/mcp-server
4. Blockscout Software Licence — https://github.com/blockscout/mcp-server/blob/main/LICENSE
5. Alchemy MCP server docs — https://www.alchemy.com/docs/alchemy-mcp-server
6. Tenderly MCP quickstart and tools — https://docs.tenderly.co/mcp-server/quickstart, https://docs.tenderly.co/mcp-server/tools
7. evm-mcp-server — https://github.com/mcpdotdirect/evm-mcp-server, https://registry.npmjs.org/@mcpdotdirect/evm-mcp-server/latest
8. foundry-mcp-server — https://github.com/PraneshASP/foundry-mcp-server
9. web3-mcp ("1 MCP to rule all them chains", listed under amygdala-labs) — https://github.com/strangelove-ventures/web3-mcp
10. thirdweb MCP — https://portal.thirdweb.com/ai/mcp
11. Coinbase AgentKit — https://github.com/coinbase/agentkit
12. base-mcp (archived) — https://github.com/base/base-mcp
13. Coinbase Wallet MCP — https://docs.cdp.coinbase.com/ai-agents/coinbase-for-agents/wallet-mcp
14. GOAT SDK (archived) — https://github.com/goat-sdk/goat
15. AgentKit MCP extension — https://github.com/coinbase/agentkit/tree/main/typescript/framework-extensions/model-context-protocol
16. mcp-etherscan-server — https://github.com/crazyrabbitLTC/mcp-etherscan-server
17. GitHub search "chainlist mcp" — https://github.com/search?q=chainlist+mcp&type=repositories
18. QuickNode MCP — https://github.com/quiknode-labs/qn-mcp
19. DeMCP — https://github.com/demcp/awesome-web3-mcp-servers
20. GitHub search "infura mcp" — https://github.com/search?q=infura+mcp&type=repositories
21. GitHub search "viem mcp" — https://github.com/search?q=viem+mcp&type=repositories
22. integrations/AGENTS.md — ../../../integrations/AGENTS.md
23. Etherscan rate limits and supported chains — https://docs.etherscan.io/rate-limits.md, https://docs.etherscan.io/supported-chains.md
24. Alchemy MCP README (retirement notice) — https://github.com/alchemyplatform/alchemy-mcp-server
25. Claude Code permissions — https://code.claude.com/docs/en/permissions
26. ADR 0036 — ../../decisions/0036-integration-trust.md
27. ADR 0024 — ../../decisions/0024-agent-setup-and-ai-policy.md
