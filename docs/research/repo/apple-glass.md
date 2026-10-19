# Apple materials and Liquid Glass: guidance for a web imitation (researched 2026-10-08)

Trust: HIG JSON and sosumi pages fetched directly (verbatim). WWDC talk quotes and newsroom quotes came through WebFetch summarisation (a small model), so treat as near-verbatim, not guaranteed.

## 1. Sources
- HIG Materials (last change log entry Sept 9, 2025): https://developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json  (human URL: /design/human-interface-guidelines/materials)
- HIG Color (Liquid Glass color, Dec 16, 2025 update): .../color.json
- HIG Accessibility: .../accessibility.json ; Dark Mode: .../dark-mode.json ; Motion: .../motion.json
- 404: .../liquid-glass.json and .../adopting-liquid-glass.json (no such HIG page; Liquid Glass lives inside Materials and Color)
- Adopting Liquid Glass: https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass (via https://sosumi.ai/documentation/technologyoverviews/adopting-liquid-glass)
- Applying Liquid Glass to custom views: https://developer.apple.com/documentation/swiftui/applying-liquid-glass-to-custom-views
- glassEffect(_:in:): https://developer.apple.com/documentation/swiftui/view/glasseffect(_:in:)
- WWDC25 219 Meet Liquid Glass: https://developer.apple.com/videos/play/wwdc2025/219/
- WWDC25 356 Get to know the new design system: https://developer.apple.com/videos/play/wwdc2025/356/
- Newsroom 2025: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- WWDC26 keynote (2026): https://developer.apple.com/videos/play/wwdc2026/101/
- iOS 27 page: https://www.apple.com/os/ios/
- Not retrieved: Landmarks sample page (fetched to raw/ but not read in detail; it is code-focused), apple.com/ios/ios-26/ (404).

## 2. Material properties (what Apple defines)
Verbatim HIG Materials:
- "A material is a visual effect that creates a sense of depth, layering, and hierarchy between foreground and background elements."
- "By allowing color to pass through from background to foreground, a material establishes visual hierarchy"
- "Liquid Glass forms a distinct functional layer for controls and navigation elements — like tab bars and sidebars — that floats above the content layer"
- "Liquid Glass allows content to scroll and peek through from beneath these elements to give the interface a sense of dynamism and depth, all while maintaining legibility for controls and navigation."

Apple technology overview: "a dynamic material ... which combines the optical properties of glass with a sense of fluidity"; custom-views doc: "a material that blurs content behind it, reflects color and light of surrounding content, and reacts to touch and pointer interactions in real time."

Newsroom 2025: "This translucent material reflects and refracts its surroundings"; "Its color is informed by surrounding content and intelligently adapts between light and dark environments."; "Liquid Glass uses real-time rendering and dynamically reacts to movement with specular highlights."

WWDC25 219 (via WebFetch):
- Lensing: "The primary way Liquid Glass visually defines itself is through something called Lensing." "Where as previous materials scattered light, this new set of materials dynamically bends, shapes, and concentrates light in real time." (i.e. defined by lensing at the edges, not by uniform blur.)
- Size changes material: at larger sizes "It casts deeper, richer shadows, has more pronounced lensing and refraction effects, and a softer scattering of light."
- Specular: "Light sources inside of this environment shine on the material producing highlights that respond to geometry"; highlights move with interaction and device motion.
- Adaptive shadow: "increases the opacity of its shadow when it is over text. Conversely, it lowers the opacity of its shadow when it is over a solid light background." "As text scrolls underneath, shadows become more prominent"
- Colour spill: "Light from colorful content nearby can subtly spill onto its surface"
- Interaction: "When interacting with Liquid Glass, the material illuminates from within as a form of feedback."
- Adaptive tint: "The amount of tint and the dynamic range shift to always ensure buttons remain legible, while letting as much of the content through as possible."
- Light/dark: small elements (nav bars, tab bars) flip light/dark with background; "Bigger elements, like menus or sidebars ... don't flip from light to dark. Their surface area is too big and transitions like these would be distracting."
- HIG Color agrees: "Liquid Glass appears more opaque in larger elements like sidebars to preserve legibility over complex backgrounds"

## 3. Variants and tint
HIG Materials:
- "The regular variant blurs and adjusts the luminosity of background content to maintain legibility of text and other foreground elements." Use "when background content might create legibility issues, or when components have a significant amount of text, such as alerts, sidebars, or popovers."
- "The clear variant is highly translucent ... Use this variant for components that float above media backgrounds — such as photos and videos"
- "Only use clear Liquid Glass for components that appear over visually rich backgrounds."
- "If the underlying content is bright, consider adding a dark dimming layer of 35% opacity."
- WWDC25 219: Regular and Clear "should never be mixed". Clear conditions: over media-rich content; content layer unharmed by dimming; "content sitting above it is bold and bright". Clear "does not have adaptive behaviors."
HIG Color (Liquid Glass color):
- "By default, Liquid Glass has no inherent color, and instead takes on colors from the content directly behind it."
- Tint: "giving them the appearance of colored or stained glass ... for drawing emphasis to a specific control, like a primary call to action". "Apply color sparingly ... Refrain from adding color to the background of multiple controls." Colour the glass background, not the label.
- WWDC25 219 on tint: "Selecting a color generates a range of tones that are mapped to content brightness underneath ... changing its hue, brightness and saturation depending on whats behind without deviating too much from the intended color." "When every element is tinted, nothing stands out"
- "Avoid using similar colors in control labels if your app has a colorful background ... prefer a monochromatic appearance"; "make sure its default or resting state ... maintains clear legibility."
Standard materials (content layer, iOS): ultraThin, thin, regular (default), thick. "Thicker materials, which are more opaque, can provide better contrast for text and other elements with fine features. Thinner materials ... help people retain their context." "Avoid selecting a material or effect based on the apparent color it imparts". Use vibrant colors on top; "avoid [quaternary] on top of the [thin] materials, because the contrast is too low."

## 4. Where to use / not use, layering
- "Don't use Liquid Glass in the content layer." Use standard materials for content layer. Exception: transient controls such as sliders/toggles take glass appearance when activated.
- "Use Liquid Glass effects sparingly ... Limit these effects to the most important functional elements in your app."
- Adopting: "avoid overcrowding or layering Liquid Glass elements on top of each other." Custom backgrounds in controls "might overlay or interfere".
- WWDC25 356: "Elements using Liquid Glass require clear separation from content ... controls sit on top of a system material, not directly on content. Without that separation, contrast can suffer." "apply the material directly to the control, not its inner views."
- Scroll edge effect: subtle blur replacing hard dividers; "not decorative. They don't block or darken like overlays"; one per view; do not mix/stack soft and hard.
- Concentricity: nested rounded shapes concentric to container (ConcentricRectangle).
- Performance: "Creating too many Liquid Glass effect containers ... can degrade performance. Limit the use of Liquid Glass effects onscreen at the same time." Use GlassEffectContainer to combine.
- Half sheet expanded to full height "transitions to a more opaque appearance".

## 5. Motion and interactivity
- Morph: GlassEffectContainer(spacing) blends neighbouring glass shapes when closer than spacing; transitions `matchedGeometry` and `materialize`. WWDC25 219: "Instead of fading, Liquid Glass objects materialize in and out by gradually modulating the light bending and lensing"; "gel-like flexibility ... moves in tandem with your interaction"; `.interactive()` gives press/pointer reactions.
- Controls: slider/toggle knob "transforms into Liquid Glass during interaction"; buttons "fluidly morph into menus and popovers".
- HIG Motion: "Add motion purposefully"; "Make motion optional"; "avoid adding motion to UI interactions that occur frequently"; "Let people cancel motion."

## 6. Accessibility fallbacks
- WWDC25 219: "Reduced Transparency, makes Liquid Glass frostier and obscures more of the content behind it." "Increased contrast, makes elements predominantly black or white and highlights them with a contrasting border." "Reduced Motion decreases the intensity of some effects and disables any elastic properties for the material."
- HIG Accessibility contrast table (WCAG AA): 4.5:1 for text (small), 3:1 for larger/bold text and icons (table rows: 4.5:1, 3:1, 3:1). "ensure it at least provides a higher contrast color scheme when ... Increase Contrast is turned on." Also check both light and dark.
- HIG Dark Mode: "make sure the contrast ratio between colors is no lower than 4.5:1. For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text." Test "in Dark Mode with Increase Contrast and Reduce Transparency turned on (both separately and together)".
- HIG Accessibility, Reduce Motion: reduce "automatic and repetitive animations, including zooming, scaling, and peripheral motion"; "Tightening animation springs", "Replacing transitions in x-, y-, and z-axes with fades", "Avoiding animating into and out of blurs".
- HIG Materials: variants "can differ in response to ... accessibility settings that reduce transparency or increase contrast"; adopting doc: settings "can remove or modify certain effects".

## 7. 2026 updates (iOS 27 / macOS 27)
- No 2026 change to the HIG Materials text itself (log ends Sept 9, 2025); Color updated Dec 16, 2025.
- WWDC26 keynote (https://developer.apple.com/videos/play/wwdc2026/101/): "To ensure exceptional readability, we tuned Liquid Glass so it diffuses complex content behind it much more effectively, while also creating more depth and separation." "we're adding a new slider and settings to adjust Liquid Glass, so you can set it anywhere from ultra clear to fully tinted."
- apple.com/os/ios (iOS 27): "Updates to Liquid Glass ensure exceptional readability with more uniform refraction and improved contrast." "a new slider lets you easily customize how Liquid Glass looks, from ultraclear to fully tinted."
- Takeaway: Apple's own 2026 direction is toward MORE diffusion and contrast over busy content, and user control of transparency. A web imitation should not be more transparent than iOS 26.0 defaults.

## 8. Apple marketing visuals
Verified: only text claims (translucent, refracts, specular highlights; "swirly gold background" in an alt text on the iOS 27 page for a Mail example, "high contrast makes buttons very legible"). apple.com/os/ios HTML contains no inline `backdrop-filter`. NOT verified: any pixel values, grain, or edge-light implementation in Apple marketing imagery (it is rendered imagery/video, not CSS). Did not inspect external stylesheets or screenshots.

## 9. Reproducible CSS characteristics (inference from the above; Apple publishes NO numeric blur/opacity values)
Apple gives only these numbers: 35% dark dimming for clear glass over bright content; 4.5:1 / 3:1 / 7:1 contrast. Everything else below is design judgement.
- Regular, not clear: text-bearing surfaces use regular behaviour = blur + luminosity adjustment, so use backdrop-filter blur plus brightness/saturate shift, with enough fill that text meets 4.5:1 at the worst-case gradient point. Over a moving colour gradient, a clear look cannot guarantee that; add a ~35% dimming layer if a clear variant is wanted.
- Lensing = edge-weighted: simulate with a bright thin inner edge (1px inset highlight, top/left brighter, i.e. specular responding to geometry) and a faint inner shadow/edge dark on the opposite side; avoid uniform frosted slab. True refraction is not feasible in CSS (SVG displacement filter is Chromium-only for backdrop-filter; unverified here).
- Colour: untinted by default, picks up gradient behind (saturate > 1 on backdrop). Tint only one primary action, on its background, not on labels.
- Adaptive shadow: soft, larger shadow when over text/busy regions; subtle over light solid.
- Large surfaces more opaque (sidebars, big panels) and do not flip light/dark; small chips may flip.
- Concentric radii for nested rounded shapes.
- Limit count: few glass surfaces, no glass stacked on glass, glass not on body content cards (Apple: content layer uses standard materials; marketing section cards are arguably content layer, so prefer thicker, more opaque fill).
- Fallbacks to implement: `prefers-reduced-transparency: reduce` -> opaque/near-opaque frosty fill, no backdrop-filter (limited browser support: unverified); `prefers-contrast: more` -> near black/white fill plus visible contrasting border; `prefers-reduced-motion: reduce` -> stop gradient animation, no elastic/spring, no animating blur in/out; also provide `@supports not (backdrop-filter)` fallback.
- Moving gradient: Apple says legibility must hold at rest and while content moves ("default or resting state ... maintains clear legibility"); keep gradient slow, low-amplitude, and test worst-case frames.

## 10. Could not verify
- Any numeric blur radius, saturation, tint opacity, grain or edge-light values from Apple (none published).
- Whether WebFetch-summarised WWDC25 quotes are character-exact.
- The "Landmarks: Building an app with Liquid Glass" details (not read).
- Apple marketing page CSS/imagery; external CSS not inspected.
- WWDC26 keynote attributes macOS "Golden Gate" naming per summariser; version attribution of individual changes inferred.
