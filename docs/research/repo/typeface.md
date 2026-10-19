---
app: repo
topic: Typeface for the Ghost design language
checked: 2026-10-19
---

# Typeface for the Ghost design language

Superseded in part: DM Sans is decided in [0055](../../decisions/0055-ghost-design-language.md); bullets recommending Manrope, a display-only face, system body text or light weights are history.

Extends [brand over native](brand-over-native.md) (one bundled OFL variable font for `display` and `figures`, system font for body) and [design direction](design-direction.md). Constraints: [0016](../../decisions/0016-licensing-and-dco.md), [0022](../../decisions/0022-accessibility.md), [0027](../../decisions/0027-design-tokens.md). Glyph shapes were judged by the owner in a rendered comparison on the Ghost screen.

## Decisions

- Decided (2026-10-19, [0055](../../decisions/0055-ghost-design-language.md)): **DM Sans** (OFL, `opsz` 9-40, `wght` 100-1000) for figures, titles and body on every platform, figures Bold; **DM Mono** for addresses on web and Android, SF Mono on Apple; Chinese in the platform CJK face. The owner picked it in a rendered comparison of 59 open faces on the Ghost screen, after rejecting light display weights as dated. Every bullet below that recommends Manrope, a single display-only face or system body text is superseded.
- Trend check (2026-10): big figures are set semibold to bold with tight tracking; neo-grotesques lead fintech, friendly geometrics come second; wallets use custom faces (Phantom's is built on F37 Zagma). [18][19][20]
- Bundling DM Sans for body text on Apple means we implement Dynamic Type (`relativeTo:`) and Bold Text (`legibilityWeight`) ourselves, as the bullets below already require for any custom face.
- We recommend Manrope as primary: OFL, Latin + Cyrillic + Greek, `wght` 200-800, `tnum` and `pnum` present, 39 kB woff2 for Latin + Cyrillic, soft geometric forms and light weights close to Phantom's friendly look. [4][5][12]
- We keep two alternatives: Onest (friendliest Cyrillic, `wght` 100-900, 2.0 released 2026-08, `tnum` unconfirmed) and Geist (cleaner and colder, `tnum` and `zero` per secondary sources, Cyrillic redesigned in 1.7.0). Inter is the safe fallback if `tnum` fails in a font-table check. [6][7][8][9][12]
- We use one face for `display` and `figures`, not a pairing, because every shortlisted face has Cyrillic and tabular digits, so a second face would add 25-40 kB per client and a second Dynamic Type test surface for no gain. Revisit only if the render shows Manrope digits too wide or too geometric at 90 px. [4][12]
- Faces without Cyrillic (Figtree, DM Sans, Instrument Sans, Funnel Display, Rethink Sans, Host Grotesk, Bricolage Grotesque, Schibsted Grotesk, Albert Sans, Hanken Grotesk, Mona Sans) are eligible again for English and Chinese.
- We keep Satoshi and General Sans out (ITF FFL, not OFL, see [brand over native](brand-over-native.md)) and Gilroy, Phantom's face and SF Pro Rounded out (proprietary). [10]
- We self-host subsets from the OFL source, never the Google Fonts CDN at runtime, and split by `unicode-range` (latin, cyrillic, greek, latin-ext) so the apps and pages fetch only what text needs. Preload only the Latin file. Gate: font bytes on the critical path stay under 30 kB, so the LCP ≤ 2.0 s and CLS ≤ 0.05 budgets keep their margin. [12][14]
- We emit a fallback `@font-face` with `size-adjust` and metric overrides for the system font, because the hero number is the LCP element and a swap must not move it (Baseline since 2023-09). [14]
- We set tabular digits explicitly per client: web `font-variant-numeric: tabular-nums`, Compose `fontFeatureSettings = "tnum"`; on SwiftUI `monospacedDigit()` is not trusted for custom fonts, so the feature is set through a `UIFontDescriptor` number-spacing feature and checked by test (needs a compile check). [11][13]
- We bundle the variable TTF on Android (minSdk 26 equals the variable-font floor) and resolve `FontVariation.weight(...)` per token; no downloadable fonts, which cannot be variable. [11]
- We map Bold Text ourselves on Apple (`legibilityWeight` to a heavier axis value), because custom fonts do not follow it, and scale with `relativeTo:` and `sp`, snapshotting at AX5 and font scale 2.0 per [0022](../../decisions/0022-accessibility.md). [13][15]

## Shortlist

Sizes are Fontsource variable `wght` woff2, Latin + Cyrillic (Greek in brackets), v5.3.x, read 2026-10-04. Last release is the Fontsource `lastModified`.

| Face (Google Fonts family) | Licence | Axes | `tnum` | Cyrillic / Greek | woff2 | Last update | Ghost fit |
|---|---|---|---|---|---|---|---|
| Manrope | OFL | wght 200-800 | yes (author site) | yes / yes | 39 kB (+9) | 2026-05 | Soft geometric, light weights, compact |
| Onest | OFL | wght 100-900 | not confirmed | yes / no | 50 kB | 2026-08 | Friendly hybrid, native Cyrillic design |
| Geist | OFL | wght 100-900 | yes, `zero` (secondary) | yes / no | 44 kB | 2025-09 | Neutral neo-grotesk, colder |
| Inter | OFL | wght 100-900, opsz 14-32 | yes (repo) | yes / yes | 67 kB (+19); opsz file 103 kB | 2025-09 | Safe, neutral, heavy files |
| Wix Madefor Display | OFL | wght 400-800 | not listed | yes / no | 34 kB | 2022-07 (v3) | Playful but no light weights |
| Plus Jakarta Sans | OFL | wght 200-800 | `.tf` glyphs (v2.6) | no / no | 27 kB (Latin only) | 2023-05 (v2.7.1) | Best Ghost look, fails Russian |

Not shortlisted for lack of Cyrillic, not read further: see Decisions. Outfit, Urbanist, Sora, Lexend, Red Hat Display were not checked.

## Facts that constrain us

- Google Fonts subsets (2026-10): Manrope cyrillic, cyrillic-ext, greek; Onest cyrillic, cyrillic-ext; Geist cyrillic; Inter cyrillic, greek; Plus Jakarta Sans cyrillic-ext only; Mona Sans, Figtree, DM Sans, Instrument Sans, Funnel Display, Rethink Sans, Host Grotesk, Bricolage, Schibsted, Albert Sans latin only. [2]
- Manrope: Google Fonts copy is OFL; the author's site calls the current release Manrope V5 and states the font may be redistributed only unmodified, under the name "Manrope V5". Subsetting is a modification, so the Reserved Font Name clause needs a check against the OFL file shipped by Google Fonts. [4][5]
- Geist: 1.7.0 (2024) moved coding ligatures to `ss11` and redesigned Cyrillic; the `tnum` and `zero` claims come from secondary articles. [6][8]
- Onest 2.0 (2026-08) grew from 534 to 876 glyphs; the README lists fractions and superiors, not `tnum`. [7]
- Mona Sans has `wdth` 75-125 and `wght` 200-900 but no Cyrillic in the Google Fonts build. [2]
- Compose variable fonts: Android 8.0 (API 26) and up, `FontVariation.weight/width/slant`, custom axes by tag; not available via downloadable fonts. [11]
- SwiftUI has no first-class variable-font API: named instances work, arbitrary weights need axis dictionaries or `UIFontDescriptor` with `kCTFontVariationAttribute` (community sources, Xcode 14-era). [13]
- Custom fonts ignore Bold Text; Apple DTS suggests mapping `legibilityWeight` to a heavier face; Dynamic Type size works with `relativeTo:`. [15][16]
- `size-adjust` is Baseline widely available since 2023-09. [14]
- Phantom uses a proprietary custom face with `lnum` + `tnum` and light weights; see [crypto site audit](crypto-site-design-audit.md). Not a source for our choice. [17]

- Satoshi, General Sans, Switzer and Cabinet Grotesk (Fontshare) use the ITF Free Font License 2.0 (2026-08-17), read from the FFL.txt in the download: commercial use, app embedding and self-hosting for the licensee's own sites and apps are allowed; placing the files in a repository or on publicly accessible servers for others, subsetting, format conversion and any modification are not without written consent. In a public open-source repo every contributor, CI job and self-hoster would download the files from Fontshare themselves. Rendered on 2026-10-04: Satoshi and Switzer have tabular digits with `tnum`; General Sans and Cabinet Grotesk do not.
- Launch languages are English and Simplified Chinese ([0041](../../decisions/0041-i18n.md)), so Cyrillic no longer limits the shortlist; Chinese uses the platform CJK face. Rendered tabular check: Plus Jakarta Sans, Hanken Grotesk, Gabarito, Outfit, Nunito Sans, Manrope pass; Urbanist, Albert Sans, Lexend, Be Vietnam Pro do not.

## Open questions

- Does DM Sans ship `tnum` with equal widths for 0-9, `$` and `%`? Check the GSUB table in M0.
- The Google Fonts DM Sans Latin variable woff2 is 48 kB with the `opsz` axis, above the 30 kB critical-path gate. Instance to the weights we use (400, 500, 700) or drop `opsz`, then measure.

- Does Onest contain `tnum`? Inspect the TTF GSUB table (or a Wakamai Fondue run); also confirm Manrope `tnum` widths are equal across 0-9 and the `$` and `%` glyphs.
- Do the Manrope OFL file's Reserved Font Name terms allow the subset files we ship? Read the OFL in `google/fonts/ofl/manrope`.
- How do Manrope, Onest and Geist digits look at 60-90 px, weight 200-300, tracking -0.035em? Not judged here.
- Does `UIFontDescriptor` number-spacing work on a bundled variable font across iOS, iPadOS and macOS? Needs a spike.
- Does Android 14+ non-linear scaling keep a 90 px `sp` hero number inside its card at 200%? Roborazzi at 2.0 decides.
- Is the Latin file (24.8 kB for Manrope) preloadable under the 30 kB gate once ADR 0027 `figures` styles need a second weight? Variable file serves all weights; confirm.
- Italic: none of the three needs it; Manrope has no italic. Is a sticker-chip slant done by transform, not a font?

## Side-by-side render checklist (superseded)

Render each of Manrope, Onest, Geist, Inter (and Plus Jakarta Sans as reference) at weights 200, 300, 400, 700, light and dark card, on iOS, Android and Windows Chrome.

- "$23,501" at 72-90 px, weight 200-300: digit width, `1` shape, `$` stroke, comma weight.
- "0.0000531" at 60 px: width, zero count legibility, decimal point visibility; compare `tnum` on and off.
- "Your pools earned $612.44" at 13, 16, 24 px: 12-13 px legibility, `$` and `.` spacing.
- "In range" and "Out of range" in a tilted sticker chip at 12 px bold.
- "您的流动性池已赚取 $612.44": CJK fallback weight next to the Latin figures.
- Headline at -0.035em tracking, 200 vs 300: counters closing, `rn`, `m`, Cyrillic `и`, `н`.
- Windows ClearType and Android hinting at 13 px: stem weight at 400.

## Sources

1. Brand over native, in repo — brand-over-native.md
2. Google Fonts METADATA (subsets, axes), `google/fonts` — https://github.com/google/fonts/tree/main/ofl (plusjakartasans, manrope, onest, geist, monasans, inter, figtree, dmsans, instrumentsans, hankengrotesk, funneldisplay, rethinksans, hostgrotesk, bricolagegrotesque, schibstedgrotesk, golostext, wixmadefordisplay)
3. Plus Jakarta Sans repo — https://github.com/tokotype/PlusJakartaSans
4. Manrope, author site — https://www.sharanda.com/manrope
5. Manrope repo — https://github.com/googlefonts/manrope
6. Geist repo and releases — https://github.com/vercel/geist-font/releases
7. Onest repo — https://github.com/simpals/onest
8. Geist OpenType features (secondary) — https://lexingtonthemes.com/blog/geist-opentype-features
9. Inter — https://github.com/rsms/inter
10. Satoshi licence (secondary, as in brand over native) — https://www.uwarp.design/blog/satoshi-font-guide
11. Android, Fonts in Compose — https://developer.android.com/develop/ui/compose/text/fonts
12. Fontsource API and jsDelivr package file sizes — https://api.fontsource.org/v1/fonts/manrope ; https://data.jsdelivr.com/v1/packages/npm/@fontsource-variable/manrope@5.3.0?structure=flat (also onest@5.3.1, geist@5.3.0, inter@5.3.0, wix-madefor-display@5.3.0, plus-jakarta-sans@5.3.0)
13. Variable fonts on macOS with SwiftUI — https://mike-engel.com/writing/variable-fonts-on-macos-with-swiftui/
14. MDN, `size-adjust` — https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@font-face/size-adjust
15. Apple Developer Forums, custom fonts and Bold Text — https://developer.apple.com/forums/thread/759013
16. `Font.custom(_:size:relativeTo:)` — https://developer.apple.com/documentation/swiftui/font/custom(_:size:relativeto:)
17. Phantom site CSS, via crypto site audit — crypto-site-design-audit.md
18. Trending fonts 2026 (secondary) — https://madegooddesigns.com/trending-fonts/
19. Phantom typeface, F37 Foundry — https://f37foundry.com/modifications/phantom
20. Best fintech fonts 2026 (secondary) — https://fontalternatives.com/best-fonts-for/fintech/
21. DM Sans repo — https://github.com/googlefonts/dm-fonts
