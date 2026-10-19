# Data contract

What the app writes into the shared container for the widget to read. Names follow the [position model](../../../concepts/position-model.md) where a field exists there. Every display value is a string the app formats before it writes. Fields marked *needs server field* are proposals and need an approved spec.

| Field | Type | Used by | Notes |
|---|---|---|---|
| `position.ref` | string | All | Stable id; the tap target |
| `pair` | string | All | Base and quote symbols, sanitized |
| `tokenLogos[2]` | two image references | Home, Android | Cached by the app in the shared container; a widget cannot load images itself. Monogram when missing |
| `status` | in-range, out-of-range, stale | All | Derived from `RangeView.status` (`in`, `below`, `above`) and `asOf`; plus a word key for the label |
| `principal[2]` | amount and symbol, strings | Home small, Home medium, Android 2 by 2 and 4 by 2 | Principal amounts per token, next to the total; never truncated |
| `totalText` | string | Home, Android | App-formatted value, with partial marker when unpriced |
| `range` | lower, upper, current, barPosition | Home, Android, Lock rectangular | Display strings and the 0 to 1 position; not recomputed |
| `owedFees[2]` | amount and symbol, strings | Home medium, Android 4 by 2 | Present only when fees are claimable |
| `outOfRangeCount` | number | Lock circular, inline | *Needs server field* (portfolio summary) |
| `worst, second` | two position summaries | Lock rectangular | *Needs server field*: worst means out of range first, then largest value; also the default target of every Home and Android widget |
| `asOf` | timestamp | All | Drives the "updated" text and the stale state |
| `locale` | string | All | Formatting only |

Source: `/api/v1/portfolio/summary`, whose payload is a *needs server field* (the position model names the endpoint only), fetched by the app, or by the Android refresh worker, and written to the shared container keyed per server URL; the widget only reads that snapshot ([ADR 0019](../../../decisions/0019-ios-stack.md), [ADR 0020](../../../decisions/0020-android-stack.md)).
