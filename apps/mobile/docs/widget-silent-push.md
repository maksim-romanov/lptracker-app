# Widget silent-push refresh — design notes

Status: **planned, not implemented**. This document captures the architecture so we can land it incrementally without re-deciding from scratch.

## Why

Current snapshot freshness has three sources:

1. Foreground TanStack Query refetch (only when the app is open or pulled-to-refresh).
2. `WalletsStore` mobx reaction (instant on add/remove wallet, only while a JS context is alive).
3. `BGAppRefreshTask` ≥ 30 min in iOS's discretion (shipped — see `widgets/data/background-refresh.task.ts`).

None of these guarantees < 5 min latency. For range-bound LP positions, a position can drift out of range in seconds. We want the widget to reflect that within a minute or two **without forcing the user to open the app**.

## Goal

When the server detects a material change for a position the user follows (status flip, large fee accrual, position closed), it pushes a **silent APNs notification** to the device. iOS wakes the app in the background for ~30 seconds; the app re-builds the snapshot and reloads the widget timeline.

## Payload shape

```json
{
  "aps": {
    "content-available": 1
  },
  "depthly": {
    "kind": "widget.refresh",
    "reason": "out-of-range" | "fee-claimed" | "closed" | "generic",
    "ref": "uniswap-v3:1:1206703"
  }
}
```

- `content-available: 1` is the only field iOS reads; it triggers `application:didReceiveRemoteNotification:fetchCompletionHandler:` in the background.
- `depthly.*` is our payload — used for log/telemetry only. The client always does a full snapshot refresh, not a per-ref delta (keeps server simple, snapshot is small).

## Server triggers

Owned by the indexer / position-watcher service. Three classes:

1. **Status flip** — pool's `currentTick` crosses `tickLower` or `tickUpper` for any followed position. Throttle: 1 push per position per 5 minutes.
2. **Fee accrual** — `unclaimed_fee_usd` jumps by ≥ $1 since last push. Coalesce within 15-minute windows.
3. **Position closed/withdrawn** — `liquidity == 0` transition. Always pushes immediately.

Throttling is critical: APNs silent pushes are budget-limited per app per device. Apple recommends < 2-3 per hour on average. Our service must dedupe across positions before fanning out.

## Client wake chain

1. `application:didReceiveRemoteNotification:` (iOS) → expo-notifications background handler (JS).
2. Background handler resolves `WIDGET_SNAPSHOT_STORE` from DI and calls `refreshFromCurrentWallets()`.
3. `refreshFromCurrentWallets` → gateway fetch → `refresh(positions, tokens)` → `widget-bridge.writeSnapshot` → `widget-bridge.reload(WIDGET_KIND)`.
4. Widget timeline reload fires inside the 30-second budget.

Same code path as `BGAppRefreshTask`, just a different wake source. No new orchestration.

## What we need

- **Backend** — push service with APNs cert/key, position-change detector, throttler, device token table.
- **Client** — `expo-notifications` background handler, device token registration to backend, optional in-app opt-in screen for "notifications" permission (silent pushes do **not** require an alert permission on iOS).
- **Info.plist** — add `remote-notification` to `UIBackgroundModes` (the expo-notifications plugin already does this when `notifications` is configured).

## Trade-offs

- **Pro**: sub-minute snapshot freshness when something actually changed; user doesn't need to open the app.
- **Pro**: no client-side polling — server pushes only when it knows there's news.
- **Con**: requires backend infra (APNs, throttler, follow-set tracking per device).
- **Con**: budget-constrained — Apple may throttle if our pushes are too noisy. Need solid dedupe on server.
- **Con**: silent pushes don't fire if the user has the app explicitly killed (force-quit). Falls back to `BGAppRefreshTask`.

## Migration order

1. Land `BGAppRefreshTask` (this PR).
2. Stand up minimal push backend (APNs cert, device token registration endpoint, manual push trigger for testing).
3. Add `expo-notifications` background handler that calls into the existing widget refresh.
4. Add server-side change detector for the cheapest signal (position closed — simplest to detect, highest user value).
5. Expand to status flips and fee accrual once the detection + throttling pipeline is proven.

Cost target: < 2 silent pushes per active user per hour on average.
