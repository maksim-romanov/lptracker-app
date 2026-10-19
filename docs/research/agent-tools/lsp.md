---
app: repo
topic: Language servers for agents
checked: 2026-10-01
---

# Language servers for agents

Scope: how coding agents get go-to-definition, references, diagnostics and rename for VoidX TypeScript (TS 7, Bun workspaces, Biome), Swift (Tuist, Xcode 27) and Kotlin (AGP 9.4, Kotlin 2.4.20). CI is out of scope: it type-checks with compilers ([ts-quality-gates](../repo/ts-quality-gates.md), [iOS](../ios-app/skeleton.md), [Android](../android-app/skeleton.md)).

## Decisions

All languages
- We commit no LSP config in M0. Contributors install LSP plugins at user or local scope. A project-scope entry in `.claude/settings.json` still needs every collaborator to run `claude plugin install --scope project` once, and cloud sessions never start plugin language servers, so a committed entry gains little [1][5]. A committed plugin also runs binaries on other people's machines, which is the risk ADR 0047 cites for project MCP config.
- We treat LSP as an aid, not a gate. `bun run check` and the native builds stay the source of truth. Agents must not skip them because the LSP tool reported no diagnostics: the tool is inactive in cloud sessions and when a binary is missing, and in a monorepo it can report false unresolved imports [1][2][6].
- We rely on the existing `Read(...)` deny rules for `.env` files to cover the LSP tool too. Claude Code applies `Read` path rules to `Read`, `Grep`, `Glob` and `LSP` [2].
- We document the setup in [CONTRIBUTING.md](../../../CONTRIBUTING.md#recommended-tools), as ADR 0047 does for other contributor tools. Each app `AGENTS.md` gets one line: "Optional code intelligence: see CONTRIBUTING. Builds, not LSP diagnostics, decide." That fits the 40-line budget of ADR 0024.
- We run no rename through LSP in Claude Code. The LSP tool is read-only: definition, references, hover, document and workspace symbols, implementations and call hierarchy [2]. A rename is an edit followed by `check`.

TypeScript
- We use the TS 7 native language server (`tsc --lsp --stdio`) from the workspace's own `@typescript/native` install, not `typescript-language-server`, for three reasons [9][11][12]:
  - It is the compiler CI type-checks with.
  - It is a Go binary, so it needs no Node. `typescript-language-server` 6.0 needs Node ≥ 22.22.2 and drives a TS ≤ 6 tsserver.
  - nvim-lspconfig has made `tsc --lsp --stdio` its TypeScript config and deprecated its `tsgo` alias.
- We deliver it as a personal plugin `.lsp.json`, because Anthropic's `typescript-lsp` hard-codes `typescript-language-server --stdio` [8]:
  `{"tsc":{"command":"${CLAUDE_PROJECT_DIR}/node_modules/.bin/tsc","args":["--lsp","--stdio"],"extensionToLanguage":{".ts":"typescript",".tsx":"typescriptreact"}}}`
  `${CLAUDE_PROJECT_DIR}` resolves in LSP `command`, and a command starting with `/` may hold a full path [3]. If the contributor already has Node, the official `typescript-lsp` also works, through the aliased TS 6 package.
- We do not attach Biome as a Claude Code language server. Claude Code gives each file extension one server, and the first one registered wins [4]. Biome on `.ts` would hide the TS server, or Biome would be ignored. Biome feedback reaches agents through `bun run check`, or through the PostToolUse hook still open in [setup-notes](../claude-code/setup-notes.md). Editors may still run `biome lsp-proxy` [13].

Swift
- We use Anthropic's `swift-lsp` plugin (user scope) with the `sourcekit-lsp` that ships in the selected Xcode toolchain, so there is nothing to install through mise [1][8].
- We expect only single-file intelligence from it on Tuist targets. sourcekit-lsp understands SwiftPM, `compile_commands.json` and build servers. Every VoidX module is a Tuist `.framework` target, not a SwiftPM package [14][15].
- We leave `xcode-build-server` optional and personal: `xcode-build-server config -workspace VoidX.xcworkspace -scheme VoidX`. The `buildServer.json` it writes holds absolute `DerivedData` paths, so it goes in `.gitignore`, and its index refreshes only when you build with `xcodebuild` [17]. Tuist's docs mention no LSP or build-server support [18].

Kotlin
- We list JetBrains `kotlin-lsp` (Anthropic's `kotlin-lsp` plugin, `brew install JetBrains/utils/kotlin-lsp`) as optional, because it is the only maintained server [19][21]. It is alpha, Android import is experimental and KMP is not supported. The official plugin waits 120 s for startup to cover the Gradle import [8][19][20].
- We do not use fwcd `kotlin-language-server`, because its README declares it deprecated in favour of `kotlin-lsp` [21].
- Contributors who run IntelliJ IDEA may use its built-in MCP server instead, as a personal stdio server. It has rename, problems and symbol search, and it can run shell commands and run configurations. So ADR 0047 applies: it stays in user scope, and its commands need confirmation (brave mode off) [22].

Other agents
- Codex has no LSP integration. Its config reference has no language-server key, so it gets code intelligence only through MCP (Serena, JetBrains) or by running compilers [24].
- We keep Serena (oraios/serena) out of project config and do not recommend it [23]:
  - It is a stdio MCP server with write tools (`rename`, `replace_symbol_body`, `safe_delete`) and `execute_shell_command`.
  - It downloads language servers at run time and writes `.serena/` into the project.
  - Its application code is GPL-3.0-or-later.
  - A contributor who uses it anyway pins an exact version, as ADR 0047 requires.

## Facts that constrain us
- Claude Code: the LSP tool stays inactive until a code intelligence plugin is installed. The server starts on the first edit of a matching file. Diagnostics appear as `Found N new diagnostic issues`, and `diagnostics: false` turns them off per server [1][2][3].
- An LSP config is strict: an unknown key fails the load, and one invalid entry skips the whole `.lsp.json` [3][4]. Enabling or disabling an LSP plugin mid-session invalidates the prompt cache [6].
- Official LSP plugins are all `1.0.0`. `typescript-lsp` maps only `.ts`, `.tsx`, `.js` and `.jsx`, although its README also lists `.mts`, `.cts`, `.mjs` and `.cjs` [8].
- To commit a VoidX plugin later, we would put a directory-source marketplace in `extraKnownMarketplaces` and an `enabledPlugins` entry in `.claude/settings.json` [5][7].
- TS 7.0 (2026-07-08) ships `tsc` with LSP built in. `@typescript/typescript6` ships `tsc6`. There is no programmatic API until 7.1, which blocks embedders such as Volar, not editor LSP. The typescript-go README still calls the language service "in progress, nearly all features implemented" [9][10].
- `typescript-language-server` 6.0.1 (2026-09-24) still wraps tsserver, and its release notes do not mention TS 7 [12].
- sourcekit-lsp: background indexing has been on by default since Swift 6.1 but works only for SwiftPM. The `defaultWorkspaceType` options are `buildServer`, `swiftPM` and `compilationDatabase`, set in `.sourcekit-lsp/config.json` [15][16].
- The latest `xcode-build-server` release is v1.3.0 (2025-01-05), and it claims no Xcode 26 or 27 support. Build and LSP must use the same Xcode [17].
- `kotlin-lsp` v263.4702.0 (2026-09-13) uses Gradle Tooling API 9.5.0, and it fixed the `ClassCastException` on Android Gradle import. An earlier release raised the requirement to JDK 25. It is based on IntelliJ and partly closed source [19][20].
- The IntelliJ IDEA MCP server is bundled from 2025.2. It needs the IDE running and auto-configures Claude Code and Codex [22].

## Conflicts with docs (flagged, not resolved)
- ADR 0024 and 0047 do not cover LSP plugins or an in-repo plugin marketplace. [skills-and-knowledge](skills-and-knowledge.md) bans third-party marketplaces in project config but says nothing about a first-party one. The owner decides whether a VoidX LSP plugin may be committed after M0.
- [monorepo-toolchain](../repo/monorepo-toolchain.md) asks whether Node is needed at all. The official `typescript-lsp` path needs Node ≥ 22.22.2 on contributor machines; the TS 7 path does not [12].
- [iOS skeleton](../ios-app/skeleton.md) leaves open a thin `Package.swift` for `Domain`. A SwiftPM package would give `Domain` native sourcekit-lsp support with background indexing; Tuist targets get neither [16].

## Open questions
- Under Bun's isolated linker, does the root `node_modules/.bin/tsc` exist and point at TS 7? It does only if `@typescript/native` is a root devDependency.
- Without project references, does `tsc --lsp` resolve `@voidx/*` `.ts` exports across workspaces without false "unresolved import" diagnostics?
- Does `xcode-build-server` work with Xcode 27 build logs and multiplatform (iOS and macOS) targets? Is there a maintained alternative?
- Does `kotlin-lsp` import an AGP 9.4 built-in Kotlin project on Gradle 9.7, and does it understand Metro's compiler plugin? IntelliJ needs a registry flag for Metro.
- Does Android Studio ship the same MCP server as IntelliJ IDEA?
- How Cursor agents read editor diagnostics. Cursor's agent tools page lists no lint or LSP tool [25].
- Can mise install `kotlin-lsp` and `xcode-build-server` (`github:` or `http:` backend) as an alternative to Homebrew?

## Sources
1. Claude Code, code intelligence plugins — https://code.claude.com/docs/en/plugins/code-intelligence
2. Claude Code tools reference, LSP tool behavior — https://code.claude.com/docs/en/tools-reference#lsp-tool-behavior
3. Plugin manifest reference, `lspServers` — https://code.claude.com/docs/en/plugins/manifest-reference#lspservers
4. Plugin components, LSP servers — https://code.claude.com/docs/en/plugins/components#lsp-servers
5. Install and manage plugins, install scopes — https://code.claude.com/docs/en/discover-plugins
6. Troubleshoot plugins, language server — https://code.claude.com/docs/en/plugins/troubleshooting#language-server-doesnt-start
7. Settings reference, `extraKnownMarketplaces` — https://code.claude.com/docs/en/settings-reference
8. claude-plugins-official marketplace.json and plugin READMEs — https://github.com/anthropics/claude-plugins-official/blob/main/.claude-plugin/marketplace.json
9. Announcing TypeScript 7.0 — https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/
10. microsoft/typescript-go README — https://github.com/microsoft/typescript-go
11. nvim-lspconfig `tsc` and `tsgo` configs — https://github.com/neovim/nvim-lspconfig/blob/master/lsp/tsc.lua
12. typescript-language-server releases — https://github.com/typescript-language-server/typescript-language-server/releases
13. Biome CLI reference, `lsp-proxy` — https://biomejs.dev/reference/cli/
14. sourcekit-lsp README — https://github.com/swiftlang/sourcekit-lsp
15. sourcekit-lsp configuration file — https://github.com/swiftlang/sourcekit-lsp/blob/main/Documentation/Configuration%20File.md
16. sourcekit-lsp background indexing — https://github.com/swiftlang/sourcekit-lsp/blob/main/Documentation/Enable%20Experimental%20Background%20Indexing.md
17. xcode-build-server README and releases — https://github.com/SolaWing/xcode-build-server
18. Tuist docs index — https://docs.tuist.dev/llms.txt
19. Kotlin/kotlin-lsp README — https://github.com/Kotlin/kotlin-lsp
20. kotlin-lsp releases — https://github.com/Kotlin/kotlin-lsp/releases
21. fwcd/kotlin-language-server — https://github.com/fwcd/kotlin-language-server
22. IntelliJ IDEA MCP server — https://www.jetbrains.com/help/idea/mcp-server.html
23. oraios/serena — https://github.com/oraios/serena
24. Codex config reference — https://learn.chatgpt.com/docs/config-file/config-reference
25. Cursor agent tools — https://cursor.com/docs/agent/tools
