---
app: repo
topic: Sticky header and scroll-linked motion (Portfolio, Position)
checked: 2026-10-19
---

# Sticky header and scroll-linked motion

Constraints: [0023](../../decisions/0023-motion.md), [0022](../../decisions/0022-accessibility.md), [0055](../../decisions/0055-ghost-design-language.md), [ios-app/motion](../ios-app/motion.md), [server/modern-css-and-view-transitions](../server/modern-css-and-view-transitions.md), [web-glass](web-glass.md), [navigation component](../../design/book/components/navigation.md). Minimum OS is 26. Tags: [K] = my knowledge, unverified. Android is out of scope (after the MVP).

## Decisions

Pattern, all clients: the hero ("Your pools earned $X") stays ordinary scroll content. When its figure passes under the bar, the same server-formatted total appears inside the bar, and the wallet tags and filters pin directly below the bar. Pinned order, top to bottom: bar (carries the total) then filter row. Nothing else sticks.

- iPhone: we keep the system `NavigationStack` large title "Portfolio" and its built-in collapse, and add the total as a `ToolbarItem(placement: .principal)`, because HIG says the large title turns into a standard title on scroll and back at the top, so the system owns that motion for free. The prototype's hand-built `.phead` is a prototype shortcut, not the target. [1][2]
- The principal total flips on a `Bool` from `onScrollGeometryChange(for: Bool.self)`: `contentOffset.y + contentInsets.top >= heroFigureMaxY`. Fade `fast` (150 ms) with `standard`, via the `Motion` helper. We do not store a continuous 0...1 progress in `@State`, because Apple warns the geometry changes every frame and a `Bool` only fires on the flip. [3]
- The hero fades through `visualEffect` with no state: `opacity` of the secondary line over the last 60 pt before it meets the bar, figure over the last 40 pt. Opacity and `offset` only, no scale, no blur. `visualEffect` needs no body re-run (iOS 17; effect values are not stored) [4][K]. Under Reduce Motion drop `visualEffect` and keep only the flip, with opacity.
- The filter row is a pinned section header (`LazyVStack(pinnedViews: [.sectionHeaders])`) inside the scroll view, not `safeAreaBar`, because `safeAreaBar` pins at once and would take 52 pt from the hero. Leave the edge effect `.automatic`: HIG names pinned table headers as its use. If a device test shows the chips lose legibility under the bar, switch to `.hard` for `.top`, not `.soft`. [5][6]
- Bar background: system only. No custom `background`, tint or `glassEffect` on the bar, because HIG says limit custom toolbar backgrounds and use `ScrollEdgeEffectStyle` to separate bar and content. One edge-effect style per view. [2][5]
- iPad and Mac, expanded: no large title (toolbar with window title). The list column pins its wallet tags as above; the total goes in the toolbar with the same `Bool` flip, using `navigationSubtitle` or a principal item (see Open questions). Each pane has its own edge effect; keep pane header heights equal. [5][K]
- Accessibility on native: the principal total is `accessibilityHidden` while the hero shows and carries "Earned $683.04" (server string) after, so VoiceOver never reads it twice. At accessibility Dynamic Type sizes we skip the principal total (hero stays scroll content), because the inline bar cannot grow. The flip threshold comes from the measured hero frame, never a constant. [K]
- Web: one sticky stack, `position: sticky; top: 0`, holding the site header and, on Portfolio, the filter row. The total is a second server-rendered copy in the header, `aria-hidden="true"`, hidden at rest by `opacity: 0` in a fixed slot, so layout never shifts (CLS ≤ 0.05). `overflow: clip`, never `hidden`, on every ancestor of the stack. [7][K]
- Web glass: one `backdrop-filter` layer only, on `.sticky-stack::before` (`blur(16px) saturate(180%)`, 12 px under 640 px), with the hairline and tint on the same pseudo-element. The scroll edge is its opacity, 0 to 1 over scroll 0 to 24 px; we never animate blur radius. Filter row sits on that same layer, not its own. [web-glass][8]
- Web scrub: `animation-timeline: scroll(root block)` with px ranges, inside `@supports (animation-timeline: scroll())` and `@media (prefers-reduced-motion: no-preference)`. Starting values, tuned on the prototype: edge `0px 24px`; total in `--condense-start` to `--condense-end` (about hero figure bottom minus bar height, over 48 px): opacity 0 to 1 and `translateY(6px)` to 0; hero secondary line opacity 1 to 0 over the 60 px before. Only `opacity` and `transform`. [8][9][10]
- Web fallback (Firefox stable, Safari before 26): a Stimulus controller with one `IntersectionObserver` on a 1 px sentinel at the hero figure's bottom sets `data-condensed` on the stack; CSS fades the total with `base` (250 ms) and `standard`, opacity and 6 px translate. The controller returns early when `CSS.supports("animation-timeline: scroll()")`, so only one path runs. No scroll listeners. Without JS the total never shows and the hero scrolls normally. [9][11][K]
- Reduced motion, web: under `reduce` no scrub and no translate; the observer path toggles opacity only, with `fast`. Reduce transparency or `@supports not (backdrop-filter)`: stack background `rgba` 0.95 opaque. Forced colours: border instead of blur. [web-glass][12]
- Reduced motion, iOS: no `visualEffect` fade, only the `Bool` flip as opacity under the `Motion` helper's `fast` ease. System bar behaviour adapts on its own. [ios-app/motion][2]
- Focus never hides: `scroll-padding-top` on the scroller equals the stack height (custom property), `scroll-margin-top` on anchors and focusable list rows, because WCAG 2.2 SC 2.4.11 forbids a focused item entirely hidden behind author content. [13]
- Reflow: under `(max-height: 30rem)` (400% zoom of a laptop screen is about 256 CSS px tall) the filter row stops pinning and only the site header sticks, because a 100+ px stack would cover half the viewport (our reading of 1.4.10, [K]).
- We do not use `@container scroll-state(stuck)` / `scrolled` for any of this: Chrome/Edge 133+ only, Firefox and Safari none through Safari 27 and Firefox 158. [14]
- Position: reuse the same primitive, not a new pattern. Native: system large title with the pool name; principal shows the position value after the hero figure passes. Web: same stack, no filter row. Ship after Portfolio proves out.
- Tuning knobs are layout tokens (`condense.start`, `condense.end`, `edge.range`, `hero.fade`), not motion tokens, because they are px ranges of scroll position, not time.

