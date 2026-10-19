---
app: ios-app
topic: Motion and animation APIs (SwiftUI)
checked: 2026-10-01
---

# Motion and animation APIs

Closes the SwiftUI animation open question in [agent-tools/native-ui-sources.md](../agent-tools/native-ui-sources.md); library choices (Pow, Vortex, Lottie, Rive, Liquid Glass basics) stay there. Constraints: [ADR 0023](../../decisions/0023-motion.md), [0022](../../decisions/0022-accessibility.md), [0027](../../decisions/0027-design-tokens.md), [0019](../../decisions/0019-ios-stack.md). The minimum OS is 26, so every API below is available without `#available`; the OS column only says when it appeared, which matters for sample code found online.

## Decisions

- We store every spring token as `duration` (s) and `bounce` (0 to 0.4, [0027](../../decisions/0027-design-tokens.md)) and build `Animation.spring(duration:bounce:)` from them, because Apple's own presets and the WWDC23 guidance use that pair, and the other two parameterisations derive from it. `brisk` and `gentle` tokens never call the `.snappy`/`.smooth` presets, which are Apple-owned values that can change. [1][2]
- We derive web `linear()` and Android `spring()` from the same two numbers by the formulas in [0027](../../decisions/0027-design-tokens.md); the generator computes them, nobody hand-writes them. [2]
- We ship one `Motion` helper in `DesignSystem` that reads `@Environment(\.accessibilityReduceMotion)` and returns `Animation?` per token: the full token normally, `nil` (instant) for movement and numbers, or the `fast` ease for opacity, when Reduce Motion is on. `Motion` takes the reduce flag as an input, so a Swift Testing snapshot covers the reduced branch; XCUITest cannot turn on Reduce Motion ([native-ui-tests](../repo/native-ui-tests.md)). Views call `withAnimation(motion.animation(.brisk))` and `.animation(motion.animation(.base), value:)`; nothing else passes an `Animation`. A SwiftLint regex bans `.ease(In|Out|InOut)?(`, `.spring(`, `.interpolatingSpring(`, `.interactiveSpring(`, `.smooth`, `.snappy`, `.bouncy`, `.linear(` and `.timingCurve(` outside `Generated/` and `DesignSystem/Motion.swift`. [3][0023]
- We replace movement on any axis with `transition(.opacity)` when `accessibilityReduceMotion` is on, chosen in the view, because `Motion` returns only an `Animation?`. Following HIG: no zoom, scale or blur, and reduced spring values have bounce 0. *Convention*, checked in code review ([0023](../../decisions/0023-motion.md)). [21]
- We animate financial numbers with `Text(formatted).monospacedDigit().contentTransition(.numericText(value: serverValue))` under a token animation. The visible string stays the server-derived, locale-formatted one; `value:` is only the direction hint, so it may be a `Double` of the display value, never used for arithmetic or shown ([0003](../../decisions/0003-server-owns-protocol-logic.md)). With Reduce Motion the helper returns `nil`, so the number changes instantly. [5]
- We use `navigationTransition(.zoom(sourceID:in:))` with `matchedTransitionSource(id:in:)` for position-list to position-detail only, with the source id equal to the Position id and one `@Namespace` per list. Other pushes keep the system transition. The modifier goes on the destination root view, outside any stack container. [6]
- We do not use `matchedGeometryEffect` across navigation; it stays for in-screen morphs (selected chip, segmented indicator). Navigation uses zoom, and glass morphs use `glassEffectID` inside one `GlassEffectContainer`. [7][8]
- We prefer `symbolEffect` (`.bounce`, `.pulse`, `.contentTransition(.symbolEffect(.replace))`, iOS 26 `.drawOn`/`.drawOff`) for icon feedback, driven by `value:` triggers, because they respect the system and cost no timing tokens. Draw effects need SF Symbols 7 symbols that carry draw layers; non-draw symbols fall back to a scale/fade, so check each icon in the SF Symbols app. [9]
- We use `sensoryFeedback(_:trigger:)` on confirmations (copy address, add to watchlist, pull-to-refresh done) with `.success`, `.selection` or `.impact(weight:)`, and never as the only signal, per HIG. It is not a token. [10][11]
- We keep `PhaseAnimator`, `KeyframeAnimator`, `TextRenderer`, `MeshGradient`, `colorEffect`/`layerEffect` and `scrollTransition` out of the MVP screens. (Updated 2026-10-19) The sticky header may use `onScrollGeometryChange(for: Bool)` and an opacity-only `visualEffect` through the `Motion` wrapper ([sticky header](../repo/sticky-header-motion.md)). Each is allowed later only through a `Motion` wrapper that takes token durations and honours Reduce Motion; shaders and `MeshGradient` also need a perf check on the oldest supported device. [12][13][14]
- The settling-time mapping test is in [0027](../../decisions/0027-design-tokens.md); `Spring.settlingDuration` gives the Swift value. [2]
- We measure motion with `XCTHitchMetric`-style hitch metrics and `XCTOSSignpostMetric.navigationTransitionMetric` on a physical device, and profile with the Xcode 26 SwiftUI instrument plus the redesigned Animation Hitches instrument; view bodies stay cheap (no formatters, no `NumberFormatter` in `body`) and read per-item Observable state. [15][16][17]

