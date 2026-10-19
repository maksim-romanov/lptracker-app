---
app: android-app
topic: Agent tools and MCP servers
checked: 2026-10-01
---

# Agent tools and MCP servers

Extends [ADR 0047](../../decisions/0047-agent-tools-and-mcp.md) and [mcp-security](../agent-tools/mcp-security-and-voidx-mcp.md) to Android. Versions: AGP 9.4, Kotlin 2.4.20, Android Studio Quail 4 (2026.1.4), Android CLI 1.0.16486076 ([skeleton](skeleton.md)).

## Decisions

- We verify only through Gradle tasks (`./gradlew assembleDebug testDebugUnitTest lint ktlintCheck verifyRoborazziDebug`), the same command CI runs. Lint, ktlint, compose-lints and Roborazzi already run as Gradle tasks, so agents need no MCP or skill for them. [skeleton]
- We do not recommend a Gradle MCP. rnett/gradle-mcp (Apache-2.0, 65 stars) runs any task and adds a Kotlin REPL, which means arbitrary code execution through a process outside the Claude Code sandbox. The Develocity MCP is served from a Develocity instance, which we do not run. [1][2][mcp-security]
- `apps/android-app/AGENTS.md` tells agents to inspect a running app with the Android CLI: `android layout` (JSON UI tree; `--diff` is a deprecated no-op), `android screen capture --annotate`, `android run`, `android emulator`. It is Google's official tool and runs as Bash, so Claude Code permissions and the sandbox apply to it. [3][4]
- Agents drive emulators only, never a contributor's personal phone. The Android CLI skill taps with `adb shell input tap|swipe|text|keyevent`. Contributors may allow `adb shell input *` and `adb exec-out screencap *` and must keep every other `adb shell` call on prompt. [4]
- Contributors run the Android CLI with `--no-metrics` in `~/.androidrc`. It records commands, flags, agent name and stack traces, but not file paths or outputs. VoidX work uses neither `android auth login` nor `android device remote` (Google-account remote devices). [3][5]
- Mobile-mcp (mobile-next, Apache-2.0, 1.0.6 of 2026-09-30) is the optional cross-platform device MCP shared with iOS. It reads the accessibility tree before screenshots. Contributors pin it (`@mobilenext/mobile-mcp@1.0.6`, never the README's `@latest`), set `MOBILEMCP_DISABLE_TELEMETRY=1` (PostHog/Scarf) and leave remote devices unused. [6][7][ADR 0047]
- We forbid adb MCPs that expose a shell: minhalvp/android-mcp-server (`execute_adb_command`, 811 stars) and CursorTouch/Android-MCP (shell tool, MIT). An injected screen string could run any device or host command through an MCP process that Claude Code does not sandbox. [8][9][mcp-security]
- We forbid every Google Play Developer API MCP. All of them are community projects (top: lusky3/play-store-mcp, 26 stars), most expose upload, release or rollout tools, and all need a service-account key, which breaks 0047's keyless rule. People publish releases. [10][ADR 0047]
- We do not use the Firebase MCP (`npx firebase-tools mcp`). Our stack has no Firebase (push goes through OneSignal, ADR 0014). The server acts with the user's Firebase CLI login or ADC and can deploy and write Firestore and Auth. `--only` narrows tool groups but always keeps core tools, so no read-only mode exists. [11]
- Maestro MCP and Appium MCP stay optional and are not recommended until an E2E tool is chosen. Maestro (Apache-2.0): `maestro mcp` with 9 tools; contributors set `MAESTRO_CLI_NO_ANALYTICS=true` and use none of the cloud tools (`run_on_cloud` needs `maestro login`). Appium MCP (Apache-2.0) has no shell tool and generates test code, but brings UiAutomator2. [12][13][14]
- Android skills (google `android/skills`, Apache-2.0) are installed per user, never with `--project=.`. 0047 bans vendored third-party skills, and project install writes into the repo. Useful ones: `agp-9-upgrade`, `navigation` (Nav3 setup), `edge-to-edge`, `testing-setup`, Compose `adaptive` and `theming`. AGENTS.md and ADR 0020 override any skill. [15][16][ADR 0047]
- `research-app` and AGENTS.md cite developer.android.com pages for Android docs. `developer.android.com/llms.txt` returns 404, and `android docs search|fetch` (Android Knowledge Base) is the official agent channel. Context7 stays optional: it indexes Compose, Glance, Navigation 3, `nav3-recipes` and `/zacsweers/metro`, but not Roborazzi, and its entries carry no version. [3][17][18][19]
- Kotlin LSP is optional and not required. It is alpha, its AGP support is experimental and it is partly closed-source (latest tag v263.4702.0). [20][21]
- The JetBrains IDE MCP server (IntelliJ 2025.2+) is allowed only with "brave mode" off. Its tools run terminal commands and run configurations outside the Claude Code sandbox. When Android Studio is open, `android studio find-declaration|find-usages|analyze-file|render-compose-preview` gives the same semantics through Bash. [3][22]
- Gemini agent mode in Android Studio is allowed. It reads `AGENTS.md` from the open file's directory and every parent, so `apps/android-app/AGENTS.md` applies. We commit no `GEMINI.md`, because it would override AGENTS.md in the same directory. Its MCP client takes only HTTP/SSE, never stdio, which fits 0047. [23][24][25]
- Accessibility runs as tests, not through an agent tool. `enableAccessibilityChecks()` (ATF, Compose ≥ 1.8, `ui-test-junit4-accessibility`) runs in `connectedDebugAndroidTest` on the emulator. We do not use `roborazzi-accessibility-check` as a gate: the Compose ATF extensions are a no-op on Robolectric ([native-ui-tests](../repo/native-ui-tests.md)). Agents read failures from the XML in `build/outputs/androidTest-results/`. [26][27][ADR 0022]
- CI uses plain Gradle through `gradle/actions/setup-gradle`, with no Android CLI, no MCP, and `--strict-mcp-config` for any agent job. The Android CLI needs Google downloads, collects telemetry by default and adds nothing CI needs. [m0-skeleton][ADR 0047]
- No agent tool touches signing. The repo holds only the committed debug keystore (ADR 0020). Agents never run `bundleRelease`, `signingReport` against a release key, `apksigner` or `keytool`, and no MCP gets Play Console or keystore access. [ADR 0020][ADR 0047]

## Facts that constrain us

| Tool | Maintainer, license | Where it runs | Can do | Risk |
|---|---|---|---|---|
| Android CLI 1.0.16486076 (2026-10) | Google, Android SDK terms | local binary, Bash | SDK, emulator, run, install, UI tree, screenshots, skills, docs, journeys, Studio bridge | telemetry on by default; `auth` and remote devices tie it to a Google account [3][5] |
| Gemini agent mode | Google, in Studio | IDE plus Gemini API | build, deploy, logcat, screenshots, `adb shell input`, MCP over HTTP | free tier may train on chat code; shell sandbox setting [23][25][28] |
| JetBrains MCP server | JetBrains, bundled 2025.2+ | IDE, SSE/stdio/HTTP | inspections, symbols, run configs, terminal, debugger | brave mode skips confirmation [22] |
| mobile-mcp 1.0.6 | mobile-next, Apache-2.0 | stdio or `--listen` HTTP | install, launch, tap, swipe, a11y tree, screenshots, logs, recording | telemetry on by default; remote devices cost money [6][7] |
| Maestro MCP | mobile.dev, Apache-2.0 | `maestro mcp`, stdio | inspect, screenshot, run flows, cloud runs | analytics on by default; cloud key [12][13] |
| Appium MCP | Appium org, Apache-2.0 | stdio, bundled drivers | sessions, gestures, page source, locators, test codegen | OTel opt-in; no shell [14] |
| android-mcp-server / Android-MCP | community, Apache-2.0 / MIT | stdio, Python | arbitrary adb or shell commands | forbidden [8][9] |
| Firebase MCP | Google, firebase-tools | stdio | project, Firestore, Auth, Crashlytics, deploy | writes with the user's credentials [11] |
| Play API MCPs | community | stdio | listings, releases, rollouts, reviews | service-account key, writes [10] |
| rnett/gradle-mcp | rnett, Apache-2.0 | JBang, JDK 21 | tasks, tests, dependency search, REPL, Compose render | code execution [1] |
| Develocity MCP | Gradle Inc., commercial | `/mcp` on a Develocity instance | build and test analytics | needs an access key or OAuth [2] |

- The Android CLI skill sends agents to `references/interact.md` before `android layout` or `android screen`, and to `journeys.md` before a journey. Journeys are XML action lists that an agent evaluates step by step. [4][29]
- Android skills install to `~/.gemini/antigravity/skills` by default and target Gemini and Antigravity via `--agent`. The docs list `.skills/` and `.agent/skills/` as project directories, which differ from our `.agents/skills/`. The repo does not accept public contributions. [15][16]
- Android Studio's MCP client lacks stdio, resources and prompts, and Google does not document Studio as an MCP server for external agents. [24]
- `.aiexclude` controls which files Gemini in Studio may send as context. [28]

## Conflicts (flagged, not resolved)

- ADR 0047 says agents use official `llms.txt` indexes, but Android has none (404). The official equivalent, `android docs`, is a CLI with telemetry. [3][17]
- Resolved by the [M0 spec](../../specs/m0-skeleton.md): `connectedDebugAndroidTest` with `enableAccessibilityChecks()` runs on the emulator in `e2e-android`. ADR 0022 needs Compose accessibility checks on a device, and `roborazzi-accessibility-check` is experimental. [26][27]
- Resolved by ADR 0036/0047 and `.gitignore`. `android skills add --project=.` writes `.skills/` or `.agent/skills/` into the repo. Neither path is in 0047's protected-path list, nor is either ignored in `.gitignore`. [15][16]
- CONTRIBUTING's "Recommended tools" table has no Android rows. [CONTRIBUTING]

## Open questions

- Does Android Studio Quail ship the JetBrains MCP server plugin, and is it enabled by default? No Android doc confirms it.
- Do Android CLI journeys need `android auth` or Google servers to evaluate, and do they suit the M0 "E2E harness"? If so, Maestro becomes a candidate.
- Do Google's `navigation` and `testing-setup` skills assume Hilt, KSP or `kotlin-android`? If so, they conflict with ADR 0020 and built-in Kotlin.
- Does `adb shell input text` ever reach a keystore or the Tink key? Device-side risk is low on an emulator; this is unconfirmed for physical devices.
- Resolved by ADR 0036/0047 and `.gitignore`. Should `.mcp.json`, `.skills/` and `.agent/` join the integration PR path scope? This is the owner's call ([mcp-security](../agent-tools/mcp-security-and-voidx-mcp.md) open question).

## Sources

1. rnett/gradle-mcp — https://github.com/rnett/gradle-mcp
2. Develocity MCP servers (2026.3) — https://docs.develocity.ai/2026.3/integrations/agentic-ai/mcp-servers/
3. Android CLI — https://developer.android.com/tools/agents/android-cli ; overview — https://developer.android.com/tools/agents
4. android-cli skill and interact reference — https://github.com/android/skills/tree/main/devtools/android-cli
5. Android CLI release notes — https://developer.android.com/tools/agents/android-cli/release-notes
6. mobile-next/mobile-mcp — https://github.com/mobile-next/mobile-mcp
7. mobile-mcp releases — https://github.com/mobile-next/mobile-mcp/releases
8. minhalvp/android-mcp-server — https://github.com/minhalvp/android-mcp-server
9. CursorTouch/Android-MCP — https://github.com/CursorTouch/Android-MCP
10. GitHub search "google play developer mcp" — https://github.com/search?q=google+play+developer+mcp&type=repositories
11. Firebase MCP server — https://firebase.google.com/docs/ai-assistance/mcp-server
12. Maestro MCP — https://docs.maestro.dev/get-started/maestro-mcp.md
13. mobile-dev-inc/maestro — https://github.com/mobile-dev-inc/maestro
14. appium/appium-mcp — https://github.com/appium/appium-mcp
15. android/skills — https://github.com/android/skills
16. Android skills docs — https://developer.android.com/tools/agents/android-skills
17. developer.android.com/llms.txt (404 on 2026-10-01) — https://developer.android.com/llms.txt
18. Context7 search "jetpack compose", "navigation3" — https://context7.com/api/v1/search?query=jetpack%20compose ; https://context7.com/api/v1/search?query=navigation3
19. Context7 search "metro" — https://context7.com/api/v1/search?query=metro
20. Kotlin/kotlin-lsp — https://github.com/Kotlin/kotlin-lsp
21. kotlin-lsp releases — https://github.com/Kotlin/kotlin-lsp/releases
22. IntelliJ IDEA MCP server — https://www.jetbrains.com/help/idea/mcp-server.html
23. Gemini agent mode — https://developer.android.com/studio/gemini/agent-mode
24. Add an MCP server (Studio) — https://developer.android.com/studio/gemini/add-mcp-server
25. Agent files (AGENTS.md, GEMINI.md) — https://developer.android.com/studio/gemini/agent-files
26. Compose accessibility testing — https://developer.android.com/develop/ui/compose/accessibility/testing
27. roborazzi-accessibility-check — https://github.com/takahirom/roborazzi/tree/main/roborazzi-accessibility-check
28. Studio data and privacy; agent permissions — https://developer.android.com/studio/gemini/data-and-privacy ; https://developer.android.com/studio/gemini/permissions
29. android-cli journeys reference — https://github.com/android/skills/blob/main/devtools/android-cli/references/journeys.md
