---
app: android-app
topic: Motion and animation APIs
checked: 2026-10-01
---

# Motion and animation APIs

Applies to Compose BOM 2026.09.00 (animation 1.12.1), Navigation 3 1.2.0, material3 1.4.0. Library choices (Lottie, Rive, Haze, compose-samples) stay in [native-ui-sources.md](../agent-tools/native-ui-sources.md); this file closes its open questions on `MotionScheme` and spring parameters. Constraints: [ADR 0023](../../decisions/0023-motion.md), [0022](../../decisions/0022-accessibility.md), [0027](../../decisions/0027-design-tokens.md), [0020](../../decisions/0020-android-stack.md); versions in [skeleton.md](skeleton.md).

## Decisions
- We generate `brisk` and `gentle` as `spring(dampingRatio, stiffness)` from the token's `duration` and `bounce`, by the formulas in [0027](../../decisions/0027-design-tokens.md). [1][2]
- We take `brisk` (0.22 s, bounce 0.4) from Material's expressive spatial fast spring and `gentle` (0.44 s, bounce 0.2) from its expressive spatial slow spring ([0023](../../decisions/0023-motion.md), table below).
- We keep Material 3 on stable `material3` 1.4.0 and set the theme with `MaterialTheme(motionScheme = …)`, because `MaterialTheme(motionScheme)` and `MaterialTheme.motionScheme` are not opt-in, while `MaterialExpressiveTheme` carries `@ExperimentalMaterial3ExpressiveApi`. [5][6]
- We do not read `MaterialTheme.motionScheme` from feature code. Feature code reads one `Motion` object in `:core:designsystem` generated from the tokens (ADR 0027); components that take Material specs get `Motion`-built specs via the `MotionScheme` interface (`fastSpatialSpec()` etc.), so Material components follow our tokens. [6][0027]
- We write `LocalReducedMotion` ourselves; no official one exists. Compose has `MotionDurationScale`, a coroutine-context element whose `scaleFactor` 0 finishes motion on the next frame, and Compose animations have followed the system "Remove animations" setting since 1.2.0. [7][8]
- We read the signal as `!ValueAnimator.areAnimatorsEnabled()` (API 26), refreshed through `ValueAnimator.registerDurationScaleChangeListener` (API 33) or a `ContentObserver` on `Settings.Global.ANIMATOR_DURATION_SCALE` below API 33, provided at the root as a `State<Boolean>`. The framework says animators turn off when the user sets the scale to 0 or Battery Saver is on, and that apps may use the flag to "show a different experience". [8][25]
- We animate shared elements with `SharedTransitionLayout` wrapped around `NavDisplay(sharedTransitionScope = this)`, `sharedElement()` for identical content (logo, monogram), `sharedBounds()` for container transforms, size modifiers before shared modifiers, and keys as data classes (`PositionRef` plus part). [9][10]
- We set per-destination transitions through `NavDisplay.TransitionKey`, `PopTransitionKey` and `PredictivePopTransitionKey` metadata on the entry, and defaults through `transitionSpec`, `popTransitionSpec`, `predictivePopTransitionSpec`, all built from `Motion`. [9]
- We use `BackHandler` and `NavigationBackHandler` (Navigation 3 1.2.0), not `PredictiveBackHandler`, for custom back. `androidx.activity` is rebuilt on `navigationevent`. Add `navigationevent-compose` only for a custom component; pin its stable 1.1.2, not the 1.2.0-rc01. [9][11]
- We declare `android:enableOnBackInvokedCallback="true"` on the application; targetSdk 36 already makes predictive back the default and stops `onBackPressed()` and `KEYCODE_BACK` delivery. [12]
- We treat disabled animators as "no animation at all": reduced motion on Android is an instant change, and we never run a crossfade under an overriding `MotionDurationScale`. "Remove animations" is an explicit request for none, Battery Saver asks to save power, Compose already snaps, and an instant change is not motion under WCAG 2.3.3 ([0023](../../decisions/0023-motion.md)). [7][25][26]
- We animate in the draw or layout phase: `graphicsLayer { }`, `offset { }`, `drawBehind { }` with values passed as `() -> T` or `State`, never `Modifier.alpha(state.value)` read in composition. A custom Lint rule next to the literal-value rule can flag `.value` reads of `Animatable` inside composition. [13]
- We measure with Macrobenchmark 1.5.0 `FrameTimingMetric` and gate on `frameOverrunMs` P90 and P99 (API 31+ devices only), keeping `frameDurationCpuMs` as the fallback below API 31. Google calls `frameOverrunMs` the preferred metric. [14][15]
- We add JankStats 1.0.0 only for field telemetry if the owner asks; the ADR 0023 budget needs Macrobenchmark alone. [16]
- We build animated numbers as one `Text` per digit inside `AnimatedContent` (`contentKey` per digit position, `slideInVertically + fadeIn togetherWith slideOutVertically + fadeOut`, `SizeTransform(clip = false)`) and `fontFeatureSettings = "tnum"` in the number text style. The server provides the formatted string (AGENTS.md hard rule); the client animates between two strings, never formats. [17]

