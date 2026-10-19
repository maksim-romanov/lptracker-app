---
app: agent-tools
topic: Native UI and motion sources (SwiftUI, Jetpack Compose)
checked: 2026-10-01
---

# Native UI and motion sources

Which official and community sources help a coding agent write good-looking, lively, accessible UI in `apps/ios-app` and `apps/android-app`. Builds on [ios-app/agent-docs-and-skills.md](../ios-app/agent-docs-and-skills.md) (Apple docs access, Hudson and van der Lee skills) and [android-app/agent-tools.md](../android-app/agent-tools.md) (Android CLI, `android/skills`, install scope). Constraints: [ADR 0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md), [0047](../../decisions/0047-agent-tools-and-mcp.md).

## Decisions

- We treat design and motion sources as reference, not dependencies. Agents read them, then write code that takes every duration, easing, spring, colour and spacing from generated tokens; a library that brings its own timings is a dependency decision for the owner (AGENTS.md "new dependency"). [0023][0027]
- We cite Apple's HIG Materials and Motion pages and the "Applying Liquid Glass to custom views" article for iOS look and behaviour, because they are the only first-party rules. Rules to copy into `apps/ios-app/docs/`: glass only on the controls/navigation layer, never the content layer; sparing on custom controls; `regular` variant under text; wrap neighbouring glass in one `GlassEffectContainer`; limit simultaneous effects. [1][2][3]
- We make "motion is optional" the review rule for both apps, because HIG says to supplement motion with haptics or audio and not force people to wait for animations. This matches ADR 0023's reduced values and ADR 0022. [3][0023]
- We recommend the Liquid Glass and SwiftUI performance skills as per-user opt-in for iOS contributors: `Dimillian/Skills` (`swiftui-liquid-glass`, `swiftui-performance-audit`, `swiftui-ui-patterns`; MIT, push 2026-03-29) next to Hudson's and van der Lee's skills. They add Liquid Glass modifier ordering and fallbacks that the other two cover less. Never vendored (0047). [4][0047]
- We do not use Pow (EmergeTools, MIT) or Vortex (Hudson, MIT) as dependencies. Both iOS 15+ SwiftPM packages ship fixed timings and haptics, document no Reduce Motion handling, and Pow's last release is 1.0.5 (2024-11-10). They stay a reference for effect ideas (change effects, particle bursts) to re-implement with tokens. [5][6]
- We do not use SwiftUI-Shimmer. Last push 2024-08-14, and ADR 0023 wants skeletons sized like content; a 20-line `redacted` + token-timed gradient replaces it. [7][0023]
- We use Lottie only for illustrative loops (empty states, onboarding), if at all, and never for state or data feedback. lottie-ios 4.6.1 (Apache-2.0) honours Reduce Motion by default through `ReducedMotionOption`: it plays designated reduced-motion markers, so every asset needs one. lottie-android's last release is v6.7.1 (2025-10-31). Adding either needs owner approval and a size budget. [8][9][10]
- We prefer Rive over Lottie only if a stateful, interactive animation is ever needed. Runtimes are MIT (`rive-ios` 6.28.0 on 2026-09-30, `rive-android` 11.12.1 on 2026-09-16), both actively pushed, and the new Apple runtime exposes editor-defined semantics to VoiceOver. No Reduce Motion switch was found in the docs read; it would be our code. [11][12][13]
- We use `android/skills` (Apache-2.0, 7.6k stars, push 2026-09-25) per user only. Its Compose folder holds `adaptive`, `migration` and `theming` (a `styles` subfolder); no animation or Material 3 Expressive skill exists, so motion guidance for Android comes from developer.android.com pages, not a skill. [14][0047]
- We cite the Compose animation docs and the shared-elements page as the Android reference: `SharedTransitionLayout`, `Modifier.sharedElement()` for hero content, `sharedBounds()` for container transforms, size modifiers before shared modifiers. Known gaps: no interop with `AndroidView`, `Dialog` or `ModalBottomSheet`; no automatic `ContentScale` or clip-shape animation. These shape ADR 0023's "shared elements across Navigation 3 scenes". [15][16]
- We keep Material 3 Expressive to what the stable artifact supports and gate the rest. `material3` 1.4.0 is stable (2026-09-23); Expressive components live in 1.5.0-alpha29. Using an alpha needs owner approval (AGENTS.md "new dependency"). Expressive spring physics (spatial vs effects, damping, stiffness, expressive vs standard schemes) is documented at m3.material.io; our `brisk` and `gentle` springs must be mapped to those parameters, not copied. [17][18][0023]
- We evaluate Haze (chrisbanes, Apache-2.0, 2.0.1 on 2026-09-29, 2.6k stars, Compose Multiplatform) as the only Android blur candidate for a Liquid-Glass-like look, behind a decision. It is the one library here with real activity; without it, Compose has no glass equivalent. Not adopted now. [19]
- We use Now in Android and the Compose samples (Jetsnack, Reply; Apache-2.0, pushed 2026-09-30 and 2026-10-01) as reference only. Jetsnack is the shared-element showcase; neither follows our token rules. [16][20][21]
- We do not add Apple or Google "design" MCPs or `llms.txt`. Apple, Android and m3.material.io publish none verified (Android 404, Apple 404 per sibling files); Figma's MCP is a separate design-to-code question, not covered here. [0047]

