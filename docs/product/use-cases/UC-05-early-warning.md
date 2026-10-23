---
id: UC-05
title: Get warned before a position leaves its range
status: draft
priority: P2
platforms: [web, iPhone, iPad]
related: [UC-02, UC-03]
---

# UC-05 Get warned before a position leaves its range

**Situation.** Dana runs a narrow range on ETH/USDC for higher fees. When ETH moves 1.5% the position is out. She is rarely at a desk, and a push after the exit is too late to act on her terms.

| Without VoidX | With VoidX (Pro) |
|---|---|
| Watches the price herself, or learns after the exit | A push when the price is within 2% of an edge, her number |
| Rebalances in a hurry at a bad price | Time to decide before the exit |

**Intent.** When the price drifts toward an edge of my range, I want a warning before it crosses, so I have time to react.

**Scope.** Starts: a Pro LP opens alert settings. Ends: the early warning is on for all positions or one. Not covered: buying Pro; the owner grants it by hand in the first release. Guarantee: the server decides who may use the rule; the client never enforces the plan.

**Trigger and preconditions.** The LP is signed in on Pro and allowed push (UC-02).

## Main scenario

1. The LP opens alert settings, or Set alert on a position (UC-03).
2. The LP turns on the early warning and sets the distance from the edge in percent.
3. The app saves the rule.
4. The price comes within that distance of an edge.
5. The app sends a push naming the pair and the edge, before the position leaves its range.
6. If the price crosses the edge, the exit alert of UC-02 follows.

## Extensions

- 2a. The plan has no early warnings: the app names the plan that does and links to Plans; nothing is saved. ✖
- 2b. The distance is out of bounds: the app states the allowed values. ↩ 2
- 5a. A warning was sent within the cooldown: no new push. ✔

## Open questions

- Q1 Default and allowed values for the distance. Owner: maksim-romanov. Proposal: set in the alert settings design (*design-pending*).
