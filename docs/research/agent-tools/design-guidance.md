---
app: repo
topic: Design quality guidance for coding agents
checked: 2026-10-01
---

# Design quality guidance for coding agents

What makes agents produce non-generic, consistent UI for a data-dense LP tracker with fixed DTCG tokens ([0027](../../decisions/0027-design-tokens.md)), CI-enforced accessibility ([0022](../../decisions/0022-accessibility.md)) and motion budgets ([0023](../../decisions/0023-motion.md)), and what we write, reference or leave to contributors ([0047](../../decisions/0047-agent-tools-and-mcp.md)). Browser tools are in [browser agents](browser-agents.md).

## Decisions

- We write one small project skill, `ui-conventions` (well under 500 lines, details in linked files), and not a copy of any third-party design skill. It states the VoidX direction: tokens only, numbers monospaced and formatted by the server, density over decoration, states (loading, empty, stale, error) per [concepts](../../concepts/). Skill descriptions cost context every turn and a body loads on use, so the description names UI work narrowly; Claude Code documents this and `paths:` scoping. [1][2]
- We do not install or vendor Anthropic's `frontend-design` skill for VoidX work. It is built to avoid "generic AI aesthetics" with bold typography, distinct palettes and "high-impact animations" for landing pages and new brands; its own text says to spend boldness in one place, but it asks the agent to pick a fresh aesthetic per task, which contradicts a fixed token set. A contributor may install it in user scope for throwaway prototypes. [3][4]
- We copy the diagnosis, not the skill: Anthropic says generic output is "distributional convergence" (Inter, purple gradients, minimal motion) and fixes it by giving the model specifics at "the right altitude", neither hex codes nor vague taste words. Our tokens are the specifics, so the skill points at generated token names, never values. [5]
- We reference, and do not vendor, Vercel Web Interface Guidelines (MIT) as a review checklist for web pages: keyboard, focus, hit targets, URL state, reduced motion, only `transform`/`opacity`, locale-aware formats. The `web-design-guidelines` skill fetches `command.md` from GitHub `main` at runtime, so its rules change without review; contributors may install it in user scope, and the project skill links the guidelines page instead. [6][7]
- We reference Rauno Freiberg's interface guidelines for micro-interaction detail (animation not over 200 ms, focus and touch behaviour). No license is stated on the page, so we copy no text. [8]
- We do not depend on Emil Kowalski's motion skills. `emilkowalski/skills` is public and MIT (pushed 2026-09-23), so contributors may install it in user scope, never vendored; the animations.dev page still lists the skills as a paid course bonus. The skills prescribe literal durations and `cubic-bezier` curves, so every value maps to a motion token; our rules come from ADR 0023. Scope and fit: [design and motion sources, delta](design-motion-sources-delta.md). [9][18]
- We make a screenshot loop the default check for UI work: Claude Code's own guidance is to give the agent a check it can run, such as "take a screenshot of the result and compare it to the original", and to ask for evidence. We use Playwright CLI for web ([browser agents](browser-agents.md)) and the simulator or emulator screenshot for native. Screenshots show mock data only. [10]
- We treat screenshots as a diagnostic, not a gate. The gates stay axe, Lighthouse, contrast, snapshots at text sizes and motion budgets (0022, 0023). [10]
- We keep design guidance for agents inside the repo as generated artefacts of the tokens, not a separate `DESIGN.md` authored by hand. A hand-written token file would be a second source next to `packages/design-tokens`. If we want one, generate a `tokens.md` summary from the DTCG source in `codegen` and link it from the skill. [11][12]
- We do not adopt Google's `DESIGN.md` format now. It is alpha, but its idea fits: YAML tokens plus prose rationale, with lint for WCAG contrast and export to Tailwind and DTCG. Revisit when it leaves alpha. [11]
- We do not add Figma MCP or Code Connect (owner does not use Figma). We note that the Figma plugin is installed in this environment; it stays unused for VoidX. [13]
- We do not add Storybook or its MCP. It is in preview, and the docs toolset needs a React, Vue 3 or Angular manifest; our web is Hono JSX SSR, and native has no Storybook. Component docs for agents live in `apps/<app>/docs/`. [14]
- We ship a design review checklist inside the project skill and run it as a subagent (fresh context) after UI changes: tokens only, states present, numbers from the server, reduced-motion branch, text-size clipping. Claude Code documents a fresh-context reviewer, and warns to flag only correctness gaps. [10]
- We do not use anti-slop skills (taste-skill, stop-slop); previously evaluated, and they restyle prose or aesthetics rather than check tokens.

