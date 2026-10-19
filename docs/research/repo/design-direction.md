---
app: repo
topic: Design direction and references
checked: 2026-10-03
---

# Design direction and references

Evidence and three contrasting directions. **Outcome:** the owner rejected all three as too standard, then picked Ghost (Phantom-inspired colour blocks) from samples built on measured reference sites; see [0055](../../decisions/0055-ghost-design-language.md) and [site audit](crypto-site-design-audit.md). Constraints: [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md), [colour and contrast](colour-and-contrast.md), [design guidance](../agent-tools/design-guidance.md), [libraries.dev audit](../agent-tools/libraries-dev-audit.md). Apple HIG typography, Material shape and Material 3 Expressive pages returned no body to the fetch tool; those facts come from secondary sources and are marked.

## Decisions (hold for any direction)

- We make the font family a per-platform token, not one font file name, because SF Pro, SF Mono and New York are licensed for Apple platforms only: no web, no Android, no embedding. A direction that wants one face everywhere must bundle an OFL font. [1]
- We set tabular digits on every number text style (web `font-variant-numeric: tabular-nums`, Compose `fontFeatureSettings = "tnum"`, SwiftUI `monospacedDigit()`), because amounts are server-formatted strings that change in place and must not shift layout ([motion](../android-app/motion.md), [0023](../../decisions/0023-motion.md)).
- We never show range status by colour alone: the status chip carries a word ("In range", "Below", "Above") plus a shape or icon, and the bar marks the current price with a labelled tick, because WCAG 1.4.1 forbids colour as the only cue and 0022 repeats it. [22]
- We draw the range bar ourselves (server-rendered SVG on web, `Canvas` or shapes natively), because it is a 1-D bar with two bounds and a marker, driven by `barPosition` and `status` from the server ([position model](../../concepts/position-model.md)); no chart library is needed in the MVP. The bar needs a text alternative per 0022. [23][24]
- We ship no sparkline or price chart in the MVP, because the model has no price history until the post-MVP PnL work ([vision](../../vision.md)). When it comes: Swift Charts (marks, accessibility labels, `AXChartDescriptor` audio graphs) and Vico (Apache-2.0, Compose, line/column/candlestick, accessibility listed) are the candidates, each behind its own owner decision. [23][24]
- We use Liquid Glass only for the navigation and controls layer and keep content surfaces (cards, rows, the range bar) on opaque token colours, because HIG says glass must not sit in the content layer, to use custom glass sparingly, and to use the `regular` variant under text. Contrast over glass is a manual check, not a token test. [2][26]
- We build colour ramps with fixed lightness steps so contrast is structural, as Stripe (Lab, "five levels apart passes small text") and Linear (LCH, three inputs: base, accent, contrast) do, then still run the Color.js gate, because ADR 0027 authors literal tested values. [9][10]
- We take no code, copy or brand asset from other products. Uniswap's name and logos fall under its trademark policy; its interface repo is GPL-3.0 per secondary sources and Rainbow is GPL-3.0, which conflicts with AGENTS.md's licence separation if copied; Robinhood (Capsule Sans) and Phantom (custom face with F37) fonts are proprietary. Visual reference only. [12][13][14][15][18][21]
- We treat red/green for up/down as a finance convention we do not need yet: out of range is a state, not a loss. Use red only for errors, and a separate hue for "out of range" so the two never mean the same thing. [18]

## Reference products

| Product | Does well, relevant to us | Note |
|---|---|---|
| Revert Finance | One panel per LP position: liquidity, price and fee charts, uncollected fees, ROI, in one dashboard. Closest domain peer. [17] | Dense, analyst tone; closed source |
| Uniswap app | Cross-platform design system (Tamagui) across web, wallet app and extension. [12] | Trademark; GPL interface code |
| Rainbow, Rabby | Open-source wallets (GPL-3.0; Rabby licence not read). Rabby's README names debank.com as its UI model. [15][16] | Do not copy code |
| Family | "Simplicity, fluidity, delight": motion with an architectural purpose, selective emphasis. [19] | Principles only; secondary summary |
| Zerion | Redesign gave charts more room, sidebar navigation, one token selector. [20] | Marketing source |
| Phantom | Custom face, light weights, large display type, lavender brand. [21] | Brand-heavy, not data-dense |
| Robinhood | Monospace figures for tickers and amounts (SF Mono or Capsule Sans Mono), haptics, colour shifts on price update (secondary). [18] | Green/red convention |
| Linear | Inter and Inter Display, density through alignment, LCH themes, contrast as a theme input. [9] | Closest to "dark crafted" |
| Vercel Geist | 10 scales, steps 100-1000 mapped to roles (backgrounds, borders, solid fills, text). [11] | Token structure to study |
| Stripe | Accessible colour systems by construction. [10] | Method, not look |
| Apple Stocks, Copilot, Mercury | Not verified in this pass; no source read. | Owner to review by hand |

