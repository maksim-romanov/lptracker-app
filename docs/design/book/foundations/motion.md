# Motion

Values are in [ADR 0023](../../../decisions/0023-motion.md). Components name a motion token and never a duration. Tokens are written without a prefix, as in the ADR (`brisk`, `intent`).

> **Rules.** Only transform and opacity animate on web. Reduced motion follows the ADR: web and Apple crossfade, Android changes instantly. No logic waits for an animation to finish. Live values change in place; only a status change is announced.
