# Design rubric

The screenshot review, the second part of phase 7 ([workflow](../../workflow.md)). It covers what a person perceives. The reviewer compares each screenshot with the approved prototype and marks every row pass or fail. A failed blocker row sends the step back; a failed note row becomes an issue. A model's review is advisory; the owner's acceptance is the human gate ([ADR 0048](../../decisions/0048-e2e-testing.md)).

## Matrix

Every state a screen page lists, in each cell:

| Client | Sizes | Also |
|---|---|---|
| Web | 390, 820 and 1280 px wide | Light and dark; 200 % zoom at 1280; 400 % zoom at 1280, which is the 320 px reflow; RTL at 390 |
| iPhone | 6.1-inch | Light and dark; largest accessibility text size; combined: largest text, Bold Text, Increase Contrast, Reduce Motion and Reduce Transparency at once; RTL |
| iPad | Full screen, half screen, Slide Over | Light and dark |
| Mac | Main window at 1240 px, Settings window | Light and dark; Increase Contrast with Reduce Transparency |

## Rows

| # | Check | Level |
|---|---|---|
| 1 | Regions, their order and their components match the screen page and the prototype | blocker |
| 2 | Cards, rows, range bar, chips and summary are the approved ones from [ghost-cards.html](visual/prototypes/ghost-cards.html) and [ui-kit.html](visual/prototypes/ui-kit.html), not new ones | blocker |
| 3 | DM Sans everywhere, figures and headlines bold; addresses in SF Mono (Apple) or DM Mono ([ADR 0055](../../decisions/0055-ghost-design-language.md)) | blocker |
| 4 | Each [screen state](foundations/screen-state.md) shows as its page says; stale and partial data keep their values | blocker |
| 5 | No horizontal page scroll, also at 320 px reflow; content keeps the margin plus the safe area | blocker |
| 6 | Status is a word and a shape, never colour alone | blocker |
| 7 | Focus is visible on every control and card; focus order equals reading order | blocker |
| 8 | Reduced motion, reduced transparency and increased contrast give the fallback the screen page names | blocker |
| 9 | RTL mirrors the layout; figures and addresses stay left to right | blocker |
| 10 | Spacing follows the scale; nothing touches an edge; groups align to one grid | note |
| 11 | Large text and combined settings stack rows instead of clipping them | note |
| 12 | Copy is short, in sentence case, and uses the [glossary](../../glossary.md) terms | note |

## Checked in code, not here

A screenshot cannot judge these; the reviewer reads the check's result instead.

| Check | Enforced by |
|---|---|
| Every value comes from a token; no literal colour, size or duration | token lint (*planned*, M0) |
| Numbers match the server; no `$0` for an unpriced token; no USD in the tokens-only state | golden formatting tests |
| Contrast for every fill, palette and context | contrast test on the [pair list](foundations/colour.md#contrast-test-pairs) |
| Touch targets at least 44 pt (48 dp) | accessibility audits ([ADR 0022](../../decisions/0022-accessibility.md)) |
