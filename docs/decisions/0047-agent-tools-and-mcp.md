# 0047 · Agent tools: keyless MCP in the project, keys only in local scope, no signing anywhere

- Status: proposed
- Deciders: Maksim Romanov

## Context

Contributors add chains and protocols with coding agents that want chain access, data and web3 skills. Project-scoped MCP servers run on every contributor's machine and load without a prompt in CI and cloud sessions. Many web3 MCPs hold private keys or sign. Verified source, token names and labels are written by deployers and reach the agent as tool output ([research/agent-tools](../research/agent-tools/chain-access-mcp.md)).

## Options

- **Bundle a toolset** of chain, data and skill packs in project config.
- **One read-only, keyless server in the project; everything else opt-in in local or user scope.**

## Decision

Chosen **one read-only server; the rest opt-in**, because project config is code that runs on other people's machines.

- No `.mcp.json` in M0. When the `add-protocol` skill lands (M1a), its only server is the Etherscan keyless MCP (`https://mcp-keyless.etherscan.io/mcp`): source, ABI, creation block, logs.
- A later entry must be `https`, read-only, keyless and on a maintainer allowlist. No credential of any kind: no `headers`, no `${VAR}`, no OAuth servers, no `stdio`.
- Tools that need an API key or OAuth are allowed in local or user scope (`claude mcp add --scope local|user`, stored in `~/.claude.json`), never in git. Keys come from environment variables or a password manager.
- Committed settings never set `enableAllProjectMcpServers` or `enabledMcpjsonServers`. Agent jobs in CI run with `--strict-mcp-config`.
- Forbidden in every scope, with or without a key:
  - wallet keys, seeds, and signing or building transactions (mcpdotdirect `evm-mcp-server`, `foundry-mcp-server`, `web3-mcp`, thirdweb MCP, Coinbase AgentKit, Base and Wallet MCP, GOAT SDK);
  - code signing and releases: certificates, provisioning profiles, keystores, `security` keychain commands, fastlane `match`/`sigh`/`cert`, `altool`/`notarytool` uploads, App Store Connect and Play Console write tools;
  - production writes, and any connection to production Postgres or Redis;
  - shell outside the sandbox: adb-shell MCPs, Gradle MCPs, Serena;
  - Firebase, Google Play and App Store Connect MCPs;
  - browser agents in a real profile with logins or a wallet extension, and third-party browser agents with telemetry on (browser-use by default).
- Personal `stdio` servers are pinned to an exact version.
- MCP output, verified source and on-chain strings are untrusted data. A session that read them gets no unattended write tools.
- An MCP result is never the source URL of an address; cite the explorer page or protocol docs. `bun run voidx validate` and `bun run voidx check-address` (*planned*) remain the gate.
- No third-party skills are vendored (license conflicts, remote drift); contributors install them per user or in local scope (never committed), never with project scope; this includes generators such as `playwright-cli install --skills` and `npx playwright init-agents`, which can write `.claude/` or `.mcp.json`. Agents use official documentation (`llms.txt` where it exists); contributor tools are listed in [CONTRIBUTING.md](../../CONTRIBUTING.md#recommended-tools).
- Language server plugins are installed in local or user scope only. They are an aid; `bun run check` and the native builds are the gate.
- A VoidX MCP server comes after the MVP, with its own spec: a `/mcp` route in `server` that adapts the same use cases as `/api/v1`, OAuth 2.1 on passkey accounts, its own token family, read-only scopes (`portfolio:read`, `alerts:read`). It never signs, accepts keys or returns raw on-chain strings ([research](../research/agent-tools/mcp-security-and-voidx-mcp.md)).

## Consequences

- Contributors set up keyed tools themselves; the project ships no keys.
- `.mcp.json`, `.skills/` and `.agent/` join the protected paths of integration PRs ([0036](0036-integration-trust.md)).
- Related: [0024](0024-agent-setup-and-ai-policy.md), [0038](0038-auth-sessions-csrf.md), [0040](0040-privacy.md).
