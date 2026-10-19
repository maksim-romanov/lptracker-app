# Families

The set for the MVP. Anything else (Large, Extra Large, two positions in one widget, controls, Live Activities) is out of scope for now.

| Family | Ratio | Regions | Shows | Opens |
|---|---|---|---|---|
| Home small | square | Top: token pair, status. Middle: pair name, total and the principal token amounts. Bottom: range bar | Total, token amounts, status, range | The position |
| Home medium | about 2.1 to 1 | Top: pair, status. Left: total, principal amounts and a short range bar. Bottom right: owed fees of token 0 and token 1 as two pills | Total, token amounts, range, owed fees per token | The position |
| Home empty | square or 2.1 to 1 | Outline pair, an Add action, one line, outline bar | No wallet yet | Add wallet |
| Lock circular | circle | Gauge ring and a count (the ratio is a *needs server field*) | How many positions are out of range | Alerts |
| Lock rectangular | about 2.2 to 1 | Worst position name with its status word, a thin range line, a second position line | Worst position and one more | The worst position |
| Lock inline | one line | A shape and text | Count out of range | Alerts |
| Android 2 by 2 | square | Same regions as Home small | Same | The position |
| Android 4 by 2 | about 2 to 1 | Same regions as Home medium | Same | The position |

> *Pending.* sizes are system defined and differ per device, so only ratios are fixed. Exact point sizes of the Lock Screen families were not verified here; read them from the platform documentation when building.
