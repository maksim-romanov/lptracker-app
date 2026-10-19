---
app: repo
topic: Design audit of leading crypto product sites
checked: 2026-10-03
---

# Design audit of leading crypto product sites

Tokens read from shipped HTML and CSS (curl, no browser) and from Uniswap's public theme source. Raw values per site live outside the repo (session scratchpad, `site-audit/<site>.json`). Feeds [design direction](design-direction.md) and [palettes](palettes.md); nothing here is decided. OKLCH and contrast figures were computed from sRGB hex with the OKLab matrices and WCAG relative luminance in this pass; the ADR 0027 Color.js gate still decides.

Not reachable as an app from source: app.1inch (redirects to 1inch.com, `app.1inch.com` did not answer), app.aave.com (SPA shell, only RainbowKit and Inter CSS), app.hyperliquid.xyz (shell CSS with `--hl-*` tokens only). uniswap.org redirects to app.uniswap.org. Nothing blocked the fetch.

## Decisions

What a top crypto product looks like in 2026 (patterns found on most of the 15 sites):

- One custom or licensed neo-grotesk, weights between 400 and 535, never bold: Uniswap Basel 485/535, 1inch Suisse 400/450/500, Aave Repro 450/500, Hyperliquid Diatype 400/500, Morpho Untitled Sans 400. Display sizes 52 to 72px with tracking -0.02 to -0.03em; body 14 to 18px. [3][4][9][10][12]
- Text colours are alpha steps of one ink, not separate greys: Uniswap neutral1/2/3 = 100/65/38% white on dark and 100/63/35% of #131313 on light; Aave fp-2..6 = 90/65/50/40/30% of #272228. [2][10]
- Neutral or near-neutral surfaces with one saturated accent: Uniswap #131313 + #FF37C7, Hyperliquid app #0F1A1F + #97FCE4, Jupiter #090D10 + lime oklch(0.907 0.145 127), Base #FFFFFF + #0000FF, 1inch #000000 + #3355FF. [2][4][8][9][16]
- Elevation by surface step and hairline, rarely by shadow: Uniswap surface1→2 (#131313→#1F1F1F) plus 12% white surface3; 1inch borderPrimary #2E2E30; Hyperliquid #273035. Shadows, where present, are 2 to 5% black. [2][4][9]
- Radius scale in 4px steps up to 24 to 32, with full pills for primary buttons: Uniswap 4…32 + 999999; Hyperliquid app 8/12/16; 1inch cards 28, buttons pill; Phantom 16 dominant. [3][4][6][9]
- Tabular, lining numerals are set explicitly: Uniswap `lining-nums tabular-nums`, Phantom `"lnum","tnum"`, Aave `"tnum"`, Hyperliquid and Family `tabular-nums`. Matches our existing rule. [1][6][9][10][15]
- Landing pages move; apps stay still. Landings ship Rive, Lottie, three.js, Spline or shaders (13 of 15); app surfaces use only shimmer skeletons, fades and pulse dots (Hyperliquid app, Jupiter, Uniswap). [1][4][6][7][8][9][11][12][13]
- Glass is used on overlays and marketing cards only (blur 12 to 25px: Phantom, Aave cardGlass, Lido, 1inch), never under dense numbers. Consistent with [design direction](design-direction.md). [4][6][10][11]

What differentiates each: see the Facts table, last column.

### Five sample directions for VoidX

All use OFL fonts from google/fonts (verified present in `ofl/`) [18], pink as the one accent at C ≤ 0.20 per [palettes](palettes.md), no green, red only for errors (hue 27), cyan for in range and amber for out of range. Contrast is against the direction's main background.

| # | Name | Borrows from (what) | Fonts (OFL) | Palette hex · OKLCH | Radii | Surface, effects, layout |
|---|---|---|---|---|---|---|
| 1 | Quiet pink | Uniswap: alpha text levels, surface1/2/3 steps, 4px radius ladder, book-weight grotesk; 1inch: pill CTA, 28px cards | Inter Tight 450/550 (closest open cut to Basel Book/Medium; tighter than Inter at display); Geist Mono for addresses | dark bg #130D11 (0.17 0.012 340), surface2 #1F181D (0.22 0.014 340), surface3 #2C2329; ink #F7F2F5 at 100/65/38%; accent #F46CBF (0.721 0.189 345) 7.1:1; in range #65CDF3 (0.801 0.110 225) 10.6:1; out of range #F4A34B (0.780 0.140 65) 9.3:1; error #F0574E (0.660 0.190 27) 5.7:1. Light: bg #FFFFFF, accent text #B94082 (0.56 0.17 350) ≈4.9:1 | 4/8/12/16/20/24, pill | Hairline borders, no shadow in dark, `0 6px 12px -3px #0000000d` in light. Position card = Uniswap swap-card proportions (20px radius, 16px padding, token pair row then big tabular value). Motion: token logos float on landing only, no animated blur |
| 2 | Pearl glass | Phantom: cream base, 157deg glass gradient, 16/24 radii, -0.02em display; Lido: soft pink and blue radial glows, 24–40px card radii; Aave: warm greys, `ss`/`tnum` features | Onest 400/500/600 (rounded-terminal grotesk, nearest open feel to Phantom's face); Geist Mono for numbers | light default bg #FDF8FE (0.985 0.008 320); ink #1E1A24 16.3:1; muted #6A6474 5.4:1; lilac #705BCD (0.55 0.17 288) 4.9:1 for text, #9B8CF2 (0.696 0.147 289) fills only; pink #B94082 text, #F28CC8 (0.766 0.142 345) fills; dark variant bg #1A1620 (0.21 0.02 300) | 16 inner, 24 cards, 40 hero panels, pill | Glass only on marketing cards and the nav bar: `linear-gradient(157deg, #fff 65% → 10% → 20% → 10%)` + blur 20px; content cards opaque white with `0 16px 44px` lilac shadow at 30%. One static pink radial glow per page. Big friendly hero, illustration on the right |
| 3 | Night desk | Hyperliquid app: #0F1A1F-style tinted dark, 8/12/16 radii, 12–13px tabular density, no glass; Jupiter: oklch card and border steps, conic border on the focused card; 1inch: grey ramp | Geist 400/500 for UI, Geist Mono 400 tabular for every number and address | bg #0C1016 (0.19 0.02 250), surface #121820, inset #1B232C, border #26303A, divider #FFFFFF0F; text #F3F6F8 17.6:1, muted #98A2AB 7.4:1; accent #FF6EC7 (0.741 0.200 345) 7.5:1; in range #7FE3FF (0.865 0.101 218) 13:1; out of range #FF8A4C (0.751 0.161 47) 8.2:1; error #F0574E 5.6:1 | 4 inline, 8 controls, 12 panels, 16 modals | Table-first portfolio (sticky header, 40px rows, right-aligned tabular values), range bar as a thin 4px track with a pink tick. Motion: 110deg shimmer skeleton, pulse dot for "live", nothing else. Shadows only on popovers `0 12px 32px #0006` |
| 4 | Editorial night | Morpho and Hyperliquid landing: light-weight grotesk at large size, -0.02 to -0.03em, mono eyebrows; Hyperliquid: serif accent word (Teodor); Arc: OFL mono and plum-to-orange 176deg gradient idea, 8px radii; Zerion: 1px grid background | Hanken Grotesk 300/400 display, 400/500 UI; Instrument Serif italic for one accent word per heading; JetBrains Mono 400 uppercase eyebrows, +0.12em | bg midnight #0B0C1A (0.16 0.03 280), surface #131428 (0.20 0.04 280); text #EEF0FA 17:1, muted #8A8FA8 6.1:1; accent #F07AB0 (0.729 0.156 353) 7.5:1; second hue lilac #8C6CF0 (0.627 0.190 291) 5.1:1; hero gradient 176deg #F07AB0 → #8C6CF0 | 4/8 cards, pill CTA | Static (pre-rendered) shader-like gradient in the hero, 1px grid `#FFFFFF0D` at 64px, numbers set in mono. Landing reads like a report: big statement, eyebrow, two columns of figures. App inherits D3 density with this type |
| 5 | Rounded neon | Rainbow: #111 base, rounded face, top-to-bottom hairline stroke, inner highlight, 20/28 radii, coin flip; Family: soft two-layer shadow, negative px tracking; Base: one blue-glow-style halo, marquee | Nunito 600/700/800 (open rounded face closest to SF Rounded); Geist Mono for numbers | bg #111111; card #1A1A1C (0.219 0.004 286) with stroke rgba(255,255,255,.05→.02); text #FFFFFF 18.9:1, muted #9F9F9F 7.1:1; accent #FF5FA2 (0.711 0.203 358) 6.7:1; gradient stops #B65BF8 → #FF5FA2 → #FFB84D (no green); in range #5CC8FF (0.791 0.126 234) 10:1 | 16 inputs, 20 cards, 28 sheets, pill | Card shadow `0 4px 9px #00000026, 0 0 64px #ffffff0a` + inset `0 8px 9px #ffffff29`; gradient ring on the selected position only; CSS 3D coin flip on token logos (off under reduced motion). Mobile-first phone mockup on landing |

Recommendation for the owner's first look: 3 for the app with 1 or 4 for the landing; 2 and 5 are the light and playful outliers.

## Facts that constrain us

| Site | Fonts (weights, display) | Bg / text / accent | Radii | Signature effect |
|---|---|---|---|---|
| Uniswap [1][2][3] | Basel Grotesk 485/535 (licensed), Inter fallback; h1 52/50 -0.02em | dark #131313/#1F1F1F, light #FFF/#F9F9F9; text alpha 100/65/38; #FF37C7 (0.690 0.265 342); success #21C95E, warning #FFBF17, critical #FF593C | 4–32 + full | Floating token logos, blur-fade-in, gsap; otherwise flat |
| 1inch [4] | Suisse Intl 400/450/500 + Mono (commercial); display 72/60/48 | dark #000/#0F0F12…, light #F7F7FA; blue #3355FF/#4175FF; 24-hue rainbow ramp | cards 28/24/20, pill buttons | Lottie + Rive, shimmer, blur 25px |
| Cosmos [5] | The Future + Mono 100–900 (Pangram, commercial), ss02/ss09 | #000 / #FFF; dark hue-tinted cards #0E1331 #402960 #75192D | 30/20/10 | Light running along card borders (gradient-flow keyframes), marquees |
| Phantom [6] | Phantom 200–700 custom; -0.02em; lnum+tnum | cream #FFFDF8, ink #1C1C1C, lavender #AB9FF2 (0.745 0.118 290) | 16 (most), 24, pills | 157deg cream glass gradient, Lottie/Rive, blur 20px |
| Rainbow [7] | SF Pro Rounded web (Apple-licensed) 500–800, body 20px | #111111; stops #B65BF8 #FE5E42 #F7FF12 #0ED9F6 | 28/24/20/16 | three.js coin flip, inner highlight + white halo shadows |
| Jupiter [8] | Inter 300–700 | #090D10, card oklch(0.192 0.022 252); primary lime oklch(0.907 0.145 127) | .5/.75/1.5rem | Animated conic border (`@property --border-angle`), three.js |
| Hyperliquid [9] | Landing: ABC Diatype 400/500 + Teodor serif (commercial), -0.03em; app: own font, 12px | landing #F8F9F9 / #03211C, app #0F1A1F / #F6FEFD / #97FCE4 (0.922 0.101 177) | app 8/12/16 | Shader + Rive landing, ticker marquee; app shimmer only |
| Aave [10] | Aave Repro + Mono, Aave Aguzzo display (custom), Inter (app); ss07, tnum | warm #FFF/#FAFAF9, ink #211D1D/#272228, purple #8075FF→#E5E5FF; P3 duplicates | 6–32, pills | cardGlass blur 12px, earn-pulse dot |
| Lido [11] | Manrope + Fira Code (OFL); h1 56 -1px, display up to 200px | #FFF9F9 / #000; ocean #0085FF, coral #FF8E76, berry #D74758; dark #1B1B26 | 24–70 | Pink and blue radial glows, infinite slider rows, three.js |
| Morpho [12] | Untitled Sans + FK Grotesk + Mono (commercial); root 1px scaled to 1440 | blue-tinted neutrals #F4F7FF…#15181A; brand #5792FF, accent #B5E6E2 | s/m/l tokens, pill | Shader canvas, brand radial glow |
| Pendle [13] | Kyrial Sans Pro (commercial), Aboreto all-caps (OFL), Poppins 200–400 | navy #001C38, teal #1BE3C2, #6079FF; footer 180deg #000→#6079FF | Tailwind, pill | Spline 3D, rotating hero verb |
| Zerion [14] | Aeonik Pro variable (commercial), body +0.01em | white / oklch(0.141 0.005 286); #3232DC on #06003C, hero #3FFDEE→#2461ED | .625rem base, 1–1.5rem | Pointer-following conic spotlight border, 1px grid background |
| Family [15] | Family custom + LFE Sans; -1.35px display; ss01, tnum | #FFF / beige #FBFAF9, ink #343433, blue #1A88F8, pink #F966AC | 2 (small UI), 12, 32 | Lottie, soft two-layer shadow, no glass |
| Base [16] | baseSans family (custom) + Google Sans Flex, Doto, Geist Mono (OFL) | #FFF / #111; #0000FF; muted #6F6F6F | 12/20, pill | Text shimmer, blinking cursor, blue halo `0 0 80px #2563EBB3` |
| Arc [17] | DM Sans, Space Grotesk, Space Mono, IBM Plex Mono (all OFL); mono eyebrow +2.72px | white + navy #000121→#011266; plum #664C88, sunset 176deg #A85B87→#EA7E4D | 8 (most), 4, 20 | Lottie + gsap, layered blur(2px) |

- Uniswap's interface repo is GPL-3.0 (GitHub API); copy values as observations only, no code. Its pink #FF37C7 sits at hue 342; direction 1 at hue 345 is near it (Open question 1). [1]
- Proprietary faces seen: Basel, Suisse Intl, The Future, Phantom, SF Pro Rounded, ABC Diatype, Teodor, Aave Repro/Aguzzo, Untitled Sans, FK Grotesk, Kyrial, Aeonik, Family, LFE, baseSans. None may ship in VoidX.
- Green dominates three references (Hyperliquid #97FCE4 and #03211C, Jupiter lime, Pendle teal). We take their structure, not their hue.
- Uniswap animates blur (`blur-fade-in`); [lively-ui](lively-ui.md) forbids animated blur, so we drop that effect.

## Open questions

1. Is a pink at hue 345 close enough to Uniswap's #FF37C7 to read as borrowed brand? Shifting to hue 355 to 0 (direction 5) avoids it but moves toward error red.
2. Inter Tight versus Geist versus Hanken Grotesk as the Basel stand-in: needs a side-by-side render of the position card; this pass had no browser.
3. Onest and Nunito have no tabular mono partner of the same feel; is Geist Mono acceptable next to a rounded face?
4. Landing motion budget (Rive, shader) versus [ADR 0023](../../decisions/0023-motion.md) perf budgets: one pre-rendered video, or none?
5. App pages of 1inch, Aave and Hyperliquid were not readable without a browser; their in-app tables and position widgets are unverified.

## Sources

1. Uniswap web app CSS and HTML — https://app.uniswap.org/
2. Uniswap interface, `packages/ui/src/theme/color/colors.ts` — https://github.com/Uniswap/interface/blob/main/packages/ui/src/theme/color/colors.ts
3. Uniswap interface, `theme/fonts.ts`, `borderRadii.ts`, `spacing.ts`, `shadows.ts` — https://github.com/Uniswap/interface/tree/main/packages/ui/src/theme
4. 1inch site CSS — https://1inch.com/
5. Cosmos site CSS — https://cosmos.network/
6. Phantom site CSS — https://phantom.com/
7. Rainbow site CSS — https://rainbow.me/
8. Jupiter app CSS — https://jup.ag/
9. Hyperliquid landing and app CSS — https://hyperliquid.xyz/, https://app.hyperliquid.xyz/
10. Aave site CSS — https://aave.com/; app shell — https://app.aave.com/
11. Lido site CSS — https://lido.fi/
12. Morpho site CSS — https://morpho.org/
13. Pendle site CSS — https://www.pendle.finance/
14. Zerion site CSS — https://zerion.io/
15. Family site CSS — https://family.co/
16. Base site CSS — https://www.base.org/
17. Arc site CSS — https://www.arc.io/ (from arc.network)
18. google/fonts OFL directory (Inter Tight, Geist, Geist Mono, Hanken Grotesk, Instrument Serif, Onest, Nunito, JetBrains Mono) — https://github.com/google/fonts/tree/main/ofl