## Changes required elsewhere (flagged, not applied)

- 0023: add a scroll-linked clause: continuous mapping is allowed for this one pattern, `opacity`/`transform` only, linear mapping with no duration. Lint exception for `animation-timeline`, `animation-range`, `animation-duration: 1ms`, and the `linear` keyword in that block, otherwise the literal-value lint fails. Optionally a `scrub` pseudo-token (linear, no time) so the exception is named.
- ios-app/motion line 22 (`scrollTransition` out of MVP): keep `scrollTransition` out (it is for items entering a viewport, not this); allow `onScrollGeometryChange(for: Bool)` and `visualEffect` for this pattern, through the `Motion` wrapper. The SwiftLint ban lists `Animation` constructors, so neither API trips it.
- navigation.md: bar anatomy gains an optional condensed value slot. The Ghost docs (0055) say nothing on headers or scroll, so no conflict found there.

## Facts that constrain us

| Fact | Version | Src |
|---|---|---|
| `scrollEdgeEffectStyle(_:for:)`, `scrollEdgeEffectHidden`, `safeAreaBar` | iOS/iPadOS/macOS 26.0 | [5][6] |
| `safeAreaBar` extends the edge effect of scroll views its inset affects; sosumi rendered the signature with `HorizontalEdge` (a vertical-edge overload exists, check the page) | 26.0 | [6] |
| `onScrollGeometryChange(for:of:action:)`: `T: Equatable`; only the first scroll view in the hierarchy calls back | iOS 18, macOS 15 | [3] |
| `visualEffect`, `scrollTransition` | iOS 17 | [ios-app/motion] |
| `toolbarMinimizeBehavior` hides a bar on scroll (secondary source) | iOS 27 | [15] |
| Scroll-driven animations: Chrome/Edge 115+, Safari 26.0 (compositor thread from 26.4), Firefox behind a flag (Nightly default; stable not default as of Firefox 152 per one blog) | 2026-10 | [9][10][16] |
| `animation-range` names `entry`, `exit`, `cover`, `contain`, `entry-crossing`, `exit-crossing`, or lengths/percent; Chrome's demo animates `transform` over `width` so it stays composited | Chrome docs | [9] |
| `@container scroll-state()` | Chrome 133+, others none | [14] |
| Safari 26.4 fixed overconstrained sticky insets and the IntersectionObserver root rect under overflow clipping | 26.4 | [10] |
| Apps with this look (Stocks, Weather, Robinhood: value moves into the inline bar on scroll) | not checked | [K] |