### Spring token seed (derived)
`d = 2π / √stiffness`, `bounce = 1 − dampingRatio`, from material3 source.

| Material token | Damping | Stiffness | d (s) | bounce |
|---|---|---|---|---|
| Expressive spatial fast / default / slow | 0.6 / 0.8 / 0.8 | 800 / 380 / 200 | 0.222 / 0.322 / 0.444 | 0.4 / 0.2 / 0.2 |
| Standard spatial fast / default / slow | 0.9 / 0.9 / 0.9 | 1400 / 700 / 300 | 0.168 / 0.237 / 0.363 | 0.1 / 0.1 / 0.1 |
| Effects (both schemes) fast / default / slow | 1.0 | 3800 / 1600 / 800 | 0.102 / 0.157 / 0.222 | 0 |

Use effects springs (damping 1) for colour and alpha, spatial springs for position and size, because overshoot on alpha or colour is invalid. [3][4]

### Web `linear()` from the same pair
With `ω = 2π / d`, `ζ = 1 − bounce`: `x(t) = 1 − e^(−ζωt) · (cos ω_d·t + (ζω/ω_d) · sin ω_d·t)`, `ω_d = ω√(1 − ζ²)`; for `ζ = 1`, `x(t) = 1 − e^(−ωt)(1 + ωt)`. Sample at about 40 points until `|1 − x| < 0.001`, emit `linear(...)`, and use the last time as the CSS duration. The perceptual `d` is a period, not the settling time; settling is roughly `4 / (ζω)`. [1]

## Facts that constrain us
- Versions as of 2026-10-01: `material3` 1.4.0 stable and 1.5.0-alpha29 (2026-09-23); `compose.animation` 1.12.1 stable, 1.13.0-alpha03 (2026-09-09); `navigation3` 1.2.0 stable, 1.3.0-alpha01 (2026-09-23); `navigationevent` 1.1.2 stable, 1.2.0-rc01; `benchmark` 1.5.0 stable (2026-09-09); `metrics-performance` (JankStats) 1.0.0. [5][18][9][11][14][16]
- Compose 1.12 needs compileSdk 37 and AGP 9.1.1; skeleton.md already pins both. [19]
- `MotionScheme` is an `@Immutable` interface with six specs: `default/fast/slow` times `Spatial/Effects`, each `FiniteAnimationSpec<T>`. `MaterialTheme.motionScheme` is a stable property; the experimental `LocalMotionScheme` is deprecated. Expressive components (buttons, FAB, menus in alpha19; `FloatingToolbar` in alpha22; list items in alpha23) are promoted to stable inside 1.5.0 alphas, not 1.4.0. [3][5][6]
- Source of the six scheme values: `ExpressiveMotionTokens` and `StandardMotionTokens` in androidx-main (`compose/material3/.../tokens/`), not documented on m3.material.io, which only names scheme, spatial/effects and fast/default/slow. [3][4][20]
- Compose 1.9 stabilised scroll behaviour for shared elements; 1.10 made shared transitions stable (plus `skipToLookaheadPosition`, `unveilIn`/`veilOut`, initial velocity for flings); 1.11 added Lookahead visual debugging; 1.12 stabilised `DeferredTargetAnimation`, added `DeferredAnimatedContent` and `DeferredAnimatedVisibility` (two-stage predictive-back style transitions). `Modifier.animateBounds` is under `LookaheadScope`. [18][21]
- Shared element limits: no View interop, `ContentScale` snaps, no automatic shape morph (use `sharedBounds()` + `animateEnterExit()`). [10]
- Navigation 3 1.2.0: shared elements between scenes via `sharedTransitionScope`, `NavigationBackHandler` with `onBackCompleted` / `onBackCancelled`, compileSdk 37, minSdk 23. [9]
- Predictive back: Android 15 removed the developer toggle; apps that opt in get back-to-home, cross-task and cross-activity animations. Android 16 (targetSdk 36) makes it default. The Android 17 behaviour-change page lists nothing on back. [12][22]
- Compose release notes for `compose-ui` 1.12 mention no reduced-motion or `LocalReducedMotion` API. [23]
- `FrameTimingMetric` percentiles are P50, P90, P95, P99; positive `frameOverrunMs` means a missed deadline. The Compose `label` argument on `AnimatedContent` and `animate*AsState` shows in traces; name them. [14][24]