## Facts that constrain us

- Claude Code skills: descriptions load into context each turn (about 1% of the window budget); the body loads on invocation. Frontmatter `paths`, `disable-model-invocation`, `user-invocable: false` and `context: fork` exist; keep `SKILL.md` under 500 lines. Skills live in personal, project, enterprise or plugin scope. Checked against docs at 2026-10. [1]
- Anthropic's `frontend-design` is a plugin in both `anthropics/claude-code/plugins/frontend-design` and `anthropics/claude-plugins-official/plugins/frontend-design` (skill about 2,000 words; two-pass: design plan, then critique). Authors are Anthropic staff. Plugins carry remote text, so ADR 0047 allows user or local scope only. [3][4]
- DTCG format 2025.10 is still labelled a preview draft ("do not implement") on designtokens.org, although Terrazzo implements it ([token-pipeline](../repo/token-pipeline.md)). Agents should not cite the spec page as authoritative; cite our generated outputs. [15]
- Vercel guidelines: 58 commits, MIT, delivered as skill, `AGENTS.md` or review command; rule areas include interactions, animation, layout, content, forms, performance, design. Our rules differ in places: Title Case headings and a fixed copy style are not part of our glossary. [6][7]
- Storybook MCP (Storybook 10.6): development, docs and testing toolsets; docs toolset needs a components manifest. [14]
- Material 3 motion defines easing and duration tokens, springs, and expressive versus standard schemes. This matches the shape of our motion tokens. [16]
- Apple's HIG motion page returned no body to the fetch tool, so no Apple text is cited. Reference the page by URL only. [17]

## Open questions

- What should `ui-conventions` contain beyond tokens: density rules, table and chart conventions, number formatting (sign, compact, locale, tabular digits)? No agent-ready, official fintech or data-dense UI reference was found in this pass; the search budget was exhausted before the question was settled.
- Does an Anthropic engineering post beyond the "improving frontend design through skills" article cover visual feedback loops for UI? Not found.
- Do we generate `tokens.md` from DTCG in `codegen`, or rely on the generated Tailwind `@theme` and Swift and Compose constants as the agent-visible form? Owner decision.
- How do we evaluate the skill (promptfoo suite as in [skills research](skills-and-knowledge.md), or screenshot diffs)? Not settled.
- Does the Playwright CLI skill installer write into project `.claude/` (see [browser agents](browser-agents.md))? Still unverified.
- Apple HIG motion and Material motion text should be read by a person for the native `Motion` and `LocalReducedMotion` helpers.

## Sources

1. Claude Code, Extending Claude with skills — https://code.claude.com/docs/en/skills
2. Claude Code, Best practices (skills versus CLAUDE.md) — https://code.claude.com/docs/en/best-practices
3. anthropics/claude-code, frontend-design plugin — https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design
4. anthropics/claude-plugins-official, frontend-design — https://github.com/anthropics/claude-plugins-official/tree/main/plugins/frontend-design
5. Claude blog, Improving frontend design through skills — https://claude.com/blog/improving-frontend-design-through-skills
6. vercel-labs/web-interface-guidelines — https://github.com/vercel-labs/web-interface-guidelines
7. vercel-labs/agent-skills, web-design-guidelines SKILL.md — https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md
8. Rauno Freiberg, Web Interface Guidelines — https://interfaces.rauno.me/
9. Emil Kowalski, animations.dev — https://animations.dev/
10. Claude Code, Best practices, "Give Claude a way to verify its work" — https://code.claude.com/docs/en/best-practices
11. google-labs-code/design.md — https://github.com/google-labs-code/design.md
12. VoidX ADR 0027 — ../../decisions/0027-design-tokens.md
13. Figma MCP server (instructions in this environment; not fetched)
14. Storybook MCP overview — https://storybook.js.org/docs/ai/mcp/overview
15. Design Tokens Community Group, Format 2025.10 — https://www.designtokens.org/tr/drafts/format/
16. Material Design 3, Motion — https://m3.material.io/styles/motion/overview/how-it-works
17. Apple HIG, Motion — https://developer.apple.com/design/human-interface-guidelines/motion
18. emilkowalski/skills (MIT) — https://github.com/emilkowalski/skills
