# Position

## Job

See one position in full: value, range, amounts, owed fees and where it lives on chain.

## Prototype

[screens.html#web-position](../visual/prototypes/screens.html#web-position), [#iphone-flow](../visual/prototypes/screens.html#iphone-flow), [#ipad-wide](../visual/prototypes/screens.html#ipad-wide), [#mac-main](../visual/prototypes/screens.html#mac-main). Status: D0 base, in progress ([prototypes](../prototypes.md)); until it is approved, this page wins where they differ.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Header | Navigation bar (web: site header and breadcrumb "Portfolio / pair") | Back, pair name, Set alert, Share. Condensed slot: the hero value once the hero scrolls under the bar ([navigation](../components/navigation.md)) |
| 2 | Out-of-range banner | Banner | Which side; how far out of range (*needs server field*); present only when out of range |
| 3 | Hero | Token pair, status chip, value, range bar | Pair name; meta line: protocol, fee percent (*needs server field*), chain, position id; `value.valueUsd` as an estimate with the principal amounts beside it and the owed fees total under it (*needs server field*); range bar with current price (`range.current` in the quote token) and range (`range.lower` to `range.upper`). Liquidity histogram: *needs server field*, omitted until it exists |
| 4 | Actions | Button, link | Set alert, Share, View on explorer; right under the hero so they show without scrolling |
| 5 | Principal | Grouped list rows | Amount per token, exact; Unlisted badge on a non-`default` token; note: amounts are exact, USD is an estimate |
| 6 | Owed fees | Grouped list rows | Total (USD only, *needs server field*), then per token; note: swap fees earned and not yet collected. Present only when `feeAccrual.mode` is `claimable` |
| 7 | Details | Grouped list rows | Protocol, fee tier (*needs server field*: a display percent, not the raw `pool.fee`), network, position id, custody, read block, owner in mono with copy; family-specific rows from the display descriptor |
| 8 | Updated | Text | Age from `asOf`; on web it is the updated line in the site header |

## States

| State | On the wire | What changes |
|---|---|---|
| `loading` | Request pending | Skeleton hero and sections sized like the content; header keeps Back |
| `failed` | The request failed | With last data: it stays with its age, banner with Retry. Without: a failed message with Retry and Back to Portfolio |
| Not found or closed | `404` problem, or `status` `closed` | Says the position is closed or no longer watched; no values; Back to Portfolio. An alert or widget link lands here, never on an error page |
| In range | `range.status` `in` | Status chip in range, round marker; no banner |
| `outOfRange` | `range.status` `below` or `above` | Banner and the diamond marker outside the band. The hero value is unchanged |
| No range | `range` null | No range bar; the status word is pending |
| `unpriced`, partial value | `value.partial` | Meta line adds "partial value"; Principal note names the unpriced token; its amount shows, never `$0` |
| Tokens only | `prices` absent (M1 to M3) | No USD anywhere: the base token amount is the big figure, the quote amount under it, owed fees per token; no owed fees total |
| Redirected or compounded fees | `feeAccrual.mode` `redirected` or `compounded` | Owed fees region replaced by a line explaining where fees go |
| `lowConfidence` | `amountsConfidence` `low` | Principal shows a short note |
| `stale` | *needs server field* | Updated line shows its age; values stay |
| Guest | No account | Set alert opens Sign in with the reason |

## Layout

| Class | Web | iOS and iPadOS | macOS |
|---|---|---|---|
| compact, under 600 | A page in one column: hero stacked, then Actions, Principal, Owed fees, Details; bottom tab bar | iPhone and Slide Over: a two-level [bottom sheet](../components/overlays.md#bottom-sheet) over Portfolio. Medium (62 %): regions 2 to 4, the summary (pair, status, value, owed fees, range bar) and the actions. Large: every region, with its links. Drag between them; drag down to close | — |
| medium, 600 to 839 | Hero stacked; sections in one column | Half screen: the detail column beside the list | — |
| expanded, 840 and up | Hero in two columns (pair and value left, range bar, current price and range right); Principal, Owed fees and Details in three columns | Wide: the detail column of sidebar, list, detail | The detail column; toolbar Share and Set alert act on the selected position |

## Motion

| Transition | Token |
|---|---|
| Row to the position sheet, and between its two heights | `gentle`; follows the finger while dragged; reduced: crossfade |
| Card or row to the position page on web | Cross-document view transition with the position's `view-transition-name`; reduced: `view-transition-name: none` ([0023](../../../decisions/0023-motion.md)) |
| Hero value condensing into the header | `scrub`; reduced: `fast` opacity fade |
| Range bar knob following the price | `gentle`; reduced: jumps |
| Value changing | Digits roll in the direction of change; reduced: the text swaps ([value](../components/data-display.md#value)) |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Position row or card (Open on web), alert, widget, link, Siri |
| Out | Alert rule (sheet), Share (system), explorer (browser), back |
| Back | Returns to the opener and its scroll position; on web the breadcrumb goes to Portfolio. A push opens Alerts then Position (proposed, see [open questions](../open-questions.md)) |
| Focus | Native: the pair name heading on arrival. Web: no programmatic focus on page load; a skip link to the hero comes first. Selecting a row on wide layouts keeps focus on the list. Closing the sheet returns focus to the row |

## Acceptance

Rubric defaults, plus: every state above at 390, 820 and 1280 px on web; on iPhone both sheet heights; on iPad wide and Mac main the detail column; tokens only shows no `$` anywhere.
