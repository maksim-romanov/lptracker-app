# Motion

Values are in [ADR 0023](../../../decisions/0023-motion.md). Components name a motion token and never a duration. Tokens are written without a prefix, as in the ADR (`brisk`, `intent`).

> **Rules.** Only transform and opacity animate on web. Reduced motion follows the ADR: web and Apple crossfade, Android changes instantly. No logic waits for an animation to finish. Live values change in place; only a status change is announced.

## UI kit v0

The M0 UI kit animates only these. Each transition names its token and its reduced value ([ADR 0023](../../../decisions/0023-motion.md)).

| Element | Motion | Token | Reduced |
|---|---|---|---|
| Status chip, status change | The marker morphs between dot and diamond (corner radius and rotation); the colours swap | `brisk` | `instant` |
| Position card and row, press | Scale down while pressed | `brisk` | None |
| Range bar | None: the knob is placed at `barPosition` | — | — |

No tilt on the chip or the card in v0. Hover, Drawer, Spotlight, the sheet and the knob spring arrive with the screens that use them.
