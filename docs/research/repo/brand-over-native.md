---
app: repo
topic: One brand design language over native platform components
checked: 2026-10-03
---

# One brand design language over native platform components

Replaces direction A in [design direction](design-direction.md) (owner: too bland). Typeface decisions are superseded by [0055](../../decisions/0055-ghost-design-language.md): DM Sans for figures, titles and body. Constraints: [0019](../../decisions/0019-ios-stack.md), [0020](../../decisions/0020-android-stack.md), [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md), [token pipeline](token-pipeline.md), [colour](colour-and-contrast.md). Apple pages were read through sosumi.ai and a fetch summariser, so API signatures come from our own knowledge and need a compile check. Nothing here is decided.

## Decisions

- We share brand through tokens, content-layer components and assets, and keep navigation, sheets, menus, pickers, text input, alerts and haptic hardware native, because every system we could verify does this: Spotify Encore shares tokens, type, motion and naming and lets each platform implement them natively; Apple's branding page says to express brand in content, not chrome, and to keep standard components. [1][13]
- We add a `shape` token group (radius scale, a status-shape pair, one squircle flag) and an `expressive` colour set (chroma up to the sRGB limit) to ADR 0027's contents, because "lively" needs more than colour, type and spacing, and M3 Expressive and Liquid Glass both already round every control. Colour stays OKLCH and sRGB. [4][9][11]
- (Superseded) We bundle one OFL variable font for two roles only, `display` (titles, hero numbers) and `figures` (every amount), and keep system fonts for body, controls and text fields, because HIG suggests custom fonts for headlines with system body text, system fonts get Dynamic Type and Bold Text free, and a custom face must replicate both. Candidates: Inter (OFL-1.1, `tnum` confirmed), Geist (OFL-1.1, `tnum` unconfirmed), Mona Sans (OFL-1.1, wght 200-900, wdth 75-125, opsz 1-100, `tnum` not in its feature list). A spike decides; the test is `tnum` present, glyph widths equal, and layout intact at AX5 and 200% font scale. [1][2][7][12][17][18][19]
- We reject Satoshi: it ships under the ITF Free Font License, not OFL, and self-hosting it as a web font needs ITF's written consent; Manrope, Space Grotesk and Instrument Sans are OFL but not checked for `tnum`. [20]
- We scale the custom font with `Font.custom(_:size:relativeTo:)` on Apple and `sp` on Android and web `rem`, and snapshot at AX5, font scale 2.0 and 200% browser zoom, because Android 14+ scales non-linearly up to 200% and large text grows slower than body, so a literal ratio table is wrong; the token carries the style role, never a pixel size per platform. [7][12]
- We use Liquid Glass only on the system layer plus at most one custom glass element per screen (the floating range-status or refresh pill), grouped in a `GlassEffectContainer`, with tint reserved for the primary action or one state, never a brand wash, because Apple says tint conveys meaning and brand colour should not colour every glass control. This keeps ADR-level "no glass in the content layer" from [design direction](design-direction.md). [4][5][6]
- We opt out of Material You dynamic colour and theme M3 with our token colours, and treat `MaterialExpressiveTheme` as unusable until `material3` 1.5.0 is stable, because dynamic colour would give four different palettes, and the expressive APIs sit in 1.5.0-alpha29 while 1.4.0 is the latest stable (2026-09-23). We copy the Expressive ideas (spring spatial motion, shape morph, emphasised type) with stable pieces: our spring tokens, `androidx.graphics:graphics-shapes` 1.0.1 `Morph`, our own `Typography`. [9][10][11][23]
- We draw the shared signature pieces ourselves on all clients from token data, and name them in the component spec: range bar, status shape chip, animated figure (digit roll), refresh pulse, empty-state illustration. Because they are the part of VoidX that looks identical everywhere, they are the "brand"; everything around them is native. ADR 0023 springs and `numericText` already carry the motion. [13][14]
- We author icons as one SVG source set (ADR 0027 already lists SVG icons) with three exports: Android vector drawables, custom SF Symbols templates (annotated layers so rendering modes and animations work), and inline SVG on the web, because SF Symbols stay the system choice for toolbars and tab bars but cannot be used for logos, and custom symbols need a symbol template with labelled layers. Brand glyphs (status shapes, chain fallback marks) go custom; generic actions keep SF Symbols on Apple and Material Symbols on Android. [3]
- We animate icons with platform effects (`symbolEffect`, Draw and Magic Replace in SF Symbols 7; `AnimatedVectorDrawable` and Compose animated vectors) for state changes and use no runtime like Rive or a custom video format in v1, because Rive's runtimes are MIT and cover Apple, Android and web but add three dependencies and a 16 KB-to-1 MB asset pipeline that ADR 0020's lint and ADR 0023's reduced-motion table do not cover; Airbnb's Lava is a patented custom format. Revisit Rive only for a mascot-style illustration. [3][14][15][16]
- We write one component spec per shared component (anatomy, states, token slots, native mapping, a11y text, reduced-motion branch) in `apps/<app>/docs/` or a shared concept doc, generated parts from tokens, because a table of "this region is token-driven, this region is the system control" is what lets an agent build four clients consistently without a Figma file ([design guidance](../agent-tools/design-guidance.md) already rules out hand-written token files). Spec template below.
- We map haptics and sound once in a token-like table (event -> `sensoryFeedback` kind / Android `HapticFeedbackType` / web none) and ship no sound in v1, because haptics are native hardware and sound is brand extras we cannot test in CI. [Open question]

