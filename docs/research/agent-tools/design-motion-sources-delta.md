---
app: agent-tools
topic: Design and motion skills for coding agents, delta
checked: 2026-10-01
---

# Design and motion skills for coding agents, delta

Adds what [web UI sources](web-ui-sources.md), [native UI sources](native-ui-sources.md) and [design guidance](design-guidance.md) do not cover. Judged against [0023](../../decisions/0023-motion.md) (motion tokens, reduced-motion branch), [0027](../../decisions/0027-design-tokens.md) (tokens only) and [0047](../../decisions/0047-agent-tools-and-mcp.md) (no vendored skills, no project-scope install, no committed stdio or keyed MCP).

## Decisions

- We correct [design guidance](design-guidance.md): Emil Kowalski's skills are now public, MIT, in `emilkowalski/skills` (created 2026-03-16, pushed 2026-09-23, 42.6k stars), so "paid and closed until 2027" no longer holds for the repo. The animations.dev page still lists the 15 skills as a course bonus. [1][2]
- We list `emilkowalski/skills` as a contributor opt-in (user scope, `npx skills@latest add emilkowalski/skills`), never vendored. Only `animate`, `review-animations`, `improve-animations` and `animation-vocabulary` fit web work; `animate-expo`, `ask-sonner` and `pick-ui-library` do not apply (React Native, a React toast library, library picking). [1][3]
- We tell contributors that Emil's skills prescribe literal values (UI under 300 ms, three `cubic-bezier` curves), which our motion-token lint rejects. The agent must map each to a `--motion-*` token; the skill is never the source of a number. The skill does say reduced motion means "fewer and gentler, not zero", which matches our reduced values. [3]
- We keep Emil's `apple-design` and `write-swift` out of the iOS recommendations until diffed against our Swift rules: the iOS notes already carry three SwiftUI skill sets and none was compared for token conflicts. [1][4]
- We do not install Impeccable (`pbakaus/impeccable`, Apache-2.0, 73k stars, pushed 2026-10-01) for VoidX work. Its installer writes into `.claude/`, `.cursor/`, `.github/` and creates a tracked `.impeccable/`, `PRODUCT.md` and `DESIGN.md`, which breaks 0047's no-project-scope rule, the protected-path list in `AGENTS.md`, and our "no hand-written DESIGN.md" decision in [design guidance](design-guidance.md). Its 24 commands also include `bolder`, `overdrive` and `delight`, which push against a dense, token-fixed UI. [5][6]
- We allow one narrow use of Impeccable: `npx impeccable detect <dir|url>` (61 deterministic rules, no LLM, JSON output) as a contributor's local lint of built HTML for generic-AI tells. It is advisory, never a CI gate, and pinned to an exact version. Reads of its output follow 0047's untrusted-output rule. [5]
- We do not install `ibelick/ui-skills` (MIT, 9.3k stars, pushed 2026-09-30). Its `fixing-motion-performance` rules (transform and opacity first, scroll or view timelines over scroll listeners, view transitions only for navigation, blur at most 8 px) agree with ours, but it never mentions reduced motion. We copy no text; our *planned* `ui-conventions` skill states the same rules in its own words. [7][8]
- We keep `https://www.ui-skills.com/mcp` off every config: it is an `https` endpoint with `list_skills` and `get_skill`, but it serves remote skill text that changes without review and is not on the allowlist. [7]
- We adopt the Motion AI Kit only as the already-listed docs MCP (free). The unified `/motion` skill (v6.0.0, 2026-05-27) is MIT; CSS spring generation (`linear()` curves), MotionScore audits and 450+ premium examples need Motion+. A paid dependency for an open-source repo is not acceptable, so no committed instruction may rely on them. [9][10]
- We use CSS `linear()` spring curves generated into tokens by our `voidx-native` Terrazzo plugin in `packages/design-tokens` (no Motion+). That keeps `brisk` and `gentle` as pure CSS on web and avoids loading the Motion runtime for springs alone. Cross-check the sampled curve against the iOS and Android spring parameters. [9][11]
- We use Chrome DevTools MCP only as [base-dev MCP](base-dev-mcp.md) already says (perf traces, Lighthouse, screenshots). We add: its `emulate` tool lists `colorScheme`, CPU, network, viewport and geolocation but no `prefers-reduced-motion`, so the reduced-motion branch is tested through Playwright or by script, not through this MCP. [12]
- We do not use Claude Design (Anthropic Labs, launched 2026-04-17) for VoidX. It reads a codebase to extract a design system and hands off to Claude Code, which would create a second token source beside `packages/design-tokens`. Revisit only if it can ingest generated tokens read-only. The claims come from secondary articles; no official page was read. [13]
- We add no official web `llms.txt`. MDN, web.dev and developer.chrome.com all return 404 for `/llms.txt`, so agents read the per-feature MDN page by URL as the citation. [14]
- We treat the Xcode MCP and Android Studio agent mode as already covered by the iOS and Android notes and add nothing; neither has a design or motion tool. [15][16]
- Thinking Orbs and the other libraries.dev components are judged in [libraries.dev audit](libraries-dev-audit.md).

## Facts that constrain us

