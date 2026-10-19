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
| Contrast | normal, increased | Outline and content colour roles; required by the accessibility ADR |
| Scheme | default | Page, accent and Fill colours (see ADR 0027) |
| Scale | device text size | Not a token context: type and text-tied spacing react to system text size |

## Pipeline

- **Source** DTCG files in `packages/design-tokens` (*planned*, M0, [ADR 0027](../../../decisions/0027-design-tokens.md))
- **Build** Terrazzo, plus the native plugin
- **Outputs** CSS variables and Tailwind theme, Swift constants and colour sets, a Compose object
- **Check** Contrast test on every pair; CI fails if outputs differ from the committed ones (*planned*)

## Token groups to create

| Group | Names (examples) | Count | Value source |
|---|---|---|---|
| Colour roles | `color.*` (Material 3 role names, `fill-1` to `fill-4`, `focus-ring`) | ~40 per theme | Scheme values in ADR 0027, the rest pending |
| Type | `font.family.* font.size.* font.weight.* font.line-height.* font.letter-spacing.* font.size-adjust font.line-height-adjust font.weight.map font.feature.tabular-nums` and composed roles | 10 roles | Structure fixed, face DM Sans |
| Space | `space.xxs .. space.xxxl`, `space.inset.* space.gap.* layout.*` | 8 steps | Fixed |
| Radius | `radius.none .. radius.full` | 7 | Pending |
| Border and elevation | `border.width.* elevation.level0-3` | ~8 | Pending |
| Motion | Values and names in [ADR 0023](../../../decisions/0023-motion.md); `flip` is provisional | per ADR 0023 | Fixed |
| Opacity | `opacity.disabled opacity.scrim opacity.pressed` | 3 | Fixed |
| Icon and image | `icon.size.* icon.stroke avatar.size.*` | ~8 | Sizes fixed, art pending |
| Layout | `breakpoint.* layout.max-width target.min` | ~8 | Fixed |
