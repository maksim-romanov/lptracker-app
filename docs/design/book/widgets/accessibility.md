# Accessibility

A widget is read as one sentence and opens one place.

| Item | Rule |
|---|---|
| Spoken label | One sentence: pair, status, total, principal amounts, range, owed fees. Template: "ETH / BTC.b, in range, total, amount of each token, price inside the range, owed fees in each token". |
| Text size | Text follows system text size where the family allows it. At the largest sizes secondary details drop before the total, status or fees do. |
| Contrast | Every Ink and Fill or surface pair passes in every rendering mode, including both ends of the system glass setting. |
| Motion | No animation that carries meaning. Values change on reload. |
| Targets | The tap target is the whole widget. |
| Tests | Snapshot tests (Apple widget snapshot tests, Roborazzi and Glance tests on Android, *planned*) per family, rendering mode, theme and text size; a manual pass with the glass setting at both ends and Always On. |