## Facts that constrain us

| API | Appeared | Note |
|---|---|---|
| `Spring`, `.smooth/.snappy/.bouncy` presets, `Spring(duration:bounce:)` | iOS 17 | Spring math is queryable (`settlingDuration`, position, velocity) [2] |
| `withAnimation(_:completionCriteria:_:completion:)` | iOS 17 | `.logicallyComplete` default; `.removed` waits for removal; fires once, immediately if nothing animates [18] |
| `PhaseAnimator`, `KeyframeAnimator`, `CustomAnimation`, `scrollTransition`, `visualEffect`, `TextRenderer`, `layerEffect`/`colorEffect`, `sensoryFeedback` | iOS 17 | `layerEffect` shaders cannot sample UIKit/AppKit-backed views (placeholder) [12][14][10] |
| `contentTransition(.numericText(value:))` | iOS 17 | `.numericText()` and `countsDown:` also exist; no effect without an enclosing animation [5][19] |
| `matchedTransitionSource`, `navigationTransition(.zoom)`, `MeshGradient` | iOS 18, macOS 15 | Works in `NavigationStack` and sheets [6][13] |
| `symbolEffect` `.drawOn`/`.drawOff` | iOS 26 (SF Symbols 7) | Playback `.byLayer` (default) or `.individually` [9] |
| `glassEffectID`, `GlassEffectTransition` (`identity`, `matchedGeometry`, `materialize`) | iOS 26 | Morph only between glass views in the same container [8] |
| `.navigationTransition(.crossFade)`, `AnyNavigationTransition` | iOS 27 | Cross-fade for sheets/full-screen covers without a source; custom `NavigationTransition` types still unsupported [20] |
| `accessibilityReduceMotion` | iOS 13 | Plus `accessibilityPlayAnimatedImages`, `accessibilityDimFlashingLights` [3] |

- Springs keep velocity when interrupted, so gesture-driven and re-triggered animations stay continuous; timing curves do not. Prefer springs for anything the user can interrupt (sheets, drags), `ease` tokens for fades. [1]
- Reduce Motion does not rewrite our `Animation` values. Our `Motion` helper is the only place it is applied; system transitions adapt on their own, but how zoom falls back is not in Apple's pages (see Open questions). [3]
- Hitch measurement: `XCTOSSignpostMetric` is iOS 13+, includes `navigationTransitionMetric`; `scrollDecelerationMetric` is deprecated. The Xcode 26 SwiftUI instrument shows long view body, long representable and other long updates (orange/red), with a Cause & Effect Graph for why a body ran. [15][16][17]
- Layout-thrash rules from the sessions: avoid rapidly changing environment values (timers, geometry), keep bodies free of formatter creation, split app-wide Observable state per item. Animate `opacity`, `offset`, `scaleEffect`, `visualEffect` rather than frame/size, which re-lay-out. [17]
- Number animation reads the old and new values to choose roll direction, so every update that should animate must change the `value:` argument. [5]

