# Add wallet

Takes an address or name and adds it to the watchlist. A bottom sheet on phone, a dialog on wide layouts, a page when there is no script.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Title and close | Sheet or dialog | "Add wallet", Close |
| 2 | Field | Text field | Address or name; label, helper, status line |
| 3 | Helpers | Buttons | Paste; Scan on phone; an example |
| 4 | Preview | Wallet row | Appears when the address is valid: avatar, shortened address, chains it will be read on (*needs server field*) |
| 5 | Plan notice | Banner | Only after the server answers `plan-limit` |
| 6 | Action | Primary button | Add wallet; disabled until the field is valid |

## States

| State | What changes |
|---|---|
| Idle | Helper line: what is accepted |
| Looking up | Name is being resolved; status line with spinner; button disabled |
| Ready | Preview shown; button enabled |
| Not an address | Error: what is wrong and what a valid one looks like |
| Name not found | Error names the name that failed |
| Already watched | Error with a Show action |
| `plan-limit` answer | Banner with `limit` and `usage` (from the problem body for an account, from the `planLimit` notice for a guest; *needs server field*) and the next step (Sign in or Plans); the button stays enabled. A guest sends the full new address list as a query first and saves it only when the answer has no `planLimit`; on the web the server writes the signed cookie after the same check |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Add control on Portfolio, empty state, widget tap on an empty widget |
| Out | Back to Portfolio with a toast; or reading state while chains answer |
| Focus | The field on open. Closing returns focus to the opener. The page behind is inert |
