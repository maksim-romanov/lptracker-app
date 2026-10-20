# Sign in

## Job

Sign in with a passkey, or continue as a guest. Sign-in is never a gate: watching works without it.

## Prototype

[screens.html#web-signin](../visual/prototypes/screens.html#web-signin), [#iphone-account](../visual/prototypes/screens.html#iphone-account). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Title and close | [Bottom sheet](../components/overlays.md#bottom-sheet) or [dialog](../components/overlays.md#dialog) | "Sign in" and Close |
| 2 | Reason | Text | What an account adds (alerts, more wallets); one sentence |
| 3 | Passkey | Primary button | "Continue with a passkey"; hands off to the system passkey sheet |
| 4 | Guest | Secondary button | "Continue as guest"; closes the overlay |

After sign-in with a guest watchlist, a confirmation dialog (role alertdialog) asks before the merge: Not now first, then Merge ([ADR 0012](../../../decisions/0012-accounts-guests-and-passkeys.md)).

## States

| State | On the wire | What changes |
|---|---|---|
| Signed in with a guest watchlist | Session created; guest wallets on the device or in the cookie | One confirmation names the guest wallets to merge; then they are added up to the account's `wallets.max` |
| Guest list over the account limit | Merge answer says how many were not added (*proposed*, [plans](../../../concepts/plans-and-entitlements.md#enforcement)) | One line: "N wallets not added, plan limit" with a link to [Plans](plans.md) |
| Passkey cancelled | No assertion | The overlay stays; no error text |
| Self-hosted instance, store apps | The app points to a server other than the official instance | Sign-in opens the system browser first (PKCE, [ADR 0012](../../../decisions/0012-accounts-guests-and-passkeys.md)) |
| First sign-up | Account created | Recovery codes, then a prompt to add a second passkey ([ADR 0012](../../../decisions/0012-accounts-guests-and-passkeys.md)) |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | Bottom sheet over the opener | Bottom sheet over the opener | — |
| medium, 600 to 839 | Centred dialog | Centred dialog or side sheet ([bottom sheet](../components/overlays.md#bottom-sheet)) | — |
| expanded, 840 and up | Centred dialog, 480 wide (*design-pending*) | Centred dialog or side sheet | Not drawn yet |

## Motion

| Transition | Token |
|---|---|
| Sheet in and out | `gentle`; scrim fades with `fast` ([bottom sheet](../components/overlays.md#bottom-sheet)); reduced: crossfade |
| Merge confirmation | Platform alert |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Alerts guest panel, Settings, Wallets at the guest limit, Portfolio guest-limit banner, Add wallet at the limit, Set alert as a guest |
| Out | Passkey success returns to the opener, through the merge confirmation when there is a guest watchlist; Continue as guest and Close return to the opener |
| Focus | Overlay title on open; focus is trapped; Escape closes; closing returns focus to the opener |

## Acceptance

Rubric defaults, plus: the sheet, the merge confirmation and the over-the-limit line at 390, 820 and 1280 px on web and on iPhone.
