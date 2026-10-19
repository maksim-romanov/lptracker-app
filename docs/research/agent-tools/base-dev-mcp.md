---
app: repo
topic: Base development MCP servers
checked: 2026-10-01
---

# Base development MCP servers

General-purpose MCP servers for a Bun/TS, Hono SSR, Postgres, Redis and GitHub monorepo with native apps. The rules for any server are in [MCP security](mcp-security-and-voidx-mcp.md); the one planned project server is in [chain access](chain-access-mcp.md). Versions are the ones current on the `checked` date.

## Decisions

### A. Project `.mcp.json`
- We add no general-purpose server to `.mcp.json`. Etherscan keyless stays the only planned entry. Every useful server here is either `stdio` (Playwright, Chrome DevTools, mobile-mcp, Postgres, Redis, Grafana) or needs a credential (GitHub, Sentry, Figma, Socket, Linear). ADR 0047 admits only `https`, read-only, keyless entries. [24][0047]
- We keep Context7 out of the project file, even though `https://mcp.context7.com/mcp` works without a key. Its library entries are community-contributed, its backend is closed, and every query goes to Upstash. A project entry would feed that text to CI agents without a prompt. [22][24]

### B. Recommended per contributor (user or local scope, exact version)
- **Browser:** Playwright MCP `@playwright/mcp@0.0.83` with `--isolated --headless --allowed-origins <local server>`. Use it to drive SSR pages, Turbo Frames and forms through the accessibility snapshot. Origin lists "do not serve as a security boundary", so a session that browses outside sites gets no write tools. Playwright itself recommends its CLI plus skills over the MCP for coding agents, to save tokens. [5][6]
- **Performance:** Chrome DevTools MCP `chrome-devtools-mcp@1.10.1` with `--isolated --headless --no-usage-statistics --no-performance-crux`. Use it to explain a failed perf budget or Lighthouse score with `performance_start_trace`, `performance_analyze_insight`, `emulate` (CPU and network throttling) and `lighthouse_audit`. Usage statistics go to Google by default. [8][9][10]
- Browser MCPs only diagnose. The merge gates stay the CI checks in ADR 0022 and 0023 (Playwright plus axe-core, html-validate, Lighthouse 100, perf budgets). An MCP result never waives a gate. [0022]
- **Native:** mobile-mcp `@mobilenext/mobile-mcp@1.0.6` with `MOBILEMCP_DISABLE_TELEMETRY=1`, on local simulators and emulators only. It reads the native accessibility tree on iOS and Android, so one tool covers both apps. Telemetry (PostHog, Scarf) is on by default. It can install and uninstall apps, so never point it at a personal phone. It supplements `performAccessibilityAudit()` and Compose checks and never replaces them. [33][34][0022]
- **GitHub:** agents use the `gh` CLI. Claude Code permission rules can scope it per command, and it runs inside the sandbox. A contributor who wants the GitHub MCP uses the remote server, read-only through `/x/<toolset>/readonly` or `X-MCP-Readonly`, with `X-MCP-Lockdown` on. Auth is OAuth or a fine-grained PAT for the VoidX repo with read permissions only. [1][2][3][35]
- **Local data:** agents reach the docker compose Postgres and Redis through `psql`, `redis-cli` and drizzle-kit in Bash, not an MCP. The Claude Code sandbox covers Bash but not MCP processes. [35] A contributor who still wants a Postgres MCP uses MCP Toolbox for Databases (`--prebuilt=postgres`) or Postgres MCP Pro (`--access-mode=restricted`). Either connects only to the local database, as a role with SELECT only and `default_transaction_read_only = on`. [13][16][24]
- **Docs:** agents fetch `https://bun.com/docs/llms.txt` (an index of per-page `.md`, with no version marker) and `https://hono.dev/llms-full.txt` or `llms-small.txt`. A fact is checked against the pinned Bun or Hono version before it is cited. Context7 stays optional, as in [skills and knowledge](skills-and-knowledge.md). [31][32]
- **Supply chain:** Socket MCP (`https://mcp.socket.dev/`, OAuth, `depscore`) is an optional check before a contributor proposes a dependency to the owner. It receives package names and versions only. It does not replace Renovate's minimum release age or the license check. [29][0037]

### C. Maintainer-only, production read
- **Sentry:** the remote MCP `https://mcp.sentry.dev/mcp` with OAuth and the `inspect` skill only (no `triage`, `project-management` or `seer`). The local package needs a token with `project:write`, `team:write` and `event:write`, so maintainers don't use it. Its license is FSL-1.1-ALv2, which is not OSI-approved. [19][20]
- **Grafana:** `grafana/mcp-grafana` over `stdio`, pinned, with `--disable-write`, `--disable-admin` (the default) and a Viewer service-account token. It is for Prometheus and Loki queries during incidents. [21]
- A session that reads production errors or logs gets no write tools. Both sources must stay free of raw addresses (ADR 0034 HMAC rule, AI_POLICY item 6); see Open questions. [0034][0040]

