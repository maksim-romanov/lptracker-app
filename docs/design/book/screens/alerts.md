# Alerts

## Job

See which positions left or returned to their range, newest first. The second tab; alerts need an account, so a guest sees why and how to start.

## Prototype

[screens.html#web-alerts](../visual/prototypes/screens.html#web-alerts), [#web-signin](../visual/prototypes/screens.html#web-signin), [#iphone-alerts](../visual/prototypes/screens.html#iphone-alerts). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ. iPad and Mac show only the sidebar entry.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar (web: site header and page title) | Title "Alerts"; Alert settings (gear icon button on iPhone, ghost button with gear on web) |
| 2 | Summary line | Text | How many positions are out of range now (*needs server field*) |
| 3 | Alert list | List row | Token pair, "left its range" or "is back in range", when, the price at the alert, status chip ("Out of range", "In range"); unread mark by shape and word. Alert history is a *needs server field* |
| 4 | Guest panel | [Empty state](../components/feedback.md#empty-state) | Replaces regions 2 and 3: "Alerts need an account.", "Sign in with a passkey. Watching never needs one.", Sign in |

## States

| State | On the wire | What changes |
|---|---|---|
| Guest | No account | Guest panel with Sign in; the tab stays visible and enabled |
| `loading` | Alert history pending (*needs server field*) | [Skeleton](../components/feedback.md#skeleton) rows; the title is already present |
| No alerts yet | Signed in, empty history (*needs server field*) | Empty state `no-alerts`: "No alerts yet.", "A position that leaves its range shows up here." |
| `failed` | The request failed | Banner with Retry; the last list stays |
| Signed in, push off | No push permission on this device | Banner: alerts arrive here only; offers the permission |
| Mac | Native macOS, no push in the MVP ([ADR 0014](../../../decisions/0014-push-via-onesignal.md)) | Banner: alerts arrive on the phone |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | One narrow column; tabs move to a bottom tab bar | iPhone and Slide Over: large title with the gear, list under it | — |
| medium, 600 to 839 | The same narrow column, centred | Half screen: tabs on top | — |
| expanded, 840 and up | The same narrow column, centred | Sidebar entry Alerts under its own caption, with a count (*needs server field*) | Same sidebar entry as iPad wide |

## Motion

| Transition | Token |
|---|---|
| Alert rows arriving | `stagger`; reduced: 0 |
| Sign in sheet (phone) or dialog (web) | `gentle`, scrim `fast` ([bottom sheet](../components/overlays.md#bottom-sheet)); reduced: crossfade |
| To Alert settings or a position | iOS push, web cross-document view transition ([0023](../../../decisions/0023-motion.md)); reduced: crossfade |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Tab bar, sidebar; a push carries only an opaque alert id and the app fetches the details ([ADR 0014](../../../decisions/0014-push-via-onesignal.md)). Proposed: a push opens Alerts then the position ([open questions](../open-questions.md)) |
| Out | Position (row tap), Alert settings (gear; web `/settings/alerts`), Sign in (sheet on phone, dialog on web) |
| Focus | Title on arrival; closing Sign in returns focus to Sign in on the guest panel |

## Acceptance

Rubric defaults, plus: guest, list, no alerts and push off at 390, 820 and 1280 px on web and on iPhone; the Mac banner in the Mac main window. Status chips pass row 6 without colour.
