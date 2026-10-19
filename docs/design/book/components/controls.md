# Controls

## Button

*control, primary secondary tertiary destructive*

- **Variants.** `primary secondary tertiary destructive`. One primary per screen region.
- **Size.** Height 56 for the main action, 48 default, 40 compact (*design-pending* sizes). Width: full in a sheet or on phone, auto elsewhere with a 120 minimum. Hit area never below 44.
- **States.** Default, hover, pressed, focused, disabled, busy (spinner replaces label, width kept).
- **Rules.** Label says what happens (verb). Disabled still shows why in nearby text.
- **A11y.** Real button element. Busy sets aria-busy.
- **Tokens.** `color.primary color.on-primary target.min radius.full brisk`

## Icon button

*control*

- **Size.** Hit area `target.min` (44 on Apple, 48 on Android); the visible control may be smaller.
- **Rules.** Needs an accessible name and a Voice Control input label. A bare icon never carries meaning alone on a first-time screen.
- **Tokens.** `icon.size.md target.min color.surface-dim`

## Segmented control

*control, settings and filters*

- **Anatomy.** Two to four mutually exclusive options; one selected.
- **Rules.** Selected state shows a shape or weight change, not colour alone. Used for a value choice (for example Cards or Rows in Settings), not for switching sections.
- **Size.** Segment height `target.min`. Wraps to a menu when the labels do not fit.
- **A11y.** Radio group semantics, arrow keys move selection.

## Filter chip

*control, toggle*

- **Anatomy.** Label and a count.
- **Size.** Visible height 30 (*design-pending*), hit area `target.min` through padding.
- **Rules.** A pressed chip changes more than colour (a check mark or weight). A chip with a nonzero attention count may use the status role.
- **A11y.** Toggle button with pressed state; group is labelled "Filter positions".

## Text field

*input, label above*

- **Anatomy.** Label above, field, helper or error line below. Optional trailing action (Paste, Clear).
- **Size.** Height 52 (*design-pending*). Corners and border from tokens. Label is always visible; a placeholder is never the label.
- **States.** Idle, focused, filled, looking up (spinner, status line), valid, invalid, disabled.
- **Rules.** Error text says what is wrong and what to do, and is tied to the field. Inputs for addresses turn off autocorrect, autocapitalize and spellcheck.
- **A11y.** Label for, aria-describedby for helper and error, aria-invalid, role alert for new errors.
