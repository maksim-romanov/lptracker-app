# Contributing

VoidX grows through integrations: new protocols and chains, added by the community. Most contributors use AI coding agents; the rules below make that work. See also [GOVERNANCE.md](GOVERNANCE.md), [SECURITY.md](SECURITY.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- Read [AGENTS.md](AGENTS.md) and the nearest `AGENTS.md` in the folder you change. Your agent reads them too.
- Adding a protocol or chain: open a *new integration* issue first. Once it is labelled `accepted`, that issue plus your agent's checkpoint, once a maintainer answers `go`, is the spec. Then follow [add a protocol](docs/guides/add-a-protocol.md) or [add a chain](docs/guides/add-a-chain.md).
- Work that changes a public contract, adds a module or spans more than one workspace: open an issue and agree on a spec first ([docs/workflow.md](docs/workflow.md)).

## Pull requests

- One integration per PR.
- An integration PR stays in `integrations/`; app changes only from the allowed list in [docs/concepts/integration-model.md](docs/concepts/integration-model.md).
- `bun run check --affected` passes locally (*planned*).
- Fill in the PR template yourself, including the sources for every address.
- Sign off every commit (`git commit -s`) under the [Developer Certificate of Origin](https://developercertificate.org/). The sign-off is always yours, the human's, even when an AI helped.
- If AI helped, follow the [AI policy](AI_POLICY.md).

## Recommended tools

All optional. The repo ships none until the `add-protocol` skill adds the Etherscan keyless MCP ([ADR 0047](docs/decisions/0047-agent-tools-and-mcp.md)). Install in local or user scope, pin the exact version named in the linked research file, turn telemetry off. Follow [AI policy](AI_POLICY.md) item 6. Never use a tool that holds wallet keys, signs code or releases, or writes to production.

| Need | Tool |
|---|---|
| Docs for agents | `llms.txt` of [viem](https://viem.sh/llms.txt), [Uniswap](https://developers.uniswap.org/llms.txt), [ethereum.org](https://ethereum.org/llms.txt), [Tuist](https://docs.tuist.dev/llms.txt); [Foundry agent docs](https://getfoundry.sh/introduction/agents); Context7 |
| Source, ABI, start block | Etherscan MCP (keyless or own key), Blockscout MCP |
| `eth_call`, logs | Alchemy MCP |
| Subgraphs and discovery | The Graph Subgraph MCP |
| Cross-checking positions and fees | Allium MCP, Dune MCP |
| Price sanity checks | CoinGecko keyless MCP |
| Web pages | Playwright CLI with its skills in user scope (default); optional Playwright MCP (`--isolated --headless`, local origins) and Chrome DevTools MCP (`--isolated --headless --no-usage-statistics --no-performance-crux`). No browser-use, Stagehand or hosted browsers. Claude in Chrome only in a separate profile without a wallet extension, on localhost ([research](docs/research/agent-tools/browser-agents.md)) |
| GitHub | `gh`; the GitHub MCP only read-only with a token scoped to this repo |
| New dependency check | Socket MCP |
| iOS build, run, UI | MobileBuildMCP (workflows `simulator`, `macos`, `ui-automation`, `project-discovery`, `coverage`; `MOBILEBUILDMCP_SENTRY_DISABLED=true`); Xcode `xcrun mcpbridge`; sosumi for Apple docs; SwiftUI and concurrency skills by Paul Hudson or Antoine van der Lee |
| Android run and UI | Android CLI (`--no-metrics`); Android Studio or IntelliJ MCP with brave mode off; Google `android/skills` in user scope |
| Both mobile platforms | Maestro MCP (`maestro mcp`, version from `mise.toml`, analytics off); mobile-mcp for cross-platform sessions (`MOBILEMCP_DISABLE_TELEMETRY=1`, simulators and emulators only) |
| Code intelligence | TS 7 `tsc --lsp --stdio` through a personal `.lsp.json`; `swift-lsp` plugin; `kotlin-lsp` (alpha) |

Third-party numbers are evidence for your PR description, never expected values in tests. Language servers are an aid; `bun run check` is the gate. Details and risks: [docs/research/agent-tools/](docs/research/agent-tools/base-dev-mcp.md), [iOS](docs/research/ios-app/agent-build-and-test-tools.md), [Android](docs/research/android-app/agent-tools.md), [LSP](docs/research/agent-tools/lsp.md).

### Adding a tool with a key

Keep the key in a gitignored `.env.local` or a password manager, export it, then add the server in local scope so it never reaches git:

```sh
claude mcp add --scope local --transport http etherscan https://mcp.etherscan.io/mcp \
  --header "Authorization: Bearer $ETHERSCAN_API_KEY"
```

## Agent sessions

Keep context small: [agent context](docs/concepts/agent-context.md).

## Licenses

Your contribution takes the license of the folder it lands in ([architecture](docs/architecture.md#packages-and-dependency-direction), [REUSE.toml](REUSE.toml)). Port code only from MIT, Apache-2.0 or BSD sources and record the source file. ABIs and addresses are facts, not code, and may come from any public source.
