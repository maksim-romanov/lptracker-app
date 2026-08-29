---
paths:
  - "packages/theme/**"
  - "apps/mobile/src/core/presentation/theme/**"
  - "apps/server/src/presentation/web/styles/**"
  - "apps/mobile/targets/positions-widget/**"
---

# Shared design tokens

The rules these values serve — palette doctrine, the two type families, elevation, what not to
build — are in [DESIGN.md](../../DESIGN.md). This file covers only how the tokens are generated
and consumed.

`packages/theme` is the single source for colour, spacing, radius **and typography** across
mobile, `/app` (SSR), the landing, and the iOS widget. Edit `packages/theme/tokens/`, then
`bun run codegen` from the root — never hand-edit `dist/js/*.ts`, `dist/css/*.css`, or the
widget's `.colorset/Contents.json`.

Generated per surface:

| Output | Consumed by |
| --- | --- |
| `dist/js/{colors,typography,spacing,networks}.ts` | mobile, via the unistyles theme |
| `dist/css/depthly.css` | `/app` — semantic colour custom properties |
| `dist/css/spacing.css` | `/app` — Tailwind `@theme` spacing + radius |
| `dist/css/typography.css` | `/app` — Tailwind `@theme` font stacks + one `text-*` utility per role |
| `Assets.xcassets/*.colorset` | iOS widget |

## Typography

Two families, split by what the text **is**: words in IBM Plex Sans, figures and hashes in
IBM Plex Mono. Mono never carries prose — that rule is what keeps the look from reading as
terminal pastiche. Roles `display`, `figure` and `figureSmall` are the mono ones.

`fontFamily` holds **PostScript** names for React Native and SwiftUI; `fontStack` holds CSS
family lists for the web. IBM Plex abbreviates its style tokens — `IBMPlexSans-Medm`, not
`-Medium`; `-SmBld`, not `-SemiBold`. A wrong name does not error, it silently falls back to
the system font. Verify with `fc-scan --format "%{postscriptname}"` against the shipped file
before adding a face.

Never hardcode a face or a size in a component. Mobile reads `theme.typography[role]` and
`theme.fontFamily[face]`; `/app` uses the generated `text-<role>` utilities. `Text.tsx`
derives its whole variant map from `theme.typography`, so a size can only be changed in the
token tree.

Faces are shipped per target and are not interchangeable: `.ttf` for React Native and both
widgets, `.woff2` self-hosted for `/app` and the landing. The landing carries only the two
sans cuts it actually sets.

## Not yet in the token tree

Elevation and motion are still per-surface. `/app` is mid-redesign and deliberately flat —
hairline borders, no radius, no shadows. Don't infer that mobile's current look is canonical,
and don't backport SSR-only values into `packages/theme` without a design decision first.
