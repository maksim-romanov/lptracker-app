# Plans

Current plan, limits and what a higher plan adds.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Current plan | Card | Plan name (*needs server field*), source, expiry |
| 2 | Limits | Grouped rows | Wallets, alerts, early warning; usage against the limit |
| 3 | What a higher plan adds | Grouped rows | Per entitlement, compared across plans (*needs server field*: a plan comparison on the server; clients hold no plan table) |
| 4 | Action | Button | Only where the storefront allows (`upgradeAvailable` on `/me`, *needs server field*); otherwise text on how to upgrade |

## States

| State | What changes |
|---|---|
| Guest | Shows what signing in gives (*needs server field*); a guest is not shown as Free |
| Pro by grant | Shows the source and until when; the grantor is not exposed |
| No upgrade available here | No button; explains the channel |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Settings, Wallets, Add wallet at the limit |
| Focus | Title on arrival |
