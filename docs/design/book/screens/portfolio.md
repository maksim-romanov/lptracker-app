# Portfolio

The first tab. Shows everything the watchlist holds and what needs attention first.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar | Title "Portfolio", Add wallet action |
| 2 | Summary | Value (display-lg), supporting line | Estimated total value from `totals.all.valueUsd` (null before prices exist: show "n/a"); owed fees total and positions in range count (*needs server field*) |
| 3 | Attention banner | Banner | Positions out of range: names and a Show action. Hidden at zero (the out-of-range count is a *needs server field*) |
| 4 | Filters | Filter chip | All and Out of range with counts (*needs server field*) |
| 5 | Positions | Position row (Rows) or card (Cards) | Sorted by value (*needs server field*); out-of-range first only when the filter is active |
| 6 | Notes | Text | Hidden positions with unlisted tokens and a Show control; USD is an estimate; block read at (per scope, from `readBlock`) |

## States

| State | What changes |
|---|---|
| Loading | Skeleton rows for scopes still pending; finished scopes render as they arrive |
| First visit | No wallet: example wallet with an example label, one primary action Add wallet |
| No positions | A wallet exists but holds none read: states what is read, offers Add another wallet |
| Partial failure | Banner names the failed chain and offers Retry for it; counts say what they cover, for example "3 of 6" (*needs server field*) |
| Stale | Updated line shows its age; values stay, never blank |
| Guest at limit | Add wallet shows the server's `plan-limit` answer and offers Sign in. If a saved list exceeds the limit (for example after the limit was lowered), the first `wallets.max` wallets show, with a line built from the `planLimit` notice (*needs server field*) and Sign in |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Tab bar, widget tap, link; start destination |
| Out | Position details (bottom sheet on phone, Drawer or Spotlight on web, detail column on wide); the Open link goes to the Position screen, Add wallet (sheet), Alerts |
| Focus | Title on arrival. Selecting a row on wide layouts keeps focus on the list |
| View | Rows on phone and Cards on wide layouts by default. Cards and Rows is a preference in Settings, not a control on this screen |
