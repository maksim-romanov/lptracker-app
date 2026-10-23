# Token architecture

Three layers. A component may use only the layer below it, so a visual change is made in one place.

- **1. Primitive** Raw scale values: a grey ramp, a type ramp, a space ramp. Named by step, not by use. `grey.500`, `size.17`, `space.lg`
- **2. Semantic** A role in the product, per context. Components use this layer. `color.on-surface`, `color.surface-container-lowest`, `space.inset.md`
- **3. Component** Optional, only where one component needs its own value. `button.primary.fill` points to a semantic token.

> **Rule.** Component code references semantic or component tokens. Primitive tokens are referenced only by the semantic layer. A raw hex, px or ms value in a component is a defect (token lint, *planned*, M0).

## Naming

| Part | Grammar | Example |
|---|---|---|
| Token | `category.role.variant`; colour is the flat `color.<role>` ([colour](colour.md)) | `font.role.display-md`, `color.on-warning-container` |
| Motion | Motion tokens are the exception: bare names fixed by [ADR 0023](../../../decisions/0023-motion.md) (`brisk`, `gentle`, `intent`) | `gentle` |
| Rules | Lowercase, dot-separated, hyphen inside a word. No platform suffixes (no "-ios", "-android"); platform differences live in the platform adapter. | `color.focus-ring` |
| Scale step | Number is the unit value for type, the rank for ramps. Space uses t-shirt names, `xxs` to `xxxl`. | `space.lg` `grey.500` |
| Context | Not part of the name. A token resolves to a value per context. | light, dark, full motion, reduced motion |

## Contexts

| Context | Values | Changes |
|---|---|---|
| Theme | light, dark | Colour roles |
| Motion | full, reduced | Durations, springs (bounce 0 when reduced), stagger 0 |
| Contrast | normal, increased | Outline and content colour roles only; ships in M0 ([values](colour.md#increased-contrast)) |
| Scheme | default | Page, accent and Fill colours (see ADR 0027) |
| Scale | device text size | Not a token context: type and text-tied spacing react to system text size |

## Pipeline

- **Source** DTCG files in `packages/design-tokens` (*planned*, M0, [ADR 0027](../../../decisions/0027-design-tokens.md))
- **Build** Terrazzo, plus the native plugin
- **Outputs** CSS variables and Tailwind theme, Swift constants and colour sets, a Compose object
- **Check** Contrast test on the [listed pairs](colour.md#contrast-test-pairs); CI fails if outputs differ from the committed ones (*planned*)

## M0 token table

Every token M0 creates, with its light and dark value, source and status (fixed, prototype, clamped, owner, design-pending; defined in [colour](colour.md#m0-values)). A design-pending token is created with its placeholder and a `design-pending` comment; it is never left out.

| Group | Names | Values, sources, status |
|---|---|---|
| Colour roles | `color.*` (Material 3 role names, `fill-1` to `fill-4`, `focus-ring`) | [colour M0 values](colour.md#m0-values), [increased contrast](colour.md#increased-contrast) |
| Component colours | `range-bar.fill-N.*`, `status-chip.*` | [colour](colour.md#range-bar-and-status-chip-on-fills) |
| Type | `font.family.* font.size.* font.weight.* font.line-height.* font.letter-spacing.* font.size-adjust font.line-height-adjust font.weight.map font.feature.tabular-nums` and composed roles | [typography](typography.md); face DM Sans |
| Space and layout | `space.xxs .. space.xxxl`, `space.inset.* space.gap.* layout.* breakpoint.* target.min` | [spacing and layout](spacing-and-layout.md), fixed |
| Radius, border, elevation, opacity | `radius.none .. radius.full`, `border.width.*`, `elevation.level0-3`, `opacity.*` | [shape and elevation](shape-and-elevation.md) |
| Motion | Names and values in [ADR 0023](../../../decisions/0023-motion.md); `flip` is provisional | ADR 0023, fixed |
| Icon and image | `icon.size.* icon.stroke avatar.size.*` | Sizes fixed, art design-pending |
