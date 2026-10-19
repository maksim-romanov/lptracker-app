---
app: repo
topic: Lively, modern UI techniques across web, iOS and Android
checked: 2026-10-03
---

# Lively, modern UI techniques

Where this file contradicts [0055](../../decisions/0055-ghost-design-language.md) or [0023](../../decisions/0023-motion.md), they win. How to make VoidX feel crafted without breaking [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md) or [0027](../../decisions/0027-design-tokens.md). Builds on [design direction](design-direction.md), [libraries.dev audit](../agent-tools/libraries-dev-audit.md), [web motion](../server/modern-css-and-view-transitions.md), [iOS motion](../ios-app/motion.md), [Android motion](../android-app/motion.md). Nothing here is decided; the signature set is a proposal for the owner.

## Decisions

- We spend liveliness on data change (number, range bar, status, alert) and on a few one-shot moments, not on ambient decoration, because dense numeric UIs pay for every moving pixel in attention and battery, and NN/g says to avoid simultaneous animations and habituation. [1][2]
- We cap ambient (looping) motion at one element per screen and one-shots at three concurrent, a proposal with no source number, to be enforced in review and by the attention-budget table below, because WCAG 2.2.2 and HIG both treat extra motion as a cost. [2][3][4]
- We add a pause control for live updates ("Pause live updates", also stops tick animation), because WCAG 2.2.2 requires a pause/stop/hide or frequency control for auto-updating content that starts automatically and sits beside other content, with no 5-second threshold; 0022 only says "not announced". [3]
- We write no custom shaders in the MVP. iOS `colorEffect`/`layerEffect` (17+) and Android AGSL `RuntimeShader` (API 33+; minSdk is 26) are possible later behind `Motion`/`LocalReducedMotion` and a device perf check, because every signature element below is drawable with transform, opacity, `Canvas` or a pre-rendered gradient. [5][6][7]
- We do not use WebGL, WebGPU, `paint()` or animated `@property` gradients on the web, because none paints without JS or stays on the compositor: WebGPU reached Baseline in 2026 per secondary sources but needs JS and a GPU context, `paint()` is Chromium-only in production, and animating a registered property repaints each frame, against 0023's transform/opacity rule. [8][9][10]
- We make glow a pre-blurred static layer whose `opacity` animates (web), a cached blur drawn once (iOS `Canvas`/shadow layer) and `graphicsLayer { alpha }` (Android), never an animated `filter: blur()`, because blur on every frame is the repaint cost the audit rejected in border-beam and gooey. [10][11]
- We never animate colour for change feedback on the web (`background-color` is a paint property). A highlight is an overlay pseudo-element whose `opacity` rises at `fast` and falls at `slow`; the direction is also carried by a sign and arrow glyph, because 1.4.1 forbids colour-only cues and 0023 allows only transform/opacity. [10][12]
- We adopt no cross-platform animation runtime (Rive, dotLottie) for signature elements. Both can run one asset on web, iOS and Android (Rive via data binding and state machines; dotLottie via the shared Rust core `dotlottie-rs` + ThorVG), but timings and easings live inside the asset, so the 0023 token lint and per-token reduced values cannot reach them; Rive's web wasm is about 200 KB gzip (secondary); and neither renders without JS. They stay limited to illustrations as in [native UI sources](../agent-tools/native-ui-sources.md). [13][14][15][16]
- If an asset ships anyway, we require a reduced-motion path inside it: Rive does not apply reduced motion itself, and the file must read a bound `prefersReducedMotion` boolean; Lottie iOS plays a reduced-motion marker. [13][14]
- We build the live-number tick from the server string: per-character roll only for characters that changed, `contentTransition(.numericText(value:))` on iOS, per-digit `AnimatedContent` on Android, opacity/transform swap in a Stimulus controller on web (already settled in the motion files). Robinhood's long-standing pattern is the same shape: in-place digit animation plus a brief colour cue, never a cross-fade of two whole amounts. [17][18]
- We coalesce SSE updates before animating: one animated change per number per second at most (proposal, to be measured); later values in that window apply instantly, because HIG asks that frequently repeating UI carry minimal motion. [2]
- We use haptics only for user-initiated confirmations (iOS `sensoryFeedback` `.success`/`.selection`; Android Compose `HapticFeedbackType.Confirm`/`Reject` from API 30, `ToggleOn`/`SegmentTick` need API 34 so gate by version), never for a live data tick or an incoming alert, because HIG says haptics supplement and must never be the only signal. [2][19]
- We pause all ambient work when offscreen or the app is backgrounded; on Low Power Mode (iOS) and Battery Saver (Android `PowerManager.isPowerSaveMode()`, API 21) we also stop ambient loops and one-shot glows, keeping state changes instant. Android animators already switch off under Battery Saver per the platform doc cited in [Android motion](../android-app/motion.md). [20][21]
- We use Material 3 Expressive shape morphing only for the status chip (in-range circle, out-of-range rounded square) and implement the morph pair ourselves on iOS and web, because the morph API is Android-only and `LoadingIndicator` needs an experimental opt-in or a 1.5 alpha (owner approval per AGENTS.md). Our sync orb replaces `LoadingIndicator`. [22][23]

