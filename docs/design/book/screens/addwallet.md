# Add wallet

## Job

Add an address or ENS name to the watchlist, with no account needed.

## Prototype

[screens.html#web-addwallet](../visual/prototypes/screens.html#web-addwallet), [#iphone-add](../visual/prototypes/screens.html#iphone-add), [#iphone-problems](../visual/prototypes/screens.html#iphone-problems), [#iphone-after](../visual/prototypes/screens.html#iphone-after); what follows: [#web-reading](../visual/prototypes/screens.html#web-reading), [#web-nopositions](../visual/prototypes/screens.html#web-nopositions). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Title and close | [Bottom sheet](../components/overlays.md#bottom-sheet) or [dialog](../components/overlays.md#dialog) | "Add wallet", Close; the sheet adds its handle |
| 2 | Field | [Text field](../components/controls.md#text-field) | Label "Address or ENS name", placeholder "0x… or name.eth"; helper or status line under it |
| 3 | Helpers | Buttons | Paste; Scan QR on phone; the example "vitalik.eth". Shown until the field is valid |
| 4 | Preview | [Wallet row](../components/lists.md#wallet-row) | Appears when the address is valid: monogram avatar, name, shortened address in mono, chains it will be read on (*needs server field*) |
| 5 | Plan notice | Banner | Only after the server answers `plan-limit` |
| 6 | Action | Primary button | Add wallet; disabled until the field is valid. The dialog puts Cancel before it |

## States

| State | Trigger | What changes |
|---|---|---|
| Idle | Field empty | Helper: "Address or ENS name. No account needed." |
| Looking up | A name is being resolved | Status line with a spinner, "Looking up vitalik.eth…"; button disabled |
| Ready | Address valid or name resolved | Preview shown; the found address is announced; button enabled |
| Not an address | Field is not an address | Error: what is wrong and what a valid one looks like ("EVM addresses start with 0x and have 42 characters") |
| Name not found | The name resolves to nothing | Error names the name that failed |
| Already watched | The address is already in the watchlist | Error "You already watch this wallet." with Show |
| `planLimit` | `409 plan-limit` (account) or the `planLimit` notice (guest) | Banner with `limit` and `usage` (from the problem body for an account, from the `planLimit` notice for a guest; *needs server field*) and the next step: Sign in for a guest, See plans when signed in; the button stays enabled. A guest sends the full new address list as a query first and saves it only when the answer has no `planLimit`; on the web the server writes the signed cookie after the same check |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | Bottom-sheet dialog over Portfolio, Cancel and Add wallet side by side at full width; bottom tab bar | iPhone and Slide Over: bottom sheet with a handle; Add wallet at full width at the bottom | — |
| medium, 600 to 839 | Centred dialog over Portfolio | Centred dialog or side sheet ([bottom sheet](../components/overlays.md#bottom-sheet)) | — |
| expanded, 840 and up | Centred dialog, 480 wide | Centred dialog or side sheet | Add in the toolbar opens the dialog |

Without script, web serves Add wallet as a page.

## Motion

| Transition | Token |
|---|---|
| Sheet in and out | `gentle`; scrim fades with `fast`; reduced: crossfade |
| Dialog in and out | *design-pending*, no motion token yet |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Add wallet on Portfolio (header or wallet tags), the empty state, the Mac toolbar, a tap on an empty widget |
| Out | Add wallet: Portfolio reads each chain while it answers ([`loading`](portfolio.md#states)), then a toast "Added <name>"; a wallet with no positions shows `empty` `no-positions`. Close or Cancel: back to the opener |
| Focus | The field on open. A new error is announced. Closing returns focus to the opener. The page behind is inert |

## Acceptance

Rubric defaults, plus: every state above at 390 px (bottom-sheet dialog) and 1280 px (dialog) on web and on iPhone; the `planLimit` state for a guest and for a signed-in account; Add wallet stays enabled under the `plan-limit` banner.
