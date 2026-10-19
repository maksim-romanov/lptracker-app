---
app: repo
topic: Browser automation for agents
checked: 2026-10-01
---

# Browser automation for agents

Which tool coding agents use to drive and inspect the SSR web app (Hono JSX, Turbo Frames and Streams over SSE) while they build and verify it. The rules for any MCP server are in [MCP security](mcp-security-and-voidx-mcp.md); base server picks are in [base dev MCP](base-dev-mcp.md); the web E2E gate is Playwright ([0048](../../decisions/0048-e2e-testing.md)). Versions are current on the `checked` date. The fetch tool reported release dates two years off for several packages, so this file gives versions only.

## Decisions

### Tiers
| Tool | Tier | Why |
|---|---|---|
| Playwright CLI `@playwright/cli@0.1.22` + its skills | **default** | Same Playwright 1.64 as the E2E gate, no second LLM, accessibility snapshot, console, requests, route, tracing [3][4] |
| Playwright MCP `@playwright/mcp@0.0.83` | optional | Same engine; for clients without shell or for long stateful loops [1][2] |
| Chrome DevTools MCP `chrome-devtools-mcp@1.10.1` | optional | Perf traces, Lighthouse, heap snapshots; telemetry and CrUX off [6][7][8] |
| Vercel `agent-browser@0.38.1` | not recommended | Duplicates Playwright CLI on a second engine; postinstall downloads a binary [9][10] |
| Stagehand `@browserbasehq/stagehand@4.1.0` | not recommended | Every `act`/`extract`/`observe` is an LLM call [11][12] |
| browser-use `0.13.10` (library, CLI, `--mcp`) | not recommended | Python toolchain, second LLM, telemetry on by default [14][15][16][17] |
| Claude in Chrome (`claude --chrome`) | not recommended; **forbidden** in a profile with a wallet extension or real accounts | Drives the user's logged-in browser [20][21] |
| Browser Use Harness, Browser Use Cloud, Browserbase, Steel, Hyperbrowser | not needed; Harness and any cloud browser on VoidX pages **forbidden** | Real Chrome or third-party hosts; the dev server is local [17][18][19][22][23] |

