---
app: server
topic: MCP security and a VoidX MCP server
checked: 2026-10-01
---

# MCP security and a VoidX MCP server

## Decisions

Third-party MCP servers in the repo and on contributor machines:

- We commit no `.mcp.json` in M0. If one is added later, it lists only remote `https` servers on a maintainer allowlist that serve read-only docs or data, with no `headers`, no `${VAR}` secrets and no `stdio` entries. A project `stdio` server is code that runs on every contributor machine, and the spec names malicious startup commands as the main local-server attack. [3][4]
- We never set `enableAllProjectMcpServers` or `enabledMcpjsonServers` in the committed `.claude/settings.json`. Both are honoured from project scope and would skip the per-server approval prompt for anything a PR adds to `.mcp.json`. [5]
- Agent jobs in CI run `claude -p --strict-mcp-config`. Non-interactive runs load project `.mcp.json` servers without a prompt. [4]
- No MCP server used on VoidX work holds a private key, seed or signing capability, and none builds transactions. VoidX is watch-only. Published crypto-agent attacks move funds through injected context, and SlowMist's checklist treats wallet MCPs as the top risk. [16][17]
- Contributors pin personal `stdio` servers to an exact version (`pkg@1.2.3`, never `@latest` or a bare `npx -y pkg`) and install no MCP package newer than the Renovate minimum release age. postmark-mcp 1.0.16 was a trusted package that turned malicious in one release, and Shai-Hulud spread through compromised npm maintainers. [11][14][15][0037]
- Third-party MCP tools get no `allow` rule in the committed settings. Each call prompts, and allow globs work only after a literal `mcp__<server>__` prefix. Calls that pass a parameter can be blocked only with `--disallowedTools`, because settings ignore `mcp__` rules with parentheses. [6]
- We treat every MCP result, GitHub issue body and on-chain string (token name, symbol, ENS name) as untrusted data, never as instructions. A model that has read such output must not get unattended write tools in the same session. Invariant showed a public issue driving the GitHub MCP to leak private repos. [12][3]

A VoidX MCP server:

- We build it after the MVP, not in it. It depends on the frozen `/api/v1` and on passkey accounts, both of which arrive in M4. It is also a new public contract, so it needs an `approved` spec first. [roadmap][AGENTS.md]
- We host it as a `/mcp` route module inside `apps/server`, not as a new app or a stdio npm package. Each tool calls the same use case as its `/api/v1` route and returns the same `packages/contracts` DTO as `structuredContent`, so numbers stay server-derived. A remote server ships no code to user machines, and every self-hosted instance gets it at its own URL. [1][3][23]
- We target protocol `2026-07-28`, which is stateless with no `Mcp-Session-Id`. Any cross-call handle is random and keyed by `<accountId>:<handle>`; holding a handle is never treated as authentication. [1][3]
- Auth is OAuth 2.1 with the instance as its own authorization server, and the authorization step is the instance's passkey ceremony. This reuses 0038's PKCE flow, with an exact redirect, `state`, S256 and single-use codes. The resource side adds RFC 9728 metadata, an RFC 8707 audience check, `iss` in responses, and CIMD-first client registration (DCR is deprecated). [2][3][0038]
- MCP tokens are a separate token family with the MCP resource as audience. The server rejects app session and refresh tokens at `/mcp`, and MCP tokens are rejected at `/api/v1`. The spec forbids accepting or passing through tokens not issued for the MCP server. [2][3]
- Scopes start minimal: `portfolio:read` and `alerts:read`. Any write scope arrives later through a step-up challenge; none ships first. [2][3]
- The consent page names the client and shows its `redirect_uri` host with a warning for localhost-only redirects. It sets `frame-ancestors 'none'` and stores consent per `client_id` in a `__Host-` cookie or server-side. [3]
- Tool calls go through the same inbound rate limits as `/api/v1` and read entitlements through the `Entitlements` port. Calls are counted per `client_id`, and the server enforces every limit. [0043][resilience]

The VoidX MCP never:

