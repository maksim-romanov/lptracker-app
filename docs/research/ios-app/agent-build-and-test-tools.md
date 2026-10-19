---
app: ios-app
topic: Agent build, run and test tools
checked: 2026-10-01
---

# Agent build, run and test tools

Scope: which MCP servers and CLIs coding agents use to build, run, test, inspect UI and lint the Tuist-generated app (iPhone, iPad, Mac, widgets). Builds on [skeleton.md](skeleton.md), whose commands and "green" list stay the gate.

## Decisions
- Every gate is a CLI command, never an MCP call: `tuist install`, `tuist generate --no-open`, plain `xcodebuild test -workspace … -scheme VoidX -only-testing …`, `swift format lint`, `swiftlint --strict`, wrapped by `bun run check`. CI uses the same commands and no MCP. Tuist's own agent skill tells agents to run `xcodebuild test` with `--only-testing` rather than `tuist test`, because `tuist test` regenerates on every run. [13]
- The one recommended iOS agent tool is **MobileBuildMCP** (formerly XcodeBuildMCP), installed in user scope. It is maintained by Sentry under MIT and works with `.xcworkspace` plus a scheme, so it works on the Tuist output. It covers simulator and macOS build, run and test, UI automation through AXe (`snapshot_ui`, `tap`, `type_text`, `screenshot`, `wait_for_ui`), log capture and coverage. Every tool is also available from the `mobilebuildmcp` CLI. [1][3][4]
- Contributors pin it to an exact version (`mobilebuildmcp@2.7.1` or the `getsentry/xcodebuildmcp` Homebrew tap) and set `MOBILEBUILDMCP_SENTRY_DISABLED=true`. Its README says `@latest`, which ADR 0047 forbids. Sentry error telemetry is on by default, though paths are redacted and tool I/O is not sent. [1][2][5][0047]
- Contributors enable only these MobileBuildMCP workflows: `simulator`, `macos`, `ui-automation`, `project-discovery`, `coverage`. These stay off:
  - `device`: needs code signing;
  - `debugging`: `debug_lldb_command` runs arbitrary LLDB commands;
  - `xcode-ide`: proxies Xcode's MCP, see the next item;
  - `project-scaffolding`;
  - `simulator-management`: erase and reset.
  The set lives in each contributor's `enabledWorkflows`. Since v2.0 the default is `simulator` only. [3][4][6]
- Xcode's built-in MCP (`claude mcp add --transport stdio xcode -- xcrun mcpbridge`) is optional and personal. It needs Xcode running with the workspace open, so it never runs in CI or headless sessions. Use it for read-type help: preview snapshots (type size, dark mode, widget timelines in Xcode 27), semantic docs search, the issue navigator, Device Hub screenshots. Never run `sudo xcrun mcp-server enable --unsafe-always-allow-all-agents`. [8][9][10]
- Agents never use Xcode 27's MCP tools that edit build settings, compiler flags, entitlements or Info.plist keys. Those edits land in the gitignored generated project and are lost on the next `tuist generate`. The change belongs in `Project.swift` (iOS AGENTS.md rule). [10]
- The accessibility gate stays the XCUITest that calls `performAccessibilityAudit()`, run through `xcodebuild test -only-testing:VoidXUITests/...` on iPhone, iPad and `platform=macOS`. MCP accessibility trees (`snapshot_ui`, AXe `describe-ui`) are for exploring and debugging only; they are not an audit. [14][26][0022]
- The snapshot gate stays swift-snapshot-testing. Xcode 27 preview snapshots and MCP screenshots help the agent look at the UI but are never golden images, because the device, OS and Xcode state vary per machine. [10][skeleton]
- Lint and format run as CLIs, with no lint MCP. The only "iOS code quality" MCP is `ios-mcp-code-quality-server` (a-25/ios-mcp-code-quality-server, 0.1.4, last release 2025-09-26). It has one maintainer, depends on `openai`, and only wraps `xcodebuild` and SwiftLint. We found no SwiftLint, swift-format or Periphery MCP from those projects. [19][21]
- We do not adopt Periphery. Its repo was archived on 2026-08-12 and it became a commercial product. Dead-code checks stay with the compiler and `tuist inspect dependencies --only implicit`. [20][skeleton]
- Code navigation is optional: the `swift-lsp` plugin from `claude-plugins-official` runs `sourcekit-lsp`. sourcekit-lsp reads only SwiftPM and `compile_commands.json`, so a Tuist workspace also needs `xcode-build-server config -workspace VoidX.xcworkspace -scheme VoidX` and one build. The resulting `buildServer.json` is per machine and gets gitignored. [22][23][24]
- When an agent drives the running app, it launches with the `scenario` launch argument against the mock API ([e2e-testing](../repo/e2e-testing.md)). Accessibility trees and logs from a real server contain on-chain token names, which ADR 0047 treats as untrusted. Fixture data keeps the session clean. [0047][skeleton]
- Not recommended:
  - ios-simulator-mcp: duplicates MobileBuildMCP UI automation, needs Python `fb-idb`, and versions before 1.3.3 had command injection. [15][18]
  - mobile-mcp as the iOS default: telemetry is on by default and it pushes towards paid remote device clouds. It stays optional for cross-platform sessions (pinned, telemetry off); MobileBuildMCP is the iOS default. [16]
  - Appium MCP: WebDriverAgent setup, provisioning-profile tools for real devices, opt-in vision with paid API keys. [17]
  - Peekaboo and other macOS desktop-automation MCPs: they need Screen Recording and Accessibility over the whole desktop. Native macOS UI is covered by XCUITest. [25]
  - Tuist's MCP: the local `tuist mcp` was removed in 4.174.7, and the remaining server-side MCP needs a Tuist account, which we do not use. [11][12]
  - Unofficial npm republishes such as `@mseep/xcodebuildmcp` and `@iflow-mcp/cameroncooke_xcodebuildmcp`. [7]
