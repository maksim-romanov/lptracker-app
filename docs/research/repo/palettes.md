---
app: repo
topic: Brand palettes without green (pink and refined neon first)
checked: 2026-10-03
---

# Brand palettes without green

Superseded in part by [0055](../../decisions/0055-ghost-design-language.md): the MVP ships one scheme (Dragonfruit light, Neon Night dark, values in [0027](../../decisions/0027-design-tokens.md)); these dark accents are candidate input only and define no card fills. Feeds [design direction](design-direction.md), [colour and contrast](colour-and-contrast.md), [0022](../../decisions/0022-accessibility.md), [0027](../../decisions/0027-design-tokens.md). **Every number below is a hand-set starting value, not measured**: no Color.js run was possible in this pass. Contrast figures use the estimate ratio = (Y_fg + 0.05) / (Y_bg + 0.05) with Y about L^3 for neutrals and about 0.9 x L^3 for pink-to-red hues (checked against Tailwind pink-400 in sRGB: Y 0.33 vs L^3 0.37). The ADR 0027 gate decides; sRGB gamut must be checked for each accent too.

## Decisions (hold for any palette)

- We give each palette one accent and spend it on one thing per screen (primary action, selection, the current-price tick), never on body text or large fills, because a neon that appears everywhere stops being an accent and dark UIs tire the eye with saturated colour. [10][12]
- We cap "refined neon" at chroma 0.15 to 0.20 for lightness 0.70 to 0.78 and 0.10 to 0.14 for secondary hues, and we gamut-check every token, because sRGB maximum chroma falls fast with lightness (Tailwind's own pink-300 is C 0.12 at L 0.82, pink-400 C 0.20 at L 0.72) and Material's dark guidance says to desaturate accents. [1][3][10]
- We tint dark neutrals toward the accent hue (C 0.010 to 0.02, hue within 10 degrees) and keep bg L 0.16 and fg L 0.96, never pure black or white, because tinted neutrals make a pink accent look intended and avoid maximum-contrast halation. The same 12-step logic (steps 1-2 background, 3-5 element, 6-8 border, 9 solid, 11-12 text) is Radix's. [4][10]
- We make glow static, accent at 0.30 to 0.35 alpha, dark mode only, one per screen, on a pre-blurred layer, never on text or on the only carrier of meaning, because [lively-ui](lively-ui.md) forbids animated blur and a glow does not count towards contrast. [16]
- We never put two saturated hues side by side (pink next to cyan at full chroma): separate them by a neutral gap or hairline and keep secondary hues below C 0.14 and at least 0.06 apart in L. This is a design heuristic, not sourced. [Open question 4]
- We keep pink and red apart: accent hue 340 to 360 (blue component survives as grey-blue under protan and deutan, red and orange turn olive), error red at hue 25 to 29 with L at least 0.08 away from the accent, and every error carries an icon and a word, because red is reserved for errors and pink must never read as one. The CVD behaviour is reasoned from Tol and Okabe-Ito, not simulated. [8][9][12]
- We use no green anywhere. Healthy and in range is the accent, ice cyan (hue 200 to 235) or lilac (285 to 300); out of range is amber (75 to 90) or orange (45 to 60); up is cyan or blue, down is orange, coral or pink, because the blue-versus-orange axis is what Okabe-Ito and Tol use as the colour-blind-safe pair and it frees red for errors. Status chip = word + shape; price change = sign + arrow + colour ([0022](../../decisions/0022-accessibility.md), [design direction](design-direction.md)). [8][9][15]
- We set state text and glyphs at L 0.70 to 0.84 on the dark surface (estimated 6 to 11:1; floor L 0.62 for 4.5:1) and at L 0.48 to 0.54 on light (estimated 5 to 7:1); range-bar fills and chip outlines need only 3:1 against the surface (about L 0.52 on dark), because WCAG 1.4.11 applies to graphical parts needed to understand state and rounding is not allowed (2.999 fails). [11]
- We author ramps by target lightness, then check, because Leonardo (Apache-2.0) and Radix both build scales from fixed contrast or lightness steps; Leonardo is a method reference, not a dependency (ADR 0027 keeps literal tested tokens). [4][7][15]
- We take hue and shape of reference palettes as inspiration only and copy no palette verbatim from Coolors, Huemint, Happy Hues or Realtime Colors, because their terms were not retrievable here; Radix (MIT), Open Color (MIT) and Tailwind values are citable. Uniswap's pink and Phantom's lavender are brand identity under trademark policy. [5][6][13][14]

## Shared neutrals (OKLCH L C H; H = the palette's neutral hue below)

| Token | Dark | Light |
|---|---|---|
| bg | 0.16 0.014 H | 0.985 0.006 H |
| surface | 0.21 0.016 H | 0.995 0.004 H |
| line (decorative) | 0.31 0.020 H | 0.90 0.010 H |
| fg | 0.96 0.008 H | 0.22 0.020 H |
| fg-secondary | 0.76 0.020 H | 0.45 0.020 H |
| error (all palettes) | 0.68 0.19 27 | 0.52 0.19 27 |
| glow | accent at 0.32 alpha, 24 px | none |

Input borders and the range-bar track need 3:1, so use L 0.55 dark and 0.60 light, not `line`.

## Palettes (accent / in range / out of range / up / down, dark, OKLCH `L C H`)

Pink, magenta and rose (1 to 9)

| # | Name, neutral H | Accent | In range | Out of range | Up | Down | Light: accent / in / out |
|---|---|---|---|---|---|---|---|
| 1 | Rosewave, 350 | 0.72 0.19 352 | 0.80 0.12 215 | 0.82 0.14 80 | 0.80 0.12 215 | 0.74 0.15 50 | 0.54 0.20 355 / 0.50 0.09 215 / 0.50 0.11 70 |
| 2 | Neon Orchid, 320 | 0.72 0.20 328 | 0.80 0.11 205 | 0.83 0.14 85 | 0.80 0.11 205 | 0.74 0.14 40 | 0.52 0.20 328 / 0.50 0.09 210 / 0.50 0.11 70 |
| 3 | Dusk Rose, 10 | 0.76 0.13 5 | 0.78 0.09 235 | 0.82 0.13 75 | 0.78 0.09 235 | 0.72 0.13 45 | 0.54 0.16 5 / 0.50 0.10 240 / 0.50 0.11 70 |
| 4 | Candy Noir, 345 (C 0.004) | 0.74 0.17 345 | 0.80 0.10 205 | 0.83 0.15 85 | 0.80 0.10 205 | 0.72 0.15 45 | 0.54 0.19 345 / 0.50 0.09 210 / 0.50 0.11 70 |
| 5 | Blush Signal, 330 | 0.75 0.15 355 | 0.76 0.12 295 | 0.82 0.14 75 | 0.76 0.12 295 | 0.72 0.15 40 | 0.54 0.18 355 / 0.50 0.15 295 / 0.50 0.11 70 |
| 6 | Synthwave Dusk, 300 (C 0.03) | 0.73 0.20 350 | 0.76 0.14 285 | 0.80 0.15 65 | 0.80 0.12 215 | 0.72 0.17 40 | 0.53 0.20 350 / 0.50 0.16 285 / 0.50 0.12 60 |
| 7 | Tol Vibrant Night, 255 | 0.68 0.21 8 | 0.72 0.12 240 | 0.76 0.15 55 | 0.72 0.12 240 | 0.76 0.15 55 | 0.55 0.21 8 / 0.50 0.12 240 / 0.52 0.14 55 |
| 8 | Raspberry Ice, 350 | 0.68 0.19 350 | 0.85 0.08 215 | 0.80 0.15 60 | 0.85 0.08 215 | 0.72 0.16 45 | 0.52 0.20 350 / 0.50 0.08 215 / 0.50 0.12 60 |
| 9 | Rose Mono, 355 | 0.76 0.14 355 | = accent | 0.82 0.14 80 | 0.80 0.11 230 | 0.74 0.15 50 | 0.54 0.17 355 / = accent / 0.50 0.11 70 |

Contrasting alternatives (10 to 14)

| # | Name, neutral H | Accent | In range | Out of range | Up | Down | Light: accent / in / out |
|---|---|---|---|---|---|---|---|
| 10 | Ultraviolet, 285 | 0.70 0.19 290 | 0.80 0.10 215 | 0.82 0.14 80 | 0.80 0.10 215 | 0.74 0.15 50 | 0.50 0.20 290 / 0.50 0.09 215 / 0.50 0.11 70 |
| 11 | Lilac Haze, 290 | 0.78 0.11 295 | 0.80 0.09 250 | 0.83 0.12 85 | 0.80 0.09 250 | 0.75 0.13 45 | 0.52 0.14 295 / 0.50 0.10 250 / 0.50 0.11 70 |
| 12 | Coral Ember, 40 | 0.74 0.16 40 | 0.78 0.11 235 | 0.86 0.15 95 | 0.78 0.11 235 | 0.70 0.18 335 | 0.54 0.17 40 / 0.50 0.10 235 / 0.52 0.12 85 |
| 13 | Ice Signal, 250 | 0.82 0.12 225 | = accent | 0.80 0.16 60 | 0.84 0.10 205 | 0.72 0.17 350 | 0.52 0.12 235 / = accent / 0.50 0.12 60 |
| 14 | Twilight Indigo, 270 | 0.66 0.18 270 | 0.80 0.10 215 | 0.82 0.14 80 | 0.80 0.10 215 | 0.72 0.17 350 | 0.50 0.19 270 / 0.50 0.09 215 / 0.50 0.11 70 |

Expected text contrast of state colours on dark surface (L 0.21): L 0.68 to 0.72 about 5.5 to 6.5:1; 0.76 to 0.80 about 7.5 to 9:1; 0.84 to 0.86 about 10 to 11:1. Light (surface L 0.995): L 0.50 about 6:1, 0.54 about 5:1.

Mood, references, CVD notes

- 1 Rosewave: calm hot pink on plum-black; ice cyan keeps it cool. Refs: Tailwind pink-400, Uniswap pink (#FF007A, full-chroma, here cut to C 0.19). Pink vs orange down: protan sees pink darker, ok with sign glyph.
- 2 Neon Orchid: the most "neon"; magenta hue 328. Refs: Tailwind fuchsia-400 (0.74 0.238 322, lowered), synthwave. Keep glow off the chip; magenta-vs-blue in-range pair is weak for tritan, rely on shape.
- 3 Dusk Rose: quietest, near-dusty; best light-mode twin. Refs: Radix crimson/pink steps 9-11, Material dark guidance. Hue 5 sits closest to error red: widen L gap to 0.10.
- 4 Candy Noir: neutral black, pink does all the talking, closest to a Linear-like look with one hot accent. Refs: Linear, Vercel Geist neutrals.
- 5 Blush Signal: pink plus lilac siblings (25 to 60 degrees apart) so nothing clashes; in range and up share lilac, so rely on word and arrow. Refs: Phantom lavender, Radix plum/iris.
- 6 Synthwave Dusk: purple-tinted bg C 0.03, pink plus violet plus orange sunset. Highest risk of "cheap"; obey rules 1 and 4. Refs: synthwave and cyberpunk palettes (not read, unverified).
- 7 Tol Vibrant Night: derived from Tol Vibrant #EE3377 pink, #0077BB blue, #EE7733 orange, lightened for dark. Up (blue) and down (orange) are the CVD-safest pair here; out of range and down share orange, so chip shape differs. Refs: Tol [8], Okabe-Ito [9].
- 8 Raspberry Ice: deeper berry accent with near-white ice for in range; very high in-range contrast. Ice vs fg 0.96 is close: in-range chip needs outline and word.
- 9 Rose Mono: in range = accent, so out of range (amber) is the only warm signal on screen; strongest "accent on one thing". Risk: accent also marks selection, so selection needs a shape (check, bar).
- 10 Ultraviolet: electric violet, hue 290 stays far from error red. Refs: Tailwind violet-400 (0.70 0.18 294), Phantom.
- 11 Lilac Haze: pastel, low chroma, friendly; thin 3:1 margin for range fills, so use L 0.58 fills.
- 12 Coral Ember: warm accent and ice contrast; out of range is gold, far from coral only by 55 degrees, so chip uses shape. Down is magenta, not red. Refs: Tailwind orange-400.
- 13 Ice Signal: cold, clinical; pink only for down. Refs: Tailwind sky-400/cyan-400.
- 14 Twilight Indigo: deepest accent (L 0.66), blue-violet; blue accent vs cyan up differ by 55 degrees, tritan-weak; use arrows.

## Facts that constrain us

- OKLCH: L is perceived lightness, so a ladder at fixed L has stable contrast across hues; LCH drifts blue to purple, OKLCH does not; practical chroma stays below 0.37 and sRGB limits are lower per hue and lightness. Oklab predicts lightness with 0.20 RMS vs CIELAB 1.70; Ottosson's code is public domain or MIT. [2][3]
- Tailwind v4 (4.3.x) palette, OKLCH: pink-300 `0.823 0.12 346`, pink-400 `0.718 0.202 350`, pink-500 `0.656 0.241 354`, fuchsia-400 `0.74 0.238 322`, rose-400 `0.712 0.194 13`, violet-400 `0.702 0.183 294`, purple-400 `0.714 0.203 306`, orange-400 `0.75 0.183 56`, amber-400 `0.828 0.189 84`, sky-400 `0.746 0.16 233`, cyan-400 `0.789 0.154 212`. Some of these exceed sRGB, so copy hue and role, not the number. [1]
- Radix Colors: 12 steps per scale, 40+ scales incl. Pink, Crimson, Ruby, Plum, Purple, Violet, Iris, Indigo, Cyan, Sky, Amber, Orange; dark variants supplied; MIT (WorkOS). Open Color: 10 levels per family, MIT. Leonardo: contrast-ratio-driven scales, Apache-2.0. [4][5][6][7]
- Paul Tol (all three marked colour-blind safe): Bright `#4477AA #EE6677 #228833 #CCBB44 #66CCEE #AA3377 #BBBBBB`; High-contrast `#004488 #DDAA33 #BB5566`; Vibrant `#EE7733 #0077BB #33BBEE #EE3377 #CC3311 #009988 #BBBBBB`. [8]
- Okabe-Ito (8 colours: black, orange, sky blue, bluish green, yellow, blue, vermilion, reddish purple), with the authors' rule to add shape, position or pattern, not colour alone. Hex values (`#E69F00 #56B4E9 #009E73 #F0E442 #0072B2 #D55E00 #CC79A7`) are from memory, not the page. [9]
- Material 2 dark theme: desaturated accents on `#121212`, saturated colours cause visual fatigue. Apple HIG Color: do not rely on colour alone, avoid red-green, test both appearances. [10][12]
- WCAG 1.4.11: 3:1 for UI components and graphical objects needed to understand state; disabled controls and logos exempt; values are not rounded. [11]
- Uniswap pink `#FF007A` (RGB 255 0 122) per brand-colour sites (secondary). [13]

## Open questions

1. Real Color.js numbers: contrast, `inGamut("srgb")` and 8-bit rounding for every token above; the first spike should script this for all 14 palettes.
2. CVD simulation (protan, deutan, tritan) of pink vs red vs orange: no tool was run and no CVD library is chosen. Color.js has none; pick one (Machado matrices) before the owner trusts note 1 to 14.
3. Do the owner's picks of pink hue (330 to 8) hold up on a real iPhone OLED and a cheap Android LCD? Needs a visual prototype.
4. Vibration and halation of saturated neighbours: no primary source found; the 0.06 L and C 0.14 limits are heuristics to be judged by eye.
5. Whether in range and up may share a hue (palettes 5, 7, 8, 10, 14 do) or need different ones.
6. Dribbble, Lyft, T-Mobile, Raycast, Warp, Arc, Zora, Rainbow, Cash App, Coolors, Huemint, Happy Hues, Realtime Colors and synthwave sources were not read; no claim here relies on them. Coolors and Huemint pages returned no terms text.
7. Material HCT and Apple `systemPink` exact values were not retrieved (HIG page gave no numbers); Apple pink is not a reason to deviate from token colours.

## Sources

1. Tailwind CSS, colors — https://tailwindcss.com/docs/colors
2. Björn Ottosson, A perceptual color space — https://bottosson.github.io/posts/oklab/
3. Evil Martians, OKLCH in CSS — https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
4. Radix Colors, understanding the scale — https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
5. Radix Colors repository (MIT) — https://github.com/radix-ui/colors ; scales https://www.radix-ui.com/colors
6. Open Color (MIT) — https://github.com/yeun/open-color
7. Adobe Leonardo (Apache-2.0) — https://github.com/adobe/leonardo
8. Paul Tol, notes on colour schemes — https://sronpersonalpages.nl/~pault/
9. Okabe and Ito, Color Universal Design — https://jfly.uni-koeln.de/color/ ; summary https://thenode.biologists.com/data-visualization-with-flying-colors/research/
10. Material 2, dark theme — https://m2.material.io/design/color/dark-theme.html
11. WCAG 2.2, 1.4.11 Non-text contrast — https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
12. Apple HIG, Color — https://developer.apple.com/design/human-interface-guidelines/color
13. Uniswap colour codes (secondary) — https://brandpalettes.com/uniswap-colors/
14. Huemint — https://huemint.com/faq ; Coolors — https://coolors.co/terms-and-conditions (no terms text returned)
15. Design direction, in repo — design-direction.md ; colour and contrast — colour-and-contrast.md
16. Lively UI, in repo — lively-ui.md
