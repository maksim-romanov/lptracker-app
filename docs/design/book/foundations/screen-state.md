# Screen state

Every screen renders from one state value. Client logic (phase 3) builds it from wire data and tests it against fixtures; the view (phase 5) only switches on it and formats. A view that reads the wire response directly, or decides a state itself, is a defect (*convention*).

## Shape

```
ScreenState<Data> =
  | loading  { partial?: Data }                  // scopes still pending; finished ones render
  | ready    { data: Data, asOf, notices: Notice[] }
  | empty    { reason: "no-wallet" | "no-positions" }
  | failed   { problem: Problem, last?: Data }   // nothing answered; last good data stays on screen

Notice =
  | planLimit      { key, limit, usage }          // from the planLimit notice or a 409 plan-limit problem
  | partialFailure { scopes: Scope[] }            // scope status failed
  | stale          { asOf }                       // needs server field: the server says the data is stale
  | outOfRange     { positions }                  // needs server field: the out-of-range list or count
  | unpriced       { count }                      // totals.partial, unpricedCount
  | truncated      { scope }                      // scope truncated: true
  | lowConfidence  { position }                   // amountsConfidence: low
```

`Data` is the screen's own type: wire fields renamed for the view, never new numbers.

## From the wire

| On the wire | State |
|---|---|
| Any scope `pending` | `loading` with the scopes that are `ok` |
| No watch entry | `empty` `no-wallet` |
| Every scope `ok`, no position | `empty` `no-positions` |
| Some scopes `failed` | `ready` with `partialFailure` naming them |
| Every scope `failed`, or the request failed | `failed`, keeping `last` |
| `planLimit` present, or a `409 plan-limit` answer | `planLimit` notice |
| `prices` absent (M1 to M3, [ADR 0011](../../../decisions/0011-token-amounts-not-usd.md)) | `ready`; the view shows token amounts only and no USD anywhere. Not a user setting |

## Notices on screen

Banners stack in this order, at most three, the rest in Notes: `planLimit`, `partialFailure`, `stale`, `outOfRange`. `unpriced`, `truncated` and `lowConfidence` are lines in Notes or in the region they qualify. A notice never hides values: stale and partial data stay on screen with their age or coverage.

## Per client

| Client | Where the state lives |
|---|---|
| Web | The route loader returns `ScreenState`; the page component switches on `kind` |
| iOS, iPadOS, macOS | An `@Observable` screen model exposes `state`; the SwiftUI view switches on it |

Each kind and each notice a screen lists has a fixture in the mock API (phase 0), so phase 5 can render every state without a server.
