# Shape, border, elevation, opacity

M0 values read from the approved prototypes ([ghost-cards.html](../visual/prototypes/ghost-cards.html), [ui-kit.html](../visual/prototypes/ui-kit.html)); status words as in [colour](colour.md#m0-values). One value for both Themes.

| Token | Value | Source | Status | Use |
|---|---|---|---|---|
| `radius.none` | 0 | — | prototype | Square edges |
| `radius.xs` | 4 px | kit Android snackbar | prototype | |
| `radius.sm` | 8 px | kit Android filter chip | prototype | Android chips |
| `radius.md` | 12 px | kit `.ctrl` (fields) | prototype | Fields, menu rows |
| `radius.lg` | 30 px | ghost `.cards-grid .card`, `.dcard` | owner (kit `.pcard` is 32 px) | Position card shell |
| `radius.xl` | 34 px | ghost `.psheet` free corners | owner (kit dialog is 28 px) | Sheets |
| `radius.full` | 999 px | every pill in both prototypes | prototype | Buttons, chips, range bar, tags |
| `border.width.hair` | 1 px | kit `--line` rules, ghost card edge | prototype | Separators, card edge |
| `border.width.regular` | 1 px | kit `.ctrl`, `.chip` border | prototype | Control outlines |
| `border.width.strong` | 2 px | ghost `:focus-visible`, `.card.sel` | prototype | Focus and selection |
| `elevation.level0` | none | — | prototype | The v0 card shell and rows |
| `elevation.level1` | — | ghost lift shadow belongs to the Drawer, not v0 | design-pending | Raised content |
| `elevation.level2` | 0 20 40 −16 px, black 50 % | kit `[popover].menu` | prototype | Menus, popovers |
| `elevation.level3` | 0 30 60 −20 px, black 50 % | kit `dialog.sheetd` | prototype | Sheets, dialogs |
| `opacity.pressed` | 0.88 | kit iOS `.btn:active` | prototype | Pressed state over a role |
| `opacity.scrim` | 0.45 | kit `::backdrop` | prototype | Alpha of `color.scrim` |
| `opacity.disabled` | — | the kit changes the role, not opacity | design-pending | |

**v0 card shell.** `radius.lg`, `fill-N`, `space.inset.md`, no elevation. Its edge is a 1 px inset line of `on-fill-N` at alpha 0.16 (`position-card.edge`; rows 0.12, `position-row.edge`), from ghost `.lift::after` and `.rows .card`. Rows in the Rows view use 26 px in ghost `.rows .card`: design-pending whether that is `radius.lg` or its own token. Other literal radii in the prototypes (20, 22, 24, 28 px) map to no name: design-pending.

| Rule | Detail |
|---|---|
| Elevation | A platform may render elevation as a shadow, a border or a tonal change |
| Disabled | Never opacity alone: it also changes the role used |
| Separator | `color.outline-variant` between list rows, inset from the leading edge by the icon width |
