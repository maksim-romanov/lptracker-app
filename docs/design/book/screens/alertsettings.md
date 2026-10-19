# Alert settings

Rules and push permission.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Push | List row with switch | Turn push on; asks for system permission at the moment the first alert is enabled |
| 2 | Rules | List rows | Leaves range, returns to range; cooldown shown as text |
| 3 | Early warning | List row, number field | Within a distance of the range edge; shown with a note naming the plan that grants it (*needs server field*) when `alerts.early_warning` is false; the control still submits and the `409 plan-limit` answer is rendered (the rule endpoint answering it is *proposed*, see the plans concept) |
| 4 | Explanation | Text | What each rule sends and how often |

## States

| State | What changes |
|---|---|
| Permission denied | Row explains how to enable it in system settings |
| Guest | Screen not reachable; Alerts shows the guest panel |
| `alerts.early_warning` false | Row shows what the plan adds |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Gear on Alerts; Notifications row in Settings |
| Out | System permission prompt; Plans |
| Focus | The switch keeps focus; its new state is announced after the system answers |
