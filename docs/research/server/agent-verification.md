---
app: server
topic: Agent-driven e2e and UI/UX verification (web)
checked: 2026-10-01
---

# Agent-driven e2e and UI/UX verification (web)

How a coding agent proves its own web change: behaviour, accessibility, performance, visuals, UX. Builds on [browser-agents](../agent-tools/browser-agents.md), [web-ui-sources](../agent-tools/web-ui-sources.md), [audit-notes](audit-notes.md), [0018](../../decisions/0018-web-ssr-hotwire.md), [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0048](../../decisions/0048-e2e-testing.md). Versions: Playwright 1.63, web-vitals 5, Turbo 8.

## Decisions

### Layers and oracles
- We make **ARIA snapshots the structural oracle** (`toMatchAriaSnapshot`, files `*.aria.yml` next to the spec, partial match by default, `/children: equal` only for lists whose order matters), because they are text, diff in review, survive restyling and read the same for an agent and a screen reader. Dynamic values (amounts, times) use regex nodes. [1]
- We use **pixel screenshots only for token-level regressions on state-gallery pages**, never on live-data pages, because rendering differs by OS, fonts and headless mode. They run Chromium-only, in the pinned Docker image, with baselines committed. [2][3]
- We run **three oracles with fixed roles**: code facts (DOM, ARIA, axe, html-validate, Lighthouse) are gates; pixel diff is a gate only for the gallery; a multimodal judge is advisory and never blocks a merge. Judges show position bias, contradict themselves between absolute and pairwise scoring, and are unstable on perceptual checks; the benchmark's routing is code facts to parsers, perception to a screenshot judge, taste to a human. [10]
- We attach the trace on failure (`trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`). From 1.63 the trace viewer shows an aria snapshot beside each action screenshot, which gives an agent a text view of every step. [4][5]

### Playwright projects (`apps/server/playwright.config.ts`)
- We define projects as options, not forks of the suite: `chromium` (default), `no-js` (`javaScriptEnabled: false`, runs only `@no-js` journeys), `reduced-motion` (`reducedMotion: 'reduce'`), `dark` (`colorScheme: 'dark'`), `mobile` (`devices['Pixel 7']`, 360 px width), `webkit` and `firefox` (functional only), `forced-colors` (`forcedColors: 'active'`). All options exist in TestOptions. [6]
- We add `text-zoom` as a test fixture, not a project: Playwright has no zoom option, so the fixture sets `document.documentElement.style.fontSize = '200%'` and also runs at 320 px width for WCAG 1.4.4 and 1.4.10; assert no horizontal scroll (`scrollWidth <= clientWidth`) and axe clean. [6][7]
- We throttle the network in Chromium through a CDP session (`Network.emulateNetworkConditions`) in a `slow-network` fixture, because Playwright has no built-in throttling option. Use it for skeleton and stale states, not for budgets. [7]
- We pin the Playwright version exactly and render baselines only in `mcr.microsoft.com/playwright:v<version>-noble`, run with `--init --ipc=host`. A local macOS run may check behaviour but never writes baselines. [3]

### Determinism
- We freeze data by scenario (below) and time by two layers: `page.clock.install()` then `pauseAt` for client timers and `Date`; a server `now` pinned by the scenario for everything rendered. The Clock API replaces `Date`, timers, `requestAnimationFrame` and `performance`, but the docs say nothing about `EventSource` or server time, so the server clock must be injected through `createRoot` overrides ([0005](../../decisions/0005-dependency-injection.md)). `install` must be the first clock call. [8]
- We rely on the screenshot default `animations: 'disabled'` (finite animations jump to their end state and fire `transitionend`; infinite ones reset), plus `caret: 'hide'` and `scale: 'css'`. Playwright also waits for two consecutive identical screenshots. Spatial motion is already off in the `reduced-motion` project, so gallery baselines use that project. `stylePath` hides the one live element (relative time) if any survives. [2][9]
- We self-host the font files, and the gallery test awaits `document.fonts.ready` before capture; `font-display` must not swap in the gallery. No source states a stricter rule; the Docker image supplies the same system fallbacks on every machine. [3]
- We keep thresholds at Playwright defaults (`threshold` 0.2) with `maxDiffPixelRatio` set per gallery page, never raised to pass a PR ([0023](../../decisions/0023-motion.md)). [2]

