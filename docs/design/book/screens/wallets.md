# Wallets

## Job

Manage the watchlist and see the plan limit: which wallets count, which are paused, and the next step at the limit.

## Prototype

[screens.html#web-wallets](../visual/prototypes/screens.html#web-wallets) (Plan switch: guest at the limit, Free after a downgrade), [#iphone-wallets](../visual/prototypes/screens.html#iphone-wallets), [#mac-settings](../visual/prototypes/screens.html#mac-settings). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | [Navigation bar](../components/navigation.md#navigation-bar) (web: breadcrumb Settings / Wallets) | Back "Settings", title "Wallets" |
| 2 | Limit meter | Meter | "3 of 3 wallets": usage of `wallets.max` (a guest reads the limit from `GET /api/v1/meta` and `usage` from the `planLimit` notice, *needs server field*); plan name, "Guest" or "Free plan" (*needs server field*); a track bar (fill *needs server field*: the usage share) |
| 3 | Explanation | Text | Guest: what signing in adds ("Sign in for 3 and alerts", *needs server field*: the Free limit). After a downgrade: how many are paused (*needs server field*) and what a paused wallet is |
| 4 | Wallet list | [Wallet row](../components/lists.md#wallet-row) | Monogram, name, shortened address in mono, positions count and value (both *needs server field*: one value per wallet across chains; no value when tokens only), remove. A paused wallet: "Paused" pill, avatar and text muted |
| 5 | Actions | [Button](../components/controls.md#button) | Primary: Sign in (guest) or Choose active wallets (after a downgrade); Add wallet |

## States

| State | On the wire | What changes |
|---|---|---|
| Signed in | `GET /api/v1/me`: `wallets.max` and usage | Meter shows usage and the plan name |
| Guest at the limit | No session; guest `wallets.max` from `/meta` (*proposed*) | Meter "1 of 1 wallets", "Guest", never "Free"; Sign in is the primary action |
| After a downgrade | Paused wallets on the account (*needs server field*: which ones) | Wallets above the limit are paused; Choose active wallets lets the person pick which stay active; the oldest stay by default ([plans](../../../concepts/plans-and-entitlements.md#downgrade-and-expiry)) |
| Add at the limit | `409 plan-limit` | Add wallet stays enabled and submits; the answer renders in the [Add wallet](addwallet.md) sheet |
| Removing | — | [Dialog](../components/overlays.md#dialog), safe action first: "Remove vitalik.eth?", "Its alerts are deleted. The wallet is not affected.", Cancel, Remove |
| Tokens only | `prices` absent (M1 to M3) | Rows show the positions count only; no USD |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | One narrow column under the breadcrumb; tabs move to a bottom tab bar | iPhone and Slide Over: pushed from Settings, back "Settings", large title | — |
| medium, 600 to 839 | One narrow column | Pushed in the Settings tab | — |
| expanded, 840 and up | One narrow column, centred; site header tabs | Reached from Settings at the foot of the sidebar | Wallets pane of the Settings window (Command comma), panes Account, Wallets, Alerts, Plan; meter and wallet rows |

## Motion

| Transition | Token |
|---|---|
| Push from Settings | Platform push on native; web cross-document View Transition ([0023](../../../decisions/0023-motion.md)); reduced: crossfade |
| Button press | `brisk` |
| Remove dialog in and out | *pending*: the prototype shows no motion |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Settings Wallets row ("1 of 1"); Settings in the iPad sidebar; Wallets pane on Mac |
| Out | Add wallet (sheet), Sign in (sheet), Plans (push) |
| Back | Settings |
| Focus | Title on arrival; each address reads as start and end with a copy action; after a remove, focus moves to the next row |

## Acceptance

Rubric defaults, plus: every state above at 390, 820 and 1280 px on web, on iPhone and in the Mac Settings window. Row 9: a paused wallet carries the word "Paused", not only muted colour. Row 10: the remove button on each row is at least 44 pt.
