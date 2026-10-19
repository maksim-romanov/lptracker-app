# Feedback

## Banner

*feedback, inline*

- **Anatomy.** Status mark, one or two lines, optional action.
- **Variants.** `info warning error`. Out-of-range and failed-chain use warning.
- **Size.** Compact one-line version on phone (visible height 40, *design-pending*). Never covers content; it pushes it down.
- **Rules.** The action names what it retries (for example "Retry Arbitrum").
- **A11y.** Role status when it appears after load; static banners are read in order.

## Empty state

*feedback, first visit and no results*

- **Anatomy.** Outline of the real content (dashed outline card or bar), one line of what this is, one primary action.
- **Variants.** `first-visit no-positions no-alerts no-wallet-selected error`
- **Rules.** Says what to do next. No illustration in the base. The first-visit state shows example data labelled as an example.

## Skeleton

*feedback, loading*

- **Rules.** Same size and position as the content it replaces, so nothing jumps. Pulse is a slow opacity change; none under reduced motion.
- **Scopes.** Per scope: a list can show finished chains and skeletons for chains still answering.
- **A11y.** The region is aria-busy; the screen title is already present.

## Toast

*feedback, transient*

- **Rules.** Confirms an action already done, a dwell time of 4 seconds (*design-pending*, no motion token yet), never the only place an error appears. No action that cannot also be reached elsewhere.
- **A11y.** Role status. Does not take focus.
