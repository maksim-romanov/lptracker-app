# Frosted / fluted glass over moving gradient: research notes (2026-10-08)

Evidence quality legend: [S] sourced number/claim from a fetched page; [W] weak (marketing/vendor/forum or search-summary only); [M] my own inference/recipe, not in any source.
Limits: search returned NO Awwwards/Codrops/Dribbble/Behance/Mobbin trend write-ups, NO analysis of apple.com, Linear, Vercel, Arc or Raycast pages, and no written tutorial for fluted CSS. Those parts are unverified; inspect live pages in DevTools if needed.

## 1. Sources actually read
- Gradient studio "Frosted Glass" preset (ribbed glass over lilac/pink/violet): https://uxpilot.ai/labs/gradient-generator/frosted-glass [S, vendor preset]
- Paper Shaders FlutedGlass (open source, WebGL): https://shaders.paper.design/fluted-glass , repo https://github.com/paper-design/shaders [S]
- Josh Comeau, backdrop-filter: https://joshwcomeau.com/css/backdrop-filter [S]
- LogRocket, liquid glass in CSS+SVG: https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/ [S]
- Infinum on iOS 26 Liquid Glass accessibility: https://infinum.com/blog/apples-ios-26-liquid-glass-sleek-shiny-and-questionably-accessible/ [S, beta-era]
- Six Colors on Apple's 26.1 changes: https://sixcolors.com/post/2025/11/soaping-up-liquid-glass-less-transparency-more-contrast/ [S]
- daisyUI aurora/mesh trend page: https://trends.daisyui.com/trend/mesh-gradient-aurora-ui/ [W, qualitative]
- Framer Reeded Glass component (param checklist only): https://www.framer.com/marketplace/components/reeded-glass/ [W]
- Other fluted components seen in search results only (not opened): https://21st.dev/@demonstrikk/components/flutedglass.md , https://pro.cult-ui.com/docs/components/fluted-glass , https://www.framer.com/marketplace/components/flutedglass/ , Webflow clone with tutorial https://webflow.com/made-in-webflow/website/fluted-glass (tutorial at youtu.be/o99tTXBGaw8, thelazygod.com/snippets/fluted-glass: unverified)
- Stripe gradient (WebGL, MiniGL, credited to Kevin Hufnagl): reverse-engineering copies, e.g. https://www.npmjs.com/package/mesh-gradient.js , GSAP forum https://gsap.com/community/forums/topic/24837-animating-gradients/ [W]
- Grain via feTurbulence: https://css-tricks.com/grainy-gradients/ (search hit css-tricks.com/?p=351302 / ?p=335760), MDN baseFrequency [S via search summary only]

## 2. Visual anatomy

### (1) Gradient layer
- Colour count: 3-5 neighbouring hues on a dark or pale base [daisyUI, W]. Concrete preset: dark base #2A0B3D plus three spots #C084FC (78%), #F9A8D4 (70%), #6D28D9 (60%): all one family (violet to pink), no complementary clash [uxpilot, S for numbers, W for "looks expensive"].
- Shape size/motion preset: scale 50, distort 30, swirl 10, angle 135, 7 bands, speed 30, vignette 20 [uxpilot, S]. Big soft shapes (roughly half the frame), drifting slowly.
- Contrast: bright spots on a deep base so the glass has something to bend; quiet dark/pale zones are kept behind text [daisyUI W].
- Speed: "slowly drift"; pause near reading tasks [daisyUI]. No source gives seconds per loop. [M] 30-60 s loops, orbs moving by 10-20% of viewport.
- Without strong local colour contrast, ribbing is invisible: the glass only reveals what is behind it. [M]

