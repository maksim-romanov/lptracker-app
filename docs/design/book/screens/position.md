# Position

One position in full: value, range, amounts and fees.

## Regions, in order

| # | Region | Component | Shows |
|---|---|---|---|
| 1 | Navigation bar | Navigation bar | Back, pair name, Set alert, Share |
| 2 | Out-of-range banner | Banner | Which side; how far out of range (*needs server field*); present only when out of range |
| 3 | Hero | Token pair, status chip, value (display-lg) with the principal amounts per token beside it, range bar | `value.valueUsd`, `amounts[principal]`, pair, fee percent (*needs server field*) and chain, range with current price |
| 4 | Principal | Grouped list rows | Amount per token, exact |
| 5 | Owed fees | Grouped list rows | Total (*needs server field*), then per token. Present only when fee accrual is claimable |
| 6 | Details | Grouped list rows | Protocol, fee tier (*needs server field*: a display percent, not the raw `pool.fee`), network, position id, custody, read block, position owner with copy; family-specific rows from the display descriptor |
| 7 | Actions | Button, link | Set alert, View on explorer |

## States

| State | What changes |
|---|---|
| In range | Hero shows the in-range status; no banner |
| Out of range | Banner and a different marker shape. The hero value is unchanged |
| Partial value | Note names the unpriced token; its amount shows, never zero |
| Redirected or compounded fees | Owed fees region replaced by a line explaining where fees go |
| Low amounts confidence | Principal shows a short note |
| Guest | Set alert opens Sign in with the reason |

## Navigation and focus

| Item | Rule |
|---|---|
| In | Position row or card, alert, widget, link, Siri |
| Out | Alert rule (sheet), Share (system), explorer (browser), back |
| Back | Returns to the opener and its scroll position; a push opens Alerts then Position (proposed, see [open questions](../open-questions.md)) |
| Focus | The pair name heading on arrival |
