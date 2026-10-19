---
app: server
topic: Web UI component and motion sources for coding agents
checked: 2026-10-01
---

# Web UI component and motion sources for coding agents

Judged against the fixed web stack: Hono JSX SSR, Turbo Frames and Stimulus, Tailwind 4 on DTCG tokens, motion tokens with a reduced-motion branch, cross-document View Transitions ([0018](../../decisions/0018-web-ssr-hotwire.md), [0023](../../decisions/0023-motion.md), [0047](../../decisions/0047-agent-tools-and-mcp.md)).

## Decisions

- We use no component library as a dependency for M0. Components are our own Hono JSX plus Tailwind classes on our tokens, because every library below ships its own colour, radius and motion values that the token and motion-token lint would reject. [3][6]
- We use Basecoat (MIT, `basecoat-css` 1.0.2, Tailwind 4, vanilla JS, shadcn themes) as the first reference for markup and ARIA patterns (dialog, dropdown, tabs, command). We copy the semantic HTML and rewrite the styling to our tokens. Fallback dependency if hand-building stalls: Basecoat, because it is the only candidate that is MIT, framework-free and token-compatible (CSS variables). [3]
- We use daisyUI (MIT, v5.7.x, Tailwind 4 only) as a reference, not a dependency. Its class-name vocabulary overrides our token layer, but `https://daisyui.com/llms.txt` is a cheap agent read for component anatomy. [4]
- We do not buy Tailwind Plus for the project. Its blocks are paid and we could not verify the licence for an open-source repo, so no block text may be committed. A contributor with a licence may use it locally as a visual reference. [1]
- We do not add Flowbite, Preline or Web Awesome. Flowbite and Preline carry paid Pro tiers beside the MIT core and bring their own JS runtime that competes with Stimulus; Preline's package says "MIT and Preline UI Fair Use License", which needs a legal read. Web Awesome is custom elements with shadow DOM, which clashes with Tailwind utilities and with server-rendered HTML that must work without JS ([0018](../../decisions/0018-web-ssr-hotwire.md)). [5][7][8]
- We write motion as CSS first: `transition` with `@starting-style` for entry, `view-transition-name` for pages, `animation-timeline` for scroll effects, all reading `--motion-*` token variables. JS animation is a fallback inside a Stimulus controller. [10][11][12]
- We add the Motion library (MIT, `motion` vanilla, `animate()` mini 2.3 kB, hybrid 18 kB) only when a Stimulus controller needs a spring or sequence CSS cannot express. Spring tokens (`brisk`, `gentle`) are the likely reason. Parameters come from generated tokens, never literals. [9]
- We do not use GSAP. It is free for commercial use since the Webflow licence (plugins included), but it bans use in visual animation builders that compete with Webflow, and nothing in our stack needs a timeline engine. [13]
- We do not use AutoAnimate or Open Props. AutoAnimate (MIT) animates DOM changes by itself and bypasses motion tokens. Open Props duplicates our DTCG tokens; only its easing and animation names are worth reading. [14][15]
- We add the `frontend-design` skill and Vercel `web-design-guidelines` as contributor-installed local or user skills, never vendored ([0047](../../decisions/0047-agent-tools-and-mcp.md)). Both are framework-agnostic and cover focus rings, reduced motion and one-orchestrated-moment motion. Their advice on fonts and "distinctive" style yields to our tokens. [16][17]
- Our own *planned* `ui-conventions` skill ([design guidance](design-guidance.md)) points at our tokens, the Basecoat patterns we copied, the WCAG gates and the motion rules. It is shorter and more binding than any third-party skill. [16][17]
- We do not use the shadcn MCP or registry. `shadcn mcp init --client claude` writes project-scope config, which [0047](../../decisions/0047-agent-tools-and-mcp.md) forbids, and its components are React plus Radix. [18]
- Magic UI (MIT, React, Framer Motion) and 21st.dev (React, free tier limited to 2 copies a day, paid credits, CLI `init --client claude`) stay as visual inspiration only. Their code cannot run on our stack. [19][20]
- Recommended shortlist:
  1. Dependency: none at M0; Motion vanilla later if a spring is needed.
  2. In-repo reference: Basecoat patterns, `daisyUI llms.txt` for anatomy, MDN pages for CSS features.
  3. Contributor local skills: `frontend-design`, `web-design-guidelines`; optional Motion docs MCP (`https://mcp.motion.dev`, free, no account) in user scope.
  4. Own *planned* `ui-conventions` skill in `.agents/skills/`.

## Facts that constrain us