### Why these tiers
- We make Playwright CLI the default because Playwright itself says coding agents should prefer "CLI–based workflows exposed as SKILLs over MCP" since they "avoid loading large tool schemas and verbose accessibility trees into the model context". Its defaults (headless, in-memory profile) already match what we ask of the MCP with `--isolated --headless`. [1][3]
- We keep the agent's browser on the same Playwright version as `apps/voidx-web` E2E, so a selector or locator an agent finds while exploring works unchanged in a test. Playwright Test Agents (planner, generator, healer) emit ordinary Playwright tests, which fits ADR 0048; see Open questions for their config files. [3][5]
- We do not adopt browser-use. Its value is an autonomous agent loop that needs its own LLM key (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`; the MCP's `retry_with_browser_use_agent` calls it), which adds cost and a second, uncontrolled model. Its non-agent tools (navigate, click, state, screenshot) duplicate Playwright. It requires Python ≥3.11, a toolchain the TS stack does not otherwise need. [14][15][16]
- We forbid browser-use with telemetry on. It sends "task instructions, URLs visited, action traces, errors, and final results" to PostHog by default, which breaks AI_POLICY item 6 as soon as a page or URL shows a watched address. Anyone who runs it anyway sets `ANONYMIZED_TELEMETRY=false`. [15][AI_POLICY]
- We do not adopt Stagehand. Each primitive calls a model, so a run is not reproducible and costs tokens; its cache is served "from Browserbase". The Browserbase MCP needs `BROWSERBASE_API_KEY` plus an LLM key and was archived on 2026-07-20. Its engines field needs Node ≥22.18 and it brings OpenTelemetry deps. [11][12][13]
- We keep agents out of a real logged-in browser. Claude in Chrome "shares your browser's login state", Browser Harness and browser-use CLI attach over CDP to the user's Chrome with its "cookies, extensions, and logged-in sessions". A DeFi contributor's profile often holds a wallet extension, which turns injected page text into a signing path that ADR 0047 forbids. Anthropic's own advice is "a separate browser profile without access to sensitive accounts" and to avoid financial accounts. [17][18][20][21][0047]
- We use no hosted browser. The dev server, Prism mock and docker compose stack are on localhost; a cloud browser would need a tunnel and keeps session data (Browserbase: 7 days free, 30 days paid). Playwright CLI covers every check we need locally. [19][22]
- We treat everything a browser tool reads as untrusted data, per ADR 0047. Allowed-origin lists are not a boundary in Playwright ("does not serve as a security boundary and does not affect redirects"). From M4, pages render on-chain token names, so a session that browsed real data gets no unattended write tools. [1][0047]
- We browse only the mock API, fixtures and test or public protocol wallets, never a watched address of a real user. Snapshots, screenshots and console output all reach the AI provider. [AI_POLICY]
- We watch SSE and Turbo Streams with `curl -N` on `/stream` in Bash and with Turbo events (`turbo:before-stream-render` exposes `event.detail.newStream`; `turbo:frame-load`, `turbo:frame-missing`, `turbo:fetch-request-error`) through `playwright-cli eval` or an init script. No tool here documents per-message SSE capture. [6][24]
- Browser tools only diagnose. The gates stay the CI checks in ADR 0022 and 0023; an agent's snapshot or Lighthouse run never waives one. [0022]

### CONTRIBUTING
- The "Web pages" row of the Recommended tools table should change: list Playwright CLI (`@playwright/cli`, skills in user scope) first, keep both MCPs as optional, and add "no browser-use, Stagehand or hosted browsers; Claude in Chrome only in a separate profile with no wallet extension, on localhost". Owner edit; this file does not make it.

## Facts that constrain us

| Tool | License | Runtime | Needs an LLM of its own | Data out by default | Accessibility tree |
|---|---|---|---|---|---|
| Playwright CLI [3][4] | Apache-2.0 | Node; Playwright 1.64 alpha | no | none documented | `snapshot` with refs |
| Playwright MCP [1][2] | Apache-2.0 | Node, stdio | no | none documented | default mode; vision is `--caps=vision` |
| Chrome DevTools MCP [6][7][8] | Apache-2.0 | Node, stdio; Chrome only | no | usage stats and CrUX on | `take_snapshot` (a11y tree, uids) |
| agent-browser [9][10] | Apache-2.0 | Rust binary; Node ≥24 | no | none documented | snapshot refs `@e1` |
| Stagehand [11][12] | MIT | Node ≥22.18 | yes, per call | OTel traces | via `observe` |
| browser-use [14][15][16] | MIT | Python ≥3.11 | yes for agent mode | PostHog telemetry on | DOM state |
| Claude in Chrome [20] | proprietary | extension; Pro/Max/Team/Enterprise login only | the session's model | Anthropic | via extension tools |

- Playwright CLI: sessions with `-s=name`, `--persistent` opt-in, idle headless sessions stop after an hour. It reads `.playwright/cli.config.json` from the working directory by default, with `allowedOrigins`. Commands include `console [min-level]`, `requests`, `route`, `tracing-start`/`-stop`, `eval`, `show` (live dashboard). [3]
- Playwright MCP flags that matter: `--isolated`, `--headless`, `--allowed-origins`/`--blocked-origins`, `--caps` (vision, pdf, devtools, network, storage, testing), `--secrets` (dotenv masking), `--console-level`, `--snapshot-mode full|none`, `--extension` and `--cdp-endpoint` (attach to a real browser; do not use). [1]
- Chrome DevTools MCP 1.10.1 also ships a `chrome-devtools` CLI bin, and has `install_extension`, `install_pwa`, `execute_3p_developer_tool` and WebMCP tools. Opt-outs: `--no-usage-statistics` or `CHROME_DEVTOOLS_MCP_NO_USAGE_STATISTICS`, `--no-performance-crux`, `--no-update-checks`. [6][7][8]
- agent-browser has the strongest built-in guards seen: `--allowed-domains` (also blocks WebRTC), `--content-boundaries` (wraps page text in markers), `--action-policy`, `--confirm-actions`. It ships cloud-provider plugins (Browserbase, Browser Use, Kernel and others). [9]
- browser-use MCP: `uvx --from 'browser-use[cli]' browser-use --mcp`, stdio; docs warn it "has access to your browser and file system". `allowed_domains` and `sensitive_data` exist in the library. 0.13.10 exact-pins its dependencies and moved to MCP Python SDK 2.1.1. [14][16][17]
- Browser Use Cloud: browser $0.02/hour; agents at model cost + 20% (own model BU 2.0 at $0.60/$3.50 per 1M tokens); $15 one-time free credit. [19]
- Claude in Chrome: Anthropic reports attack success "less than 0.08%" against its internal prompt-injection tests with Opus 4.8, "non-zero". Financial sites require permission first. Default side-panel mode is "Automatically approve". Unavailable with API-key auth or Bedrock/Vertex/Foundry; can be blocked with `deniedMcpServers` (`claude-in-chrome`). Recorded GIFs capture everything visible. [20][21]

## Open questions
- Resolved in [agent-verification](../server/agent-verification.md): `playwright-cli install --skills` writes into the project's `.claude/skills` by default, so contributors pass `--global` (ADR 0047). Pin one Playwright version for the CLI and the tests.
- Does `npx playwright init-agents --loop=claude` write `.mcp.json` or `.claude/agents/` into the repo? A `stdio` entry in `.mcp.json` is banned by ADR 0047. Not verified; check before anyone runs it.
- Should a `.playwright/cli.config.json` with `allowedOrigins` for localhost be committed? It is not MCP config, so ADR 0047 does not cover it, but it is agent config in the repo. Owner decision.
- Does Playwright CLI or Chrome DevTools MCP expose EventSource messages (CDP `Network.eventSourceMessageReceived`)? Not verified; until then use `curl -N` and Turbo events.
- Should maintainers get a managed-settings template that denies `claude-in-chrome` (already an open question in [MCP security](mcp-security-and-voidx-mcp.md))?
- Hyperbrowser was not checked beyond its category; the "not needed" verdict rests on the local-only argument.
- agent-browser telemetry is undocumented, not confirmed absent.

## Sources
1. microsoft/playwright-mcp — https://github.com/microsoft/playwright-mcp
2. @playwright/mcp on npm — https://registry.npmjs.org/@playwright/mcp/latest
3. microsoft/playwright-cli README — https://github.com/microsoft/playwright-cli
4. @playwright/cli on npm — https://registry.npmjs.org/@playwright/cli/latest
5. Playwright Test Agents — https://playwright.dev/docs/test-agents
6. ChromeDevTools/chrome-devtools-mcp — https://github.com/ChromeDevTools/chrome-devtools-mcp
7. Chrome DevTools MCP tool reference — https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
8. chrome-devtools-mcp on npm — https://registry.npmjs.org/chrome-devtools-mcp/latest
9. vercel-labs/agent-browser — https://github.com/vercel-labs/agent-browser
10. agent-browser on npm — https://registry.npmjs.org/agent-browser/latest
11. browserbase/stagehand — https://github.com/browserbase/stagehand
12. @browserbasehq/stagehand on npm — https://registry.npmjs.org/@browserbasehq/stagehand/latest
13. browserbase/mcp-server-browserbase (archived) — https://github.com/browserbase/mcp-server-browserbase
14. browser-use/browser-use and PyPI — https://github.com/browser-use/browser-use ; https://pypi.org/pypi/browser-use/json ; https://github.com/browser-use/browser-use/releases
15. Browser Use telemetry — https://docs.browser-use.com/open-source/development/monitoring/telemetry.md
16. Browser Use MCP server — https://docs.browser-use.com/open-source/customize/integrations/mcp-server.md ; secure setup https://docs.browser-use.com/open-source/examples/templates/secure.md
17. Browser Use CLI and products — https://docs.browser-use.com/open-source/browser-use-cli.md ; https://docs.browser-use.com/cloud/which-product.md
18. browser-use/browser-harness — https://github.com/browser-use/browser-harness
19. Browser Use pricing — https://browser-use.com/pricing
20. Claude Code, Use Claude Code with Chrome — https://code.claude.com/docs/en/chrome
21. Using Claude in Chrome safely — https://support.claude.com/en/articles/12902428-using-claude-in-chrome-safely
22. Browserbase pricing — https://www.browserbase.com/pricing
23. steel-dev/steel-browser — https://github.com/steel-dev/steel-browser
24. Turbo events reference — https://turbo.hotwired.dev/reference/events
- [0022] ADR 0022, [0047] ADR 0047, [0048] ADR 0048, [AI_POLICY] AI_POLICY.md item 6 — in this repo
