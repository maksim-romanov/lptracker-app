---
app: agent-tools
topic: libraries.dev UI effect libraries
checked: 2026-10-03
---

# libraries.dev UI effect libraries

Audit of every library on libraries.dev (Jakub Antalik) [1] as a dependency or a reference for VoidX. Each npm tarball and the native port sources were read, not only the pages. Judged against [0016](../../decisions/0016-licensing-and-dco.md), [0018](../../decisions/0018-web-ssr-hotwire.md) (SSR, Hotwire, no React), [0019](../../decisions/0019-ios-stack.md), [0020](../../decisions/0020-android-stack.md), [0022](../../decisions/0022-accessibility.md), [0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md), [0046](../../decisions/0046-token-logos.md) and [0047](../../decisions/0047-agent-tools-and-mcp.md).

## Decisions

- We add none of the seven packages as a web dependency. Every package's main entry imports `react/jsx-runtime`, which 0018 excludes; only `thinking-orbs/engine` is React-free. [2][6–14]
- We copy no default value from any library. Each ships its own durations, springs, palettes and `theme="auto"` detection (`data-theme`, `.dark`, `prefers-color-scheme`); a port takes motion from `--motion-*` tokens and colour from our OKLCH tokens, or the motion-token lint and contrast test fail ([0023](../../decisions/0023-motion.md), [0027](../../decisions/0027-design-tokens.md)). [2][6–14]
- We use no native port as a package. iOS ports install only by local path (`.package(path:)`) with no SwiftPM release, the React Native ports are not on npm, and no library has an Android or Compose port ([0019](../../decisions/0019-ios-stack.md), [0020](../../decisions/0020-android-stack.md)). Native use means our own port. [5][6][7][11]
- **Thinking orbs** (`thinking-orbs`): reference now, possible web dependency later. It stays the owner's visual reference for a busy indicator, for example while scopes are discovered or refreshed; it never replaces a skeleton for loading content. The web candidate is `thinking-orbs/engine` (7.1 KB gzip, React-free, paint functions only), driven by a Stimulus controller that owns `requestAnimationFrame`, pauses offscreen and paints one static frame under `prefers-reduced-motion`. Adding it is a new dependency for the owner to approve. iOS: port the drawing onto our `Motion` helper; `ThinkingOrbsKit` (SwiftUI `Canvas` + `TimelineView`, static under Reduce Motion) is the reference. Android: own Compose `Canvas` port, about 2 days. The orb is decorative (`aria-hidden`); the busy state is announced by the frame's `aria-busy`, not by the orb's built-in `role="img"` label. [6][7][16]
- **Image** (`img-fx`): reject, including as the logo placeholder. It needs React and `three` (WebGL), has no native port, paints nothing until JS runs, and has no reduced-motion handling at all. It is built to churn a pixel mosaic and reveal random images from a pool, with literal timings (`revealHoldMs` 2000, `revealFadeOutMs` 300). Its cells keep a fixed CSS-pixel size, so a 24 px logo holds only a few cells. [13][14]
- **Logo placeholder** for token, chain and protocol logos: no animated placeholder. `logo: null` is a permanent state, not a load, so an animated "generating" mosaic would say "loading" forever ([0046](../../decisions/0046-token-logos.md)). Logos are immutable WebP from our origin, so the time before an image paints is short.
  - Web: the server renders the [monogram](../../glossary.md#data) on the token backplate in every case. When `logo` is set, an `<img width height loading="lazy" decoding="async">` sits over it in the same fixed box, so CLS is 0 and the page works without JS. A Stimulus controller may fade the image in with `opacity` at `--motion-fast` and removes it on `error`, so the monogram shows. Opacity is not motion under WCAG 2.3.3, so the fade needs no reduced branch ([0023](../../decisions/0023-motion.md)).
  - iOS and Android: the image loader's placeholder and failure slots both render the same monogram view or composable. No shimmer.
  - If the owner wants img-fx's pixel look, we port it as a **static** pixel-mosaic backplate under the monogram letters, seeded by address hash from palette tokens: server-rendered SVG on the web, `Canvas` on iOS and Android. About 1 day per client. This changes the glossary's "palette colour" wording, so it needs an owner decision.
- **Metal** (`metal-fx`): reject in the app; visual reference only for a future plan-upgrade badge drawn as a static token gradient. The web package runs a continuous WebGL2 loop, and `prefers-reduced-motion` only turns off the cursor light; the ring keeps moving. `MetalFxKit` draws through SwiftUI `.colorEffect` and `.layerEffect` Metal shaders in a 60 fps `TimelineView`, reads CoreMotion at 60 Hz for tilt and has no Reduce Motion branch. [ios-app motion](../ios-app/motion.md) keeps `colorEffect` and `layerEffect` out of MVP screens unless they go through `Motion` with a device perf check. There is no Android port. A position list open for hours cannot pay a constant GPU cost for decoration. [11][12][17]
- We record that `metal-fx` declares `MIT` in `package.json` but inlines Paper Shaders' `liquidMetal` shader under Apache-2.0 (`NOTICE`). Any vendored copy must carry Apache-2.0 in `REUSE.toml` and keep the NOTICE ([0016](../../decisions/0016-licensing-and-dco.md)). [11][13]
- **Border beam** (`border-beam`): visual reference only. It animates `@property`-registered angle and hue variables and `filter: blur()`, which repaint every frame; 0023 lets only `transform` and `opacity` animate. Its rainbow palette has no token equivalent. A port for "this card is refreshing" would rotate a token-coloured `conic-gradient` pseudo-element with `transform`, masked to the border, and render nothing under reduced motion. About 0.5 day on the web; native ports wait for post-MVP motion work. [8][9]
- **Gooey** (`liquid-gooey`): reference for one idea, reject the package. Its springs compile to cached CSS `linear()` curves, the same method we use for `brisk` and `gentle` ([design-motion delta](design-motion-sources-delta.md)). The goo itself is an SVG `feGaussianBlur` + `feColorMatrix` filter re-rendered during motion, and the morph writes `filter: blur()` on the element. Both break the transform-and-opacity rule, and a merging blob menu does not fit a dense finance UI. [10]
- **Voice** (`voice-glow`): reject. It visualises microphone input through `getUserMedia`, and VoidX has no voice input. [2][15]
- **Bot avatars** (`bot-avatars`): reject. VoidX shows no agent characters, and at 64.8 KB gzip it is the heaviest package. [2][15]
- We do not install the libraries.dev agent skill or the `libraries-dev` CLI. `libraries apply` installs packages and places components on its own, which breaks AGENTS.md's stop-and-ask rule for new dependencies. Its placement rules (orbs after 2 s, beam after 3 s) are not our motion rules. 0047 forbids vendoring it. [4][18]
- We do not buy Libraries Pro ($9 a month, $59 Business, $149 lifetime). Studio exports and Pro presets are licensed per plan, not MIT, so no Pro or Studio output may be committed, as with Tailwind Plus in [web UI sources](web-ui-sources.md). [3]

## Facts that constrain us

| Package | Version, published | Licence | Rendering | Web API | Native ports | Reduced motion (web) | Gzip of ESM dist |
|---|---|---|---|---|---|---|---|
| `border-beam` | 1.4.1, 2026-09-22 | MIT | CSS `conic-gradient`, `@property` keyframes, mask, blur | React | SwiftUI (Metal `colorEffect`, iOS 17), RN | CSS `@media` branch | 14.3 KB [8][9] |
| `thinking-orbs` | 0.3.2, 2026-09-22 | MIT | 2D canvas, rAF | React + `/engine` | SwiftUI (`Canvas`, iOS 15), RN | static frame | 7.7 KB; engine 7.1 KB [6][7] |
| `liquid-gooey` | 0.2.2, 2026-09-22 | MIT | SVG filters under live DOM, CSS `linear()` | React, `react-dom` portal | none | transitions snap | 26.0 KB [10] |
| `voice-glow` | 0.2.1, 2026-09-22 | MIT | 2D canvas, Web Audio | React | none | sweep stops | 16.5 KB [15] |
| `bot-avatars` | 0.2.2, 2026-10-02 | MIT | 2D canvas, matcap | React | SwiftUI (`Canvas`, iOS 17), RN | pose kept, motion dropped | 64.8 KB [15] |
| `metal-fx` | 2.0.11, 2026-09-22 | MIT + Apache-2.0 shader | WebGL2, shared context, one rAF | React (`createInstance` in the same bundle) | SwiftUI (Metal `colorEffect`/`layerEffect`, iOS 17), RN | cursor light only | 42.1 KB [11][12][13] |
| `img-fx` | 0.5.1, 2026-09-04 | MIT | WebGL via `three`, 2D overlay canvases | React + `three` peer | none | none | 23.7 KB + `three` [14] |

- No package has runtime `dependencies`; peers are `react` ≥ 18, `react-dom` ≥ 18 and, for `img-fx`, `three` ≥ 0.149. `three` 0.186.1 (MIT) prebuilt core plus module is about 195 KB gzip. [14][19]
- The site says all seven weigh "under 110 KB gzipped"; our sum of the shipped ESM files is about 195 KB gzip. Those files are not minified, so the two numbers are not comparable. [2]
- SSR: every package paints on the client after mount. `metal-fx` renders a transparent placeholder on the server; the others render their wrapped child or an empty canvas. None paints without JS. [7][11][15]
- Offscreen cost: `thinking-orbs`, `bot-avatars`, `metal-fx` and `img-fx` pause through `IntersectionObserver`. `img-fx` caps itself at 10 fps. `liquid-gooey`'s loop sleeps after about 0.5 s still. `border-beam` runs its CSS animations wherever it is mounted. [7][10][11][14][15]
- Accessibility: `thinking-orbs` and `bot-avatars` set `role="img"` with a per-state `aria-label`. `img-fx` and `metal-fx` mark their canvases `aria-hidden`. `liquid-gooey` leaves its content as live DOM. [7][10][11][14][15]
- `MetalFxKit` and `BorderBeamKit` must be built through Xcode, because SwiftPM alone does not compile their `.metal` files. `BorderBeamKit` and `ThinkingOrbsKit` read `accessibilityReduceMotion`; no `MetalFxKit` source does. [9][12]
- Repo `Jakubantalik/Libraries.dev`: MIT, 4,035 stars, created 2026-04-12, pushed 2026-10-02. Its tags cover only the border-beam and voice-glow releases. `img-fx` and `metal-fx` publish from their own MIT repos (183 and 483 stars). [5][11][14]

## Open questions

- Which image loader do the iOS and Android apps use, and does it expose one placeholder slot for both loading and failure? Neither app's research names one yet.
- Does the owner want a pixel-mosaic monogram? If so, the glossary's Monogram entry and [token logos](../server/token-logos.md) change with it.
- Does the orb's static reduced-motion frame still read as "busy"? 0023 only says reduced motion means a fade. Test with a screen-reader user before adopting it.
- What is a Stimulus-driven `thinking-orbs/engine` frame's cost on a low-end Android phone with 20 cards on screen? Not measured.
- The terms page was not read in full; the Pro licence wording comes from the pricing and Studio pages.

## Sources

1. libraries.dev — https://libraries.dev/
2. How to use (seven packages, React 18, MIT, size claim) — https://libraries.dev/how-to-use.html
3. Pro and Studio — https://libraries.dev/pro.html, https://libraries.dev/studio.html
4. Agent skill page — https://libraries.dev/skill.html
5. Jakubantalik/Libraries.dev — https://github.com/Jakubantalik/Libraries.dev (API: https://api.github.com/repos/Jakubantalik/Libraries.dev)
6. Thinking orbs demo — https://libraries.dev/orbs
7. `thinking-orbs` on npm (0.3.2, `/engine` entry) — https://www.npmjs.com/package/thinking-orbs; `ThinkingOrbsKit` — https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/thinking-orbs/ports/ios/ThinkingOrbsKit
8. Border beam — https://libraries.dev/beam.html, https://www.npmjs.com/package/border-beam
9. `BorderBeamKit` — https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/border-beam/ports/ios/BorderBeamKit
10. Gooey — https://libraries.dev/gooey.html, https://www.npmjs.com/package/liquid-gooey
11. Metal — https://libraries.dev/metal.html, https://www.npmjs.com/package/metal-fx, https://github.com/Jakubantalik/metal-fx
12. `MetalFxKit` sources — https://github.com/Jakubantalik/Libraries.dev/tree/main/packages/metal-fx/ports/ios/MetalFxKit/Sources/MetalFxKit
13. Paper Shaders (`@paper-design/shaders` 0.0.81, Apache-2.0) — https://github.com/paper-design/shaders
14. Image — https://libraries.dev/image.html, https://www.npmjs.com/package/img-fx, https://github.com/Jakubantalik/img-fx
15. Voice and Bot avatars — https://libraries.dev/voice.html, https://www.npmjs.com/package/voice-glow, https://libraries.dev/bots.html, https://www.npmjs.com/package/bot-avatars
16. Turbo frame `busy` and `aria-busy` — https://turbo.hotwired.dev/reference/frames
17. iOS motion research — [motion.md](../ios-app/motion.md)
18. libraries-dev skill and CLI (0.1.0) — https://raw.githubusercontent.com/Jakubantalik/Libraries.dev/main/skills/libraries-dev/SKILL.md, https://www.npmjs.com/package/libraries-dev
19. `three` on npm (0.186.1) — https://www.npmjs.com/package/three