| Source | Version seen | Licence | Price | Agent surface | Fit |
|---|---|---|---|---|---|
| Tailwind Plus | not verified | paid, terms not read | paid | none found | partial (HTML blocks) [1] |
| Tailwind CSS | v4.3 docs | MIT | free | no `llms.txt` (404) | yes [2] |
| Basecoat | `basecoat-css` 1.0.2, 4.3k stars | MIT | free | docs index at `/llms.txt` lists 50+ components | yes [3] |
| daisyUI | 5.7.x, 42.5k stars | MIT | free | `llms.txt`, Claude plugin dir in repo | partial [4] |
| Flowbite | v4.0 | MIT core, Pro paid | Pro paid | `npx flowbite-mcp` (stdio, MIT) | partial [5][6] |
| Preline | 5.0.0 | MIT + "Fair Use License" | Pro paid | skills via `npx skills add htmlstreamofficial/preline` | partial [7] |
| Web Awesome | 3.14.0 | open core from Shoelace | Pro paid | skills and `llms.txt` shipped in `node_modules` | partial [8] |
| Oat | pre-1.0, about 10 kB | MIT | free | none | partial, unstable [21] |
| Motion | current | MIT; Motion+ paid | free core | free docs MCP, no account | yes, JS fallback [9][22] |
| GSAP | current | free standard licence, Webflow-owned | free | none checked | no [13] |
| shadcn | CLI `shadcn@latest` | MIT | free | MCP via `mcp init` | no [18] |
| Anthropic `frontend-design` | repo main | Apache-2.0 | free | skill | yes [16] |
| Vercel `web-design-guidelines` | repo main | MIT | free | skill, 100+ rules | yes [17] |

- Flowbite MCP: the Figma token is optional; docs tools run without it. It runs over stdio, so only local or user scope is allowed, pinned to an exact version. [6]
- Motion MCP is `https`, keyless and read-only in effect (docs search), so it meets the committed-MCP test in [0047](../../decisions/0047-agent-tools-and-mcp.md) but is not on the maintainer allowlist. Source code of premium examples and MotionScore need Motion+. [22]
- Browser support: `@starting-style` is Baseline 2024. Same-document View Transitions are Baseline newly available since Firefox 144 (2025-10-14), without view transition types. Scroll-driven animations show "limited availability" on MDN, so they are enhancement only. [10][11][12][23]
- The `frontend-design` text asks for "one orchestrated moment per page" and a visible focus and reduced-motion floor. [16]
- Vercel guidelines: honour `prefers-reduced-motion`, prefer CSS over main-thread JS, visible focus ring on every focusable element, pause control after 5 s of autoplay. [17]
- Web Awesome's AI skills are generated per build and read from `node_modules`, so they need the package installed. [24]
- No official Hotwire, Stimulus or Turbo `llms.txt` exists (both URLs 404). [25]

## Open questions

- Tailwind Plus: licence for use in an open-source repo, price, and whether Elements has an AI or MCP surface. The site returned only its login page.
- Cross-document View Transitions support in Firefox and Safari: not re-read from MDN or Baseline here; ADR 0023 already treats it as enhancement. Check before the web spec.
- Preline "Fair Use License" text and Flowbite Pro price were not read.
- Does Basecoat's JS (dialog, dropdown) behave with Turbo Frames reloads and without Turbo Drive, or do we rewrite it as Stimulus controllers?
- Motion `animate()` and `prefers-reduced-motion`: the docs page read does not say whether the library reads the setting itself. Our reduced motion values decide it, but confirm.
- Does Motion's MCP belong on the maintainer allowlist? Owner decision.
- Anthropic `frontend-design` licence is Apache-2.0 on `LICENSE.txt`, which conflicts with the MIT annotation on `.agents/**` if ever vendored; ADR 0047 already says do not vendor.

## Sources

1. Tailwind Plus (login page only) — https://tailwindcss.com/plus
2. Tailwind CSS installation (v4.3) — https://tailwindcss.com/docs/installation/using-vite
3. Basecoat repo and package — https://github.com/hunvreus/basecoat, https://raw.githubusercontent.com/hunvreus/basecoat/main/package.json, https://basecoatui.com/llms.txt
4. daisyUI repo and llms.txt — https://github.com/saadeghi/daisyui, https://daisyui.com/llms.txt
5. Flowbite MCP docs — https://flowbite.com/docs/getting-started/mcp/
6. flowbite-mcp repo — https://github.com/themesberg/flowbite-mcp
7. Preline repo and package.json — https://github.com/htmlstreamofficial/preline, https://raw.githubusercontent.com/htmlstreamofficial/preline/main/package.json
8. Web Awesome — https://webawesome.com/
9. Motion animate() — https://motion.dev/docs/animate
10. MDN `@starting-style` — https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
11. MDN View Transition API — https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
12. MDN `scroll()` — https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline/scroll
13. GSAP standard licence — https://gsap.com/community/standard-license/
14. AutoAnimate — https://github.com/formkit/auto-animate
15. Open Props — https://github.com/argyleink/open-props
16. Anthropic frontend-design skill — https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md
17. Vercel web-interface-guidelines and agent-skills — https://github.com/vercel-labs/web-interface-guidelines, https://github.com/vercel-labs/agent-skills
18. shadcn MCP — https://ui.shadcn.com/docs/mcp
19. Magic UI — https://github.com/magicuidesign/magicui
20. 21st.dev — https://21st.dev/
21. Oat — https://github.com/knadh/oat
22. Motion MCP and AI — https://motion.dev/llms.txt
23. Same-document View Transitions Baseline — https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
24. Web Awesome AI docs — https://webawesome.com/docs/ai
25. Stimulus and Turbo `llms.txt` probes (404) — https://stimulus.hotwired.dev/llms.txt, https://turbo.hotwired.dev/llms.txt
