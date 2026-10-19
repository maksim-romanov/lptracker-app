# Lists

## List row

*list, settings and wallets*

- **Anatomy.** Leading icon or avatar, title, optional subtitle, trailing value or control or disclosure mark.
- **Group.** Rows sit in a grouped section with a heading above and an explanatory line below. Separators inset from the leading edge.
- **Size.** Minimum height 52 (*design-pending*); grows with text.
- **A11y.** One element per row. A row with a switch exposes the switch state in its name.
- **Tokens.** `space.inset.sm color.outline-variant color.surface-container-lowest`

## Wallet row

*list, wallets*

- **Anatomy.** Monogram avatar, name, shortened address with positions count and value (both *needs server field*: one value per wallet across chains), trailing status or remove.
- **States.** Active, paused (above plan limit: read-only, no alerts, shown muted with a word), removing (confirmation).
- **Rules.** Address reads as start and end with a copy action. Remove always confirms and says what is deleted.
- **Data.** Account wallets and the plan limit usage.
