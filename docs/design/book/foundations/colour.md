# Colour roles

The roles every screen uses and their M0 values. Names follow Material 3 role names in kebab-case, so Compose reads the same names and Tailwind utilities read naturally. Roles Material needs that are not listed here (`secondary*`, `tertiary*`, `on-background`, `surface-variant`, `inverse-primary`, `surface-tint`) are aliased by the Compose generator so native Material components never fall back to default colours ([why](../../../research/repo/colour-token-naming.md)).

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

## M0 values

OKLCH `L C H`. Status: **fixed** (in [ADR 0027](../../../decisions/0027-design-tokens.md), which holds the value), **prototype** (read from an approved prototype), **clamped** (prototype value with chroma cut to the sRGB gamut, L and H kept), **owner** (two approved prototypes disagree, see below), **design-pending** (no approved source; the token file carries the placeholder with a `design-pending` comment). Prototype variables are from [ui-kit.html](../visual/prototypes/ui-kit.html) unless marked ghost ([ghost-cards.html](../visual/prototypes/ghost-cards.html)). "x % A in B" is an Oklab mix, as CSS `color-mix(in oklab, A x %, B)`; the value shown is its result.

| Token | Light | Dark | Source | Status | Use |
|---|---|---|---|---|---|
| `color.background` | ADR 0027 | ADR 0027 | `--bg`, ghost `--page` | fixed | App page behind everything |
| `color.surface` | 0.995 0.002 350 | 0.21 0.035 320 | `--surface` | clamped, owner | Default container, sheets, menus |
| `color.surface-container` | 0.945 0.014 350 | 0.265 0.04 320 | `--field` | prototype | Fields, tonal buttons |
| `color.surface-container-high` | alias `surface` | alias `surface` | the kit draws sheets and menus on `--surface` | prototype | Overlays, sheets |
| `color.surface-dim`, `surface-bright`, `surface-container-lowest`, `-low`, `-highest` | — | — | none | design-pending | |
| `color.on-surface` | 0.18 0.02 350 | 0.97 0.01 340 | `--ink` | owner | Primary text and icons |
| `color.on-surface-variant` | 0.45 0.03 350 | 0.76 0.04 330 | `--muted` | prototype | Secondary text, placeholder |
| `color.inverse-surface` | alias `on-surface` | alias `on-surface` | `.toast` | prototype | Toast, tooltip |
| `color.inverse-on-surface` | alias `background` | alias `background` | `.toast` | prototype | Content on inverse |
| `color.outline` | 0.6 0.03 350 | 0.58 0.05 320 | `--edge` | prototype | Control borders, 3:1 |
| `color.outline-variant` | 0.88 0.015 350 | 0.32 0.045 320 | `--line` | prototype | Separators, decorative |
| `color.scrim` | 0 0 0 / 0.45 | 0 0 0 / 0.45 | `dialog::backdrop` | prototype | Behind sheets and dialogs |
| `color.primary` | ADR 0027 | ADR 0027 | `--accent` | fixed | Main actions, selected |
| `color.on-primary` | 0.99 0.004 350 | 0.16 0.03 320 | `--on-accent` | owner | |
| `color.primary-container` | 0.889 0.004 350 (13 % `on-surface` in `surface`) | 0.309 0.032 321 | `--sel` | prototype | Quiet emphasis, badges |
| `color.on-primary-container` | alias `on-surface` | alias `on-surface` | `.badge` | prototype | |
| `color.error` | 0.52 0.2 25 | 0.72 0.17 25 | `--danger` | prototype; dark clamped from 0.19 | Failure |
| `color.on-error` | 0.99 0.004 25 | 0.16 0.03 25 | `--on-danger` | prototype | |
| `color.error-container` | 0.928 0.029 23 (14 % `error` in `surface`) | 0.281 0.046 348 | `--danger-soft` | prototype | Failure banner |
| `color.on-error-container` | alias `on-surface` | alias `on-surface` | `.banner` text | prototype | |
| `color.warning` | 0.5 0.1 70 | 0.84 0.13 85 | `--warn` | prototype | Attention text and icons |
| `color.warning-container` | 0.906 0.018 65 (18 % `warning` in `surface`) | 0.323 0.025 11 | `--warn-soft` | prototype | Warning banner |
| `color.on-warning-container` | alias `on-surface` | alias `on-surface` | `.banner` text | prototype | |
| `color.on-warning` | — | — | none | design-pending | |
| `color.success` | 0.47 0.11 155 | 0.8 0.16 155 | `--success` | light clamped from 0.12 | Healthy, confirmed |
| `color.on-success`, `success-container`, `on-success-container`, `info`, `on-info`, `info-container`, `on-info-container` | — | — | none | design-pending | |
| `color.focus-ring` | alias `ink-dark` | alias `ink-light` | ghost `:focus-visible` (`--page-ink`) | prototype | Keyboard and switch focus outside a card |
| `color.fill-1` to `fill-4` | ADR 0027 | ADR 0027 | `--f1` to `--f4` | fixed | The four rotating card colours; the order is the rotation |
| `color.ink-dark`, `color.ink-light` | ADR 0027 | ADR 0027 | ghost `inkFor` | fixed | The two inks |
| `color.on-fill-1` to `on-fill-4` | `ink-light`, `ink-dark`, `ink-light`, `ink-dark` | `ink-dark`, `ink-light`, `ink-light`, `ink-dark` | `--f1i` to `--f4i` | fixed by the higher-contrast rule | Text, chips, range bar and focus on a fill |

