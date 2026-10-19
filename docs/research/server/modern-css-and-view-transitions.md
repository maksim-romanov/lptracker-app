---
app: server
topic: Modern CSS motion and View Transitions
checked: 2026-10-01
---

# Modern CSS motion and View Transitions

Browser facts for the web client under [0018](../../decisions/0018-web-ssr-hotwire.md), [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md). Library and component sources are not repeated: see [web-ui-sources](../agent-tools/web-ui-sources.md). "Now" is Chrome 147, Safari 27.0 (2026-09-17), Firefox 154.

## Decisions

- We use `@view-transition { navigation: auto }` in the shared layout CSS for page-to-page motion, because it is a Chrome 126+, Safari 18.2+ feature with no JS and Firefox just does a plain load. [1][2][3]
- We name only the activated entity in `pageswap` (old page) and `pagereveal` (new page), not every card in CSS, because duplicate names make the transition skip, and `match-element` cannot cross documents. The name is a server-derived slug of the Position, since a position ref (`eip155:8453/…:912345`) is not a valid `<custom-ident>`. [4][5]
- We pick the direction with a view transition type (`forwards`, `backwards`, `up`) set in `pageswap`/`pagereveal` and styled with `:active-view-transition-type()`. Types are Safari 18.2+ and Chrome; Firefox 147 has types for same-document only, which is irrelevant while Firefox gets plain loads. [6][7]
- We do not use Turbo Drive's view-transition support (`<meta name="view-transition">`, `data-turbo-visit-direction`), because those hooks only fire for Drive visits and Drive is off. [8]
- We animate a frame reload only for `<turbo-frame data-vt>`: a small Stimulus controller listens to `turbo:before-frame-render` and wraps the render in `document.startViewTransition()`; the callback does no fetch and no heavy work, because the page is frozen until the callback paints and that window lands in INP. Turbo ships no frame support; the pattern comes from community write-ups. [9][10][11]
- We add `<link rel="expect" blocking="render" href="#main">` where a page has lazy frames above the fold, so the first paint of a cross-document transition is not a half-built page. It protects CLS ≤ 0.05; verify it is ignored harmlessly where unsupported. [1][3]
- We keep `pagereveal` work well under Chrome's 4 s cross-document timeout, after which the page loads plainly. [3]
- We ship Speculation Rules as document rules with `prefetch` + `eagerness: moderate` on in-app links, and never prerender, because a prerendered page opens `/stream` and runs side effects before the user arrives ([0023](../../decisions/0023-motion.md)). Chrome/Edge 109+ only; Safari behind a flag, Firefox none. [12][13]
- We exclude logout and mutating URLs from prefetch rules. [13]
- We write every motion value as a token variable. Springs become `linear()` strings generated at token build time (our `voidx-native` Terrazzo plugin in `packages/design-tokens` from the token's `duration` and `bounce` to a `linear()` list plus the settle duration, [0027](../../decisions/0027-design-tokens.md)), not hand-pasted. `linear()` is Baseline widely available since December 2023; a native `spring()` does not exist (Easing L2 draft has only `linear()`). [14][15]
- We lint literal motion values in CSS with a Biome GritQL plugin (`language css`), not Stylelint: plugins target CSS and match declarations such as `transition: $value`, so a duration, `cubic-bezier()` or `linear()` outside `var(--…)` fails, with `includes` excluding the generated token CSS. No new dependency; Biome marks GritQL as still in progress, so the plugin ships with a canary. [38][39]
- We use `@starting-style` for entry (Baseline 2024) and `popover` / `<dialog>` with `command` / `commandfor` for menus and dialogs where it replaces a Stimulus controller. `command`/`commandfor` is Safari 26.2+; confirm Chrome and Firefox versions before relying on it. [16][17][18]
- We use scroll-driven animations (`animation-timeline: scroll()/view()`) only as enhancement inside `@supports (animation-timeline: scroll())` and `@media (prefers-reduced-motion: no-preference)`, because Firefox needs a flag. Safari 26.4 runs them on the compositor thread. [19][20][21]
- We stagger lists with `calc(sibling-index() * <stagger token>)`, capped, because it replaces inline `--i` styles. Safari 26.2+; Firefox 154 (2026-08-18) per a secondary source. Step and cap come from the `stagger` token ([0023](../../decisions/0023-motion.md)). [17][22]
- We do not use `@container scroll-state()`, `timeline-trigger` (scroll-triggered animations, Chrome 146 only), interest invokers (`interestfor`, Chrome 142 only), `corner-shape` (Chromium 139+ only), or `interpolate-size` / `calc-size()` (Chromium only), because each is unsupported in Safari or Firefox and none carries a required behavior. [23][24][25][26][27]
- We open disclosures (accordions, details) at once and fade their content, never animating height, because `interpolate-size` is Chromium only and height animation runs layout on every frame ([0023](../../decisions/0023-motion.md)). `interpolate-size` may come later as a Chromium-only enhancement. [25]
- We use `appearance: base-select` only as a later enhancement over a plain `<select>`: Chrome 135, Safari 27.0; browsers without it show the native select. Not for M0. [28][29]
- We keep reduced motion as the crossfade branch of ADR 0023: `@view-transition` stays on; under `prefers-reduced-motion: reduce` set entity `view-transition-name: none` and give `::view-transition-old/new(root)` the `--motion-*-reduced` opacity alias. We put scroll-driven rules inside `@media (prefers-reduced-motion: no-preference)`, and view-transition reductions as an override under `reduce`. [1][30]
- We show financial values without a ticker library. Digit changes are an opacity/transform swap on the server-formatted string with `font-variant-numeric: tabular-nums`, done in a Stimulus controller that reads the new text and never reformats. We do not use NumberFlow or an `@property` counter, because both format numbers on the client, a second formatter next to the shared one ([0022](../../decisions/0022-accessibility.md)). Opacity-only changes are not motion under WCAG 2.3.3. [30][31][32]

## Facts that constrain us

| Feature | Chrome/Edge | Safari | Firefox | Note |
|---|---|---|---|---|
| Same-document View Transitions | 111+ | 18+ | 144+ (Baseline newly, 2025-10-14) | types: Firefox 147+ [2][7][33] |
| Cross-document (`@view-transition`) | 126+ | 18.2+ (macOS and iOS) | partial from 144, default off per caniuse | 87.78% global [3][34] |
| `view-transition-class` | 125+ (DevTools 139) | not verified | not verified | [6] |
| `match-element` | shipped 2025 | not verified | not verified | same-document only [5][6] |
| Nested groups | 140+ | not verified | not verified | restores clipping [6] |
| Element-scoped (`element.startViewTransition()`) | 147+ | none seen | none seen | [35] |
| `document.activeViewTransition` | 142+ | 26.2+ | 147+ | [6][17][7] |
| Scroll-driven animations | 115+ (not re-verified) | 26.0+, threaded 26.4 | flag only | [19][20][21] |
| Scroll-triggered (`timeline-trigger`) | 146+ | none | none | [24] |
| `@container scroll-state()` | 133+ | no | no | [23] |
| `interpolate-size` | 129+ | no (through 27) | no (through 158) | [25] |
| Anchor positioning | yes | 26.0+ | 147+ | Interop 2026 carryover [7][20][36] |
| `sibling-index()` | yes | 26.2+ | 154+ | [17][22] |
| `command`/`commandfor` | not verified | 26.2+ | not verified | [17] |
| `interestfor` | 142+ | no | no | [26] |
| `base-select` | 135+ | 27.0 | not shipped | [28][29] |
| `corner-shape` | 139+ | no (through 27) | no (through 155) | [27] |
| Speculation Rules | 109+ | flag | none | [12][13] |
| `linear()` | widely available | widely available | widely available | Dec 2023 [14] |

- Cross-document transitions need same-origin, both pages opted in, and a user-initiated or traverse/push/replace navigation; address-bar navigations never transition. [1][3]
- Duplicate `view-transition-name` on one page rejects `ViewTransition.ready` and skips the transition. [5]
- During a view transition the page is frozen for snapshots; an interaction in that window inflates INP. Long Animation Frames (LoAF) attributes the cost. [11]
- Turbo Drive adds `data-turbo-visit-direction` and honours the `view-transition` meta only on Drive visits; `data-turbo="false"` and `Turbo.session.drive = false` switch Drive off. [8]
- Interop 2026 targets view transitions (same-document focus), scroll-driven animations, anchor positioning and dialogs/popovers. Expect behaviour changes in those four through 2026. [36]
- Safari 27.0 view-transition notes are bug fixes only (sRGB snapshots, stale transform snapshots); no new features. [37]
- Speculation limits in Chrome: `immediate` 50 prefetch/10 prerender; `eager`, `moderate`, `conservative` hold 2 each, FIFO. Chrome skips speculation on Save-Data, low battery, low memory and background tabs. [12]
- `Sec-Purpose: prefetch` marks speculative requests server-side. [13]
- NumberFlow (vanilla web component, 7.7 kB) uses Shadow DOM, needs a raw number plus `Intl` options, supports `renderInnerHTML()` for SSR and `respectMotionPreference`. [31]

## Open questions

- Safari and Firefox versions for `view-transition-class`, `match-element`, nested groups and cross-document types were not read from MDN or WebKit notes.
- Does `<link rel="expect">` have Safari support? Not found in the sources read.
- Chrome and Firefox versions for `command`/`commandfor`, and whether `transition-behavior: allow-discrete` is Baseline, were not checked.
- Firefox 144+ cross-document status: "partial" on caniuse; which part is missing is unknown. Test on a real build.
- Does Turbo Frame render wrapped in `startViewTransition` stay stable with frames lazy-loaded by `src` and with the `reload-frame` stream action? Needs a prototype.
- INP effect of `pagereveal` work on low-end Android was not measured.

## Sources

1. MDN `@view-transition` — https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition
2. MDN View Transition API — https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
3. Chrome: cross-document view transitions — https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
4. MDN `view-transition-name` — https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name
5. MDN `view-transition-name` constraints (same page as 4)
6. Chrome: what's new in view transitions, 2025 — https://developer.chrome.com/blog/view-transitions-in-2025
7. MDN View transition types and Firefox 147 notes — https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using_types, https://developer.mozilla.org/en-US/Firefox/Releases/147
8. Turbo Drive handbook — https://turbo.hotwired.dev/handbook/drive
9. palkan/turbo-view-transitions — https://github.com/palkan/turbo-view-transitions
10. Evil Martians, Turbo View Transitions — https://evilmartians.com/chronicles/the-future-of-full-stack-rails-turbo-view-transitions
11. Corewebvitals, view transitions and INP — https://www.corewebvitals.io/pagespeed/view-transition-web-performance
12. Chrome: prerender pages — https://developer.chrome.com/docs/web-platform/prerender-pages
13. MDN Speculation Rules API — https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API
14. MDN `linear()` — https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear
15. CSS Easing Level 2 draft; linear-easing generator context via Josh Comeau — https://drafts.csswg.org/css-easing/, https://www.joshwcomeau.com/animation/linear-timing-function/
16. MDN `@starting-style` (via [web-ui-sources](../agent-tools/web-ui-sources.md) source 10) — https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style
17. WebKit features for Safari 26.2 — https://webkit.org/blog/17640/webkit-features-for-safari-26-2/
18. Interop 2026 (dialogs and popovers) — https://web.dev/blog/interop-2026
19. MDN scroll-driven animations — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
20. WebKit features in Safari 26.0 — https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
21. WebKit features for Safari 26.4 — https://webkit.org/blog/17862/webkit-features-for-safari-26-4/
22. CSS-Tricks, What's !important #16 (Firefox 154 `sibling-index()`; secondary) — https://css-tricks.com/whats-important-16/
23. MDN `@container` scroll-state, caniuse — https://developer.mozilla.org/en-US/docs/Web/CSS/@container, https://caniuse.com/mdn-css_at-rules_container_scroll-state_queries
24. Chrome 146 — https://developer.chrome.com/blog/new-in-chrome-146
25. MDN and caniuse `interpolate-size` — https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size, https://caniuse.com/mdn-css_properties_interpolate-size
26. MDN interest invokers (Chrome 142 via search result) — https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using_interest_invokers
27. caniuse `corner-shape` — https://caniuse.com/mdn-css_properties_corner-shape
28. Chrome: customizable select — https://developer.chrome.com/blog/a-customizable-select
29. WebKit features for Safari 27.0 — https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
30. WCAG 2.2 SC 2.3.3 Understanding — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
31. NumberFlow vanilla docs — https://number-flow.barvian.me/vanilla/
32. MDN `font-variant-numeric` (not fetched; `tabular-nums` behaviour from NumberFlow docs, source 31)
33. web.dev, same-document View Transitions Baseline — https://web.dev/blog/same-document-view-transitions-are-now-baseline-newly-available
34. caniuse cross-document view transitions — https://caniuse.com/cross-document-view-transitions
35. Chrome 147 element-scoped view transitions — https://developer.chrome.com/blog/element-scoped-view-transitions
36. Interop 2026 — https://web.dev/blog/interop-2026, https://webkit.org/blog/17818/announcing-interop-2026/
37. WebKit, Safari 27 beta notes — https://webkit.org/blog/17967/news-from-wwdc26-webkit-in-safari-27-beta/
38. Biome linter plugins — https://biomejs.dev/linter/plugins/
39. Biome GritQL reference — https://biomejs.dev/reference/gritql/
