# Layers and accessibility baseline

Stacking order and the checks every screen must pass.

| Layer | Order | Contains |
|---|---|---|
| content | 0 | Screens, cards, rows |
| bars | 10 | Tab bar, navigation bar, sidebar, toolbar |
| sheet | 20 | Bottom sheets, side sheets |
| popover | 30 | Menus, tooltips |
| dialog | 40 | Alerts, confirmation, the scrim behind them |
| toast | 50 | Transient messages |

| Check | Requirement |
|---|---|
| Contrast | Text 4.5:1, large text and controls 3:1, every state and both themes |
| Targets | 44 pt minimum (48 dp on Android), spaced so neighbours are not hit by mistake |
| Status | Word plus shape, never colour alone |
| Focus | Native clients: one title per screen takes focus on arrival; back returns focus to the opener. Web page loads let the browser manage focus |
| Motion | Every motion has a reduced version; nothing flashes more than three times a second |
| Names | Every control has a spoken name and a Voice Control input label; every list row is one element with custom actions |
| Text size | Layouts survive the largest system text size without clipping |

Source: [ADR 0022](../../../decisions/0022-accessibility.md), [accessibility research](../../../research/repo/accessibility-all-devices.md). The ADR holds the audits and the colour-alone and flash rules; the numeric thresholds in the table are owned here.
