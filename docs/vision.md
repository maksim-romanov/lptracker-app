# Vision

VoidX makes managing your own digital assets and the protocols you use mobile. Today this work lives in a desktop browser: wallet extensions, protocol dashboards, explorers. VoidX puts it on the phone, native, with push and widgets. It is open source. The first product tracks LP positions for any address, on iOS, iPadOS, macOS and the web (Android after the MVP, [0056](decisions/0056-android-after-the-mvp.md)), with alerts when a position leaves or re-enters its range. Acting on positions comes later.

Where to read next: [problem](product/problem.md), [users, jobs and MVP scope](product/prd.md), [use cases](product/use-cases/README.md).

## What must stay true

- The phone is the primary client. Every job works there first; the web and the desktop follow the same data ([ADR 0002](decisions/0002-native-clients-per-platform.md)).
- Adding a chain or protocol is adding an integration. Core never changes; apps need at most minimal, optional changes ([ADR 0006](decisions/0006-integration-unit.md)).
- Every quantity a user sees comes from the chain, computed once on the server; USD prices are labelled estimates ([ADR 0003](decisions/0003-server-owns-protocol-logic.md), [ADR 0007](decisions/0007-data-rule-and-read-block.md)).
- Every client is semantic, accessible (WCAG 2.2 AA) and smooth ([ADR 0022](decisions/0022-accessibility.md), [ADR 0023](decisions/0023-motion.md)).