### Hotwire and SSE
- We wait on frames by state, never by time: `await expect(frame).not.toHaveAttribute('busy')` and `toHaveAttribute('complete')` (Turbo sets `busy` while a request runs and `complete` when navigation ends), then assert content. A helper `frameReloaded(page, id)` listens for `turbo:frame-load` for that id. Never `waitForTimeout`. [11]
- We drive SSE from a **test-only publish endpoint** (`POST /__test/publish`, mounted only when `createRoot` gets `testControl: true`) rather than `page.route`, because `route.fulfill` hands the browser a finished body, not an open stream, and cannot prove ordering or reconnect. A second endpoint closes all streams to test resync from the `since` cursor. [12][audit-notes]
- We assert a live update with this order: publish event, wait for `frameReloaded`, assert new text, assert `document.activeElement` id unchanged, assert the single polite live region text (throttled). Focus retention and announcements are observed from the DOM: `aria-live` region content and `page.evaluate(() => document.activeElement?.id)`. A real screen reader is not in the loop; announcements are verified as text only. [audit-notes][0022]
- We check Turbo Drive is off with a canary: after a link click the `navigation` request is a full document load (`page.waitForEvent('load')`).

### Performance in the loop
- We keep Lighthouse CI for navigation runs on the gallery and top pages (`numberOfRuns: 3`, budgets from ADR 0023, `startServerCommand: bun run dev`). LHCI documents no user-flow, timespan or INP support. [13]
- We measure **INP in Playwright with `web-vitals/attribution` `onINP`** injected with `addInitScript`, `reportAllChanges: true`, after real clicks and keypresses on the main interactions, reading `attribution.interactionTarget`, `inputDelay`, `processingDuration`, `presentationDelay`. INP finalises on `visibilitychange` to hidden, so the test reads the latest reported value. Assert ≤ 200 ms, on CPU throttle 4x. [14]
- We do not use Lighthouse user flows as a gate: Lighthouse documents INP in timespan mode, but its flow docs show Puppeteer only, no Playwright, and timespan has no performance score. Revisit if the Playwright adapter is documented. [15]
- Agents diagnose with **Chrome DevTools MCP** only when a budget fails: `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight` (for example `LCPBreakdown`), plus `emulate` for CPU and network. It remains optional and user-scope per browser-agents. [16][browser-agents]

### Agent tooling
- We keep `playwright-cli` as the exploration default; its output (locators, snapshots) pastes into Playwright Test unchanged. `playwright-cli install --skills` writes into the project's `.claude/skills` by default; contributors must run it with `--global` to satisfy ADR 0047. This resolves one open question in browser-agents. [17][0047]
- We use the 1.60 `boxes` option on `ariaSnapshot()` only for agent inspection (adds bounding boxes); it never goes in a committed `.aria.yml`, since boxes churn. [5]

### UX and visual review
- We give the agent a **screenshot matrix** per gallery state: `{light, dark} x {1280, 768, 360 px}` plus `reduced-motion`, `200% text` and `forced-colors` once each, produced by one command (`bun run test:visual`) into `apps/server/.artifacts/ux/` (git-ignored, not a committed baseline). Only the committed gallery baselines are gates.
- We have the agent apply a **written rubric** to those images, answering per state with evidence (element, token, pixel region) and a pass, fail or unsure verdict: (1) hierarchy, one primary element; (2) spacing and radii on tokens, no off-scale values; (3) state is not colour-only; (4) clipped or overlapping text at 360 px and 200%; (5) skeleton matches final size (CLS); (6) the state's own message, retry or next action is visible; (7) in-range, stale and unknown family each distinct. Facts a tool can check (token use, contrast, overflow) are asserted in code first, so the judge handles only perception. [10]
- We require two-pass judging for any claimed visual regression: score the same image in two orders or against the committed baseline pair, and report only agreement. Single-judge scores are never trended. [10]
- We treat `unsure` as a human review item and put the images in the PR; the owner approves taste.
- Baseline update policy: only `bun run test:visual --update` inside the Docker image, in its own commit titled `test(web): update visual baselines`, with before and after images in the PR description. An agent never updates baselines to make a failure pass.

### Scenarios and the state gallery
- We reuse the ADR 0048 name: `scenario=<fixture name>` on web as a query parameter `?scenario=` on `bun run dev` only, and as `createRoot(config, { scenario })` in tests. The same names feed Prism, the native apps and the web, so one fixture renders one state everywhere. A scenario fixes cassette, watchlist, server `now` and flag values. (Glossary: a scenario is a fixture name, not a journey.) [0048]
- We add a dev-only route `/__gallery` (absent in production builds; enforced by a route test that fails if it exists when `NODE_ENV=production`) that lists every scenario and renders each component state in its own frame: loading (skeleton), partial (one scope failed), stale, error with retry, empty, unknown family, shed. Each state has a stable id used for baselines, axe and ARIA snapshots. The gallery is also the target of axe, html-validate and Lighthouse runs, so every state is covered without live data. [0048][0022]
- Gallery routes share the real views and DTOs; they never render a hand-copied mock, so a view change shows up there by construction.

