---
app: repo
topic: Colour space and contrast tooling for design tokens
checked: 2026-10-01
---

# Colour space and contrast tooling for design tokens

Extends the design-tokens section of [contracts-and-tokens](contracts-and-tokens.md#design-tokens). Input for `packages/design-tokens` ([ADR 0027](../../decisions/0027-design-tokens.md)) and the contrast gate ([ADR 0022](../../decisions/0022-accessibility.md)). Re-checked on 2026-10-01 against 2026 releases and specs.

## Decisions

### Source colour space
- We author every colour token as DTCG `colorSpace: "oklch"` with `components` `[L, C, H]` (L in 0..1), and keep every value inside the sRGB gamut, because Tailwind v4's palette is OKLCH so the web output needs no conversion, lightness is perceptual so light and dark ladders are predictable, and the sRGB limit makes all four clients show the same colour. [1][2][8]
- We fail the contrast test when a token is outside sRGB (`color.inGamut("srgb")` is false), because the build would otherwise gamut-map silently, so the shipped native colour would differ from the authored one and from what the test measured. [3][4]
- We do not author in Display P3 and do not emit P3 variants in v1, because Android renders in sRGB unless an activity opts in with `colorMode="wideColorGamut"` (API 26+), and `.xcassets` needs a second `display-gamut` variant per colour set, for no gain on a text-and-numbers app. A P3 accent can be added later as an `$extensions` override. [5][6][7]
- We emit sRGB on native: 8-bit values from our `voidx-native` plugin (Swift, Compose `Color(0xFF…)`) and `.xcassets` components as `color-space: "srgb"` floats from the same rounded values. The web keeps `oklch()` ([token-pipeline](token-pipeline.md)). [6][9]
- We do not set the optional DTCG `hex` field, because every colour is inside sRGB, so the fallback would only duplicate it.

### Colour library
- We keep Color.js (`colorjs.io`) for the contrast test: `new Color(...).contrast(other, "WCAG21")` and `inGamut("srgb")`. Re-checked in 2026 it is still the best fit: Terrazzo's parser depends on it (`^0.7.1`), as does Style Dictionary, its default `toGamut()` is the CSS Color 4 algorithm, it has four maintainers including the CSS Color spec editor, and it was last committed 2026-09-14 (code) with releases through 0.7.1 (2026-07-24). [3][10][26][27][28][29]
- We declare `colorjs.io` as a direct devDependency of `packages/design-tokens` in the range of Terrazzo's parser (`^0.7.1`), because a transitive import breaks under strict hoisting and a second 0.x copy breaks colour handling ([token-pipeline](token-pipeline.md)).
- We do not adopt `@texel/color`, culori or chroma.js, because none beats the shared copy for us: `@texel/color` is 5-125x faster and about 3.5 kB for OKLCH to sRGB but has no contrast API and uses Ottosson's gamut mapping, not the CSS algorithm, and speed is irrelevant for a test over a few hundred pairs; culori's `toGamut` is "slightly different" from CSS Color 4 and its last code commit was 2026-07-02 after a year of none; chroma.js (3.2.0, 2025-11) is not OKLCH-first. A second library would give a second conversion that can disagree with the generators. [11][18][30][31][32][33]
- We run contrast on the 8-bit-rounded sRGB value that native clients ship, not on the unrounded OKLCH, because that is what users see on iOS and Android and rounding moves a ratio by well under 0.01. [3]
- We composite any token with `alpha < 1` over its background before measuring, because WCAG measures the rendered colour. [12]
- We write no own colour maths: a 20-line WCAG function is right only for sRGB input and we still need OKLCH to sRGB conversion and a gamut check. [4][11]

### Material HCT
- We do not use Material Color Utilities or HCT, because tokens are authored values, not generated from a seed colour, and HCT tone does not equal the WCAG ratio, which is the normative gate. The repo is maintained (Google syncs, last 2026-08-21) but the Compose Material 3 1.4 stable line adds nothing the token pipeline needs. [13][34][35]

### Contrast standard
- We gate on WCAG 2.2 ratios only (4.5:1 text, 3:1 large text and non-text UI), because WCAG 3 is still a Working Draft (2026-09-10) whose contrast algorithm is "yet to be determined", APCA was removed from the draft in 2023, and legal references (ADA, EAA) cite WCAG 2.x. [12][21][36][37]
- We do not gate on APCA and do not add an APCA report to the test, because no standard consumes it. Designsystemet (Norway) also gates on WCAG 2.1 AAA and only aims "closer to" APCA thresholds. If the owner wants a margin, raise the WCAG target (for example 5.0 for text) instead. [36][38]

### CSS colour features in emitted CSS
- We emit only explicit `oklch()` values per token (light and dark), and do not emit `color-mix()`, relative colour syntax or `contrast-color()` in tokens, because every token must be a tested literal that the native outputs reproduce byte for byte; derived CSS values would exist only on web and escape the contrast test. [3][39]
- We keep dark mode as a `prefers-color-scheme` block and do not switch to `light-dark()` yet, because `light-dark()` needs Chrome 123, Firefox 120 and Safari 17.5 while Tailwind v4's floor is Chrome 111, Safari 16.4, Firefox 128 (the floor would have to rise to Safari 17.5). [2][40]
- We do not use `contrast-color()` for UI text, because it returns only black or white using WCAG 2 luminance, which gives poor results on mid-tones, and our foreground tokens are chosen and tested explicitly. [41][42]

## Facts that constrain us

- DTCG 2025.10 colour: `colorSpace` is one of 14 values (`srgb`, `srgb-linear`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz-d65`, `xyz-d50`); `components` may use `"none"`; `alpha` is 0..1, default 1; `hex` is an optional 6-digit fallback; tools may gamut-map. [8]
- Style Dictionary 5.5.5 (2026-09-20, Apache-2.0, Node >= 22) depends on `colorjs.io ^0.5.2` and `tinycolor2`. Releases 5.5.1 to 5.5.5 are security and bug fixes. Issue #1590 (checked): colour, border, shadow and dimension 2025.10 done; gradient and duration in progress; resolver pending. [3][15][26]
- Style Dictionary DTCG colour path (`getColor`, `lib/common/transforms.js`): converts with Color.js; if outside sRGB returns `hex` when present, else `toGamut({space: "srgb"})`; rounds channels to 8 bits. `color/hex`, `color/css`, `color/rgb`, `color/ColorSwiftUI` and `color/composeColor` all use it. `color/css` returns hex or `rgba()`, never `oklch()`; one reason we chose Terrazzo ([token-pipeline](token-pipeline.md)). [4][14]
- Color.js releases: 0.6.0 (2025-12-24) switched missing coordinates from `NaN` to `null`, made numbers primitives, and re-serialises colours in their parsed format; 0.6.1 (2026-01-15) types fix; 0.7.0 (2026-07-14) removed prebuilt ESM bundles and `.min` files (ESM exports point to `src/`), added `raytrace` gamut mapping, gamut-relative `oklch-srgb`-style spaces and experimental Helmlab spaces; 0.7.1 (2026-07-24) regression fix. Notes for 0.6.0 said it was "likely the last v0.x"; 0.7 shipped anyway and no 1.0 date is published. MIT, no runtime dependencies. `toGamut()` default is still `"css"`; colours are never gamut-mapped unless called. APCA is built in and unused. [10][16][17][26][27]
- Terrazzo (MIT; successor to Cobalt UI): parser depends on `colorjs.io ^0.7.1`; supports DTCG 2025.10 including `colorSpace` and the resolver; CSS plugin keeps `oklch()` and emits `@media (color-gamut: p3 | rec2020)` blocks gamut-mapped with Color.js; cli, parser and web plugins at 2.7.1 ([token-pipeline](token-pipeline.md)). Plugins: CSS, Sass, JS/TS, Tailwind, Vanilla Extract, Swift (0.3.3, "experimental", emits `Tokens.xcassets`, light/dark and colour-space handling undocumented). No Compose or Kotlin plugin. [43][44][45][46][47]
- Tokens Studio exports DTCG 2025.10 on Style Dictionary v5; the old export format ends September 2026. It is a Figma-side authoring tool, not a build tool. [48]
- Tailwind v4: default palette is OKLCH; latest 4.3.3 (2026-07-16), no palette change in 4.3.x. Radix Colors 3 ships P3 variants for every scale. `oklch()` and `color-mix()` are Baseline widely available since May 2023. [1][2][19][25][39][49]
- CSS Color 5 is a Working Draft (2026-09-13). Browsers: relative colour syntax Chrome 119, Safari 16.4, Firefox 128 (Baseline 2024); `light-dark()` Baseline 2024; `contrast-color()` Chrome 147 (2026-04-07), Firefox 146, Safari 26.0, Baseline newly available April 2026, returns black or white, UA-defined algorithm, currently WCAG 2 luminance in all engines (secondary source). [40][41][42][50][51]
- Apple Liquid Glass (iOS 26): the system adapts glass to Reduce Transparency and Increase Contrast, and Apple says custom colours must be tested in both appearances with those settings on. Contrast over glass depends on the content behind, so a token-pair test cannot cover it. [52]
- Android: `Color(0xFF…)` is sRGB; wide gamut needs API 26+, a capable display and an opted-in window. Apple `.colorset` `Contents.json` takes `srgb` or `display-p3` floats with optional `display-gamut`. [5][6][7][20]
- WCAG 2.2 AA ratio is defined on sRGB relative luminance. Primer builds on Style Dictionary with a dedicated contrast CI across light, dark and high-contrast themes; Adobe Spectrum generates from target ratios with Leonardo. [12][21][22][23][24]

## Open questions

- Web unrounded `oklch()` vs native rounded hex: ratios differ by under 0.01. A margin rule (for example 4.55 for 4.5) is not decided.
- Android dynamic colour (Material You, API 31+) with minSdk 26: ignore it and use token colours only? Belongs to the ADR 0020 owner.
- Text over Liquid Glass or blur: which surfaces on iOS use glass, and how contrast is checked there (manual, not token test). Belongs to the ADR 0019 owner.
- Whether a P3 accent is ever wanted; contrast would then be tested on the sRGB variant only.
- Not verified from primary sources: Polaris and Atlassian pipelines; Material 3 Expressive token format; the `contrast-color()` spec text (section not retrievable); Leonardo release activity.

## Sources

1. Tailwind CSS, colors — https://tailwindcss.com/docs/colors
2. Tailwind CSS, compatibility — https://tailwindcss.com/docs/compatibility
3. Style Dictionary package.json (5.5.5) — https://raw.githubusercontent.com/style-dictionary/style-dictionary/main/package.json
4. Style Dictionary `lib/common/transforms.js` — https://raw.githubusercontent.com/style-dictionary/style-dictionary/main/lib/common/transforms.js
5. Android, wide color content — https://developer.android.com/training/wide-color-gamut
6. Asset Catalog Format Reference, Named Color — https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/Named_Color.html
7. Compose `Color` reference — https://developer.android.com/reference/kotlin/androidx/compose/ui/graphics/Color
8. DTCG Color Module 2025.10 — https://www.designtokens.org/tr/2025.10/color/
9. Style Dictionary, DTCG — https://styledictionary.com/info/dtcg/
10. Color.js releases — https://github.com/color-js/color.js/releases
11. culori API — https://culorijs.org/api/
12. WCAG 2.2 — https://www.w3.org/TR/WCAG22/
13. Material Color Utilities — https://github.com/material-foundation/material-color-utilities
14. Style Dictionary predefined transforms — https://styledictionary.com/reference/hooks/transforms/predefined/
15. Style Dictionary issue #1590 — https://github.com/style-dictionary/style-dictionary/issues/1590
16. Color.js, contrast — https://colorjs.io/docs/contrast
17. Color.js, gamut mapping — https://colorjs.io/docs/gamut-mapping
18. culori on npm — https://www.npmjs.com/package/culori
19. MDN, `oklch()` — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch
20. SwiftUI `Color.init(_:red:green:blue:opacity:)` — https://developer.apple.com/documentation/swiftui/color/init(_:red:green:blue:opacity:)
21. WCAG 2.2 Understanding 1.4.3 — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
22. Primer primitives — https://github.com/primer/primitives
23. Adobe Leonardo — https://github.com/adobe/leonardo
24. Spectrum, color fundamentals — https://spectrum.adobe.com/page/color-fundamentals/
25. Radix Colors installation (P3 pattern, secondary) — https://www.radix-ui.com/colors/docs/overview/installation
26. Color.js and Style Dictionary release data via GitHub API — https://api.github.com/repos/color-js/color.js/releases and https://api.github.com/repos/style-dictionary/style-dictionary/releases
27. Color.js v0.7.0 release notes — https://github.com/color-js/color.js/releases/tag/v0.7.0
28. Color.js recent commits — https://api.github.com/repos/color-js/color.js/commits
29. colorjs.io on npm (maintainers, MIT) — https://registry.npmjs.org/colorjs.io
30. @texel/color — https://github.com/texel-org/color
31. @texel/color on npm — https://registry.npmjs.org/@texel/color
32. culori commits — https://api.github.com/repos/danburzo/culori/commits
33. chroma.js releases — https://api.github.com/repos/gka/chroma.js/releases
34. Material Color Utilities commits — https://api.github.com/repos/material-foundation/material-color-utilities/commits
35. Compose Material 3 releases — https://developer.android.com/jetpack/androidx/releases/compose-material3
36. WCAG 3.0 Working Draft — https://www.w3.org/TR/wcag-3.0/
37. WCAG 3 contrast status (secondary) — https://yatil.net/blog/wcag-3-is-not-ready-yet
38. Designsystemet, contrast — https://designsystemet.no/en/best-practices/accessibility/contrast/
39. MDN, `color-mix()` — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix
40. MDN, `light-dark()` — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
41. MDN, `contrast-color()` — https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color
42. Chrome 147 release notes — https://developer.chrome.com/release-notes/147
43. Terrazzo repository — https://github.com/terrazzoapp/terrazzo
44. Terrazzo parser package.json and workspace catalog — https://raw.githubusercontent.com/terrazzoapp/terrazzo/main/pnpm-workspace.yaml
45. Terrazzo CSS plugin — https://terrazzo.app/docs/integrations/css/
46. Terrazzo DTCG guide — https://terrazzo.app/docs/guides/dtcg/
47. Terrazzo releases — https://api.github.com/repos/terrazzoapp/terrazzo/releases
48. zeroheight, Style Dictionary v5 migration (Tokens Studio note, secondary) — https://help.zeroheight.com/hc/en-us/articles/48049028236187-Migrating-to-Style-Dictionary-v5-in-tokens-automation
49. Tailwind releases — https://api.github.com/repos/tailwindlabs/tailwindcss/releases
50. MDN, relative colors — https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors
51. CSS Color 5 Working Draft — https://www.w3.org/TR/css-color-5/
52. Apple, Liquid Glass — https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass
