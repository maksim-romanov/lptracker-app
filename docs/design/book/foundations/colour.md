# Colour roles

The roles every screen uses. Names follow Material 3 role names in kebab-case, so Compose reads the same names and Tailwind utilities read naturally. Roles Material needs that are not listed here (`secondary*`, `tertiary*`, `on-background`, `surface-variant`, `inverse-primary`, `surface-tint`) are aliased by the Compose generator so native Material components never fall back to default colours ([why](../../../research/repo/colour-token-naming.md)). Scheme values are in [ADR 0027](../../../decisions/0027-design-tokens.md); a value shown as ADR 0027 is fixed there; every other value is a neutral placeholder.

## Naming

| Rule | Detail |
|---|---|
| Path | One flat path: `color.<role>`. No role is both a token and a group, so every name flattens to a valid CSS, Swift and Kotlin identifier |
| Pairing | `on-X` is the content colour on `X`. Use it only on its own `X` |
| Platforms | CSS `--color-on-surface`; Compose `colorScheme.onSurface` or `ExtendedColors`; Swift `VoidColor.onSurface` |
| Themes | Light, dark and contrast are resolver contexts, never part of a name |
| States | No hover or pressed colours. Components use `opacity.pressed` over the role; hover only hints |
| Hue and number | Only primitives (`grey.500`) and the ordered `fill-N` carry them |
| Check | CI fails when two tokens flatten to one name or a segment is a reserved word (*planned*, M0) |

## Surfaces and content

| Token | Placeholder value | Use |
|---|---|---|
| `color.background` | ADR 0027 | App page behind everything |
| `color.surface` | `#f5f5f7` | Default container |
| `color.surface-dim` | `#e7e7ec` | Recessed areas, inset fields |
| `color.surface-bright` | `#ffffff` | Brightest surface in the dark theme |
| `color.surface-container-lowest` | `#ffffff` | Raised cards, rows |
| `color.surface-container-low` | `#fafafc` | |
| `color.surface-container` | `#f0f0f4` | |
| `color.surface-container-high` | `#d9d9e0` | Overlays, sheets |
| `color.surface-container-highest` | `#cfcfd8` | |
| `color.on-surface` | `#1d1d24` | Primary text and icons |
| `color.on-surface-variant` | `#5d5d6a` | Secondary text, placeholder |
| `color.inverse-surface` | `#2b2b33` | Toast, tooltip |
| `color.inverse-on-surface` | `#fafafb` | Content on inverse |
| `color.outline` | `#8a8a96` | Control borders, 3:1 |
| `color.outline-variant` | `#d4d4db` | Separators, decorative |
| `color.scrim` | `rgba(20,20,28,.4)` | Behind sheets and dialogs |

## Accent and status

| Token | Placeholder value | Use |
|---|---|---|
| `color.primary` | ADR 0027 | Main actions, selected |
| `color.on-primary` | `#fafafb` | |
| `color.primary-container` | `#dcdce4` | Quiet emphasis |
| `color.on-primary-container` | `#1d1d24` | |
| `color.error`, `on-error`, `error-container`, `on-error-container` | `#a33a3a`, `#ffffff`, `#f3d9d9`, `#3d1010` | Failure |
| `color.warning`, `on-warning`, `warning-container`, `on-warning-container` | `#8a6a1f`, `#ffffff`, `#e8dcb8`, `#2e2205` | Out of range, attention |
| `color.success`, `on-success`, `success-container`, `on-success-container` | `#3a6b4a`, `#ffffff`, `#d4e6da`, `#0e2a18` | Healthy, confirmed |
| `color.info`, `on-info`, `info-container`, `on-info-container` | `#3a5a8a`, `#ffffff`, `#d4def0`, `#0e1f3a` | Neutral notice |
| `color.focus-ring` | `#2b4cff` | Keyboard and switch focus |

## Fills

| Token | Placeholder value | Use |
|---|---|---|
| `color.fill-1` to `fill-4` | ADR 0027 | The four rotating card colours; the order is the rotation |
| `color.ink-dark`, `color.ink-light` | ADR 0027 | The two inks |
| `color.on-fill-1` to `on-fill-4` | Alias of `ink-dark` or `ink-light`, picked by contrast | Text and range bar on a fill; the range bar uses only this ink |

| Role family | Pairs required | Notes |
|---|---|---|
| status roles | `X`, `on-X`, `X-container`, `on-X-container` | A status is always a word and a shape (dot, diamond), never colour alone. In range is the neutral chip; out of range uses the warning container. Contrast test per pair |
| `fill-N` and `on-fill-N` | The four Fills, each with its own Ink | Cards cycle by index. Any component placed on a fill must read on all four |
| `color.outline` | One role | Any border that identifies a control uses it or stronger (3:1) |
| `color.focus-ring` | One role | At least 3:1 on every surface and fill; 2 px minimum |

## Scheme values

Dragonfruit (light) and Neon Night (dark) values live only in [ADR 0027](../../../decisions/0027-design-tokens.md), in OKLCH. Tokens in the tables above that show a hex value are placeholders for roles the ADR does not list.

> *Pending.* Every token the ADR does not list, in both Themes.
