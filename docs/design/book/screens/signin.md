# Sign in

A sheet that offers a passkey or continuing as a guest. Sign-in is never a gate.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Title and close | Sheet | "Sign in" |
| 2 | Reason | Text | What an account adds (alerts, more wallets); one sentence |
| 3 | Passkey | Primary button | Hands off to the system passkey sheet |
| 4 | Guest | Secondary button | Closes the sheet |

## States

| State | What changes |
|---|---|
| Signed in with a guest list | One confirmation names the guest wallets to merge ([ADR 0012](../../../decisions/0012-accounts-guests-and-passkeys.md)); then they are added up to the account limit |
| Guest list over the account limit | One line: "N wallets not added, plan limit" with a link to Plans |
| Passkey cancelled | Sheet stays; no error text |
| Self-hosted | Sign-in opens the system browser first |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Alerts guest panel, Settings, Add wallet at the limit, Set alert as a guest |
| Focus | Sheet title on open; closing returns focus to the opener |
