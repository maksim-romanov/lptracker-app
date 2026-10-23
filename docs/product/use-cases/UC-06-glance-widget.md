---
id: UC-06
title: Glance at my positions without opening the app
status: draft
priority: P1
platforms: [iPhone, iPad, Mac]
related: [UC-01, UC-02, UC-03]
---

# UC-06 Glance at my positions without opening the app

**Situation.** Dana wants to know "am I still in range?" a dozen times a day, in the queue, between meetings, on the sofa. Each check today is a browser tab on a protocol site.

| Without VoidX | With VoidX |
|---|---|
| Unlock, open the browser, find the bookmark, connect or paste the address, wait | Look at the home screen: "3 of 4 in range", owed fees, the pair that is out |
| A habit of checking too often, or not at all | Glance in a second `[illustrative]`; push covers what the glance misses (UC-02) |

**Intent.** When I only want a quick answer about my positions, I want it on the home screen, so I do not open anything.

**Scope.** Starts: the LP adds a VoidX widget. Ends: the widget shows the portfolio summary. Not covered: acting from the widget; live prices. Guarantee: the widget shows the last data the app read, with its age, and never `$0` for an unpriced token.

**Trigger and preconditions.** The LP watches at least one wallet in the app (UC-01).

## Main scenario

1. The LP adds the widget to the home screen and picks which wallets it covers.
2. The widget shows the summary: positions in range out of all, and the pairs that are out of range.
3. The widget refreshes on the system's schedule from the data the app last read.
4. The LP taps the widget and lands on the portfolio, or on the position that is out of range (UC-03).

## Extensions

- 2a. No wallet is watched: the widget invites the LP to add one in the app. ✔
- 2b. The data is old: the widget shows its age instead of presenting it as current. ✔
- 2c. The LP is a guest: the widget works for the guest watchlist; alerts still need an account (UC-02). ✔
- 3a. The app has not run for a while: the widget keeps the last data and its age; it does not refresh credentials itself. ✔

## Open questions

- Q1 Widget sizes and what each shows. Owner: maksim-romanov. Proposal: decide in the widget design, after the D0 screens.