- No agent tool may touch code signing or distribution, because M0 signs nothing for devices and a signing identity is a key ("no signing anywhere", ADR 0047). Forbidden:
  - physical-device install workflows;
  - `security` keychain commands;
  - certificates and provisioning profiles, and fastlane `match`/`sigh`/`cert`;
  - App Store Connect API keys and any App Store Connect MCP or write tool;
  - `altool` or `notarytool` uploads;
  - `--unsafe-always-allow-all-agents`. [0047][skeleton]

## Facts that constrain us
- MobileBuildMCP 2.7.1 (npm `mobilebuildmcp`, 2026-09-23) renamed everything:
  - env vars from `XCODEBUILDMCP_*` to `MOBILEBUILDMCP_*`;
  - project config from `.xcodebuildmcp/config.yaml` to `.mobilebuildmcp/config.yaml`;
  - state to `~/Library/Developer/MobileBuildMCP`;
  - registry name to `io.github.getsentry/mobilebuildmcp`.
  The old npm name `xcodebuildmcp` stopped at 2.7.0 (2026-07-23). The repo moved from cameroncooke to getsentry around v2.0.7 and has about 6.4k stars. Requirements: macOS 14.5+, Xcode 16+, Node 18+ (not needed with Homebrew). [1][2][3][7]
- MobileBuildMCP 2.7.0 changes:
  - Xcode 27 Device Hub simulators.
  - Build and test results use schema v3.
  - Builds follow the scheme's configuration instead of defaulting to Debug.
  - `extraArgs` session defaults.
  - Earlier releases fixed shell injection and path traversal. [2][3]
- Config precedence is: session tool calls, then `.mobilebuildmcp/config.yaml` at the workspace root, then env vars. The file holds `enabledWorkflows`, `customWorkflows`, `sessionDefaults` (workspace, scheme, simulator) and `sentryDisabled`. [6]
- MobileBuildMCP UI automation targets iOS simulators only. The `macos` workflow builds, runs and tests Mac apps but does not tap them. [4]
- AXe 1.8.0 (cameroncooke, MIT) is a Swift CLI built on idb frameworks and private accessibility APIs. It supports Xcode 26 and 27, including Device Hub. idb itself (Meta, MIT) now requires Xcode 26+ and macOS 15+. [14][18]
- Xcode 26.3 added agentic coding: the Claude Agent and Codex run inside Xcode, and the same tools are exposed through MCP. External agents connect with `xcrun mcpbridge` after the setting Intelligence > "Allow external agents to use Xcode tools" is turned on, and Xcode shows an alert while one is connected. [8][9]
- Xcode 27 added:
  - agent tools that boot simulators, synthesize touches and take screenshots;
  - preview snapshots with variants;
  - debugger and run-state tools;
  - tools that read and edit build settings and entitlements;
  - String Catalog tools;
  - `lldb-mcp`;
  - an `xcrun mcp-server enable` command (beta);
  - a filesystem security layer for agents;
  - an Apple accessibility "specialist" skill.
  Device Hub cannot show devices during parallel testing. [10]