## Open questions

- Does a pinned section header under the iOS 26 nav bar get the automatic edge effect and glass-correct legibility for 44 pt chips? Test on device; fallback is `safeAreaBar` with the hero reflowing.
- `navigationSubtitle` on iOS 26 and macOS 26 versus a principal item for the condensed total; not read from an official page. `.scrollView` coordinate space (iOS 18) for measuring the hero frame is also unverified.
- Exact px ranges depend on the final hero height and the Dynamic Type default; tune on the prototype, then freeze as tokens.
- Whether `view-timeline` on the hero figure (with `view-timeline-inset` for the 56 px stack) is simpler than `scroll()` px ranges; both need a Safari 26.4 test.
- The ticker controller must update both copies of the total; whether one `data-fees` target list is enough.
- Firefox stable status for scroll-driven animations after 152 was not confirmed; MDN's compat table did not load.
- Apple's HIG scroll-views and toolbars pages were read through a proxy summary; confirm wording on the live pages. WWDC25 session 323 and the WWDC26 SwiftUI session were not read.

## Sources

1. HIG Toolbars (large titles, Liquid Glass, via proxy) — https://developer.apple.com/design/human-interface-guidelines/toolbars
2. HIG Navigation bars — https://developer.apple.com/design/human-interface-guidelines/navigation-bars
3. onScrollGeometryChange(for:of:action:) — https://developer.apple.com/documentation/swiftui/view/onscrollgeometrychange(for:of:action:)
4. visualEffect — https://developer.apple.com/documentation/swiftui/view/visualeffect(_:)
5. HIG Scroll views, scroll edge effects (via proxy) — https://developer.apple.com/design/human-interface-guidelines/scroll-views
6. scrollEdgeEffectStyle(_:for:), safeAreaBar — https://developer.apple.com/documentation/swiftui/view/scrolledgeeffectstyle(_:for:), https://developer.apple.com/documentation/swiftui/view/safeareabar(edge:alignment:spacing:content:)
7. MDN position: sticky (not fetched; ancestor overflow caveat from knowledge) — https://developer.mozilla.org/en-US/docs/Web/CSS/position
8. MDN scroll-driven animations — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
9. Chrome, scroll-driven animations — https://developer.chrome.com/docs/css-ui/scroll-driven-animations
10. WebKit features for Safari 26.4 — https://webkit.org/blog/17862/webkit-features-for-safari-26-4/
11. MDN IntersectionObserver (not fetched) — https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
12. WCAG 2.2 SC 2.3.3 — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
13. WCAG 2.2 SC 2.4.11 Focus Not Obscured — https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
14. caniuse scroll-state queries — https://caniuse.com/mdn-css_at-rules_container_scroll-state_queries_stuck
15. Adaptive SwiftUI toolbars in iOS 27 (secondary) — https://nilcoalescing.com/blog/AdaptiveSwiftUIToolbarsInIOS27
16. Firefox experimental features — https://developer.mozilla.org/Firefox/Experimental_features
