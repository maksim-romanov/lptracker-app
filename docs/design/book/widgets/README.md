# Widgets

One position per widget. A widget is a snapshot of data the app has already read and formatted. It is never a place where numbers are calculated.

> **Fixed.** Families, regions, data, states, tap targets, refresh behaviour and accessibility. **Pending:** colour, type face, corner shape, surface treatment, and the look under the system tint.

| Rule | Detail |
|---|---|
| One tap target | The whole widget opens one place: the position it shows. No buttons inside. A widget showing a count opens Alerts. |
| No numbers computed | The app formats values with the shared formatter from the server's exact decimals and saves the strings into the shared container. The widget only lays them out. |
| Status | A word and a shape, so it survives single-tint and monochrome rendering. |
| Never blank | A widget that cannot refresh keeps its last values and shows their age. It never shows an empty shell for an existing position. |
| No network for auth | The widget does not refresh tokens and does not fetch flags. It reads the snapshot and code defaults. |
| Unpriced token | Shows the token amount; a total marked "partial" or "n/a". Never zero. |
| Size | Designed as ratios. The system chooses the point size per device; layouts scale and never use fixed pixel positions. |