## Conflicts with the ADRs (flagged, not resolved)

- ADR 0023 gates releases on hitch and navigation metrics; ADR 0048 keeps them off PRs. Consistent; recorded so nobody adds them to PR CI.

## Open questions

- Apple's reference pages give no default numbers for `.smooth`, `.snappy`, `.bouncy`; commonly cited values (0.5 s with bounce 0, 0.15, 0.3) were not confirmed. Measure `settlingDuration` on a device before using them in docs.
- How zoom navigation behaves under Reduce Motion: community posts say it becomes a push; no Apple page confirms. Test on a device and record it.
- The WWDC26 claims of layer shaders, timeline-driven animation and alignment guides in transitions come from one blog that looks unreliable; verify against Apple's iOS 27 release notes before relying on them. The sosumi pages for `XCTHitchMetric` and the `drawOn` symbol effect returned no content, so their OS versions are unconfirmed.
- Whether `navigationTransitionMetric` fires for SwiftUI zoom transitions in a `NavigationStack` on macOS, and what baseline noise looks like on a physical device.
- Whether `numericText` stays smooth for 18-digit decimal strings and mixed units, or whether the display must split into integer and fraction parts.
- Whether `Motion` should live in `DesignSystem` as an `@Observable` or an environment key; spec decision.

## Sources

1. WWDC23 Animate with springs — https://developer.apple.com/videos/play/wwdc2023/10158/
2. Spring — https://developer.apple.com/documentation/swiftui/spring
3. accessibilityReduceMotion — https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion
4. HIG Motion — https://developer.apple.com/design/human-interface-guidelines/motion
5. numericText(value:) — https://developer.apple.com/documentation/swiftui/contenttransition/numerictext(value:)
6. navigationTransition(_:) — https://developer.apple.com/documentation/swiftui/view/navigationtransition(_:)
7. Applying Liquid Glass to custom views — https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views
8. GlassEffectTransition — https://developer.apple.com/documentation/swiftui/glasseffecttransition
9. WWDC25 What's new in SF Symbols 7 — https://developer.apple.com/videos/play/wwdc2025/337/
10. sensoryFeedback(_:trigger:) — https://developer.apple.com/documentation/swiftui/view/sensoryfeedback(_:trigger:)
11. HIG Playing haptics — https://developer.apple.com/design/human-interface-guidelines/playing-haptics
12. TextRenderer — https://developer.apple.com/documentation/swiftui/textrenderer
13. MeshGradient — https://developer.apple.com/documentation/swiftui/meshgradient
14. layerEffect — https://developer.apple.com/documentation/swiftui/view/layereffect(_:maxsampleoffset:isenabled:)
15. XCTOSSignpostMetric — https://developer.apple.com/documentation/xctest/xctossignpostmetric
16. Xcode 26 release notes — https://developer.apple.com/documentation/xcode-release-notes/xcode-26-release-notes
17. WWDC25 Optimize SwiftUI performance with Instruments — https://developer.apple.com/videos/play/wwdc2025/306/
18. withAnimation(_:completionCriteria:_:completion:) — https://developer.apple.com/documentation/swiftui/withanimation(_:completioncriteria:_:completion:)
19. contentTransition(_:) — https://developer.apple.com/documentation/swiftui/view/contenttransition(_:)
20. Navigation transition updates in SwiftUI on iOS 27 (article) — https://nilcoalescing.com/blog/SwiftUINavigationTransitionUpdatesIniOS27/
21. HIG Accessibility, Cognitive (Reduce Motion) — https://developer.apple.com/design/human-interface-guidelines/accessibility
- [0003] [0023] [0027]: ADRs in `docs/decisions/`
