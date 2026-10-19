# Typography

Roles, not sizes. Names follow role then size (`title-lg`), the vocabulary shared by Material, Primer, Carbon, Fluent and Coinbase ([research](../../../research/repo/typography-token-naming.md)). A screen picks a role; the role resolves to size, line height and weight per platform. The face is a token: DM Sans ([0055](../../../decisions/0055-ghost-design-language.md)).

| Role | Token | Sample size, line height |
|---|---|---|
| display-lg | `font.role.display-lg` | 56 / 56, tabular, bold |
| display-md | `font.role.display-md` | 40 / 44, tabular, bold |
| display-sm | `font.role.display-sm` | 28 / 32, tabular, bold |
| title-lg | `font.role.title-lg` | 32 / 38, semibold |
| title-md | `font.role.title-md` | 24 / 30, semibold |
| title-sm | `font.role.title-sm` | 20 / 26, semibold |
| body | `font.role.body` | 17 pt iOS, 16 sp Android, 1 rem web; 24 line |
| body-sm | `font.role.body-sm` | 15 / 20 |
| label | `font.role.label` | 13 / 16, medium, tabular |
| caption | `font.role.caption` | 12 / 16, tabular; nothing below 11 |

Big numbers use the `display-*` roles; the numeric face is the token `font.family.numeric`, a fallback for tabular digits. A number in a row or an amount line uses `body` with the tabular feature. `display-*` is the largest text in the product (hero totals and card values), so its sample sizes may move relative to `title-*` in the design pass.

| Rule | Detail |
|---|---|
| Numbers | Every number uses tabular digits, set by the feature token `font.feature.tabular-nums` (on by default for `display-*`, `label` and `caption`; switched on for numbers in `body`). The generator emits `font-variant-numeric: tabular-nums` on web, `fontFeatureSettings = "tnum"` in Compose and a `UIFontDescriptor` tabular number-spacing feature in SwiftUI, checked by test. A value never changes width when digits change. |
| Text size | Body size follows the platform default (17 pt iOS, 16 sp Android, 1 rem web); the face is DM Sans. Roles scale with system text size: Dynamic Type to AX5, font scale to 2.0, rem on web. Mac has no text scaling; windows and display zoom cover it. |
| Reflow | No fixed heights on text. At the largest sizes a row stacks (name above value) instead of truncating. Status, value and amounts are never truncated; pair names may wrap to two lines. |
| Weights | `font.weight.regular medium semibold bold` as tokens; display roles are bold, no light token in the MVP. Bold Text on Apple maps one step heavier. |
| Line length | Running text at most 65 characters. Headlines use balanced wrapping. |
| Case | Sentence case in the interface. Uppercase only for tiny section labels, with letter spacing. |
| Face | `font.family.display`, `font.family.body`, `font.family.numeric` are DM Sans; `font.family.mono` is SF Mono on Apple and DM Mono elsewhere; Chinese falls back to the platform CJK face. Only the numeric face needs tabular digits. |

> *Pending.* weights other than bold display, tracking, optical sizes. The role table above is the structural default and can be tuned without touching components.
