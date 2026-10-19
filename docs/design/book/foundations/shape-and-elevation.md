# Shape, border, elevation, opacity

Names and counts are fixed so components can refer to them. Every value is pending.

| Group | Tokens | Role |
|---|---|---|
| Radius | `radius.none xs sm md lg xl full` | Cards use `lg`, controls use `full` or `md`, sheets use `xl` on the free corners. Pending values. |
| Border width | `border.width.hair regular strong` | Hair for separators, regular for outlines, strong for focus and selection. |
| Elevation | `elevation.level0 level1 level2 level3` | Level 0 flat, 1 raised content, 2 menus and popovers, 3 sheets and dialogs. A platform may render elevation as a shadow, a border or a tonal change. |
| Opacity | `opacity.disabled opacity.pressed opacity.scrim` | Disabled never relies on opacity alone: it also changes the role used. |
| Separator | `color.outline-variant` | Between list rows. Inset from the leading edge by the icon width. |

> *Pending.* the character of all of the above (soft or sharp, flat or layered, glass or opaque).
