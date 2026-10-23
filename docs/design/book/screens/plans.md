# Plans

## Job

See the current plan, its limits and what a higher plan adds.

## Prototype

[screens.html#web-plans](../visual/prototypes/screens.html#web-plans) (Account switch: guest, signed in), [#iphone-settings](../visual/prototypes/screens.html#iphone-settings) (the Plan screen). The Mac Plan pane is not drawn. Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | [Navigation bar](../components/navigation.md#navigation-bar) (web: breadcrumb Settings / Plan) | Back "Settings", title "Plan" |
| 2 | Current plan | Card | Plan name (*needs server field*), `source`, `expiresAt` from `GET /api/v1/me` |
| 3 | Limits | Grouped [list rows](../components/lists.md#list-row) | Wallets, alerts, early warning: `wallets.max`, `push.enabled`, `alerts.early_warning` with usage from `/me` |
| 4 | Plans compared | Plan card per plan, card fills from [ghost-cards.html](../visual/prototypes/ghost-cards.html) | Guest, Free, Pro; a Current tag on the person's plan; per plan its wallets and alerts lines and how to get it ("Sign in with a passkey.", "Invite only for now."). Every value *needs server field*: a plan comparison on the server; clients hold no plan table |
| 5 | Action | [Button](../components/controls.md#button) | Only where the storefront allows (`upgradeAvailable` on `/me`, *needs server field*); otherwise text on how to upgrade |

## States

| State | On the wire | What changes |
|---|---|---|
| Guest | No session | Guest card is Current; shows what signing in gives (*needs server field*); a guest is never shown as Free |
| Signed in, Free | `GET /api/v1/me` | Free card is Current; limits show usage from `/me` |
| Pro by grant | `/me` `source` `admin`, `expiresAt` | Shows the source and until when; the grantor is not exposed |
| No upgrade available here | `upgradeAvailable` false | No button; text explains the channel |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | One narrow column, plan cards stacked; tabs move to a bottom tab bar | iPhone and Slide Over: pushed from Settings, back "Settings", large title, plan cards stacked | — |
| medium, 600 to 839 | One narrow column, plan cards stacked | Pushed in the Settings tab | — |
| expanded, 840 and up | Three plan cards side by side; site header tabs | Reached from Settings at the foot of the sidebar | Plan pane of the Settings window (Command comma), *pending*: not drawn |

## Motion

| Transition | Token |
|---|---|
| Push from Settings, Wallets or Add wallet | Platform push on native; web cross-document View Transition ([0023](../../../decisions/0023-motion.md)); reduced: crossfade |
| Button press | `brisk` |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Settings Plan row ("Guest" or "Free"), [Wallets](wallets.md), [Add wallet](addwallet.md) at the limit (See plans: the sheet closes first, then Plans opens), [Sign in](signin.md) over-the-limit line |
| Back | The screen that opened it |
| Focus | Title on arrival |

## Acceptance

Rubric defaults, plus: every state above at 390, 820 and 1280 px on web and on iPhone. Row 12: the guest copy says "Guest", never "Free".
