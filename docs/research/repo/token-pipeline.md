---
app: repo
topic: Design token pipeline tool
checked: 2026-10-01
---

# Design token pipeline tool

Which tool turns `packages/design-tokens` into CSS, Tailwind, Swift, `.xcassets` and Compose outputs ([ADR 0027](../../decisions/0027-design-tokens.md), [ADR 0023](../../decisions/0023-motion.md)). Colour space and contrast: [colour-and-contrast](colour-and-contrast.md). Based on docs, issue trackers and a spike run on 2026-10-01.


## Decisions

- We use Terrazzo (`@terrazzo/cli` + `@terrazzo/parser`) instead of Style Dictionary, because it implements all of DTCG 2025.10 including the resolver module, while Style Dictionary 5.5.5 has no resolver (design only, 2026-09-18), no 2025.10 duration (work started 2026-09-29) and names `$root` tokens wrongly. Our tokens use duration, springs as duration, and light/dark modes, so these are the gaps we would hit first. [1][2][3][4][5][6]
- We describe light and dark with one `voidx.resolver.json` (set `core`, modifier `theme` with contexts `light` and `dark`), not with a custom `$extensions` mode key or two builds, because the resolver is the stable 2025.10 spec and Terrazzo passes each context to plugins through `resolver.apply({ theme })`. [3][7][spike]
- We describe reduced motion as a second resolver modifier, `motion` with contexts `full` and `reduced`, not as `*.reduced` alias tokens, because it uses the same mechanism as light and dark: CSS gets a `prefers-reduced-motion` block; native emits only `full`, because iOS and Android follow the reduced behaviour in the ADR 0023 table (fade or instant). A test fails when a motion token has no value in `reduced`, since the resolver would otherwise fall back to the full value. [7][8]
- We use `@terrazzo/plugin-css` for CSS variables (`permutations` with a `prefers-color-scheme: dark` wrapper) and `@terrazzo/plugin-tailwind` for `@theme`, because both keep `oklch()` and take resolver contexts, so the web side needs no custom code. Style Dictionary's `color/css` emits hex, so it would need its own `oklch()` transform, `@theme` format and dark block. [8][9][10][spike]
- We write one own plugin, `voidx-native`, for `Tokens.swift`, `Tokens.xcassets` (sRGB, light and dark appearances), the Compose `Tokens.kt` object, and the spring `linear()` CSS. Neither tool ships usable native output: Terrazzo's Swift plugin emits only colours, as `display-p3`, and fails on OKLCH (spike, #861); Style Dictionary's Swift output is UIKit and its Swift and Compose size transforms multiply `16px` by 16. Native code costs the same in both tools (about 60 lines), so it does not decide the choice. [11][12][13][spike]
- We do not use `@terrazzo/plugin-swift` or the draft `plugin-android` (#866), because they emit Display P3 colour, while we ship sRGB ([colour-and-contrast](colour-and-contrast.md#source-colour-space)). [11][14]
- We keep the spring maths in one module (`springParams`, `springToCssLinear`, `settlingTimeSeconds`), which the plugin and the 5% settling test both import, because the ADR 0027 test compares the three platforms against one formula. [spike]
- We keep our own Color.js contrast and gamut test and enable Terrazzo's `core/max-gamut` (`srgb`) and `a11y/min-contrast` lint rules only as an early signal, because Terrazzo lints only the default resolver context (#785) and measures unrounded values without alpha compositing. [15][16]
- We declare `colorjs.io` `^0.7.1`, the parser's range, so the lockfile holds one copy. Two copies break colour handling: Color.js keeps registered colour spaces per module instance (#861). [11][17][spike]
- We run the build as `bunx --bun tz build` from the `codegen` task, with `outDir` in `Generated/`. It works under Bun 1.4.2 with the isolated linker, and the outputs are byte-identical to the Bun 1.3.13 run. [spike]
- We do not use Tokens Studio `sd-transforms`, Supernova or Specify, because the first converts the Tokens Studio Figma format into Style Dictionary input and the other two are hosted services; we write DTCG by hand. [18]

## Facts that constrain us

- DTCG Resolver Module 2025.10 is a Final Community Group Report (2025-10-28) and is "considered stable". [7]
- Style Dictionary 5.5.5 (2026-09-20), Apache-2.0, Node >= 22, `colorjs.io ^0.5.2`. Docs: 2025.10 "does not have full support yet". #1590: colour, border, shadow and dimension done; gradient and duration in progress; resolver not built (design with Autodesk contributors 2026-08/09). #1471 (motion tokens) and #1757 (`$root`) open. 2.6 M weekly downloads; 30 commits since 2026-04-01, 11 by the one active maintainer. [1][2][4][5][6][19]
- Terrazzo 2.7.1 (cli, parser, plugin-css, plugin-tailwind; 2026-08-11), MIT, successor to Cobalt UI. Parser 2.0.0 brought "full support for the DTCG v2025.10 spec, including resolvers". 114 k weekly parser downloads; 70 commits since 2026-04-01 from 22 authors, 24 by Drew Powers, who wrote most of the code. 44 open issues. [3][8][19][20]
- Terrazzo issues that affect us: #861 Swift plugin breaks on Color.js instance mismatch; #785 lint sees only the default context; #707 `setTransform` fails for a token missing from the default input; #718 the Tailwind `template` path is resolved against the parent of `outDir`, not the config; #811 Tailwind typography prints `[object Object]`. #243 and #244 (Swift and Android plugin requests) are open since 2024-04-04. [11][15][21]
- `@terrazzo/plugin-swift` 0.3.3 (2026-07-26) depends on `colorjs.io ^0.6.1` while the parser uses `^0.7.1`, so a default install has three Color.js copies (0.5.2, 0.6.1, 0.7.1) if Style Dictionary is also present. [spike]
- Terrazzo's `core/valid-color` accepts `okhsv`, `lab-d65` and `xyz`, which are not among the 14 DTCG colour spaces. Our test should reject anything except `oklch`. [spike][22]
- Users: Primer builds with Style Dictionary `^5.0.0` and emits only web, JS and Figma outputs (no native). Spectrum design data is on Style Dictionary `^3.9.2`. Terrazzo is used by WordPress Gutenberg (`packages/theme`), the Guardian (`@guardian/pulse`), Canonical (`@canonical/terrazzo-plugin-css`), Migrationsverket and NYS Design System. No well-known system was found generating SwiftUI and Compose with either tool. [23][24][25]

## Spike results

Source: two OKLCH colours (light and dark through the resolver), one dimension, one duration, one cubicBezier, one spring (`duration` 350 ms, `voidx.spring.bounce` 0.15). Versions: Style Dictionary 5.5.5, Terrazzo 2.7.1 (plugin-swift 0.3.3), Color.js 0.7.1, Bun 1.3.13 and 1.4.2 (isolated linker), Node 24.16.

| Check | Style Dictionary 5.5.5 | Terrazzo 2.7.1 |
|---|---|---|
| Parses 2025.10 file | yes | yes |
| Resolver light/dark | no; two instances, joined by hand | yes, `resolver.apply` |
| CSS out of the box | hex colours, durations `[object Object]` | `oklch()`, `250ms`, dark `@media` block |
| Tailwind `@theme` | none | yes, `oklch()`, `@variant dark` |
| Swift out of the box | UIKit `UIColor`, `CGFloat(256.00)` for 16px, durations `[object Object]` | crashes on OKLCH; with one Color.js it writes raw OKLCH numbers as P3 (`blue: 247.8`), no dark |
| Compose out of the box | `256.00.dp` for 16px, durations `[object Object]`, bezier `0.2,0,0,1` | none |
| Invalid token (`"250ms"`, `okhsl`) | builds silently, emits `[object Object]` | fails with file position and fix hint |
| Custom code for Compose + Swift + `.xcassets` + springs | 58 lines for Compose, springs and two CSS transforms, Swift and `.xcassets` not done | 61 lines for all four |
| Shared spring and colour helpers | 46 lines, same in both | 46 lines |

Spring 350 ms, bounce 0.15: `dampingRatio` 0.85, `stiffness` 322.27, settling time 488 ms at 0.1% tolerance, 41-point `linear()`. Kotlin and spring CSS were identical from both tools.

## Open questions

- Bus factor: both tools depend on one main maintainer. Our exposure to Terrazzo is the parser, two web plugins and the `resolver.apply` API; the DTCG source works in any tool.
- Whether Compose consumes `ColorPair` objects or two `TokensLight`/`TokensDark` objects (the #866 pattern) belongs to the ADR 0020 owner.
- Not verified from primary sources: Salesforce, Amazon, Polaris, Atlassian and Wise pipelines (no public build config found).

## Sources

1. Style Dictionary, DTCG — https://styledictionary.com/info/dtcg/
2. Style Dictionary issue #1590, DTCG 2025.10 support — https://github.com/style-dictionary/style-dictionary/issues/1590
3. Terrazzo parser changelog (2.0.0, 2.4.0-2.7.1) — https://github.com/terrazzoapp/terrazzo/blob/main/packages/parser/CHANGELOG.md
4. Style Dictionary issue #1471, motion tokens — https://github.com/style-dictionary/style-dictionary/issues/1471
5. Style Dictionary issue #1757, `$root` naming — https://github.com/style-dictionary/style-dictionary/issues/1757
6. Style Dictionary `lib/common/transforms.js` (5.5.5) — https://github.com/style-dictionary/style-dictionary/blob/main/lib/common/transforms.js
7. DTCG Resolver Module 2025.10 — https://www.designtokens.org/tr/2025.10/resolver/
8. Terrazzo, resolvers guide — https://terrazzo.app/docs/guides/resolvers/
9. Terrazzo Tailwind plugin — https://github.com/terrazzoapp/terrazzo/tree/main/packages/plugin-tailwind
10. Style Dictionary predefined transforms — https://styledictionary.com/reference/hooks/transforms/predefined/
11. Terrazzo issue #861, Swift plugin Color.js mismatch — https://github.com/terrazzoapp/terrazzo/issues/861
12. Terrazzo Swift plugin source — https://github.com/terrazzoapp/terrazzo/tree/main/packages/plugin-swift
13. Style Dictionary predefined transform groups — https://styledictionary.com/reference/hooks/transform-groups/predefined/
14. Terrazzo PR #866, plugin-android draft — https://github.com/terrazzoapp/terrazzo/pull/866
15. Terrazzo issue #785, lint only default context — https://github.com/terrazzoapp/terrazzo/issues/785
16. Terrazzo plugin API — https://terrazzo.app/docs/reference/plugin-api/
17. Color.js releases — https://github.com/color-js/color.js/releases
18. `@tokens-studio/sd-transforms` — https://github.com/tokens-studio/sd-transforms
19. npm weekly downloads — https://api.npmjs.org/downloads/point/last-week/style-dictionary and https://api.npmjs.org/downloads/point/last-week/@terrazzo/parser
20. Terrazzo repository and contributors — https://github.com/terrazzoapp/terrazzo
21. Terrazzo open issues (#707, #718, #811, #243, #244) — https://github.com/terrazzoapp/terrazzo/issues
22. DTCG Color Module 2025.10 — https://www.designtokens.org/tr/2025.10/color/
23. Primer primitives (`package.json`, `scripts/`) — https://github.com/primer/primitives
24. Spectrum design data, tokens `package.json` — https://github.com/adobe/spectrum-design-data
25. GitHub code search for `@terrazzo/cli` in `package.json` (Gutenberg `packages/theme`, guardian/csnx `libs/@guardian/pulse`) — https://github.com/search?q=%22%40terrazzo%2Fcli%22+path%3Apackage.json&type=code