## Directions

### A. Native-first calm
- Look: each platform looks like itself; the VoidX character lives in the content layer (range bar, number transitions, status chip). Light and dark equal.
- References: Apple HIG and Stocks, Material 3 baseline, Now in Android and Jetsnack ([native UI sources](../agent-tools/native-ui-sources.md)), Stripe colour method [10].
- Typography: SF Pro and SF Mono (Apple), Roboto Flex or system Roboto (Android), `system-ui` stack on web. No bundled font; Dynamic Type and font scale come free.
- Palette sketch (unverified): neutrals L 0.98 to 0.18, C 0.005, H 260; accent L 0.55 C 0.17 H 255; in range L 0.52 C 0.13 H 160; out of range L 0.60 C 0.15 H 70 (amber, plus icon).
- Density and shape: medium density; radii follow platform (continuous corners on Apple, M3 medium on Android, 12 px on web).
- Motion: `gentle` for layout, `brisk` for press and state change; no decorative loops.
- Mapping: tokens set colour, type scale, spacing, motion; shape and elevation stay platform defaults. Liquid Glass and M3 components used as shipped.
- Risks: bland if craft is not spent on content; three font stacks make golden formatting tests per platform; Roboto `tnum` on OEM fonts not tested.
- Implies tokens: `font.family.*` per platform, colour ramps, spacing, `radius.card` per platform, motion.

### B. Dark crafted terminal
- Look: dark-first, near-black tinted neutrals, hairline borders, one accent, small radii, mono figures as a feature; crafted micro-detail (token-coloured border beam on refresh, orb for busy) as in libraries.dev.
- References: Linear [9], Vercel Geist colours [11], libraries.dev ([audit](../agent-tools/libraries-dev-audit.md)), Revert for domain density [17].
- Typography: Geist and Geist Mono (OFL-1.1, npm `geist`) or Inter (OFL-1.1, variable, `tnum`, slashed zero) bundled on all three clients so the look is identical. [6][7]
- Palette sketch (unverified): background L 0.16 C 0.01 H 270; surface L 0.20; border L 0.30; text L 0.96 / 0.72; accent L 0.75 C 0.14 H 190; out of range L 0.78 C 0.15 H 75.
- Density and shape: high density; radius 6 to 8 px; 1 px borders replace elevation.
- Motion: `brisk` on everything interactive; beam and orb are the signature, both repaint-heavy and rejected as dependencies, so own ports ([audit](../agent-tools/libraries-dev-audit.md)).
- Mapping: fights the platform most: custom type and surfaces over M3, hairline cards beside Liquid Glass bars; M3 Expressive shapes unused.
- Risks: Linear/Vercel look is itself "distributional convergence" ([design guidance](../agent-tools/design-guidance.md)); dark-only contrast margins are thin; bundled fonts add size and a Dynamic Type and font-scale test burden; light mode becomes second class.
- Implies tokens: one `font.family`, dark-first ramps with a tested light twin, `radius.sm`, `border.hairline`, `motion` plus a `beam` effect token set.

### C. Expressive playful
- Look: M3 Expressive across clients: large radii, bold chroma, emphasised type, shape morphing on status change.
- References: Material 3 Expressive (shape: 35 shapes, finer corner scale; motion: spatial springs may overshoot, effects springs must not; Roboto Flex axes) [4][5][8], Family [19], Phantom [21].
- Typography: Roboto Flex variable (OFL) bundled, emphasised styles for amounts; SF Pro Rounded on Apple would need a per-platform pair.
- Palette sketch (unverified): saturated accent L 0.62 C 0.22 H 300; pastel container tones L 0.92 C 0.06; range status as filled shapes (circle in, rounded square out).
- Density and shape: low-medium density; radii 16 to 28 px; pill chips.
- Motion: expressive springs on spatial change, colour and opacity without overshoot.
- Mapping: natural on Android only; Apple clients need hand-built shapes to match (Liquid Glass already rounds controls); web CSS rebuilds morphing.
- Risks: finance trust and density suffer; high chroma strains the 4.5:1 gate on tinted containers; Expressive components sit in `material3` 1.5.0-alpha, which needs owner approval ([native UI sources](../agent-tools/native-ui-sources.md)); highest effort.
- Implies tokens: shape tokens beyond radius (morph pairs), emphasised type roles, container colour roles, effect and spatial spring split.