- tuist/agent-skills ships `generated-projects`, `fix-flaky-tests`, `migrate` and others. Several of them, for example `fix-flaky-tests`, need a Tuist server account. [13]
- SwiftLint 0.65.1 (2026-08-21) has no MCP or agent features. [21]

## Open questions
- Resolved by the Tools section of `apps/ios-app/AGENTS.md` and CONTRIBUTING. ~~ADR 0047 limit:~~ ADR 0047 allows only remote, read-only `https` project servers, and every iOS tool here is a local `stdio` server. iOS agent tooling can therefore only be documented, never configured in the repo. Is a README-level recommendation in `apps/ios-app/AGENTS.md` plus [CONTRIBUTING.md#recommended-tools](../../../CONTRIBUTING.md#recommended-tools) enough?
- Should `.mobilebuildmcp/config.yaml` be committed with `sessionDefaults` and `enabledWorkflows`? It is not MCP config, so ADR 0047 does not cover it, but `extraArgs` reaches `xcodebuild`. If it is committed, should it join the protected paths of integration PRs (ADR 0036)?
- Resolved: [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md) forbids code signing and release writes.
- Xcode's in-IDE Claude Agent runs bash and reads `AGENTS.md`/`CLAUDE.md`, but not our `.claude/settings.json` permissions. Which rules apply to it?
- Resolved: [ADR 0019](../../decisions/0019-ios-stack.md) rests Tuist on the module graph and implicit-import check; the JSON project format weakens only the merge-conflict argument.
- MobileBuildMCP's full per-workflow tool list renders client-side and was read only from the workflow manifests. Before relying on the deny list, run `mobilebuildmcp --help` on the pinned version.
- The exact tool names of the Xcode 26.3 `mcpbridge` server are not in Apple's docs. List them with `tools/list` on the pinned Xcode.
- tuist.dev returned 403. The MCP and Tuist skill facts come from the GitHub source and the changelog.

## Sources
1. getsentry/MobileBuildMCP README — https://github.com/getsentry/MobileBuildMCP
2. MobileBuildMCP v2.7.1 release — https://github.com/getsentry/XcodeBuildMCP/releases/tag/v2.7.1
3. MobileBuildMCP CHANGELOG — https://github.com/getsentry/MobileBuildMCP/blob/main/CHANGELOG.md
4. MobileBuildMCP workflow manifests — https://github.com/getsentry/MobileBuildMCP/tree/main/manifests/workflows
5. MobileBuildMCP privacy — https://github.com/getsentry/xcodebuildmcp.com/blob/main/app/docs/_content/privacy.mdx
6. MobileBuildMCP configuration — https://github.com/getsentry/xcodebuildmcp.com/blob/main/app/docs/_content/configuration.mdx
7. npm search "xcodebuildmcp" — https://registry.npmjs.org/-/v1/search?text=xcodebuildmcp
8. Apple, Giving external agents access to Xcode — https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode
9. Xcode 26.3 release notes — https://developer.apple.com/documentation/xcode-release-notes/xcode-26_3-release-notes
10. Xcode 27 release notes — https://developer.apple.com/documentation/xcode-release-notes/xcode-27-release-notes
11. Tuist CLI changelog; PR #10171 (remove local MCP) — https://github.com/tuist/tuist/blob/main/cli/CHANGELOG.md ; https://github.com/tuist/tuist/pull/10171
12. Tuist PR #10013 (server MCP tools) — https://github.com/tuist/tuist/pull/10013
13. Tuist skills — https://github.com/tuist/tuist/tree/main/skills/skills ; https://github.com/tuist/agent-skills
14. AXe — https://github.com/cameroncooke/AXe
15. ios-simulator-mcp — https://github.com/joshuayoes/ios-simulator-mcp
16. mobile-mcp — https://github.com/mobile-next/mobile-mcp
17. Appium MCP — https://github.com/appium/appium-mcp
18. idb — https://github.com/facebook/idb
19. ios-mcp-code-quality-server — https://registry.npmjs.org/ios-mcp-code-quality-server
20. Periphery (archived) — https://github.com/peripheryapp/periphery
21. SwiftLint releases — https://github.com/realm/SwiftLint/releases
22. swift-lsp plugin — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/swift-lsp
23. sourcekit-lsp — https://github.com/swiftlang/sourcekit-lsp
24. xcode-build-server — https://github.com/SolaWing/xcode-build-server
25. Peekaboo — https://github.com/steipete/Peekaboo
26. WWDC23, Perform accessibility audits for your app — https://developer.apple.com/videos/play/wwdc2023/10035/
- [0022] ADR 0022, [0047] ADR 0047, [skeleton] skeleton.md — in this repo
