---
app: repo
topic: Typography token naming
checked: 2026-10-11
---

# Typography token naming

Research on 2026-10-11 for text roles in a multi-platform product (web, SwiftUI, Compose) with DTCG tokens. Role names were read from source files in the systems' repositories and npm packages; Apple, the Material 3 role page and Wise's role docs could not be fetched (JS-rendered) and are marked as memory.

## Findings

- **Grammar.** The most common is role then size word: Material 3 `displayLarge`, Primer `text.title.large`, Atlassian `font.heading.xxlarge`, Spectrum `heading-size-xxl`. Carbon uses role and two digits (`display-01`), Coinbase and Fluent role and one digit (`display1`, `Title1`). Wise names by function (`title-screen`, `title-section`) and keeps a separate display scale.
- **Shared vocabulary** (three or more systems, verified): `display`, `heading`, `title`, `body`, `label`, `caption`, `code`. `metric` appears only in Atlassian (`font.metric.large/medium/small`), `figure` in none.
- **Big numbers.** Most systems reuse display or heading styles: Material 3, Primer, Carbon, Spectrum, Polaris, Coinbase (`display1` to `display3`), Fluent. Dedicated numeric concepts: Atlassian `font.metric.*`, Wise `np-text-display-number`, Fluent's `fontFamilyNumeric` family token, and component-level Ant `Statistic` and Chakra `Stat`.
- **Tabular digits.** DTCG 2025.10 typography has five properties (family, size, weight, letter spacing, line height) and no feature property ([spec 9.8](https://www.designtokens.org/tr/2025.10/format/)). CSS `font-variant-numeric: tabular-nums`; SwiftUI `.monospacedDigit()` and Compose `fontFeatureSettings = "tnum"` are from memory. Coinbase turns tabular numbers on by default for `label` and `caption` and offers a `tabularNumbers` prop.
- **Collisions.** `title`, `body`, `caption` and `headline` match SwiftUI `Font.TextStyle`; Material names match Compose `Typography` slots; Tailwind `--text-*` is the size namespace. Namespace the generated Swift (`VoidFont.titleLg`) and alias Compose slots.
- **Set size.** Material 3 has 15 roles, Coinbase 13, Primer 11.

## Decisions

Big numbers are `display-lg/md/sm` with the tabular feature, not a separate family; the 17 pt number role is `body` with tabular digits. Roles are `title-lg/md/sm`, `body`, `body-sm`, `label`, `caption` (10 in all). Sizes use the same `lg/md/sm` words as spacing. The tabular behaviour is the token `font.feature.tabular-nums`; the numeric face is `font.family.numeric` (as Fluent). Written in the [design book](../../design/book/foundations/typography.md).

## Open questions

- `display-sm` (28) is smaller than `title-lg` (32) in the placeholder values; the design pass may reorder them.
- Not verified: Apple style names, Material 3 role page, Stripe, Revolut, Monzo, Robinhood (no public source found).
