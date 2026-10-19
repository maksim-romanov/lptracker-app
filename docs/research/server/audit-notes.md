---
app: server
topic: Design audit findings for the server and web
checked: 2026-09-30
---

# Design audit findings: server and web

Input for the server's research gate. Findings from the backend, SSR frontend, SRE and security audits of the design docs; re-verify each fact before building.

## Decisions

- Render scopes whose snapshot is cached straight into the page HTML; only cache misses become lazy `<turbo-frame>`s. This fixes the no-JS path, layout shift, skeleton flashes on return and the HTML → JS → fetch waterfall at once. [2]
- Without JavaScript a lazy frame never loads: add a `<noscript>` link to `/portfolio?sync=1`, which renders every scope within the deadline. [2]
- Every frame id has its own GET route, including `/portfolio/position/<ref>`, because `reload-frame` re-fetches `src`. A frame rendered in the page keeps its URL in `data-src` so Turbo does not fetch it again on connect; the stream action sets `src`. [1][2]
- Frame responses always return the frame, even when shed or failed, with a retry state; frame routes read the cache only. [2]
- Batch reloads on the client: at most one reload per frame per animation frame; reload the whole scope frame when more than 5 positions change in one event burst. [2]
- One Stimulus controller keeps focus across frame reloads: on `turbo:before-frame-render` save the focused element's id, restore it after render, compare `data-announce` attributes and send a throttled message to one polite live region outside all frames. [2]
- Forms: hidden idempotency token, Hono `csrf()` (Origin / `Sec-Fetch-Site`), `__Host-` session cookie with `SameSite=Lax`, 303 after POST, on 422 re-render with an error summary that receives focus. See ADR 0038. [2][3]
- Guest watchlist cookie: signed, capped at 25 CAIP-10 addresses, versioned shape, key rotation. [2]
- SSE: `Cache-Control: no-cache, no-transform`, `X-Accel-Buffering: no`, no compression, HTTP/2 at the edge, a `since` cursor in the page for resync, close on `pagehide` and reopen on `pageshow` so the back/forward cache works. [2]
- Motion: cross-document View Transitions only in Chromium and Safari 18.2+; Firefox gets plain page loads. Add `<link rel="expect" blocking="render">` for the hero element and give elements with `view-transition-name` a size independent of lazy content. Frame transitions need our own `startViewTransition` inside `turbo:before-frame-render`; skip it when one is already running. [2][4]
- We do not prerender; Speculation Rules prefetch only ([ADR 0023](../../decisions/0023-motion.md)). [5]
- Asset pipeline: Tailwind 4 `@source` covering the JSX and design tokens, no dynamic class names; `Bun.build` with an explicit Stimulus controller index; hashed files plus a manifest; a CSP nonce for Turbo's `csp-nonce`, the Speculation Rules script and inline scripts. [2]
- Tooling: html-validate element definitions for `turbo-frame` and `turbo-stream`; Hono JSX `IntrinsicElements` typings; the Biome canary covers `class` and `for` (Hono JSX uses them instead of `className` and `htmlFor`). [2]
- Tests: a test-only publish endpoint so Playwright can trigger SSE deterministically; WebKit and Firefox projects; a `reducedMotion` run; an assertion that focus survives a frame reload. [2]
- Idempotency keys only on account `/api/v1` mutations; auth ceremonies excluded; never replay responses containing tokens. [3]
- `/healthz/deps` is authenticated; RPC URLs with embedded keys are redacted in logs and errors. [3]

## Facts that constrain us

- Turbo 8 supports custom `StreamActions` and `frame.reload()`; Turbo does not restore focus after a frame render and does not announce navigation (hotwired/turbo#774). [1]
- Cross-document View Transitions: Chromium 126+, Safari 18.2+; not in stable Firefox. Speculation Rules are on by default only in Chromium. [4][5]
- Browsers allow six HTTP/1.1 connections per origin; several tabs plus lazy frames starve without HTTP/2. [2]
- A signed cookie holds about 4 KB; ~57 characters per CAIP-10 address. [2]

## Open questions

- Whether a frame with server-rendered content plus `src` refetches on connect in the current Turbo version; verify in Turbo source before relying on `data-src`.

## Sources

1. Turbo handbook, Streams and Frames — https://turbo.hotwired.dev/handbook/streams
2. VoidX SSR frontend design audit, 2026-09-30 (internal review of docs/)
3. VoidX security and backend design audits, 2026-09-30 (internal review of docs/)
4. Cross-document view transitions — https://css-tricks.com/cross-document-view-transitions-part-1/
5. Prerender pages in Chrome — https://developer.chrome.com/docs/web-platform/prerender-pages