Approved prototypes disagree on these values; the table takes the UI kit and the owner confirms:

- `surface`: ghost `--surface` 0.995 0.004 350 (outside sRGB) and 0.23 0.04 320.
- `on-surface`: ghost page text is `--page-ink`, 0.22 0.05 350 and 0.98 0.01 320.
- `on-primary`: ghost `--accent-ink`, 0.98 0.01 350 and 0.22 0.05 320.

### Increased contrast

The M0 resolver ships this context ([ADR 0027](../../../decisions/0027-design-tokens.md)); every other role keeps its normal value. Source: the kit's `prefers-contrast: more` block.

| Token | Light | Dark | Rule |
|---|---|---|---|
| `color.outline` | 0.275 0.019 350 | 0.873 0.012 334 | 88 % `on-surface` in `background` |
| `color.outline-variant` | 0.538 0.016 350 | 0.605 0.019 326 | 55 % `on-surface` in `background` |
| `color.on-surface-variant` | 0.259 0.019 350 | 0.889 0.012 335 | 90 % `on-surface` in `background` |

## Range bar and status chip on fills

Component tokens, one set per fill and theme, from `bandFor` in [ghost-cards.html](../visual/prototypes/ghost-cards.html):

1. `track` = 12 % `on-fill-N` in `fill-N`.
2. `band` walks lightness from the track's far side (ink light: L 0.70 up by 0.01; ink dark: L 0.55 down by 0.012) at chroma 0.13, hue 345 in light and 350 in dark, and takes the first step with at least 3.1:1 against `track`. `band-out` does the same at hue 62.
3. Where a step is outside sRGB, its chroma is cut to the gamut before the contrast check (the prototype skipped this; changed values are marked \*).

| Fill | Light `track` | `band` | `band-out` | Dark `track` | `band` | `band-out` |
|---|---|---|---|---|---|---|
| `fill-1` | 0.593 0.198 350 | 0.89 0.072 345\* | 0.88 0.081 62\* | 0.66 0.188 349 | 0.382 0.13 350 | 0.37 0.085 62\* |
| `fill-2` | 0.902 0.007 350 | 0.55 0.13 345 | 0.55 0.126 62\* | 0.558 0.195 295 | 0.85 0.097 350\* | 0.85 0.103 62\* |
| `fill-3` | 0.258 0.01 350 | 0.7 0.13 345 | 0.7 0.13 62 | 0.206 0.01 320 | 0.7 0.13 350 | 0.7 0.13 62 |
| `fill-4` | 0.801 0.068 355 | 0.514 0.13 345 | 0.502 0.115 62\* | 0.801 0.053 236 | 0.526 0.13 350 | 0.514 0.118 62\* |

Names: `range-bar.fill-N.track`, `range-bar.fill-N.band`, `range-bar.fill-N.band-out`. The knob is `on-fill-N` with a 4 px ring of `fill-N`. Status chip: in range `status-chip.in.container` = `on-fill-N`, `status-chip.in.content` = `fill-N`; out of range `status-chip.out.container` 0.88 0.11 80 (ghost `--amber` 0.88 0.12 80, clamped) and `status-chip.out.content` 0.28 0.06 60 (ghost `--amber-ink`), the same on every fill in both themes. Other chip variants: design-pending.

## Contrast test pairs

The M0 contrast test reads this list and checks it in light and dark, normal and increased contrast, and fails on any colour outside sRGB ([ADR 0027](../../../decisions/0027-design-tokens.md)).

| Foreground | Background | Minimum |
|---|---|---|
| `on-surface`, `on-surface-variant` | `background`, `surface`, `surface-container`, `primary-container` | 4.5:1 |
| `on-X` | `X`, for `primary`, `primary-container`, `error`, `error-container`, `warning-container`, `inverse-surface` | 4.5:1 |
| `primary`, `error`, `warning`, `success` as text | `background`, `surface`; `error` on `error-container`, `warning` on `warning-container` | 4.5:1 |
| `on-fill-N` | `fill-N` | 4.5:1 |
| `status-chip.in.content`, `status-chip.out.content` | `status-chip.in.container` on each fill, `status-chip.out.container` | 4.5:1 |
| `range-bar.fill-N.band`, `band-out`, and the knob `on-fill-N` | `range-bar.fill-N.track` | 3:1 |
| `outline` | `background`, `surface`, `surface-container` | 3:1 |
| `focus-ring` | `background`, `surface`, `surface-container`, `surface-container-high`, `primary-container` | 3:1 |
| focus on a fill (`on-fill-N`) | `fill-N` | 3:1 |

`outline-variant` is decorative and not tested. Cards and rows take `fill-N` by index; a component placed on a fill passes on all four. A status is always a word and a shape (dot, diamond), never colour alone.

## Focus ring

2 px, `border.width.strong`. Outside a card: `color.focus-ring` (the page ink), drawn on the page at offset 4 px around controls and 5 px around a card, as in ghost-cards.html. Inside a card or row: `on-fill-N` of that fill. Never `primary` or a fixed hue: on `fill-1` the primary is the fill itself.
