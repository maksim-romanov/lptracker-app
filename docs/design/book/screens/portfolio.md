# Portfolio

## Job

See every watched position at once and what needs attention first. The first tab and the start destination.

## Prototype

[screens.html#web-portfolio](../visual/prototypes/screens.html#web-portfolio), [#iphone-flow](../visual/prototypes/screens.html#iphone-flow), [#ipad-wide](../visual/prototypes/screens.html#ipad-wide), [#mac-main](../visual/prototypes/screens.html#mac-main). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar (web: site header) | Title "Portfolio", Add wallet; web adds the tabs, the updated line and Sign in or Account. Condensed slot: the summary figure once the summary scrolls under the bar ([navigation](../components/navigation.md)) |
| 2 | Wallets | Wallet tags | One tag per wallet with its position count (*needs server field*), then Add wallet. Tapping tags scopes every region below to those wallets |
| 3 | Summary | Headline with a pill, supporting line | USD: owed fees total in the pill (*needs server field*), `totals.all` as an estimate, in range count (*needs server field*). Tokens only: "K of N positions in range" across wallets and networks (*needs server field*, every count); no USD |
| 4 | Notices | Banner | Notices in the order of [screen state](../foundations/screen-state.md#notices-on-screen); out of range names the pairs and offers Show |
| 5 | Filters | Filter bar (web), Filters button and sheet (phone) | Networks, protocols and status (All, Out of range), each with its count (*needs server field*); Reset when any is set |
| 6 | View | Cards / Rows toggle | Web only; remembered, the same preference as in Settings |
| 7 | Positions | Position card (Cards) or position row (Rows) | Sorted in the server's order (*needs server field*: by value, or by amount when tokens only); tokens only: base amount as the figure, then the quote amount and owed fees per token |
| 8 | Notes | Text | Hidden positions with unlisted tokens and Show; USD is an estimate (USD only); block read at, from `readBlock` |

## States

| State | On the wire | What changes |
|---|---|---|
| `loading` | Scopes `pending` | Skeleton rows for pending scopes; finished scopes render as they arrive |
| `empty` `no-wallet` | No watch entry | Example wallet with an example label; one primary action, Add wallet |
| `empty` `no-positions` | Every scope `ok`, no position | Says what VoidX reads; Add another wallet |
| `failed` | Every scope `failed`, or the request failed | With last data: it stays with its age, banner with Retry. Without: the Positions region says the read failed, with Retry; header, wallet tags and Add wallet stay |
| `partialFailure` | Some scopes `failed` | Banner names the chain, offers Retry for it; counts say what they cover, "4 of 6" |
| `stale` | *needs server field* | Updated line shows its age with an amber dot; banner with Retry; values stay; live updates stop |
| `planLimit`, guest over the limit | `planLimit` notice | Only the first `wallets.max` wallets show; banner "Showing 1 of 3 saved wallets" with Sign in |
| Tokens only | `prices` absent (M1 to M3) | No USD anywhere: summary counts positions in range; cards and rows show token amounts |
| `outOfRange` | *needs server field* | Banner with the pairs; Show sets the status filter |
| `truncated` | A scope with `truncated: true` | Notes line names the wallet and network and says not every position is shown; the counts say what they cover |
| `unpriced` | `totals.partial`, `unpricedCount` | Summary total marked partial; Notes line with the `unpricedCount` tokens that have no price; their amounts show, never `$0` |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | Header: logo, updated dot, Sign in; tabs move to a bottom tab bar. Wallet tags and filters scroll in one row each. Summary left-aligned. Rows by default; Cards in one column when chosen | iPhone and Slide Over: large title, wallet tags under it, centred summary, Filters button and sheet, Rows | — |
| medium, 600 to 839 | Cards in two columns; filters in a grouped bar | Half screen: tabs on top, list and detail side by side | — |
| expanded, 840 and up | Centred summary, grouped filter bar, cards grid | Sidebar with wallets, list column, detail column; selecting a row fills the detail | Same as iPad wide plus toolbar (search, share, set alert, Add) |

iOS, iPadOS and macOS pick the layout by `horizontalSizeClass`, never by device or width. One `NavigationSplitView` holds sidebar, list and detail; when the window narrows to compact it collapses to a stack, and a position selected in the detail column moves into the bottom sheet over the list, keeping its height. Widening moves it back into the detail column.

## Frames and routes

Web ([ADR 0018](../../../decisions/0018-web-ssr-hotwire.md)). The page URL holds every scope, so a reload, a link or a back step restores the screen.

| Item | Rule |
|---|---|
| Route | `/` with query params `?wallet=&chain=&status=&view=`; `wallet`, `chain` and `status` take one or more values, absent means all; `view` is `cards` or `rows` |
| Frame | One `portfolio-body` frame holds regions 3 to 8. A wallet tag, filter or view change is a link or GET form targeting it; when a scope lands on the stream, that frame reloads. Header and wallet tags stay outside it |
| No script | Tags, filters and the view toggle are plain links and GET forms that load the full page with the same params; positions render on the server |
| From the server | Wallet tag counts, filter counts, the in range count, sort order and each position's fill index (*needs server field*, every one); the client computes none |

## Motion

| Transition | Token |
|---|---|
| Summary condensing into the header; filters pinning under it | `scrub`; reduced: `fast` opacity fade |
| Card details on web: Drawer (Cards), Spotlight (Rows) | `flip`, `gentle` ([0055](../../../decisions/0055-ghost-design-language.md)) |
| Row to the position sheet, and between its two heights | `gentle`; follows the finger while dragged; reduced: crossfade |
| Range bar knob following the price | `gentle`; reduced: jumps |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Tab bar, widget tap, link; start destination |
| Out | Position (Drawer or Spotlight then Open on web, a two-level sheet on iPhone and Slide Over ([bottom sheet](../components/overlays.md#bottom-sheet)), detail column on wide), Add wallet (sheet or dialog), Alerts |
| Focus | Native: title on arrival. Web: no programmatic focus on page load or frame reload; a skip link to Positions comes first. Selecting a row on wide layouts keeps focus on the list |
| View | Rows on phone and Cards on wide layouts by default |

## Acceptance

Rubric defaults, plus: every state above at 390, 820 and 1280 px on web, and on iPhone, iPad wide and Mac main.