## Signature elements (proposal)

Shared rule: each element has a token set, a reduced-motion value and a stop condition. New tokens needed beyond 0023: `duration.ambient` (3000-6000 ms, outside the current 0-400 ms scale), `duration.hold` (flash dwell), `opacity.glow` and a `motion.live.paused` flag.

| Element | Web (SSR, Stimulus) | iOS | Android | Reduced motion | Cost |
|---|---|---|---|---|---|
| 1 Number tick | per-character swap, `opacity` + `translateY`, `tabular-nums`; arrow + sign glyph | `numericText` + `monospacedDigit` under `brisk` | per-digit `AnimatedContent`, `tnum`, `brisk` | instant text change | low; coalesced to 1 per s |
| 2 Change flash | overlay pseudo-element `opacity` fast in, slow out | overlay `Rectangle` opacity | `graphicsLayer { alpha }` | none (opacity is not motion, keep at `fast`, no hold) | low |
| 3 Range-bar glide | marker `translateX`, segments `scaleX`, `gentle`; server SVG | marker `offset` via `Canvas`, `gentle` | `drawBehind` offset, `gentle` | marker jumps; label updates | low |
| 4 Range-bar breathing (calm idle) | marker halo `opacity` 0.6 to 1 over `duration.ambient`, in-range detail screen only | same, `TimelineView` paused offscreen | `rememberInfiniteTransition` in `graphicsLayer` | static halo | low; counts against the one-ambient cap |
| 5 Status morph | two SVG shapes crossfade at `base`, word + icon change | shape crossfade + `symbolEffect(.replace)` | `Morph` from `graphics-shapes`, `gentle` | crossfade only (iOS), instant (Android) | low |
| 6 Sync orb | optional `thinking-orbs/engine` Stimulus port, offscreen pause, `aria-hidden`, `aria-busy` on frame | `Canvas` + `TimelineView` | `Canvas` + `withFrameNanos` | one static frame with visible "Syncing" text | medium; run at most 5 s, then static "still syncing" |
| 7 Alert glow | one-shot ring `opacity` pulse, 2 cycles then steady badge | `symbolEffect(.pulse)` + glow layer | alpha pulse, 2 cycles | steady badge, no pulse | low |
| 8 Refresh beam | token-coloured `conic-gradient` masked to border, `transform: rotate`, one pass | `BorderBeamKit` as reference, own `Canvas` | own `Canvas` stroke | not rendered | medium; one-shot only, never looped |

Position details use Flip, Drawer and Spotlight ([0023](../../decisions/0023-motion.md)); navigation to a detail page keeps zoom or shared-element transitions. Pressed state: scale 0.97 at `brisk` on cards, none in reduced mode.

## Attention budget and pause rules

| Rule | Value |
|---|---|
| Ambient loops per screen | 1 (element 4 or 6); list screens run none |
| Concurrent one-shots | 3; further ones apply instantly |
| Looping lifetime | orb at most 5 s (2.2.2 threshold); breathing only on detail screens with a Pause control |
| Pause on | offscreen (`IntersectionObserver`, `onDisappear`, Compose lifecycle), `document.hidden`, app background, Low Power Mode, Battery Saver, reduced motion, "Pause live updates" |
| Web | CLS ≤ 0.05, INP ≤ 200 ms (0023); effects add no layout; frames animate compositor properties only |
| iOS | no hitch regression in `XCTHitchMetric` baselines; `Canvas` bodies hold no formatters |
| Android | Macrobenchmark `frameOverrunMs` P90/P99 within ±10% (0023); no shader below API 33 |

## Facts that constrain us

- `colorEffect`: iOS 17+, macOS 14+; Metal `[[stitchable]]` function; UIKit/AppKit-backed views render a placeholder. `MeshGradient` iOS 18+. Minimum OS is 26, so all are available. [5][iOS motion]
- AGSL: Android 13 (API 33)+; the effect is merged into the GPU fragment shader; minSdk 26 means a non-shader fallback is mandatory. [6][7]
- Compose haptics: `Confirm`, `Reject`, `GestureStart/End` since API 30; toggle, segment tick and threshold types API 34 (secondary). [19]
- `prefers-reduced-transparency`: not Baseline; do not depend on it for glass or glow. Reduce Transparency on Apple applies to materials; VoidX keeps content on opaque tokens ([design direction](design-direction.md)). [24]
- WCAG 2.2.2: pause/stop/hide for auto-starting motion over 5 s beside other content, and for auto-updating information with no time threshold. [3]
- Web compositor-only properties: `transform`, `opacity`; `will-change` only for proven issues. [10]
- WebGPU: Baseline January 2026 (Chrome 113+, Safari 26+, Firefox 141 Windows / 145 macOS ARM) per secondary sources; Firefox Linux and Android in progress. [8]
- Rive: editor free, paid plans gate splash removal and team features; `.riv` export on all tiers; runtimes MIT per [native UI sources](../agent-tools/native-ui-sources.md) (not re-read here). Rive docs say to pause offscreen and use one-shot idles. [13][15][25]
- dotLottie: ThorVG renders on WebGL and WebGPU backends, 1.0 per LottieFiles; shared Rust core for web, iOS, Android. [16]
- Material 3 1.4.0 is stable; `MaterialShapes` and `LoadingIndicator` stability is contradictory in what was read (stable in 1.4.0 per an article, promoted then reverted in 1.5.0-alpha19 per the release page). [22][Android motion]

