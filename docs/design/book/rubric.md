# Design rubric

The screenshot review, the second part of phase 7 ([workflow](../../workflow.md)). The reviewer compares each screenshot with the approved prototype and marks every row pass or fail. A failed blocker row sends the step back; a failed note row becomes an issue.

## Matrix

Every state a screen page lists, in each cell:

| Client | Sizes | Also |
|---|---|---|
| Web | 390, 820 and 1280 px wide | Light and dark; 200 % zoom at 1280 |
| iPhone | 6.1-inch | Light and dark; largest accessibility text size |
| iPad | Full screen, half screen, Slide Over | Light and dark |
| Mac | Main window at 1240 px, Settings window | Light and dark |

## Rows

| # | Check | Level |
|---|---|---|
| 1 | Regions, their order and their components match the screen page and the prototype | blocker |
| 2 | Cards, rows, range bar, chips and summary are the approved ones from [ghost-cards.html](visual/prototypes/ghost-cards.html) and [ui-kit.html](visual/prototypes/ui-kit.html), not new ones | blocker |
| 3 | DM Sans everywhere, figures and headlines bold; addresses in SF Mono (Apple) or DM Mono ([ADR 0055](../../decisions/0055-ghost-design-language.md)) | blocker |
| 4 | Every value comes from a token; no literal colour, size or duration | blocker |
| 5 | Numbers pass the golden formatting tests; no `$0` for an unpriced token; no USD in the tokens-only state | blocker |
| 6 | Each [screen state](foundations/screen-state.md) shows as its page says; stale and partial data keep their values | blocker |
| 7 | No horizontal page scroll; content keeps the margin plus the safe area | blocker |
| 8 | Text contrast passes the contrast test for this card fill and palette | blocker |
| 9 | Status is a word and a shape, never colour alone | blocker |
| 10 | Touch targets at least 44 pt; focus order equals reading order | blocker |
| 11 | Reduced motion and reduced transparency give the fallback the screen page names | blocker |
| 12 | Spacing follows the scale; nothing touches an edge; groups align to one grid | note |
| 13 | Large text stacks rows instead of clipping them | note |
| 14 | Copy is short, in sentence case, and uses the [glossary](../../glossary.md) terms | note |