### Recommended shortlist

| | Reference (cite in docs) | Per-user opt-in skills | Dependencies |
|---|---|---|---|
| iOS | HIG Materials and Motion, Liquid Glass article, Landmarks-style Apple samples (unverified) | `swiftui-pro`, `swiftui-expert-skill`, `Dimillian/Skills` Liquid Glass and performance | none; Lottie or Rive only by owner decision |
| Android | Compose animation, shared elements, m3.material.io motion, Jetsnack, Now in Android | `android/skills` (`theming`, `adaptive`) | none now; Haze if blur is wanted; Lottie or Rive by owner decision |
| Cross-platform | DTCG motion tokens ([0027](../../decisions/0027-design-tokens.md)) | none | none |

## Facts that constrain us

| Source | License | Fresh (last seen) | Agent skill / MCP / llms.txt | Fit |
|---|---|---|---|---|
| Apple HIG Materials, Motion | Apple | live (via sosumi) | none; no llms.txt | yes, rules [1][3] |
| Liquid Glass article | Apple | live | none | yes, API shape; no OS versions on the page [2] |
| `Dimillian/Skills` | MIT | 2026-03-29 | 16 skills (3 SwiftUI) | partial: opt-in [4] |
| Pow | MIT | push 2026-04-13, release 1.0.5 2024-11 | none | no: reference [5] |
| Vortex | MIT | push 2026-04-03 | none | no: reference [6] |
| SwiftUI-Shimmer | MIT | push 2024-08-14 | none | no [7] |
| lottie-ios / lottie-android | Apache-2.0 | 4.6.1 2026-06 / 6.7.1 2025-10 | none | partial [8][9][10] |
| rive-ios / rive-android | MIT | 6.28.0 / 11.12.1, Sept 2026 | none | partial [11][12][13] |
| `android/skills` | Apache-2.0 | push 2026-09-25 | 21 topic folders, no animation | partial [14] |
| Compose animation and shared-element docs | Apache/CC | live | none | yes [15][16] |
| `material3` | Apache-2.0 | 1.4.0 stable; 1.5.0-alpha29 | none | yes, stable only [17] |
| Haze | Apache-2.0 | 2.0.1 2026-09-29 | none | partial [19] |
| Now in Android, compose-samples | Apache-2.0 | Sept-Oct 2026 | none | yes, reference [20][21] |

