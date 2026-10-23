# 0027 · One design-token source for all clients

- Status: proposed
- Deciders: Maksim Romanov

## Context

The web, Apple and Android clients must share colours, type, spacing, radius, motion and icons, and agents must not invent values.

## Options

- **Per-platform constants**.
- **W3C DTCG tokens generated into every platform**.

## Decision

Chosen **DTCG tokens in `packages/design-tokens`**, built by Terrazzo, because it implements all of DTCG 2025.10 including the resolver, which Style Dictionary v5 does not ([research](../research/repo/token-pipeline.md)):

- Contents: colour in OKLCH within the sRGB gamut (light and dark), type, spacing, radius, motion ([0023](0023-motion.md)), and SVG icons including chain and protocol logos.
- A spring is a `duration` token whose `$value` is its perceptual duration, with `$extensions["voidx.spring"] = { bounce }`, bounce from 0 to 0.4, because DTCG has no spring type and Apple configures every spring by `duration` and `bounce` instead of mass, stiffness and damping ([research](../research/repo/contracts-and-tokens.md#design-tokens)). Generators derive SwiftUI `Spring(duration:bounce:)`, Compose `spring(dampingRatio = 1 − bounce, stiffness = (2π / duration)²)` and a CSS `linear()` curve with its settling time as the animation duration.
- Light and dark, and full and reduced motion, are contexts of one DTCG resolver. Increased contrast is another context of the same resolver, shipped from M0; it changes outline and content roles only. A new Scheme is one more context of the same resolver ([0055](0055-ghost-design-language.md)).
- Outputs: CSS variables and a Tailwind `@theme` block from Terrazzo's plugins; Swift constants, `.xcassets` colour sets, a Compose output (light, dark and contrast `ColorScheme`s with every Material slot aliased, plus an `ExtendedColors` CompositionLocal for status, Fill and ink roles) and spring `linear()` curves from our own `voidx-native` plugin.
- Colour roles use Material 3 role names (except `ink-dark` and `ink-light`) in kebab-case under one flat `color.*` path, with `on-X` pairs, status roles `error`, `warning`, `success`, `info`, and the four Fills as `fill-1` to `fill-4`; the build fails when two names flatten to one identifier ([naming research](../research/repo/colour-token-naming.md)).
- Default Scheme ([0055](0055-ghost-design-language.md)), values in OKLCH; each fill's ink is the darker or lighter ink with the higher contrast:

  | Token | Dragonfruit (light) | Neon Night (dark) |
  |---|---|---|
  | `color.background` | 0.975 0.012 350 | 0.16 0.03 320 |
  | `color.primary`, `color.fill-1` | 0.54 0.224 350 | 0.72 0.208 350 |
  | `color.fill-2`, `fill-3`, `fill-4` | 0.995 0.001 350; 0.16 0.01 350; 0.88 0.07 355 | 0.5 0.22 295; 0.1 0.01 320; 0.88 0.06 230 |
  | `color.ink-dark`, `color.ink-light` (each `color.on-fill-N` aliases the one with the higher contrast) | 0.22 0.05 350; 0.98 0.01 350 | 0.22 0.05 320; 0.98 0.01 320 |

- A contrast test with Color.js checks every foreground and background pair in the [pair list](../design/book/foundations/colour.md#contrast-test-pairs) against WCAG 2.2, in every context, and fails on a colour outside sRGB ([0022](0022-accessibility.md), [research](../research/repo/colour-and-contrast.md)).
- CI regenerates outputs and fails on any difference from what is committed.
- Logos for chains and protocols are also served by URL at runtime, so new integrations appear without an app release ([0010](0010-wire-contract.md)).

## Consequences

- A new colour needs its contrast test.
- A test checks that each spring's settling time on iOS and Android is within 5% of the web `linear()` duration.
- Related: [0018](0018-web-ssr-hotwire.md), [0019](0019-ios-stack.md), [0020](0020-android-stack.md).
