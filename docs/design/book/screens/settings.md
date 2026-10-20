# Settings

## Job

Manage the account, wallets, notifications, preferences and plan in one place. The third tab; its own window on Mac.

## Prototype

[screens.html#web-settings](../visual/prototypes/screens.html#web-settings), [#iphone-settings](../visual/prototypes/screens.html#iphone-settings), [#mac-settings](../visual/prototypes/screens.html#mac-settings). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar (web: site header) | Title "Settings"; large title on iPhone |
| 2 | Account | [List row](../components/lists.md#list-row) | Guest: "Guest" and Sign in. Signed in: plan name (*needs server field*), passkey management, the account id from `GET /api/v1/me` |
| 3 | Wallets and notifications | List rows with disclosure | Wallets with used of `wallets.max` (guest source as on [Wallets](wallets.md)); Notifications, On or Off; open [Wallets](wallets.md) and [Alert settings](alertsettings.md) |
| 4 | Preferences | List rows with a [segmented control](../components/controls.md#segmented-control) | Positions view (Cards or Rows); appearance (system, light, dark) |
| 5 | Plan | List row with disclosure | Plan name (*needs server field*): a guest shows "Guest", never "Free"; opens [Plans](plans.md) |
| 6 | About | List rows | Version, licence, source, privacy |

Positions view is one remembered preference; the Cards / Rows toggle on web Portfolio sets the same value, and each shows the other's change. Appearance follows the system until the person picks light or dark; the MVP has one Scheme, so there is no Scheme choice.

## States

| State | On the wire | What changes |
|---|---|---|
| Guest | No session | Account row says "Guest" and offers [Sign in](signin.md); Plan row says "Guest"; Notifications Off |
| Signed in | `GET /api/v1/me` | Account row shows the plan and passkey management; usage from `/me` |
| Self-hosted instance | The app points to a server other than the official instance | Instance address shown; store apps sign in through the system browser |
| Offline | `/me` cached with its ETag | Values from the cache; nothing is enforced on the client |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | One narrow column; tabs move to a bottom tab bar | iPhone and Slide Over: Settings tab, large title, grouped rows; Wallets, Alert settings and Plans push | — |
| medium, 600 to 839 | One narrow column | Settings in the tabs on top | — |
| expanded, 840 and up | One narrow column; site header tabs | Settings at the foot of the sidebar | Settings window (Command comma) with panes Account, Wallets, Alerts, Plan; Wallets shows the limit meter and wallet rows |

## Motion

| Transition | Token |
|---|---|
| Push to Wallets, Alert settings, Plans | Platform push on native; web cross-document View Transition ([0023](../../../decisions/0023-motion.md)); reduced: crossfade |
| Preference change | None; applies at once |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Tab bar or sidebar; web site header; Command comma on Mac |
| Out | Sign in (sheet or dialog), Wallets, Alert settings, Plans; back returns to Settings |
| Focus | Title on arrival, then the first row. Web page loads leave focus to the browser |

## Acceptance

Rubric defaults, plus: Guest and Signed in at 390, 820 and 1280 px on web, on iPhone, and in the Mac Settings window with each pane.
