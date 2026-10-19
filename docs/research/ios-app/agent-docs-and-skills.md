---
app: ios-app
topic: Agent docs MCPs and Swift skills
checked: 2026-10-01
---

# Agent docs MCPs and Swift skills

Which docs servers, skills and knowledge packs give coding agents current Apple and Swift knowledge for `apps/ios-app`. Builds on [agent-tools/skills-and-knowledge.md](../agent-tools/skills-and-knowledge.md) and [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md).

## Decisions

- We add nothing for iOS to project config (`.mcp.json`, `.claude/settings.json`, `.agents/skills/`). Every candidate is either a local `stdio` server, a third-party remote, or a third-party skill, and ADR 0047 allows none of these in the project. [0047][1][3]
- We point agents at Tuist's official `llms.txt`, because Tuist is the only part of our iOS stack that publishes one. Apple (`developer.apple.com/llms.txt`), swift.org and pointfree.co return 404. [5][6]
- For Apple API facts, contributors opt in to one of two docs sources: Xcode's own MCP bridge, which is local, first-party and tied to the installed SDK, or `sosumi.ai`, which is remote, keyless and read-only. A research file still cites the `developer.apple.com` URL, never the tool output. [2][3][0047]
- We recommend `claude mcp add --transport stdio xcode -- xcrun mcpbridge` only for interactive sessions. It can build, edit and render previews, so ADR 0047's rule that a session which read MCP output gets no unattended write tools applies to it. [2][0047]
- We never run `xcrun mcp-server enable --unsafe-always-allow-all-agents` (Xcode 27 beta) on a CI runner or a shared Mac. It approves every agent up front, which contradicts ADR 0047's per-call prompts and `--strict-mcp-config`. [4][0047]
- We list as opt-in for contributors, with no vendoring: Paul Hudson's `swiftui-pro`, `swift-concurrency-pro` and `swift-testing-pro`; Antoine van der Lee's `swiftui-expert-skill` and `swift-concurrency`. All are MIT, target iOS 26 and Swift 6.2, and run no remote fetches. ADR 0047 still forbids vendoring them, even though a REUSE override would allow it. [7][8][9][10][0047]
- We do not recommend Cupertino. The upstream `mihaelamj/cupertino` returns 404, the surviving fork has no license, and building the index takes a 20–24 h crawl. [11][12]
- We do not recommend the npm Apple-docs MCPs (`@kimsungwhee/apple-docs-mcp`, `apple-doc-mcp-server`) over sosumi or Xcode. They are third-party `stdio` code, their READMEs install unpinned or `@latest`, and kimsungwhee's bundled WWDC data stops at 2025. A contributor who uses one pins an exact version (ADR 0047). [13][14][0047]
- Context7 stays optional, as it is for web3. It has `/pointfreeco/swift-dependencies` (updated 2026-09-30), `/pointfreeco/swift-sharing`, `/tuist/tuist` and a crawl of Apple's SwiftUI docs, all unversioned, so a fact still needs the official page. [15][16][17]
- `apps/ios-app/AGENTS.md` should get one "Docs" line: the Tuist `llms.txt`, Xcode documentation search or sosumi for Apple APIs, and Swift-DocC on Swift Package Index for Point-Free. It links to CONTRIBUTING for the opt-in tools and does not restate rules from any skill. [5][3][0047]
- A future VoidX iOS skill borrows these patterns and states our opinions where the public skills deliberately stay neutral:
  - a version header (iOS/macOS 26, Swift 6 language mode) [7][9];
  - one reference file per topic, loaded on demand [7][9];
  - review output grouped by file, with rule name, before/after code and high/medium/low priority, and clean files skipped [7];
  - a "deprecated API" checklist (`ObservableObject` → `@Observable`, no GCD, async over closures) [18];
  - "prefer Xcode MCP tools when present" (`DocumentationSearch`, `BuildProject`, `RenderPreview`) [18];
  - our own rules: Tuist targets, swift-dependencies, `@Shared`, server-derived numbers, ADR 0022/0023 gates. [0019]

## Facts that constrain us

