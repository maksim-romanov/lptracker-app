# Spacing and layout

One scale for spacing; nothing in `space.*` is off the scale. Layout tokens below have their own values.

| Token | Value |
|---|---|
| `space.xxs` | 2px |
| `space.xs` | 4px |
| `space.sm` | 8px |
| `space.md` | 12px |
| `space.lg` | 16px |
| `space.xl` | 24px |
| `space.xxl` | 32px |
| `space.xxxl` | 48px |

| Token | Compact (phone) | Medium (tablet portrait) | Expanded (tablet landscape, desktop) | Notes |
|---|---|---|---|---|
| `layout.margin` | 16 | 24 | 32; web 56 | Plus the device safe area |
| `layout.gutter` | 12 | 16 | 24 | Between columns and cards |
| `layout.columns` | 4 | 8 | 12 | Content grid |
| `layout.max-width` | full | full | full; web content 1200 | Wide screens add space at the sides |
| `layout.section-gap` | 24 | 32 | 48 | Between regions on a screen |
| `target.min` | 44 | 44 | 44 (48 on Android) | Touch target, includes padding around a small control |

## Layout classes

| Class | Width | iOS and iPadOS | Android | Web | Navigation |
|---|---|---|---|---|---|
| compact | under 600 | iPhone, Slide Over | Compact window | Phone | Tab bar, one column, push |
| medium | 600 to 839 | iPad portrait, Split View | Medium window | Tablet | Tab bar or rail, list then detail |
| expanded | 840 and up | iPad landscape, Mac | Expanded window | Desktop | Sidebar, list and detail side by side |
| short | height 520 or less | iPhone landscape | Landscape phone | Short window | Compact navigation, content scrolls |

## Inset and gap

| Token | Value | Used for |
|---|---|---|
| `space.inset.sm` | 12 (`space.md`) | Chips, small controls, rows in a list |
| `space.inset.md` | 16 (`space.lg`) | Cards, banners, groups |
| `space.inset.lg` | 24 (`space.xl`) | Hero blocks, dialogs |
| `space.gap.tight / regular / loose` | 4 / 8 / 16 (`xs`, `sm`, `lg`) | Between sibling parts inside a component |

## Naming rules

| Rule | Detail |
|---|---|
| Names | T-shirt steps `xxs` to `xxxl`, eight in all. Add a semantic token, not a ninth step. Names start with a letter so they are valid Swift and Kotlin identifiers |
| Use | Components use the semantic tokens only; the scale is for building them |
| Platforms | CSS `--space-md`, not `--spacing-*` (Tailwind v4 treats that as a numeric multiplier); Swift `Spacing.md`; Compose `Spacing.md` as `Dp` |
| Text size | Page margin and the column grid do not scale. Spacing tied to text (control padding, icon gap) scales with system text size |

> **Rule.** Spacing between siblings uses gap on the container, not margins on the children. Content never touches the screen edge: the margin token plus the safe area is the minimum.