- Signs, builds or simulates a transaction. It never asks for or accepts a key, seed or signature.
- Returns another account's data, or lets a guest query arbitrary addresses (see Open questions).
- Returns a raw on-chain string. Symbols are the sanitized `Token.symbol`. Positions whose tokens are both unverified stay hidden unless the tool argument asks for them, and the result labels them as untrusted.
- Logs raw addresses. MCP logs follow the HMAC rule in 0040.
- Returns USD or prices beyond what `/api/v1` returns ([token-prices](../server/token-prices.md) open question on CoinGecko redistribution).

## Facts that constrain us

- The current MCP spec is `2026-07-28`. It removes `initialize` and protocol sessions, and moves server-to-client notifications to `subscriptions/listen`. It deprecates Roots, Sampling, Logging and DCR, and makes `iss` validation a client MUST. [1]
- The authorization spec says the server MUST publish Protected Resource Metadata and MUST validate the token audience. Clients MUST send `resource` in both the authorization and the token request. Tokens never go in the query string. [2]
- In Claude Code, `.mcp.json` servers prompt once per server after workspace trust. `claude mcp reset-project-choices` clears those answers. [4]
- `allowedMcpServers` and `deniedMcpServers` match by `serverName`, `serverCommand` or `serverUrl`. `allowManagedMcpServersOnly` works in managed settings only. [4][5]
- The Claude Code sandbox covers Bash, PowerShell and Monitor and their child processes. It does not cover MCP server processes. Isolating a local MCP server takes a container or VM. [7]
- Claude Code tool output: a warning at 10k tokens, a default limit of 25k (`MAX_MCP_OUTPUT_TOKENS`), and per-tool `_meta["anthropic/maxResultSizeChars"]` up to 500k chars. Our tools should page rather than raise the limit. [4]
- `${VAR}` in `.mcp.json` expands from the user's environment, and some credential variables read as empty. A committed `headers` entry with `${VAR}` still sends that variable's value to the remote server. [4]
- Claude Code advisories:
  - CVE-2025-59536: code ran before the trust dialog; fixed in 1.0.111. [8]
  - CVE-2026-33068: a repo's `.claude/settings.json` with `defaultMode: bypassPermissions` skipped the trust dialog; fixed in 2.1.53. [9]
  - GHSA-q5hj-mxqh-vv77 (2026-04, worktree trust bypass) and GHSA-7835-87q9-rgvv (2026-06, sandbox escape). [10]
- Tool poisoning hides instructions in tool descriptions. In a rug pull, a server changes its descriptions after approval (Invariant, 2025-04). Pinning helps for `stdio` packages only; a remote server can change at any time. [11]
- `mcp-remote` 0.0.5–0.1.15 (CVE-2025-6514, CVSS 9.6) ran OS commands taken from a malicious `authorization_endpoint`; fixed in 0.1.16. [13]
- postmark-mcp 1.0.16 (2025-09-25) BCC'd every email it sent to the attacker. [14]
- Shai-Hulud (2025-09) compromised 500+ npm packages and stole GitHub PATs and cloud keys; CISA advises pinning and phishing-resistant MFA. [15]
- Memory and context injection beats prompt injection against web3 agents (ElizaOS, CrAIBench). [16]
- Survey of DeFi MCPs (2026-10):
  - CoinGecko runs a remote read-only MCP: keyless at `mcp.api.coingecko.com/mcp`, Pro by key, OAuth in Claude web; every tool call counts against the plan's rate limit. [18]
  - Zerion's MCP serves only docs and OpenAPI. Portfolio data for agents goes through a CLI and skill with an API key or x402 pay-per-call, and the same CLI also trades and signs. [19][20]
  - Uniswap ships skills and plugins, including trading ones, plus an `X-Agent-Info` header; it has no data MCP. [21]
  - DeBank's and Revert's docs list no MCP. Zapper's docs returned 403 and were not verified. [22]
