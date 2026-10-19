# 0023 · Smooth, animated UI from shared motion tokens

- Status: proposed
- Deciders: Maksim Romanov

## Context

The product must feel smooth and animated on every client while honouring reduced-motion settings. Agents invent inconsistent durations unless values are shared and checked.

## Options

- **Per-platform animation choices**.
- **Shared motion tokens with platform techniques and CI budgets**.

## Decision

Chosen **shared motion tokens with CI budgets**.

- Tokens (DTCG, format in [0027](0027-design-tokens.md)); each has a value in the resolver's `reduced` context, which a test requires. Names never match a platform preset (SwiftUI `.snappy`, `.smooth`, `.bouncy`), so an agent cannot confuse the two.

  | Token | Value | Use |
  |---|---|---|
  | `instant`, `fast`, `base`, `slow` | 0, 150, 250, 400 ms | durations |
  | `standard`, `emphasized`, `exit` | cubic-bezier easings | easings |
  | `brisk` | spring 0.22 s, bounce 0.4 | presses, small elements (Material 3 expressive fast spatial) |
  | `gentle` | spring 0.44 s, bounce 0.2 | transitions, sheets (Material 3 expressive slow spatial) |
  | `flip` | spring 0.63 s, bounce 0.375 | Drawer on web Cards, provisional until its values are fixed ([0055](0055-ghost-design-language.md)) |
  | `intent` | 110 ms | hover delay before the owed-fees hint |
  | `stagger` | 30 ms per item, at most 8 | lists; 0 when reduced |
  | `scrub` | scroll position, no duration | the sticky header only: the hero total condensing into the bar; opacity and transform only; reduced: a `fast` opacity fade at the threshold ([research](../research/repo/sticky-header-motion.md)) |

- Web: cross-document View Transitions between pages with a per-entity `view-transition-name`; Speculation Rules prefetch with `eagerness: moderate` on in-app links, no prerender, because a prerendered page would open `/stream` before anyone sees it; view transitions on frame reloads only where `data-vt` is set; springs as generated `linear()` curves; skeletons sized like the content; only `transform` and `opacity` animate, except the size of `::view-transition-group` snapshots, which are composited images, not layout; disclosures open at once and fade their content, never animating height (*convention*).
- iOS: zoom navigation transitions, `contentTransition(.numericText(value:))` with monospaced digits, the value only giving the direction, sensory feedback on confirmations, one `Motion` helper that honours Reduce Motion.
- Android: shared elements across Navigation 3 scenes, predictive back transitions, `LocalReducedMotion` from `ValueAnimator.areAnimatorsEnabled()`, baseline profiles.
- Position details: Drawer, Spotlight and the bottom sheet are defined in [0055](0055-ghost-design-language.md); Drawer uses `flip` (a legacy name), the sheet `gentle`. Under reduced motion each becomes a crossfade (instant on Android).
- Reduced motion follows each platform's signal. Opacity changes are not motion under WCAG 2.3.3, and reduced spring values have bounce 0.

| Client | Signal | Reduced behaviour |
|---|---|---|
| Web | `prefers-reduced-motion: reduce` | Spatial motion becomes a short crossfade; entity `view-transition-name: none` |
| iOS | `accessibilityReduceMotion` | Movement on any axis becomes a fade (`transition(.opacity)`); no zoom, scale or blur (*convention*) |
| Android | animators disabled ("Remove animations" or Battery Saver) | Instant change; Compose already snaps, and we never override `MotionDurationScale` (*convention*) |

`LocalReducedMotion` on Android only stops decorative loops, Lottie and autoplay. No logic waits for an animation to end.

| Client | Budget | Runs |
|---|---|---|
| Web | Lighthouse CI: CLS ≤ 0.05, LCP ≤ 2.0 s, TBT ≤ 200 ms; INP ≤ 200 ms measured with `web-vitals` in Playwright ([research](../research/server/agent-verification.md)) | every PR |
| iOS | XCTest hitch and navigation-transition metrics against committed baselines | `bun run bench:ios` (*planned*) on the owner's Mac with a connected device; gates releases |
| Android | Macrobenchmark frame timing and startup within ±10% of baseline | `bun run bench:android` (*planned*) on the owner's Mac with a connected device; gates releases |

PR gates on native apps: [0048](0048-e2e-testing.md). Timing metrics are not PR gates, because simulators and emulators make them noisy, and Macrobenchmark does not run on an emulator. Cross-document View Transitions are progressive enhancement: a browser without them gets plain page loads.

## Consequences

- A lint fails on literal durations, easings or springs outside generated files.
- Thresholds are never lowered to make a PR pass.
- Related: [0018](0018-web-ssr-hotwire.md), [0019](0019-ios-stack.md), [0020](0020-android-stack.md), [0022](0022-accessibility.md).