## Shared versus native (VoidX screens)

| Screen | Shared (token or custom-drawn, identical) | Native (system control) |
|---|---|---|
| Portfolio list | Colour, `display` heading, `figures` for totals, row shape, empty-state illustration, stagger, skeleton | Navigation container (tab bar / `NavigationSuiteScaffold` / web nav), list scroll, pull-to-refresh, swipe actions, search field |
| Position row | Chain and protocol logo tile, status shape chip (word + shape), figures, row layout | Row selection and context menu, `Menu` for sort, accessibility actions |
| Position detail, range bar | Range bar (custom `Canvas` or SVG), tick label, status chip, animated figures, morph of status shape, refresh pulse | Navigation push with zoom or shared element, sheet for fees breakdown, share sheet, copy toast/haptic |
| Alerts | Alert row anatomy, status colours, icon set | Permission prompts, notification settings page, `Picker` or segmented control for conditions, system alert dialogs |
| Settings | Section headings in `display`, accent, toggles tinted with the accent | `Form`/`List`, `Toggle`, `Picker`, M3 `Switch`, `ListItem`, text fields, destructive confirmation dialogs |
| Sign-in | Brand mark, one illustration, voice and copy | Passkey sheet (`ASAuthorization`, Credential Manager), `ASWebAuthenticationSession`, Custom Tab, keyboard, autofill |

## Component spec template (what an agent needs)

- Anatomy: regions named once, each tagged `token` (generated name), `custom` (we draw it) or `native` (platform control, with the exact API per client).
- States: default, pressed, focused, disabled, loading, stale, error, empty; each a token set, never a literal.
- Motion: spring token per transition and the `reduced` branch ([0023](../../decisions/0023-motion.md)).
- A11y: accessible name, text alternative for custom drawing, minimum target, Dynamic Type and 200% behaviour ([0022](../../decisions/0022-accessibility.md)).
- Mapping table: one row per client (Hono JSX + CSS, SwiftUI, Compose) naming the file and the primitive.
- Test: one snapshot at AX5 or font scale 2.0 and the contrast pair list.

## Facts that constrain us

- Apple Branding: "branding always defers to content"; do not use launch screens, logos everywhere or brand colour on all controls; custom fonts for headlines, system for body (secondary summary of the page, 2026-10). [1]
- Apple Typography: custom fonts must implement Dynamic Type and Bold Text themselves; system fonts get both. [2]
- `Font.custom(_:size:relativeTo:)` scales with Dynamic Type relative to a text style; without `relativeTo` the size is fixed. [7]
- `Glass` has `regular`, `clear`, `identity`, with `tint` and `interactive`; `glassEffectID` morphs between glass views; `GlassEffectContainer` groups glass for performance and merging. [4][6]
- SF Symbols 7 adds Draw animations, gradient rendering and better Magic Replace; symbols cannot be used in app icons or logos. [3]
- Icon Composer (macOS Tahoe 26.4+) authors layered Liquid Glass app icons with default, dark and mono appearances from one file; Xcode integrates it. [8]
- Compose Material 3 1.4.0 is stable; expressive components live in 1.5.0-alpha29 (2026-09-23); `MaterialExpressiveTheme` was `internal` in 1.4.0 (secondary). M3 `Typography` has no default font family, so each style sets it. [9][10][23]
- Material guidance (secondary): with Expressive an app may follow dynamic colour or keep brand colours, with a static light and dark fallback below API 31. [23]
- `graphics-shapes` 1.0.1 morphs only polygons; arbitrary paths need `AnimatedVectorDrawable`. [11]
- Spotify Encore: a foundation of tokens, type, motion, spacing, writing and a11y guidance sits under separate Mobile and Web systems; its page says little on motion and type specifics. [13]
- Airbnb Lava (May 2025, secondary): a patented micro-video format with alpha, own renderer for web and mobile, replaces 2D Lottie for 3D icons. [14]
- Rive: runtimes MIT for Web, React, React Native, Apple, Android, Flutter, Unity, Unreal; some features depend on the renderer. Duolingo's character file is under 1 MB (Rive case, secondary). [15][16]
- Fonts: Geist, Inter, Mona Sans, Manrope, Space Grotesk, Instrument Sans are OFL-1.1; Inter lists `tnum`; Mona Sans has an `opsz` axis (1 to 100) and a monospace sibling. [17][18][19][20]

