---
app: repo
topic: Colour token naming
checked: 2026-10-11
---

# Colour token naming

Research on 2026-10-11 for a product with web (CSS, Tailwind v4), SwiftUI and Jetpack Compose clients and DTCG tokens built with Terrazzo. Recorded in [ADR 0027](../../decisions/0027-design-tokens.md) and the [design book](../../design/book/foundations/colour.md).

## Evidence quality

| Level | What |
|---|---|
| Fetched from official pages | DTCG 2025.10 Format, Color and Resolver modules; Terrazzo docs and changelog; Style Dictionary transforms; Android Compose custom design system and Material 3 pages; Tailwind v4 theme; MDN; Primer, Carbon, Atlassian, Radix, shadcn, Open Props colour pages |
| From memory, not fetched | Material 3 role page (the role list matches Android docs), Apple HIG and UIColor names, Fluent 2 token names, Polaris, Spectrum names |
| Not verified | Material 3 Expressive colour changes, iOS 27 colour guidance, Compose Material 3 1.5 additions |
| Practitioner posts only | Agent legibility of names, token tier depth, removal windows. No controlled study found |

## Findings

1. **Tiers.** Use at most three: primitive, semantic, component. Product code uses semantic tokens. Component tokens stay local until about three components share a decision ([Curtis](https://nathanacurtis.substack.com/p/naming-tokens-in-design-systems-9e86c7444676), practitioner). Polaris made palette tokens private in v11.
2. **Name by role, not value.** Atlassian says choosing a token by how the colour looks "can break the experience in other themes" ([source](https://atlassian.design/foundations/tokens/design-tokens)). Carbon keeps the name and changes the value per theme.
3. **Modes are not names.** Light, dark, contrast and brand are resolver contexts. DTCG Format 2025.10 is a stable Community Group report dated 2025-10-28, not a W3C Standard; modes live in the separate Resolver module. A newer draft (2026-09-08) says not to implement it.
4. **Pair fills with content.** Material 3 pairs `x` with `on-x`; shadcn pairs `x` with `x-foreground`; Primer uses `onEmphasis`. Every pair gets a contrast test.
5. **States are not colour tokens in Material 3.** Hover, pressed and focus are opacity layers applied by components. Primer instead suffixes states on component tokens.
6. **Numbers belong to primitives and ordered categorical sets.** Carbon moved from `$ui-01` to descriptive names in v11. Carbon's 14 data colours are numbered because their order is the design.
7. **Status vocabulary has no standard.** Primer: `success attention danger severe done`. Carbon: `support-error`. Dialpad moved `success` to `positive`. Pick one list and write it down.
8. **Renames need a lifecycle.** Keep the old name as an alias, codemod the mechanical part, add a lint for leftovers, remove after a stated window (Spectrum: at least two minor versions).

## Constraints from tooling

| Constraint | Source |
|---|---|
| DTCG names must not start with `$` and must not contain `{`, `}` or `.`; case-sensitive | Format 2025.10 |
| Terrazzo CSS names come from `token.id.replace(/\./g, "-")` by default in its example, so `a-b.c` and `a.b-c` collide | Terrazzo docs |
| Swift and Kotlin identifiers cannot start with a digit or contain `-`; reserved words (`default`, `in`, `is`, `object`) are unusable | language rules |
| Terrazzo has no Compose or Android plugin; the Swift plugin is experimental and emits an Xcode asset catalog only | Terrazzo docs 2.x |
| Tailwind v4 `@theme { --color-surface-container: ... }` creates `bg-surface-container`, `text-...`, `border-...` | Tailwind docs |
| Compose Material components read only `ColorScheme`; extra roles go in a CompositionLocal | Android docs |
| SwiftUI `Color.primary`, `.secondary` and `.tint` exist; a custom `.primary` clashes | Apple API (memory) |

## Decisions

**One flat path under `color.`, Material 3 role names in kebab-case, plus our own roles only where Material has none.** Reasons: Compose reads the same names (missing Material slots are aliased), Tailwind utilities read naturally, and models know the names. No segment is both a leaf and a group, so every token flattens to one valid identifier.

| Role family | Tokens |
|---|---|
| Surface ladder | `color.background`, `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest`, `-low`, `surface-container`, `-high`, `-highest` |
| Content on surface | `color.on-surface`, `on-surface-variant`, `inverse-surface`, `inverse-on-surface` |
| Lines | `color.outline` (control borders, 3:1), `outline-variant` (separators), `scrim` |
| Accent | `color.primary`, `on-primary`, `primary-container`, `on-primary-container` |
| Status | `color.error`, `success`, `warning`, `info`, each with `on-X`, `X-container`, `on-X-container` |
| Focus | `color.focus-ring` |
| Fills | `color.fill-1` to `fill-4` with `on-fill-1` to `on-fill-4`; the order is the rotation and is documented |
| Opacity layers | `state.layer.hover`, `pressed`, `focus` (opacity tokens, not colours) |

### Mapping

| Role | CSS | Compose | Swift |
|---|---|---|---|
| `color.surface-container-high` | `--color-surface-container-high` | `colorScheme.surfaceContainerHigh` | `VoidColor.surfaceContainerHigh` |
| `color.on-primary` | `--color-on-primary` | `colorScheme.onPrimary` | `VoidColor.onPrimary` |
| `color.success` | `--color-success` | `ExtendedColors.success` | `VoidColor.success` |

Swift symbols live in a `VoidColor` namespace so `VoidColor.primary` never shadows `Color.primary`. Prototype this in Xcode before fixing it: asset-symbol generation rules were not verified.

### Rules

- Name check in CI: fail when two tokens flatten to the same CSS, Swift or Kotlin name, or when a path segment is a reserved word.
- Only primitives may carry a hue or number (`grey.500`). Semantic names never do, except the ordered `fill-N`.
- No platform words in names. Platform differences go in the platform adapter.
- Every semantic token has a one-line `$description` with "use for" and "never for".
- Dynamic colour (Android) and the user accent colour (macOS) are opt-ins outside the token contract.

## Fills in Material 3 terms

- Material names the three accent groups by prominence (primary, secondary, tertiary), not by meaning, and pairs each with `on-X` ([Android docs](https://developer.android.com/develop/ui/compose/designsystems/material3)). Our four fills are equal peers, so that vocabulary does not fit.
- For extra colours Material says to add custom colours that do not reuse slot names, keep luminance so contrast holds ([Color.md](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md)), and the Theme Builder export gives each one four roles: base, on, container, on-container (a codelab, not a spec). We need only the base and its content, so `fill-N` and `on-fill-N`.
- Names by hue (`brand_blue`) would be wrong here: each scheme changes a fill's hue between light and dark. The name stays an index, the glossary term stays Fill.
- Material harmonises custom colours toward `primary`; we do not, since fills are chosen by the scheme.

## Open questions

- Whether the Material word "container" suits our cards; a neutral ladder name would need a mapping table on Android.
- Swift namespace and asset-symbol behaviour (prototype).
- Swift asset symbols generated from `.xcassets` named `primary` or `background` may clash with SwiftUI `Color.primary` even inside a namespace; turn off generated symbols or prefix the set names.
- Material 3 Expressive and Apple 26/27 colour guidance, not verified.

## Spacing

Spacing follows the same approach, recorded here to keep one naming note. Research on 2026-10-11 (Tailwind v4 and Atlassian and Primer pages fetched; Fluent, Polaris, Carbon and Apple from memory or snippets):

- T-shirt names stay (`xxs` to `xxxl`, eight steps, no new steps). Inserting a size between two others is their known weakness; semantic tokens absorb new needs.
- Names start with a letter, so they are valid Swift and Kotlin identifiers; `2xl` was not.
- CSS uses `--space-*`: Tailwind v4's `--spacing-*` is a numeric multiplier and its own `xs`, `sm` names already live in the container, text and radius namespaces ([Tailwind](https://tailwindcss.com/docs/theme)).
- Components use `space.inset.*` and `space.gap.*`; the scale is for building them (Primer and Atlassian keep this split).
- Only text-tied spacing scales with text size.