### D. Forbidden on VoidX work
- Any MCP connected to production Postgres or Redis, read-only or not. Production rows hold sessions, passkeys and watchlists, every result reaches the AI provider, and AI_POLICY item 6 bars watched addresses from MCP servers. [0040]
- `@modelcontextprotocol/server-postgres`. It was archived on 2025-05-29, and a stacked `COMMIT;` escaped its read-only transaction. The last version, 0.6.2, is unfixed and still had about 21k weekly downloads. [11][12]
- The `filesystem` and `git` reference servers. Claude Code reads files and runs git itself, the MCP maintainers call reference servers "educational examples ... not production-ready", and an MCP process runs outside the sandbox. [23][35]
- `redis/mcp-redis` against anything but a throwaway local Redis. It has write and delete tools and no read-only mode; only a Redis ACL can restrict it. [17]
- GitHub MCP write toolsets in any session that reads issues, PRs or discussions by outside contributors. Lockdown is "a best-effort content filter, not a security boundary". [2][3][35]
- Supabase MCP, Linear and Notion: they don't fit VoidX. Supabase's server targets Supabase projects, and our issues live in GitHub. [15][30]

## Facts that constrain us

| Server | Maintainer, license | Version | Transport | Read-only control | Telemetry, data out |
|---|---|---|---|---|---|
| GitHub [1][2][3][4] | GitHub, MIT | v1.12.2 | remote `api.githubcopilot.com/mcp/`; Docker `ghcr.io/github/github-mcp-server` | `--read-only` / `X-MCP-Readonly`; `--toolsets`, `--tools`, `--exclude-tools`; `--lockdown-mode` / `X-MCP-Lockdown` | GitHub API |
| Playwright [5][6][7] | Microsoft, Apache-2.0 | 0.0.83 (Playwright 1.64 alpha) | stdio; HTTP with `--port` | `--caps` opt-in for vision, pdf, devtools, network, storage; `--secrets` masking | none documented |
| Chrome DevTools [8][9][10] | Google, Apache-2.0 | 1.10.1 | stdio | `--slim`; `--category-*`; also has `install_extension`, `install_pwa`, `evaluate_script` | usage stats on; CrUX on |
| Postgres MCP Pro [13][14] | Crystal DBA, MIT | 0.3.0 (2025-05-16) | stdio, SSE | `restricted`: read-only tx, pglast rejects `COMMIT`/`ROLLBACK`, time limit; unsafe procedural languages can bypass it | none documented |
| MCP Toolbox for Databases [16] | Google, Apache-2.0 | 1.13.1 | stdio, HTTP | `tools.yaml` with parameterized SQL; the prebuilt set includes `execute_sql` | OTLP export opt-in |
| Redis [17][18] | Redis, MIT | 0.5.1 (2026-08-05) | stdio only | ACL only | none documented |
| Sentry [19][20] | Sentry, FSL-1.1-ALv2 | 0.42.0 | remote OAuth; stdio with token; `--host` for self-hosted | `MCP_SKILLS` / `MCP_DISABLE_SKILLS` | AI search needs `EMBEDDED_AGENT_PROVIDER` |
| Grafana [21] | Grafana Labs, Apache-2.0 | 808 commits | stdio, SSE, Streamable HTTP | `--disable-write`, `--disable-<category>` | Grafana API |
| mobile-mcp [33][34] | Mobile Next, Apache-2.0 | 1.0.6 | stdio | none; app install tools | PostHog and Scarf on |
| Figma [27][28] | Figma, hosted | — | remote `mcp.figma.com/mcp`, OAuth, catalog clients only | none found; it writes to the canvas | — |
| Socket [29] | Socket, MIT | 0.0.20 | remote OAuth; self-host with `packages:list` token | read-only by design | package names |
| Context7 [22] | Upstash, MIT (server only) | — | remote, optional key | read-only | queries to Upstash |

- The reference repo keeps Everything, Fetch, Filesystem, Git, Memory, Sequential Thinking and Time. It archived GitHub, Postgres, Redis, Sentry, Puppeteer, SQLite and others. [23]
- GitHub MCP v1.10.0 strips invisible Unicode and normalizes HTML entities in responses. Lockdown cannot be relaxed per request once the operator enables it. Classic PATs hide tools the token's scopes don't allow. Other tokens show every tool and rely on API errors. [3][4]
- Docker MCP Gateway (MIT) runs `stdio` servers in containers with limited privileges, network and resources, and injects secrets from Docker Desktop. It also runs without Desktop on Docker Engine. It is the documented way to isolate a local server, which the Claude Code sandbox does not do. [25][26][35]
- Figma limits: View and Collab seats get 6 calls a month (20 on Starter). Dev and Full seats get 200 a day on Starter and Professional and 600 a day on Organization and Enterprise. [28]
- Claude Code loads MCP tools on demand (tool search) by default, so idle personal servers cost little context. Its docs advise read-only database users. [24]

