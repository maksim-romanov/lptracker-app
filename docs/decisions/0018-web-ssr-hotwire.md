# 0018 · Web is multi-page SSR with Hotwire, updating pieces only

- Status: proposed
- Deciders: Maksim Romanov

## Context

The web client must be server-rendered, accessible and smooth, and update parts of a page without re-rendering it. Live position changes must reach an open page.

## Options

- **HTMX + Alpine**.
- **HTMX + Stimulus**.
- **Hotwire (Turbo Frames and Streams + Stimulus) with Turbo Drive off**.

## Decision

Chosen **Hotwire with Turbo Drive off**, because it gives partial updates, SSE streams and lazy frames in one model while navigation stays a real page load.

- Multi-page SSR on Hono JSX. Navigation is a real page load, so the browser handles focus and screen-reader announcements.
- Each piece that updates is a `<turbo-frame>` with a stable id (position card, scope, watchlist, forms).
- Cached scopes render into the HTML; only cache misses are lazy frames, so fast chains show first and a failed one shows its own error.
- `/stream` (SSE) sends a `reload-frame` Turbo Stream action for one frame; the frame re-fetches its own `src` through the normal GET route, so rendering and authorization have one path.
- No whole-page refresh or morph.
- Stimulus handles small behaviours. No HTMX, no Alpine.
- Links and forms are plain HTML and work without JavaScript.
- Styling is Tailwind 4 on design tokens ([0027](0027-design-tokens.md)).

## Consequences

- One small custom stream action (`reload-frame`) is maintained in-house.
- Page transitions come from cross-document View Transitions ([0023](0023-motion.md)).
- Related: [0022](0022-accessibility.md), [0028](0028-server-stack.md).
