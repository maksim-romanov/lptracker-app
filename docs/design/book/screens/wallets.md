# Wallets

Manage the watchlist and see the plan limit.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Limit meter | Meter, text | Used of `wallets.max` (a guest reads it from `/meta` and `usage` from the `planLimit` notice, *needs server field*), plan name (*needs server field*) |
| 2 | Explanation | Text | What a limit means; what paused means |
| 3 | Wallet list | Wallet row | Name, address, positions count and value (both *needs server field*: one value per wallet across chains); paused muted with a word |
| 4 | Actions | Button | Add wallet; Sign in or Choose active wallets, by state |

## States

| State | What changes |
|---|---|
| At the limit | `wallets.max` reached; Sign in offered to a guest |
| After a downgrade | Wallets over the limit are paused; the person can choose which stay active |
| Removing | Dialog: names the wallet and what is deleted |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Settings row; sidebar on wide layouts |
| Out | Add wallet (sheet), Sign in (sheet), Plans (push) |
| Focus | Title on arrival; remove returns focus to the next row |