## Open questions

- Is `LoadingIndicator` or `MaterialShapes` opt-in free in `material3` 1.4.0? Check the `@ExperimentalMaterial3ExpressiveApi` annotation in source.
- `androidx.graphics:graphics-shapes` `Morph` version and stability: not read in this pass.
- iOS `ProcessInfo.isLowPowerModeEnabled` and `NSProcessInfoPowerStateDidChange`: the Apple page returned no body; confirm availability. The web has no Low Power Mode signal read in these sources, so web loops rely on compositor throttling and offscreen pause.
- Does 2.2.2 treat a live price tick as "essential"? Unsettled; the pause control is the safe route. Does the pause control also need to stop SSE or only animation?
- Real cost of one `Canvas` orb on a low-end Android phone and of 20 range bars with halos: unmeasured.
- Not read: Apple Stocks, Copilot Money, Revolut, Family and Rainbow motion internals, WWDC "Design with motion", NN/g duration numbers, Material motion guidance on data UIs; Robinhood facts are from a secondary design-system summary and its engineering blog title only.
- Owner decision: [design direction](design-direction.md) recommends calm Direction A; this file's set fits A plus one signature detail, not B's continuous beam or orb.

## Sources

1. NN/g, Animation purpose in UX — https://www.nngroup.com/articles/animation-purpose-ux/
2. Apple HIG, Motion (via sosumi) — https://sosumi.ai/design/human-interface-guidelines/motion
3. WCAG 2.2, Pause, Stop, Hide — https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html
4. WCAG 2.2, Animation from Interactions — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
5. SwiftUI `colorEffect` (via sosumi) — https://sosumi.ai/documentation/swiftui/view/coloreffect(_:isenabled:)
6. AGSL — https://developer.android.com/develop/ui/views/graphics/agsl
7. Compose graphics with RuntimeShader (search summary, not fetched) — https://developer.android.com/develop/ui/compose/graphics/draw/shaders
8. WebGPU support (secondary) — https://web.dev/blog/webgpu-supported-major-browsers, https://www.utsubo.com/blog/frontier-web-apis-2026-production-ready
9. CSS Paint API status (secondary) — https://web.dev/articles/houdini-how
10. web.dev, High-performance CSS animations — https://web.dev/articles/animations-guide
11. libraries.dev audit, in repo — ../agent-tools/libraries-dev-audit.md
12. WCAG 2.2, Use of Color — https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
13. Rive, Reduced motion — https://rive.app/docs/editor/accessibility/reduced-motion
14. Lottie iOS `ReducedMotionOption`, in repo — ../agent-tools/native-ui-sources.md
15. Rive, Best practices — https://rive.app/docs/getting-started/best-practices ; pricing — https://rive.app/pricing
16. LottieFiles, dotLottie runtimes — https://lottiefiles.com/blog/dotlottie/how-dotlottie-runtimes-solve-lottie ; WebGL/WebGPU — https://lottiefiles.com/blog/working-with-lottie-animations/hardware-accelerated-lottie-on-the-web-dotlottie-web-now-ships-webgl-webgpu
17. Robinhood Engineering, Hello, Ticker — https://medium.com/robinhood-engineering/hello-ticker-20eaf6e51689
18. Robinhood design system (secondary) — https://oh-my-design.kr/design-systems/robinhood
19. Compose `HapticFeedbackType` — https://developer.android.com/reference/kotlin/androidx/compose/ui/hapticfeedback/HapticFeedbackType
20. Android `PowerManager.isPowerSaveMode()` — https://developer.android.com/reference/android/os/PowerManager#isPowerSaveMode()
21. Apple `ProcessInfo.isLowPowerModeEnabled` (page empty to fetch) — https://developer.apple.com/documentation/foundation/processinfo/islowpowermodeenabled
22. Compose Material 3 releases — https://developer.android.com/jetpack/androidx/releases/compose-material3
23. Material 3 Expressive LoadingIndicator (secondary) — https://joebirch.co/android/material-3-expressive-for-compose-loading-indicator/
24. MDN `prefers-reduced-transparency` — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency
25. Rive wasm size (secondary) — https://rive.app/docs/runtimes/web/preloading-wasm
