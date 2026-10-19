# States

Every widget family handles each of these.

| State | Condition | What changes |
|---|---|---|
| In range | status in range | Status word and shape; range bar in the band |
| Out of range | status out of range | Different shape and word; marker shape changes on the bar |
| Partial value | Some token is unpriced | Total carries a partial marker; amounts still show |
| Stale | asOf older than the first threshold | An age line replaces the secondary line; values stay |
| Cannot refresh | App could not update the snapshot | A short "Can't refresh" pill; last values stay |
| Empty | No wallet | Outline layout with an Add action |
| Removed position | Chosen position no longer exists | Falls back to the worst position (*needs server field*), then empty |
| Sign-out or reset | Account removed | Falls back to the guest watchlist or empty |

> *Pending.* **Proposed thresholds:** stale after 30 minutes without an update, "cannot refresh" after two hours. These are proposals, not decisions.
