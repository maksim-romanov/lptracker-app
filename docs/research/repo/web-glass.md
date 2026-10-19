# Web frosted / Liquid Glass notes (researched 2026-10-08)

Confidence tags: [S] = from fetched source, [K] = my own knowledge / synthesis (weak, verify visually).

## Sources
- Josh Comeau, backdrop-filter: https://joshwcomeau.com/css/backdrop-filter  (fetched)
- kube.io liquid glass (CSS+SVG, physics): https://kube.io/blog/liquid-glass-css-svg/  (fetched)
- Devyatov, 6 ways: https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07  (fetched)
- buildmvpfast recipes 2026: https://www.buildmvpfast.com/blog/liquid-glass-css-backdrop-filter-recipes-2026  (fetched; secondary blog)
- ekino Medium: https://medium.com/ekino-france/liquid-glass-in-css-and-svg  (search snippet only)
- web.dev backdrop-filter: https://web.dev/articles/backdrop-filter  (snippet only)
- LiquidGlass WebGL lib: https://www.cssscript.com/demo/webgl-liquid-glass ; Godot frosted shaders (mip vs gaussian, warp texture, fresnel rim) godotshaders.com
- NOT fetched: Codrops, Nikita Hlukhov. No claims attributed to them.

## Why glass looks fake on flat/plain bg
- Blur of a uniform field = the same uniform field. No visible effect. [S: "Glass looks best over saturated imagery and nearly invisible over flat gray" (Devyatov); "backdrop needs color or texture" (buildmvpfast)]
- Comeau: backdrop-filter only samples pixels directly behind the element, so edges go goopy; real glass picks up neighbouring light. Extend the sampled area (child with height 200% + hard-stop mask) [S].
- Frosting is *only legible at the boundary*: something sharp outside the slab (edge, shape, type) becoming soft inside. So: need high-contrast edges crossing the slab boundary [K, consistent with above].

## Core CSS values (cited)
- Baseline: backdrop-filter: blur(16px) saturate(180%); tint rgba(255,255,255,0.08) [S Devyatov]; or tint 0.12, border 1px rgba(255,255,255,.28), top border .55, radius 24px, inset 0 1px 0 rgba(255,255,255,.35), outer 0 12px 40px rgba(0,0,0,.35) [S buildmvpfast]
- Guideline ranges: blur 12-30px, saturate 140-200% [S buildmvpfast]; common 8-16px [S search snippet].
- Comeau examples: header blur(8px) brightness(90%) saturate(140%); edge blur(6px) brightness(110%) saturate(120%); semi-opaque bg hsl(0 0% 100% / .5); edge strip 4px thick with smaller blur + brightness to "pop" [S].
- Why saturate: blur averages colours -> desaturates -> "dirty plastic" [S].
- Safari: -webkit-backdrop-filter needed; CSS custom props don't resolve inside -webkit-backdrop-filter, hardcode [S buildmvpfast; weakly supported, test].
- Gotchas: ancestor overflow clips; backdrop-filter creates containing block for fixed children [S]. Chrome applies overflow clip before filters, so overflow:hidden/clip-path don't extend backdrop [S Comeau]. Nested backdrop-filter elements don't blur each other's backdrops reliably [K].