| Source | Maintainer | License | Fresh (last seen) | Local/remote | Fit |
|---|---|---|---|---|---|
| Xcode MCP (`xcrun mcpbridge`) | Apple | Xcode licence | Xcode 26.3+ / 27 | local `stdio`, needs Xcode (macOS) | Docs search and build tools tied to the installed SDK [2][4] |
| sosumi.ai | NSHipster (Mattt) | MIT | push 2026-09-21 | remote `https://sosumi.ai/mcp`, Cloudflare Workers | Apple docs, HIG, WWDC transcripts, external DocC [3][19] |
| Swift skills (`twostraws/*-Agent-Skill`) | Paul Hudson | MIT | SwiftUI v1.1 2026-04-20; Concurrency and Testing 2026-05-17 | local files | Review skills, iOS 26 / Swift 6.2 [7][8] |
| `AvdLee/SwiftUI-Agent-Skill`, `AvdLee/Swift-Concurrency-Agent-Skill` | Antoine van der Lee | MIT | push 2026-09-29 / 2026-09-14 | local files, plus Python `xctrace` scripts | Liquid Glass, iOS 15–27 migrations, Swift 6.2 isolation [9][10] |
| `twostraws/SwiftAgents` (AGENTS.md) | Paul Hudson | none listed | 2026-03-05 | local file | Generic iOS 26 rules [18] |
| `n0an/Widgets-Agent-Skill`, `n0an/App-Intents-Agent-Skill` | Anton Novoselov | MIT | 2026-09-08 / 2026-09-26 | local files | Only WidgetKit and App Intents packs; 14 and 35 stars [20][21] |
| `tuist/agent-skills` | Tuist | not stated | mirrored from `tuist/tuist` | local files | Only `migrate`; not for greenfield [22] |
| Tuist `llms.txt` + `.md` pages + MCP guide | Tuist | — | live | remote docs | Official; `tuist.dev` answers 403 to some fetchers [5][0019-skeleton] |
| Cupertino | mihaelamj (gone) | fork: none | fork 2025-11-28, v0.1.5 | local crawl, macOS 15+ | Docs, Evolution, swift.org, 9.7k packages [11][12] |
| `giginet/swift-evolution-mcp` | giginet | none | 2025-03-30 | local | Stale [23] |

- Xcode 26.3 added agentic coding (Claude Agent, Codex) and exposed Xcode over MCP. Agents connect through `xcrun mcpbridge` after "Allow external agents to use Xcode tools" is turned on in Settings → Intelligence. The project must be open, and Xcode alerts when an agent connects. Xcode 26.3 ships Swift 6.2.3. [2][24]
- Xcode 27 ships Swift 6.4, natural-language semantic search of the developer documentation, agent plugins (skills, MCP servers, ACP agents), and MCP tools that render previews (including Widgets and type sizes) and edit build settings, entitlements and Info.plist. It also adds a filesystem-access security layer for agents, and a beta `mcp-server` that runs without an open workspace. [4]
- Public skills target Swift 6.2. The current toolchain is 6.4, so the skills may lag two minor releases on concurrency defaults. [4][7][10]
- Xcode 27.2 (beta) adds an opt-in JSON project format (`.xcproj`). Apple says it makes merge conflicts less likely and makes the file easier for agents to edit. [25]
- sosumi rendered the WidgetKit page, including "accented rendering mode and Liquid Glass". It returned HTTP 500 for a swift-dependencies DocC page on Swift Package Index. sosumi publishes no logging policy and leaves Apple Terms compliance to the user. [3][19]
- sosumi's `SKILL.md` tells the agent to keep source links. It contains no feedback POSTs or chained remote skills, unlike ETHSKILLS. [26]
- Context7 lists `/twostraws/swiftui-agent-skill` and `/avdlee/swiftui-agent-skill` as libraries, so skill text can reach an agent through Context7 too. [15]

## Conflicts to flag (not resolved here)