## Facts that constrain us
- Playwright 1.63 is the latest release seen (Docker doc: `v1.63.0-noble`; Ubuntu 22.04, 24.04 and 26.04 images exist; Alpine is unsupported). browser-agents lists `@playwright/cli` on a 1.64 alpha, so pin one version for both. [3][4]
- `toHaveScreenshot` uses pixelmatch; baselines are suffixed by browser and platform; WebP baselines exist since 1.62; `snapshotPathTemplate`-style `pathTemplate` since 1.50; `stylePath` since 1.41. [2][4]
- Aria snapshots: partial match by default, `/children: contain|equal|deep-equal`, `--update-snapshots` with `--update-source-method` (patch, 3way, overwrite), separate `.aria.yml` through the `name` option. [1]
- `reducedMotion`, `colorScheme`, `contrast`, `forcedColors`, `javaScriptEnabled`, `locale`, `timezoneId` are all test options. [6]
- Playwright Clock exists since 1.45. [4][8]
- web-vitals 5: `onINP` needs a page-hide to finalise; the attribution build is ~1.5 kB larger. [14]
- Chrome DevTools MCP `lighthouse_audit` excludes performance; traces come from the `performance_*` tools. [16]
- Turbo: `FrameElement.loaded` resolves when navigation ends; `busy` is present while loading. [11]

## Open questions
- `route.fulfill` with `text/event-stream` and EventSource: the issue and articles read suggest interception is unreliable; not verified against 1.63. The test endpoint avoids it.
- Does Chrome DevTools MCP or `playwright-cli` expose `Network.eventSourceMessageReceived`? Still unverified.
- Does the `reload-frame` action set `busy` and `complete` the same way as a user navigation? Verify in Turbo source before relying on the wait helper.
- Which interactions count as the INP set (copy, toggle orientation, add wallet, filter)? Needs the web spec.
- Hosted CI runners vary in timing; do INP assertions need a looser CI value than local, or only a trend? ADR 0023 forbids lowering thresholds.
- Where is the mobile or text-zoom gate worth running on every PR vs nightly? No cost data.
- Which multimodal model and prompt version judge the rubric, and are verdicts stored? Owner decision with the AI policy.

## Conflicts with existing docs
- ADR 0023 lists only Lighthouse CI as the PR performance gate and says INP comes from "user-flow"; Lighthouse flow docs show Puppeteer only. This file proposes web-vitals in Playwright instead.
- AGENTS.md of server lists only `test:a11y` and `test:perf`; `test:visual`, `/__gallery`, the test-only publish endpoint and `?scenario=` are new commands and routes and need the owner's route approval ("Stop and ask").
- ADR 0048 names the web layer only "journeys and the web gates"; the project matrix, gallery and visual baselines are not stated there.
- browser-agents says `playwright-cli install --skills` location is unverified; it writes project-scope by default (see Decisions).

## Sources
1. Playwright, Aria snapshots — https://playwright.dev/docs/aria-snapshots
2. Playwright, Visual comparisons — https://playwright.dev/docs/test-snapshots
3. Playwright, Docker — https://playwright.dev/docs/docker
4. Playwright, Release notes (1.41–1.63) — https://playwright.dev/docs/release-notes
5. Playwright, Test agents and trace viewer in release notes 1.59–1.63 — https://playwright.dev/docs/release-notes
6. Playwright, TestOptions — https://playwright.dev/docs/api/class-testoptions
7. Playwright, Emulation — https://playwright.dev/docs/emulation (CDP network conditions: https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditions)
8. Playwright, Clock — https://playwright.dev/docs/clock
9. Playwright, PageAssertions `toHaveScreenshot` — https://playwright.dev/docs/api/class-pageassertions
10. MLLM as a UI Judge — https://arxiv.org/pdf/2510.08783 ; https://github.com/CAPTH69/mllm-ui-judge
11. Turbo, Frames reference — https://turbo.hotwired.dev/reference/frames
12. Playwright issue 15353, mocking event streams — https://github.com/microsoft/playwright/issues/15353 ; https://qaskills.sh/blog/playwright-mock-server-sent-events-stream
13. Lighthouse CI configuration — https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
14. web-vitals — https://github.com/GoogleChrome/web-vitals
15. Lighthouse user flows — https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md ; INP in flows since 9.6: https://developer.chrome.com/blog/inp-tools-2022
16. Chrome DevTools MCP tool reference — https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
17. Playwright agent CLI installation — https://playwright.dev/agent-cli/installation
- [0005], [0022], [0047], [0048] ADRs, [audit-notes], [browser-agents] — in this repo