### (2) Glass layer
- Ribbing: 16 vertical panes preset; 8 panes = wide calm slats behind a pricing card; 30 panes = fine reeded texture that holds at small sizes [uxpilot, S]. Glass strength 70 default, drop to ~35 under long text [S]. Soft 60, intensity 60.
- Real WebGL parameters (Paper Shaders) [S]: size 0-1 (example 0.5), shape lines|wave|pattern|linesIrregular|zigzag, angle 0-180, distortionShape prism|lens|contour|cascade|flat, distortion 0-1 (example 0.5), shift -1..1, stretch 0-1, blur 0-1, edges 0-1 (example 0.25), shadows 0-1 (example 0.25), highlights 0-1 (example 0.1, "thin strokes along the distortion shape, antialias the small grid"), grainMixer 0-1, grainOverlay 0-1, minPixelRatio default 2.
- Grain: preset grain 8 (of 100?) size 1.5 [uxpilot]. CSS guidance: noise opacity 0.03-0.12; above ~0.15 reads as dirt [search summary, W]. Grain also dithers gradient banding [S-ish, widely stated]. Framer grainy-mesh component suggests 0.3-0.5 noise opacity [W; conflicts, depends on blend mode].
- Backdrop blur (CSS frosted, not fluted): blur(16px) default; blur(12px)+brightness(0.96) with 0.5-0.6 alpha bg; edge strip 4-6px thick, brightness up 110-120%; saturate(120-140%) to undo blur muddiness [Comeau, S]. Fallback bg alpha 0.95 when unsupported, 0.5 when supported.
- Edges: thin bright 1px rim / edge highlight (Paper `highlights` 0.1; LogRocket specular rim stroke 1-few px, ~50% opacity) [S]. Tint: white at ~15% (`hsl(0 100% 100% / 15%)`) over `brightness(150%)` in the LogRocket button [S].
- Key insight: true "fluted" look = per-stripe REFRACTION (each rib acts as a cylindrical lens: image is compressed/shifted inside each stripe, with a smooth profile), not just blur. Blur-only CSS looks like generic glassmorphism. [M, consistent with Paper's prism/lens distortionShape].

### (3) Typography and UI on top
- Sources say: keep text on calm zones, keep gradients out of paragraphs and small labels [daisyUI]; lower glass strength to ~35 under long text, choose light or dark text explicitly [uxpilot]; keep critical content off blurred surfaces [Infinum].
- [M] Large, medium-to-semibold sans headline in near-white or near-black, small count of text styles; one solid CTA. No source gives weights/sizes.

### (4) Restraint
- Sparse use of gradient-heavy regions [daisyUI]; a few floating glass elements only [LogRocket]; Apple itself dialled back in 26.1 (Tinted option, more opaque layers) after legibility complaints [Six Colors, Gulf News].
- [M] One hero surface per page, glass as ground not as card-on-card; static elsewhere.

## 3. Recipes

### CSS fluted over moving gradient (my recipe; the search produced it, no tutorial source) [M]
```css
.hero { position:relative; overflow:hidden; background:#2A0B3D; isolation:isolate }
.orb { position:absolute; width:55vmax; aspect-ratio:1; border-radius:50%;
  filter:blur(60px); opacity:.85; will-change:transform;
  animation:drift 40s ease-in-out infinite alternate }
.orb.a{ background:#C084FC; left:-10%; top:-20% }
.orb.b{ background:#F9A8D4; right:-15%; top:10%; animation-duration:55s }
.orb.c{ background:#6D28D9; left:20%; bottom:-30%; animation-duration:70s }
@keyframes drift { to { transform:translate3d(12vw,8vh,0) scale(1.15) } }

.glass { position:absolute; inset:0; pointer-events:none;
  backdrop-filter:blur(10px) saturate(130%);
  background:
    repeating-linear-gradient(90deg,
      rgba(255,255,255,.18) 0 1px,        /* rib highlight */
      rgba(255,255,255,.06) 1px 6px,
      rgba(0,0,0,.14) 6px 12px,           /* rib shadow side: fakes lens curvature */
      transparent 12px 24px);             /* ~24px pitch */
}
.grain { position:absolute; inset:0; opacity:.08; mix-blend-mode:overlay;
  background:url("noise-256.png") }       /* pre-baked tile, not live feTurbulence */
@media (prefers-reduced-motion:reduce){ .orb{ animation:none } }
@media (prefers-reduced-transparency:reduce){ .glass{ backdrop-filter:none; background:rgba(20,10,30,.85) } }
```
Honest limit: this fakes ribs with gradients (shading) and uniform blur; it does not refract per stripe. Variant from search: mask the backdrop-filter with `repeating-linear-gradient(90deg,#000 0 10px,transparent 10px 16px)` so only bands blur [M, from search answer]. For true refraction you need WebGL or SVG displacement (Chromium only).

### Cheaper alternative [M]
Render gradient + ribs once in WebGL canvas (or bake the ribbed result as a video/AVIF/WebP) so no live backdrop-filter is needed. The uxpilot page explicitly bakes glass into the gradient rather than using live CSS blur [S].

### WebGL (Paper Shaders) [S for props]
`<FlutedGlass image=... shape="lines" size={0.5} angle={0} distortionShape="prism" distortion={0.5} shadows={0.25} highlights={0.1} edges={0.25} blur={0} grainMixer={0} grainOverlay={0}/>` Feed it an image or render target of the moving gradient; image must be an element or URL, so animated source needs a separate canvas pipeline [M, check with docs]. Hand-rolled approach: render gradient to render target, in fragment shader quantize uv.x into stripes, offset sample by a smooth profile (e.g. sin or smoothstep) across each stripe, optional small per-channel offset for dispersion, add shadow/highlight by derivative of the profile [M].

### Stripe-style gradient
WebGL mesh with noise-displaced vertices, 3-4 colours, slow time uniform; reported to be battery-heavy [W forum].

### SVG "liquid glass" refraction (Chromium only) [S, LogRocket]
`backdrop-filter:url(#f) brightness(150%)`, filter: feGaussianBlur stdDeviation 1, feDisplacementMap scale 55 (R/G channels, 128 neutral), feColorMatrix saturate 50, rim blur 1, specular rim 50% opacity. Safari and Firefox do not accept SVG filters in backdrop-filter; fall back to blur.

## 4. Performance
- backdrop-filter over large animated area re-blurs every frame; keep the glass area small or let the glass sit on a static/cached layer. [Comeau doesn't discuss it; LogRocket: SVG backdrop filters reserve GPU resources, limit to few elements, S]
- Large `filter:blur()` orbs: cost scales with radius and area; animate only transform/opacity, avoid animating blur radius. [M]
- Live feTurbulence grain is CPU-rendered and choppy if animated; bake a PNG tile; numOctaves <=3 [search summary].
- WebGL: cap DPR (Paper default minPixelRatio 2, maxPixelCount available), pause offscreen via IntersectionObserver, render static frame for reduced-motion [M + S for props].
- Compat: backdrop-filter >97% (Dec 2024, Comeau); Firefox sticky + overflow + border-radius bug; Firefox flicker fix `overscroll-behavior:none`; `mask-image` over `overflow:hidden` in Chrome [S].

## 5. Accessibility
- Apple Liquid Glass drew contrast criticism: Infinum measured as low as 1.5:1 vs 4.5:1 needed (beta) [S, beta-era]; Apple responded with Tinted (26.1), Reduce Transparency + Increase Contrast (locks reduced transparency on in Tahoe) [S Six Colors].
- Web equivalents: honour `prefers-reduced-motion` (stop orbs / shader), `prefers-reduced-transparency` (still limited browser support, check caniuse) and `prefers-contrast` (swap to near-opaque panel) [M]. Add `@supports not (backdrop-filter)` fallback with opaque bg [Comeau pattern, S].
- Text over moving background: contrast varies per frame; test at the worst frame (brightest orb) or put text on a scrim/solid panel. Pause motion near reading [daisyUI]. WCAG 2.2.2 requires a pause mechanism for auto-moving content >5s [M].
- Don't rely on glass to separate interactive from decorative elements [Infinum].

## 6. Weakly supported / unverified
- Everything about Awwwards/Codrops/Dribbble/Behance/Mobbin trend status, Apple/Linear/Vercel/Arc/Raycast pages: not found. "Looks expensive" attributions are mine.
- Linear style description (#5E6AD2 accent, noise+grid+blobs) came from AI prompt-template pages, not site analysis [W].
- Grain opacity ranges conflict (0.03-0.12 vs 0.3-0.5); depends on blend mode.
- uxpilot numbers are one generator's preset, not an industry standard.
- Orb sizes, durations, rib pitch (~24px) and CSS fluted recipe are my estimates.
- Webflow/thelazygod tutorial not opened.

## 7. "What makes it look expensive" (synthesis, mostly [M] backed by sources above)
1. One hue family, big soft shapes, slow drift, dark base.
2. Glass reveals structure: ribs/panes at a considered pitch (8 calm, 16 default, 30 fine).
3. Refraction + thin highlight/shadow per rib, not flat blur.
4. Fine grain for dither/tactility at low opacity.
5. Text on quiet zones with high contrast, few type styles.
6. Restraint: one hero use, static fallback.