## Open questions

- Resolved: [0023](../../decisions/0023-motion.md) sets `brisk` and `gentle`.
- Does our `voidx-native` plugin emit `Motion` as `SpringSpec<Float>` fields, or numbers plus a hand-written adapter ([token-pipeline](../repo/token-pipeline.md))? The generated-file rule forbids hand edits.
- ADR 0020 pins targetSdk 36; targetSdk 37 effects on `enableOnBackInvokedCallback` came only from a third-party PR, not a Google page. Re-check when Play requires 37.
- Do OEM system fonts expose `tnum`? Compose passes `fontFeatureSettings` to the font; a bundled font (Roboto Flex or Inter with `tnum`) may be needed. Not tested.
- When does the owner approve `material3` 1.5.0 alpha for expressive components? Alpha needs approval (AGENTS.md "new dependency"); 1.4.0 has the `MotionScheme` but not the promoted expressive component APIs.
- `androidx.baselineprofile` Gradle plugin version and Macrobenchmark on a Gradle Managed Device vs a physical device (ADR 0023 says physical nightly) were not checked.

## Sources
1. SwiftUI `Spring` — https://developer.apple.com/documentation/swiftui/spring (via https://sosumi.ai/documentation/swiftui/spring)
2. Compose customize animations (spring, tween, keyframes) — https://developer.android.com/develop/ui/compose/animation/customize
3. `ExpressiveMotionTokens.kt` — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt
4. `StandardMotionTokens.kt` — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/StandardMotionTokens.kt
5. Compose Material 3 releases — https://developer.android.com/jetpack/androidx/releases/compose-material3
6. `MaterialTheme.kt` and `MotionScheme.kt` — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialTheme.kt
7. `MotionDurationScale` — https://developer.android.com/reference/kotlin/androidx/compose/ui/MotionDurationScale
8. Android, Animations and Reduced Motion (Eevis) — https://eevis.codes/blog/2022-12-12/android-animations-and-reduced-motion/
9. Navigation 3 releases and animate destinations — https://developer.android.com/jetpack/androidx/releases/navigation3 ; https://developer.android.com/guide/navigation/navigation-3/animate-destinations
10. Shared element transitions — https://developer.android.com/develop/ui/compose/animation/shared-elements
11. NavigationEvent releases — https://developer.android.com/jetpack/androidx/releases/navigationevent
12. Predictive back and Android 16 behaviour changes — https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture ; https://developer.android.com/about/versions/16/behavior-changes-16
13. Compose best practices (defer state reads) — https://developer.android.com/develop/ui/compose/performance/bestpractices
14. Benchmark releases and `FrameTimingMetric` — https://developer.android.com/jetpack/androidx/releases/benchmark ; https://developer.android.com/topic/performance/benchmarking/macrobenchmark-metrics
15. Macrobenchmark metrics (preferred `frameOverrunMs`) — same as 14
16. Metrics (JankStats) releases — https://developer.android.com/jetpack/androidx/releases/metrics
17. Animation composables and modifiers (`AnimatedContent`, `SizeTransform`, `animateContentSize`) — https://developer.android.com/develop/ui/compose/animation/composables-modifiers
18. Compose Animation releases — https://developer.android.com/jetpack/androidx/releases/compose-animation
19. Jetpack Compose August '26 release — https://android-developers.googleblog.com/2026/08/jetpack-compose-august-2026-release.html
20. M3 motion specs — https://m3.material.io/styles/motion/overview/specs
21. Same as 19 (`DeferredAnimatedContent`, `DeferredAnimatedVisibility`)
22. Android 17 behaviour changes — https://developer.android.com/about/versions/17/behavior-changes-17
23. Compose UI releases — https://developer.android.com/jetpack/androidx/releases/compose-ui
24. Compose animation `label` and tooling — same as 17
25. `ValueAnimator.areAnimatorsEnabled()`, `registerDurationScaleChangeListener` — https://developer.android.com/reference/android/animation/ValueAnimator (Javadoc in AOSP `ValueAnimator.java`)
26. WCAG 2.2 Understanding 2.3.3 Animation from Interactions — https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- [0020] [0022] [0023] [0027]: ADRs in `docs/decisions/`
