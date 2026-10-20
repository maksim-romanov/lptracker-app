# Alert settings

## Job

Choose which range changes send an alert and turn push on for this device. The alert rule sheet sets the same rules for one position.

## Prototype

[screens.html#web-alertsettings](../visual/prototypes/screens.html#web-alertsettings), [#iphone-rules](../visual/prototypes/screens.html#iphone-rules) (guest rule sheet: [#iphone-account](../visual/prototypes/screens.html#iphone-account)). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar (web: breadcrumb Alerts / Alert settings) | Back to Alerts, title "Alert settings" |
| 2 | Permission banner | [Banner](../components/feedback.md#banner) `warning` | Only when permission is denied: "Push is off. Turn it on in system settings.", Open Settings |
| 3 | Push | [List row](../components/lists.md#list-row) with switch | "Push notifications", "Alerts arrive on this phone"; asks for system permission at the moment the first alert is enabled |
| 4 | Rules | List rows with switches | Left range, Back in range |
| 5 | Early warning | List row with a switch; when on, a number field "Warn at N % from the edge" (default *design-pending*) | Within that distance of the range edge, "Before the price reaches the edge"; when `alerts.early_warning` is false, a pill naming the plan that grants it (*needs server field*). The control still submits and renders the `409 plan-limit` answer (the rule endpoint is *proposed*, [plans](../../../concepts/plans-and-entitlements.md#enforcement)) |
| 6 | Explanation | Group footer | What each rule sends and how often: "One alert per position every 30 min." from `alerts.cooldown_s` |

Alert rule sheet, from Set alert on a position: title is the pair, then regions 4 and 5 for that position.

## States

| State | On the wire | What changes |
|---|---|---|
| Permission denied | System answer on this device | Banner; the Push switch is off |
| Guest | No account | Screen not reachable; Alerts shows the guest panel. Set alert opens [Sign in](signin.md) with the reason |
| `planLimit` | `alerts.early_warning` false, or `409 plan-limit` with `key` | Early warning row shows what the plan adds; links to Plans |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | One narrow column under `/settings/alerts`; bottom tab bar with Alerts current | iPhone and Slide Over: pushed in the Alerts stack. The rule sheet opens over the position sheet | — |
| medium, 600 to 839 | The same narrow column, centred | Not drawn yet | — |
| expanded, 840 and up | The same narrow column, centred; the rule sheet is a centred dialog or side sheet | Not drawn yet; the rule sheet is a centred dialog or side sheet | Alerts pane of the Settings window (Command comma); Set alert in the toolbar opens the rule sheet. No Push row in the MVP |

## Motion

| Transition | Token |
|---|---|
| Switch toggling | `brisk`; reduced: crossfade |
| Rule sheet in and out | `gentle`, scrim `fast` ([bottom sheet](../components/overlays.md#bottom-sheet)); reduced: crossfade |
| From Alerts or Settings | iOS push, web cross-document view transition ([0023](../../../decisions/0023-motion.md)); reduced: crossfade |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Gear on Alerts; Notifications row in Settings; Set alert on a position (rule sheet) |
| Out | System permission prompt, Open Settings (system settings), Plans, back to Alerts |
| Focus | Title on arrival. The switch keeps focus; its new state is announced after the system answers. Closing the rule sheet returns focus to Set alert |

## Acceptance

Rubric defaults, plus: granted, denied and `planLimit` at 390, 820 and 1280 px on web and on iPhone; the rule sheet over the large position sheet on iPhone; the Mac Settings window Alerts pane. Each switch exposes its state in its name ([list row](../components/lists.md#list-row)).
