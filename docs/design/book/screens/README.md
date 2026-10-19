# Screens

Each screen is drawn at the compact and expanded layout classes (see Foundations). Medium follows compact with a wider margin, or expanded when there is room for two columns. Regions are listed in reading order, which is also focus order.

> **Scope.** These are the MVP screens: Portfolio, Position, Add wallet, Wallets, Alerts, Alert settings, Settings, Sign in, Plans. Navigation between them is in [navigation-map.html](../visual/prototypes/navigation-map.html). Data names are fields of the position model and the account endpoints.

> **Rule.** Numbers are derived on the server; clients format them with the shared formatter and compute nothing ([AGENTS.md](../../../../AGENTS.md)). No screen below contains arithmetic. A field marked *needs server field* is not in the [position model](../../../concepts/position-model.md) yet and needs an approved spec before it is built.

> **Rule.** Plans and limits are decided by the server. A client reads entitlement keys from `GET /api/v1/me` for display, always submits, and renders the `409 plan-limit` answer ([plans](../../../concepts/plans-and-entitlements.md)).

> *Pending.* all visual treatment. Screens must work with grey tokens and DM Sans.

Layouts of the working screens: [web](../visual/wireframes/app-web.html), [phone](../visual/wireframes/app-phone.html), [iPad](../visual/wireframes/app-ipad.html) ([drawings](../drawings/README.md)).
