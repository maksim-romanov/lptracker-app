# Screens

The MVP screens: Portfolio, Position, Add wallet, Wallets, Alerts, Alert settings, Settings, Sign in, Plans. Navigation between them is in [navigation-map.html](../visual/prototypes/navigation-map.html). Data names are fields of the [position model](../../../concepts/position-model.md) and the account endpoints.

> **Rule.** Numbers are derived on the server; clients format them with the shared formatter and compute nothing ([AGENTS.md](../../../../AGENTS.md)). No screen below contains arithmetic, counts included. A field marked *needs server field* is not in the position model yet and needs an approved spec before it is built.

> **Rule.** Plans and limits are decided by the server. A client reads entitlement keys from `GET /api/v1/me` for display, always submits, and renders the `409 plan-limit` answer ([plans](../../../concepts/plans-and-entitlements.md)).

## Every screen page has these sections

| Section | Holds |
|---|---|
| Job | One line: what the person comes here to do |
| Prototype | The deep link into [screens.html](../visual/prototypes/screens.html) (`#<platform>-<screen>`) and its status in [prototypes.md](../prototypes.md) |
| Regions, in order | Region, component, the wire fields it shows. Reading order is focus order |
| States | Every [screen state](../foundations/screen-state.md) kind and notice that applies, what triggers it on the wire, what changes on screen |
| Layout | What changes per [layout class](../foundations/spacing-and-layout.md#layout-classes) and per platform (web, iOS, iPadOS, macOS) |
| Motion | Each transition and its [motion token](../../../decisions/0023-motion.md) |
| Navigation and focus | In, out, back, focus on arrival |
| Acceptance | The [rubric](../rubric.md) rows that need more than the defaults |

A screen is done when every row of its States table has a fixture and a screenshot in the rubric matrix, and the rubric passes (phase 7 screenshot review, [workflow](../../../workflow.md)).

A screen that is not in the prototype is drawn there first and approved by the owner before its page is written.