- ADR 0047: "Agents use official `llms.txt` indexes." Apple, swift.org and Point-Free publish none, so the iOS app cannot follow this rule for Apple APIs without a third-party proxy (sosumi) or a local `stdio` tool (Xcode). [5][6]
- ADR 0019 chose Tuist "because Tuist removes `.pbxproj` conflicts". The Xcode 27.2 JSON format makes the same claim, in beta. This does not overturn ADR 0019 (module graph and `implicit` check remain), but its stated reason is weaker. [25][0019]
- `twostraws/SwiftAgents` and `swiftui-pro` prescribe a feature-folder layout in one project and "no third-party frameworks without asking". The second matches our "stop and ask". The first conflicts with ADR 0019's Tuist module targets, and a contributor who loads them may get advice to flatten modules. [7][18][0019]

## Open questions

- Does Xcode 27's `DocumentationSearch` (or its successor) work from `xcrun mcpbridge` without an open project, and can Linux or CI agents reach any equivalent? Apple's page lists no tool names; the names come from `SwiftAgents`.
- Should `swift-concurrency-pro` or AvdLee's `swift-concurrency` be preferred? They overlap, and neither was diffed against Swift 6.4.
- Does Point-Free host DocC that sosumi can render, or is Swift Package Index (500 today) the only path?
- Does the Xcode 27 plugin format let us ship a VoidX Xcode plugin later, and would ADR 0047 then cover it as project config?

## Sources

1. VoidX ADR 0047 — ../../decisions/0047-agent-tools-and-mcp.md
2. Apple: Giving external agents access to Xcode — https://developer.apple.com/documentation/xcode/giving-external-agents-access-to-xcode
3. NSHipster/sosumi.ai — https://github.com/NSHipster/sosumi.ai
4. Xcode 27 release notes — https://developer.apple.com/documentation/xcode-release-notes/xcode-27-release-notes
5. Tuist llms.txt — https://docs.tuist.dev/llms.txt
6. 404 checks — https://developer.apple.com/llms.txt ; https://www.swift.org/llms.txt ; https://www.pointfree.co/llms.txt
7. twostraws/SwiftUI-Agent-Skill (`swiftui-pro` SKILL.md v1.1) — https://github.com/twostraws/SwiftUI-Agent-Skill
8. twostraws repositories (Concurrency, Testing, SwiftData skills) — https://github.com/twostraws?tab=repositories
9. AvdLee/SwiftUI-Agent-Skill — https://github.com/AvdLee/SwiftUI-Agent-Skill
10. AvdLee/Swift-Concurrency-Agent-Skill — https://github.com/AvdLee/Swift-Concurrency-Agent-Skill
11. Cupertino upstream (404 on 2026-10-01) — https://github.com/mihaelamj/cupertino
12. Rippin918/cupertino fork README — https://github.com/Rippin918/cupertino
13. kimsungwhee/apple-docs-mcp — https://github.com/kimsungwhee/apple-docs-mcp
14. MightyDillah/apple-doc-mcp — https://github.com/MightyDillah/apple-doc-mcp
15. Context7 search "swiftui" — https://context7.com/api/v1/search?query=swiftui
16. Context7 search "swift-dependencies" — https://context7.com/api/v1/search?query=swift-dependencies
17. Context7 search "tuist" — https://context7.com/api/v1/search?query=tuist
18. twostraws/SwiftAgents AGENTS.md — https://github.com/twostraws/SwiftAgents
19. sosumi WidgetKit render — https://sosumi.ai/documentation/widgetkit
20. n0an/Widgets-Agent-Skill — https://github.com/n0an/Widgets-Agent-Skill
21. n0an/App-Intents-Agent-Skill — https://github.com/n0an/App-Intents-Agent-Skill
22. tuist/agent-skills — https://github.com/tuist/agent-skills
23. giginet/swift-evolution-mcp — https://github.com/giginet/swift-evolution-mcp
24. Xcode 26.3 release notes — https://developer.apple.com/documentation/xcode-release-notes/xcode-26_3-release-notes
25. Apple: Updating your Xcode project configuration file format — https://developer.apple.com/documentation/xcode/updating-your-xcode-project-configuration-file-format
26. sosumi SKILL.md — https://sosumi.ai/SKILL.md
- [0019] ADR 0019; [0019-skeleton] skeleton.md — in this repo