- Liquid Glass: `glassEffect(_:in:)` defaults to a capsule and `regular`; `.interactive()` adds touch response; `GlassEffectContainer(spacing:)` blends and morphs neighbours; `glassEffectID(_:in:)` with `GlassEffectTransition` (`matchedGeometry`, `materialize`) morphs between states; `glassEffectUnion` merges shapes. Apple warns that too many containers or effects outside containers hurt performance. [2]
- Variants change with the user's Liquid Glass look setting and with Reduce Transparency and Increase Contrast, so clear glass over text needs a ~35% dim layer on bright media. [1]
- Lottie iOS defaults to `systemReducedMotionToggle`; `disabledMotion` renders the first frame, useful for snapshot tests. [10]
- Rive Apple runtime: iOS 14+, macOS 13.1+, SwiftUI via `RiveUIViewRepresentable`; main-thread calls required. [13]
- Compose animation docs list `AnimatedVisibility`, `animateContentSize`, `AnimatedContent`, `animate*AsState`, `Transition`, `InfiniteTransition` as the API choices; the page read gives no reduced-motion API, so `LocalReducedMotion` from animator scale (ADR 0023) is our own. [15][0023]

## Conflicts (flagged, not resolved)

- ADR 0023 says iOS gets "one `Motion` helper that honours Reduce Motion"; Lottie and Rive honour it by their own rules (marker-based or none), which a `Motion` helper cannot reach. Any such asset bypasses the token lint.
- ADR 0047 wants official `llms.txt`; none of the sources above has one.

## Open questions

- Apple SwiftUI animation APIs (`PhaseAnimator`, `KeyframeAnimator`, `matchedGeometryEffect`, symbol effects, `MeshGradient`) and WWDC sample code were not fetched; Apple pages need JavaScript and only the Liquid Glass and HIG pages were read via sosumi. Re-check each and its minimum OS before the iOS motion spec cites them.
- Exact Compose Material 3 Expressive API (`MotionScheme`, `MaterialExpressiveTheme`, opt-in annotations) and the spring parameters behind them were not verified; the reference page and the m3.material.io page returned no detail.
- Do `Dimillian/Skills` and `swiftui-pro` agree with a token-only motion rule, or do they suggest literal `.easeInOut(duration:)`? Not diffed.
- Does the Rive runtime offer any Reduce Motion hook, and what are the Lottie and Rive binary sizes against our app budget? Not measured.
- Does `android/skills` `theming/styles` target the experimental Compose Styles API, and does it clash with ADR 0027's generated Compose object?
- Swift 6.4 / Xcode 27 status of Pow and Vortex (last releases predate it) was not tested.

## Sources

1. Apple HIG Materials — https://developer.apple.com/design/human-interface-guidelines/materials (read via https://sosumi.ai/design/human-interface-guidelines/materials)
2. Applying Liquid Glass to custom views — https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views (via sosumi)
3. Apple HIG Motion — https://developer.apple.com/design/human-interface-guidelines/motion (via sosumi)
4. Dimillian/Skills — https://github.com/Dimillian/Skills
5. EmergeTools/Pow — https://github.com/EmergeTools/Pow ; releases https://github.com/EmergeTools/Pow/releases
6. twostraws/Vortex — https://github.com/twostraws/Vortex
7. markiv/SwiftUI-Shimmer — https://github.com/markiv/SwiftUI-Shimmer
8. airbnb/lottie-ios — https://github.com/airbnb/lottie-ios/releases
9. airbnb/lottie-android — https://github.com/airbnb/lottie-android/releases
10. Lottie `ReducedMotionOption` — https://github.com/airbnb/lottie-ios (Sources/Public/Configuration/ReducedMotionOption.swift)
11. rive-app/rive-ios — https://github.com/rive-app/rive-ios/releases
12. rive-app/rive-android — https://github.com/rive-app/rive-android/releases
13. Rive Apple runtime — https://rive.app/docs/runtimes/apple/apple
14. android/skills — https://github.com/android/skills
15. Compose animation introduction — https://developer.android.com/develop/ui/compose/animation/introduction
16. Compose shared element transitions — https://developer.android.com/develop/ui/compose/animation/shared-elements
17. Compose Material 3 releases — https://developer.android.com/jetpack/androidx/releases/compose-material3
18. M3 motion — https://m3.material.io/styles/motion/overview/how-it-works
19. chrisbanes/haze — https://github.com/chrisbanes/haze
20. android/compose-samples — https://github.com/android/compose-samples
21. android/nowinandroid — https://github.com/android/nowinandroid
- [0022] [0023] [0027] [0047]: ADRs in `docs/decisions/`
