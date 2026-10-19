# Alerts

The second tab. Alerts need an account, so a guest sees why and how to start.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar | Title "Alerts", settings action |
| 2 | Summary line | Text | How many positions are out of range now (*needs server field*) |
| 3 | Alert list | List row | Position, what happened, when (alert history, *needs server field*); unread mark by shape and word |
| 4 | Guest panel | Empty state | Replaces the list: what alerts do, Sign in |

## States

| State | What changes |
|---|---|
| Guest | Empty state with Sign in; the tab stays visible and enabled |
| No alerts yet | Explains the rule that creates one |
| Signed in, push off | Banner: alerts arrive here only; offers the permission |
| Mac | Banner: alerts arrive on the phone (no push on Mac in the MVP) |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Tab bar; a push opens Alerts then the position (proposed, see [open questions](../open-questions.md)) |
| Out | Position (push), Alert settings (push), Sign in (sheet) |
| Focus | Title on arrival |