## Open questions
- ADR 0047 requires "keyless" entries and bans `headers` and `${VAR}`. OAuth remotes (Figma, Sentry, GitHub, Linear) need neither headers nor variables. Should the allowlist rule say "no credential of any kind"? Owner decision.
- Figma: is it part of the workflow? ADR 0027 makes DTCG in `packages/design-tokens` the only token source, so `get_variable_defs` output could only be an input to a reviewed token PR. The Figma MCP also has write tools that cannot be disabled.
- Sentry or GlitchTip (ADR 0034): does the Sentry MCP work against GlitchTip's API? Not verified. Do Sentry events (request URLs, breadcrumbs) keep raw addresses? ADR 0034 and 0040 cover logs only.
- Postgres MCP Pro has not shipped a release since 2025-05-16. Is it maintained? Should we prefer MCP Toolbox with a `tools.yaml` that has no `execute_sql`?
- Not verified this pass (web search budget exhausted): OSV-Scanner's MCP mode, any Renovate MCP, Docker Gateway's exact flags (`--block-secrets`, `--verify-signatures`), a Bun docs MCP, and release dates for GitHub MCP v1.12.2 and Playwright MCP 0.0.83 (the fetch tool reported 2024, which contradicts the version history).
- Should the CONTRIBUTING "Recommended tools" table get rows for browser, native and docs tools from tier B? That is a doc edit for the owner.

## Sources
1. github/github-mcp-server README — https://github.com/github/github-mcp-server
2. GitHub MCP remote server — https://github.com/github/github-mcp-server/blob/main/docs/remote-server.md
3. GitHub MCP server configuration — https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md
4. GitHub MCP releases — https://github.com/github/github-mcp-server/releases
5. microsoft/playwright-mcp — https://github.com/microsoft/playwright-mcp
6. @playwright/mcp on npm — https://registry.npmjs.org/@playwright/mcp/latest
7. Playwright MCP releases — https://github.com/microsoft/playwright-mcp/releases
8. ChromeDevTools/chrome-devtools-mcp — https://github.com/ChromeDevTools/chrome-devtools-mcp
9. Chrome DevTools MCP tool reference — https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
10. chrome-devtools-mcp on npm — https://registry.npmjs.org/chrome-devtools-mcp/latest
11. Archived Postgres reference server — https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres
12. Datadog Security Labs, SQL injection in the PostgreSQL MCP server (2025-08-21) — https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/
13. crystaldba/postgres-mcp — https://github.com/crystaldba/postgres-mcp
14. postgres-mcp on PyPI — https://pypi.org/pypi/postgres-mcp/json
15. supabase-community/supabase-mcp — https://github.com/supabase-community/supabase-mcp
16. googleapis/genai-toolbox (MCP Toolbox for Databases) — https://github.com/googleapis/genai-toolbox
17. redis/mcp-redis — https://github.com/redis/mcp-redis
18. redis-mcp-server on PyPI — https://pypi.org/pypi/redis-mcp-server/json
19. getsentry/sentry-mcp — https://github.com/getsentry/sentry-mcp
20. @sentry/mcp-server on npm — https://registry.npmjs.org/@sentry/mcp-server/latest
21. grafana/mcp-grafana — https://github.com/grafana/mcp-grafana
22. upstash/context7 — https://github.com/upstash/context7
23. modelcontextprotocol/servers — https://github.com/modelcontextprotocol/servers
24. Claude Code, MCP — https://code.claude.com/docs/en/mcp
25. Docker MCP Gateway docs — https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
26. docker/mcp-gateway — https://github.com/docker/mcp-gateway
27. Figma MCP remote server installation — https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
28. Figma MCP rate limits and access — https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/
29. SocketDev/socket-mcp — https://github.com/SocketDev/socket-mcp
30. Linear MCP — https://linear.app/docs/mcp
31. Bun llms.txt — https://bun.sh/llms.txt
32. Hono llms.txt — https://hono.dev/llms.txt
33. mobile-next/mobile-mcp — https://github.com/mobile-next/mobile-mcp
34. @mobilenext/mobile-mcp on npm — https://registry.npmjs.org/@mobilenext/mobile-mcp/latest
35. VoidX research, MCP security (sandbox scope, Invariant GitHub MCP exploit) — mcp-security-and-voidx-mcp.md