## Premium look: edges, thickness (mostly [K] unless noted)
- Edge light: 1px border via ::before with mask-composite (exclude) + linear/conic gradient border: bright (white .5-.7) at top-left and bottom-right, near 0 elsewhere. Conic-gradient from ~ -45deg with two lobes gives a specular rim. [K]
- Top inset highlight `inset 0 1px 0 rgba(255,255,255,.35)` [S]; add `inset 0 -1px 0 rgba(255,255,255,.1)` and soft inner glow `inset 0 0 24px rgba(255,255,255,.06)` [K].
- Thickness illusion: inner bevel = second narrow strip with brighter/less blurred backdrop (Comeau's backdrop-edge) [S]; inner shadow `inset 0 -8px 16px rgba(0,0,0,.15)`; double border (outer dark hairline rgba(0,0,0,.2) + inner light hairline) [K].
- Real refraction: kube.io — Snell's law, convex squircle profile y=(1-(1-x)^4)^(1/4), displacement map in R/G (128 neutral, 127 scale), feImage + feDisplacementMap scale = max displacement px, colorInterpolationFilters=sRGB, specular rim at about -60deg light; map must be rebuilt on size/shape change; animating `scale` is cheap [S].
- Refraction is Chromium-only as backdrop-filter:url(#f). Firefox accepts url() so @supports passes yet renders nothing; Safari open bug. Gate with UA/engine detection, fallback blur+saturate [S, 3 sources agree]. Only displaces within element bounds (no edge bleed) [S]. Use inset:-20px overscan on child to avoid transparent gutters [S Devyatov].
- Non-backdrop SVG filter (feTurbulence+feDisplacementMap on regular `filter`) works everywhere but distorts element content, not the backdrop [S Devyatov claim #4; interpretation].
- iOS 26 Safari: `-apple-visual-effect: -apple-system-glass-material` gives native material [S Devyatov only; WEAK, single source, verify].
- Progressive blur: ~7 stacked masked layers, blur ~0.0625*i*strength rem [S Devyatov]; costs multiply.

## Noise / grain / tint order (mostly [K])
Bottom to top: moving backdrop -> backdrop-filter (blur/saturate/brightness) -> tint fill (white 6-14% in light, or dark 15-30%) -> noise overlay (SVG feTurbulence baseFrequency .8-.9, 2-3 octaves, opacity .04-.08, mix-blend-mode: overlay/soft-light, static tile, NOT animated) -> edge light border -> content. Noise above blur so it stays crisp; grain also hides banding in gradients. Pre-render noise as small PNG tile (128-256px) rather than live feTurbulence (cost) [K]. Same grain over the entire hero helps unify [K].

## Performance
- Static blur cheap; blur over moving content re-filtered every frame [S]. Don't animate blur radius, animate opacity [S]. Keep blur <~20px on large surfaces; 3-4 glass layers per viewport; will-change sparingly [S buildmvpfast]. Mobile: 8-16px max [S snippet]. Firefox scroll jank, sticky+overflow+radius bug [S]. Cost scales with area x radius x layers [K].
- Mitigation for moving bg: render bg at reduced res / as a single canvas or CSS-animated transforms of few large blobs (compositor-only: transform/opacity). Blur on a bg of pre-blurred big gradients is mostly redundant -> use sharp shapes (see below) only where needed [K].
- Hero full-viewport backdrop-filter over animated canvas = worst case; the 3rd option is bake: blurred copy of bg (see WebGL) [K].

## Support & fallbacks
- web.dev: Chrome 76, Edge 79, Firefox 103, Safari 18 unprefixed (prefix needed older) [S snippet]. Comeau (Dec 2024): >97% [S].
- Fallback: @supports not (backdrop-filter...) -> near-opaque bg hsl(0 0% 100%/.95) [S Comeau].
- prefers-reduced-transparency: Chromium shipped behind flag at best; Safari unsupported, Firefox disabled by default [S buildmvpfast; WEAK, one blog, one snippet said 72% support which contradicts. Check caniuse]. Therefore make readable/opaque default, add glass inside `@media (prefers-reduced-transparency: no-preference)` is wrong for non-supporting browsers? Actually unsupported queries evaluating `no-preference` are false -> glass would never show. Safer: default glass, override with `@media (prefers-reduced-transparency: reduce)` plus prefers-contrast: more and @supports fallback. [K, conflicts with buildmvpfast's advice; decide per audience]
- Also honour prefers-reduced-motion (freeze bg) [S].

## WebGL alternative
- CSS can't blur a canvas beneath except as an HTML rect; shader route renders scene to render target, blur (mip-level cheap/ugly at high levels; gaussian better; dual Kawase = cheap wide), sample with noise/normal-warp UV offset, tint + grain + fresnel rim [S Godot shaders/three forum, synthesis].
- Run blur at 1/2-1/4 res and upscale [S forum].
- Best for full-viewport hero: since you own the bg in WebGL, "glass" can be a fullscreen post-process (blurred bg texture + masks of slab shapes) -> no backdrop-filter cost; CSS panels then need a matching blurred texture (can't align trivially) [K].
- Devyatov: GLSL refract() ~120 lines, cap 30fps, pause offscreen [S].
- Libraries: LiquidGlass WebGL (cssscript demo) [S snippet, unreviewed].

## What makes glass expensive vs cheap (synthesis, [K] mostly)
Cheap: uniform white 20% fill + blur on flat bg, thick uniform 1px white border, big drop shadow, blur 40px+, no saturation, text on blur with no contrast control.
Expensive: sharp content visibly passing under edges; saturate+slight brightness; low tint (6-12%); directional 1px rim light (not uniform); inner bevel / thickness cue; fine static grain; restrained shadow tinted by bg; consistent light direction; few layers; large radii (24-40px) with squircle-ish corners; tiny contrast changes rather than milky white.

## Backdrop design (so frosting is visible) [K]
- 3-5 large high-saturation shapes (circles/rounded blobs/stripes) with crisp edges (not blurred) and strong luminance contrast against dark base; slow drift 30-60s linear/ease-in-out, transform only.
- Light streaks: thin bright diagonal bars/line segments crossing slab boundaries - show sharp outside, soft inside.
- Big type or thin outline rings/grid lines behind panels: best "proof of frosting" because readability change is obvious.
- Avoid pure smooth mesh gradients alone: blur is invisible. Keep some shapes bigger than the panel and some smaller so edges pass under.
- Add grain on top of everything.

## Recipe A: full-viewport hero, whole bg reads as frosted glass [K, assembled; tune visually]
Layers (position fixed, inset 0):
1. .scene: dark base (#0b0b14) + 4-6 crisp shapes (SVG/divs, transform animation 40s).  
2. .ribs (the frosting): a repeating "reeded glass" / slab grid over the viewport: e.g. 8-12 vertical (or diagonal) strips, each a child with `backdrop-filter: blur(24px) saturate(1.6) brightness(1.05)`; `background: linear-gradient(90deg, rgba(255,255,255,.10), rgba(255,255,255,.02) 40%, rgba(255,255,255,.06))`; 1px left/right edge-light via box-shadow `inset 1px 0 0 rgba(255,255,255,.25), inset -1px 0 0 rgba(0,0,0,.2)`. Strips make edges everywhere so sharp shapes are cut by frost boundaries.  
   Cheaper variant: ONE full-viewport layer `backdrop-filter: blur(28px) saturate(1.5)` over the scene plus a second, sharp copy of the shapes masked into windows above... (single big blur is cheaper than many; but visible frosting needs boundaries).
3. .grain: fixed, pointer-events none, 200px PNG noise tile, opacity .06, mix-blend-mode: soft-light.
4. .vignette optional. Content on top.
Reduced: `@media (prefers-reduced-motion)` stop animation; `@supports not (backdrop-filter: blur(1px))` replace ribs with pre-blurred bg image.
Budget: 1 large backdrop element over animated content; test on mid Android and Firefox.

## Recipe B: glass panels over moving gradient
```css
.panel{
  position:relative; border-radius:28px; isolation:isolate;
  background: linear-gradient(135deg, rgba(255,255,255,.14), rgba(255,255,255,.04));
  -webkit-backdrop-filter: blur(20px) saturate(180%) brightness(1.05);
          backdrop-filter: blur(20px) saturate(180%) brightness(1.05);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.35),
    inset 0 -1px 0 rgba(255,255,255,.08),
    inset 0 0 24px rgba(255,255,255,.05),
    0 20px 50px -12px rgba(0,0,0,.45);
}
.panel::before{ /* rim light */
  content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
  background: conic-gradient(from 210deg, rgba(255,255,255,.7), rgba(255,255,255,.05) 25%,
              rgba(255,255,255,.05) 50%, rgba(255,255,255,.45) 75%, rgba(255,255,255,.7));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
.panel::after{ /* grain */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:url(noise.png); opacity:.05; mix-blend-mode:soft-light;
}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .panel{ background: rgba(24,24,40,.92); }
}
@media (prefers-reduced-transparency: reduce){ .panel{ background:rgba(24,24,40,.95); backdrop-filter:none; -webkit-backdrop-filter:none; } }
```
Optional Chromium-only upgrade: `backdrop-filter:url(#lens) blur(2px) saturate(160%)` gated by UA check, with kube.io-style map.
Keep panels <= 3-4 on screen; text in panel over tint with dark-mode tint ~ rgba(10,10,20,.25) for contrast.

## Weakly supported / verify
- All numeric "premium" values in recipes A/B beyond Comeau's and buildmvpfast's are my tuning, not measured from premium sites.
- Noise opacity/blend, conic rim, reeded-strip idea: no source.
- prefers-reduced-transparency support status contradictory (72% vs Safari none/Firefox disabled).
- -apple-visual-effect glass material: single source.
- -webkit-backdrop-filter custom-prop limitation: single blog.
- Search tool returned snippets; ekino, web.dev not read in full; Codrops/Hlukhov not found.