| Source | Maintainer | Licence | Last activity | Agent surface | Fit |
|---|---|---|---|---|---|
| `emilkowalski/skills` | Emil Kowalski | MIT | pushed 2026-09-23 | 13 skill dirs, `npx skills add` | web motion review: opt-in [1][3] |
| `pbakaus/impeccable` | Paul Bakaus | Apache-2.0 | pushed 2026-10-01 | one skill, 24 commands, `detect` CLI, 17+ harnesses | no; `detect` only, local [5][6] |
| `ibelick/ui-skills` | Ibelick | MIT | pushed 2026-09-30 | 6 skills, CLI, remote MCP | no [7][8] |
| Motion AI Kit | Motion | MIT skill; Motion+ paid features | v6.2.0 2026-07-23 | `/motion` skill, docs MCP | docs only [9][10] |
| Chrome DevTools MCP | Google | Apache-2.0 | v1.10.1 2026-09-23 | stdio MCP, 7 bundled skills | local perf aid [12][17] |
| `anthropics/skills` | Anthropic | Apache-2.0 (document skills source-available) | 19 skill dirs | skills | `frontend-design` only; `canvas-design`, `theme-factory`, `web-artifacts-builder` target artifacts, not apps [18] |
| `claude-plugins-official` | Anthropic | per plugin | 52 plugin dirs | plugins | only `frontend-design` is UI related; no motion plugin [19] |
| Claude Design | Anthropic Labs | product | launched 2026-04-17 | handoff to Claude Code | no [13] |

- Emil's `animate` skill is about 4,800 words, React and Framer Motion leaning, and its curves are `cubic-bezier(0.23, 1, 0.32, 1)`, `(0.77, 0, 0.175, 1)` and `(0.32, 0.72, 0, 1)`. [3]
- Impeccable's README says nothing on reduced motion, and `animate` is a one-line description there. [5]
- Impeccable ships configs for 22 hidden agent directories at its repo root, which is why a submodule or copy would add much noise. [6]
- Chrome DevTools MCP bundles skills `a11y-debugging`, `debug-optimize-lcp`, `memory-leak-debugging`, `chrome-devtools-cli`, `cookie-debugging`, `troubleshooting`. `a11y-debugging` suits our accessibility diagnosis, not the gate. Its `lighthouse_audit` excludes performance, and usage stats and CrUX are on by default. [12][17]
- `anthropics/skills` also holds `webapp-testing` (Playwright-based) and `skill-creator`; the latter is relevant to our own skills' evals. [18]
- Cross-document View Transitions: Chromium 126+, Safari 18.2+, Firefox not shipped in stable as of 2026 per articles; MDN lists `@view-transition` as limited availability. Enhancement only, as 0023 already says. [20][21]
- Same-document View Transitions are Baseline newly available from Firefox 144, and `:active-view-transition` from 2026-01-13. [20][21]

## Open questions

- Is `emilkowalski/skills` the same set as the animations.dev bonus, or a separate free release? The two pages disagree and no changelog was found.
- Do Emil's skills honour a token-only rule if the project skill says so, or do they still emit literals? Not tested.
- Does Impeccable `detect` work on Hono-rendered HTML with Tailwind classes without false positives on our tokens? Not run.
- Does `npx impeccable detect` send telemetry or fetch rules remotely? The README is silent.
- Which Chrome or web.dev pages should the *planned* `ui-conventions` skill cite for view transitions, and does Bramus's `view-transitions.chrome.dev` demo site have a stable licence? Not read.
- Can `linear()` spring curves from codegen match Compose and SwiftUI springs closely enough to share one token? Needs a numeric test.
- Claude Design, Josh Comeau, Una Kravets, Jhey Tompkins and Adam Argyle material were not read; none was found with an agent surface in this pass.
- Does Safari ship cross-document support unprefixed in 18.2 on iOS too? Taken from an article; check MDN compat data.

## Sources

1. emilkowalski/skills — https://github.com/emilkowalski/skills (API: https://api.github.com/repos/emilkowalski/skills)
2. animations.dev — https://animations.dev/
3. Emil `animate` skill — https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md
4. Native UI sources — [native-ui-sources.md](native-ui-sources.md)
5. pbakaus/impeccable README — https://raw.githubusercontent.com/pbakaus/impeccable/main/README.md
6. pbakaus/impeccable — https://github.com/pbakaus/impeccable (API: https://api.github.com/repos/pbakaus/impeccable)
7. ibelick/ui-skills — https://github.com/ibelick/ui-skills
8. ui-skills `fixing-motion-performance` — https://raw.githubusercontent.com/ibelick/ui-skills/main/skills/fixing-motion-performance/SKILL.md
9. Motion AI Kit — https://motion.dev/docs/ai-kit
10. Motion AI Kit changelog — https://motion.dev/changelog?lib=ai-kit
11. Motion AI Kit install — https://motion.dev/docs/ai-kit-install
12. Chrome DevTools MCP tool reference — https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md
13. Claude Design, secondary — https://www.datacamp.com/blog/claude-design, https://claude.com/resources/tutorials/using-claude-design-for-prototypes-and-ux
14. `llms.txt` probes (404) — https://developer.mozilla.org/llms.txt, https://web.dev/llms.txt, https://developer.chrome.com/llms.txt
15. Xcode MCP — [agent docs and skills](../ios-app/agent-docs-and-skills.md)
16. Gemini in Android Studio — https://developer.android.com/studio/gemini/features
17. Chrome DevTools MCP skills — https://github.com/ChromeDevTools/chrome-devtools-mcp/tree/main/skills
18. anthropics/skills — https://github.com/anthropics/skills/tree/main/skills
19. anthropics/claude-plugins-official — https://github.com/anthropics/claude-plugins-official/tree/main/plugins
20. Same-document View Transitions Baseline — https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
21. Cross-document View Transitions, secondary — https://css-tricks.com/cross-document-view-transitions-part-1/