- MCP TypeScript SDK 2.2.0 (2026-09-28) has web-standard Streamable HTTP, a Hono adapter and bearer-auth/PRM helpers. Using it is a new dependency and needs the owner's approval. [23]

## Open questions

- Resolved by ADR 0036/0047 and `.gitignore`. 0036 and the AGENTS.md CI path scope block integration PRs from editing `AGENTS.md`, `CLAUDE.md`, `.agents/` and `.claude/`, but not `.mcp.json`. A PR that adds `.mcp.json` would reach a maintainer's agent through an approval prompt. Should the path scope include it? Owner decision; this file does not resolve it.
- Should a keyless, guest-style `portfolio.query` tool exist, like CoinGecko's keyless tier? It conflicts with 0040's intent that the server learn nothing about guests, and it creates an anonymous address-lookup API.
- Is MCP access a plan entitlement (an `mcp.enabled` key) or free like the API, with only rate limits? 0043 does not cover it.
- The privacy notice should say that the user's AI provider sees whatever their agent reads. 0040 lists only RPC providers and The Graph.
- Could `alerts:write` (creating range alerts) ever ship? If so, it needs a step-up scope and possibly a fresh passkey assertion.
- Do major MCP clients (Claude, ChatGPT, Cursor) support CIMD well enough to drop DCR entirely on day one?
- Should we ship a Claude Code managed-settings template for maintainers (`deniedMcpServers` for wallet MCPs)? Project settings cannot enforce restrictions.

## Sources

1. MCP spec 2026-07-28, Key changes — https://modelcontextprotocol.io/specification/2026-07-28/changelog
2. MCP spec, Authorization — https://modelcontextprotocol.io/specification/latest/basic/authorization
3. MCP spec, Security best practices — https://modelcontextprotocol.io/specification/latest/basic/security_best_practices
4. Claude Code, MCP — https://code.claude.com/docs/en/mcp
5. Claude Code, Settings reference — https://code.claude.com/docs/en/settings-reference
6. Claude Code, Permissions — https://code.claude.com/docs/en/permissions
7. Claude Code, Sandboxing — https://code.claude.com/docs/en/sandboxing
8. GHSA-4fgq-fpq9-mr3g / CVE-2025-59536 — https://github.com/anthropics/claude-code/security/advisories/GHSA-4fgq-fpq9-mr3g
9. GHSA-mmgp-wc2j-qcv7 / CVE-2026-33068 — https://github.com/anthropics/claude-code/security/advisories/GHSA-mmgp-wc2j-qcv7
10. Claude Code security advisories — https://github.com/anthropics/claude-code/security/advisories
11. Invariant Labs, Tool poisoning attacks — https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks
12. Invariant Labs, GitHub MCP exploited — https://invariantlabs.ai/blog/mcp-github-vulnerability
13. GHSA-6xpm-ggf7-wc3p / CVE-2025-6514 (mcp-remote) — https://github.com/advisories/GHSA-6xpm-ggf7-wc3p
14. Postmark, Malicious postmark-mcp package — https://postmarkapp.com/blog/information-regarding-malicious-postmark-mcp-package
15. CISA, npm supply chain compromise (Shai-Hulud) — https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem
16. Real AI agents with fake memories (arXiv 2503.16248) — https://arxiv.org/abs/2503.16248
17. SlowMist, MCP Security Checklist — https://github.com/slowmist/MCP-Security-Checklist
18. CoinGecko, MCP server — https://docs.coingecko.com/docs/mcp-server
19. Zerion, Build with AI — https://developers.zerion.io/build-with-ai/overview.md
20. zeriontech/zerion-ai — https://github.com/zeriontech/zerion-ai
21. Uniswap AI — https://github.com/Uniswap/uniswap-ai ; https://developers.uniswap.org/llms.txt
22. DeBank Cloud docs sitemap; Revert docs sitemap — https://docs.cloud.debank.com/en/sitemap.md ; https://docs.revert.finance/revert/sitemap.md
23. MCP TypeScript SDK releases — https://github.com/modelcontextprotocol/typescript-sdk/releases