## Recommendation (superseded)

The owner rejected A, B and C; see [0055](../../decisions/0055-ghost-design-language.md).

## Facts that constrain us

- Apple font licence: SF Pro, SF Mono and New York only for Apple platforms; no embedding; registered Apple Developer. [1]
- Liquid Glass: `regular` variant by default; `clear` over media with a ~35% dark dim layer; always use system vibrant colours on materials. [2]
- Charting HIG: every chart accessible; keep charts simple and let people choose detail. [3]
- Fonts: Geist (Sans, Mono, Pixel) and Inter are OFL-1.1; Inter may not be sold alone; Roboto Flex is OFL-1.1 with axes opsz, wght, wdth, GRAD and parametric axes. [6][7][8]
- Material 3 Expressive (secondary sources): 15 baseline and 15 emphasised type roles; motion schemes expressive (default) and standard. [4][5]
- Vico: Apache-2.0, 3.2k stars, Compose Multiplatform. [24]

## Open questions

- Resolved in [0055](../../decisions/0055-ghost-design-language.md): light (Dragonfruit) is the primary surface.
- Does a bundled font keep Dynamic Type (`Font.custom(_, size:, relativeTo:)`) and Android font scale under the 0022 snapshots? Not verified.
- Do Roboto and OEM system fonts on Android expose `tnum`? Not tested.
- Resolved in [0055](../../decisions/0055-ghost-design-language.md): an amber chip with dark ink; colour-blind simulation still to run.
- Does a custom monogram or logo treatment ([logos](../../concepts/prices-and-logos.md)) belong to the direction?
- Not read: Apple HIG typography and Color pages, Material 3 pages, Apple Stocks, Copilot Money, Mercury, DeBank, Zapper, Aerodrome, Arrakis, Gamma; the Uniswap interface licence file; Rabby licence.

## Sources

1. Apple, Fonts and licences — https://developer.apple.com/fonts/
2. Apple HIG, Materials (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/materials
3. Apple HIG, Charting data (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/charting-data
4. Material 3 Expressive overview (secondary) — https://supercharge.design/blog/material-3-expressive
5. Android Developers Blog, M3 Expressive for Wear OS — https://android-developers.googleblog.com/2025/08/introducing-material-3-expressive-for-wear-os.html
6. Vercel Geist font — https://github.com/vercel/geist-font
7. Inter — https://github.com/rsms/inter
8. Roboto Flex — https://github.com/googlefonts/roboto-flex
9. Linear, How we redesigned the UI — https://linear.app/now/how-we-redesigned-the-linear-ui
10. Stripe, Accessible color systems — https://stripe.com/blog/accessible-color-systems
11. Vercel Geist, Colors — https://vercel.com/geist/colors
12. Uniswap interface repo — https://github.com/Uniswap/interface
13. Uniswap brand assets — https://github.com/Uniswap/brand-assets
14. Uniswap interface GPL (secondary) — https://www.bitget.com/news/detail/12560603896199
15. Rainbow — https://github.com/rainbow-me/rainbow
16. Rabby — https://github.com/RabbyHub/Rabby
17. Revert docs — https://docs.revert.finance/revert
18. Robinhood design system (secondary) — https://oh-my-design.kr/design-systems/robinhood ; identity — https://robinhood.com/us/en/newsroom/a-visual-identity-that-better-reflects-our-vision/
19. Family Values (Benji Taylor) — https://benji.org/family-values
20. Zerion, new portfolio app — https://zerion.io/blog/meet-the-new-zerion-portfolio-app/
21. Phantom brand identity — https://phantom.com/learn/blog/introducing-phantom-s-new-brand-identity
22. WCAG 2.2, Use of Color — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
23. WWDC21, Bring accessibility to charts — https://developer.apple.com/videos/play/wwdc2021/10122/
24. Vico — https://github.com/patrykandpatrick/vico
25. Native UI sources, in repo — ../agent-tools/native-ui-sources.md
26. Haze (Android blur candidate) — https://github.com/chrisbanes/haze