## Open questions

- Which of Inter, Geist or Mona Sans has working `tnum` plus a distinctive look; test by inspecting the font tables and a screenshot spike, not by the READMEs.
- Is a custom face on only display and figures lively enough for the owner, or is the character in shape, colour and motion? Needs a visual prototype, which this file cannot judge.
- Resolved in [0055](../../decisions/0055-ghost-design-language.md): light is the primary surface.
- Where does the spec live: `docs/concepts/` (shared) or per app? Owner decision; ADR 0027 may need an amendment for `shape` and fonts.
- Does `GlassEffectContainer` keep contrast with Reduce Transparency and Increase Contrast on? Manual check ([colour](colour-and-contrast.md)).
- Not verified: Airbnb DLS internals and its 2025 engineering posts (Lava page blocked, 403), Duolingo, Revolut (secondary sites claim a system font stack), Cash App, Robinhood Legend design system (only the SDUI post exists), Linear mobile, Arc/Dia, Things 3, Shopify Polaris native, Uber Base, Primer mobile. No primary source found; do not cite them as patterns.
- Apple HIG app-icon pages, Material 3 Expressive pages (blog returned no body) and Android font-scaling docs were read only through summaries or secondary sources; a person should read them before implementation.

## Sources

1. Apple HIG, Branding (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/branding
2. Apple HIG, Typography (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/typography
3. Apple HIG, SF Symbols (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/sf-symbols
4. Applying Liquid Glass to custom views — https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views
5. Adopting Liquid Glass — https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
6. SwiftUI `Glass` — https://developer.apple.com/documentation/swiftui/glass
7. `Font.custom(_:size:relativeTo:)` — https://developer.apple.com/documentation/swiftui/font/custom(_:size:relativeto:)
8. Icon Composer — https://developer.apple.com/icon-composer/
9. Material Design 3 in Compose — https://developer.android.com/develop/ui/compose/designsystems/material3
10. Compose Material 3 releases — https://developer.android.com/jetpack/androidx/releases/compose-material3
11. Shapes in Compose (`graphics-shapes`) — https://developer.android.com/develop/ui/compose/graphics/draw/shapes
12. Android 14 features, non-linear font scaling — https://developer.android.com/about/versions/14/features
13. How Spotify's design system goes beyond platforms — https://www.designsystems.com/how-spotifys-design-system-goes-beyond-platforms/
14. Airbnb's new Lava icon format (secondary) — https://medium.com/@waldobear002/airbnbs-new-lava-icon-format-a-technical-deep-dive-b2604626c7e0
15. Rive runtimes — https://rive.app/docs/runtimes/getting-started
16. Duolingo-style Rive characters (secondary) — https://dev.to/uianimation/building-duolingo-style-ai-video-call-characters-using-rive-10o9
17. Geist font — https://github.com/vercel/geist-font
18. Mona Sans — https://github.com/github/mona-sans
19. Inter — https://rsms.me/inter/
20. Satoshi, Manrope, Space Grotesk licences (secondary) — https://www.uwarp.design/blog/satoshi-font-guide ; https://www.fontshare.com/fonts/manrope
21. Robinhood, server-driven UI — https://robinhood.com/us/en/newsroom/how-server-driven-ui-is-helping-frontend-engineers-scale-impact/
22. Android Developers Blog, M3 Expressive for Wear OS — https://android-developers.googleblog.com/2025/08/introducing-material-3-expressive-for-wear-os.html
23. M3 Expressive dynamic colour and `MaterialExpressiveTheme` (secondary) — https://composables.com/docs/androidx.compose.material3/material3/components/MaterialExpressiveTheme ; https://github.com/seijikohara/femto-car-launcher/issues/427
