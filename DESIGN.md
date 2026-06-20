---
name: Depthly
description: Onchain portfolio monitoring — a wireframe instrument for DeFi power users.
colors:
  primary: "#FF007A"
  primary-deep: "#CC0062"
  primary-deeper: "#A4014D"
  secondary: "#FF80BE"
  surface: "#000000"
  surface-container: "#16181C"
  surface-variant: "#202327"
  ink: "#E7E9EA"
  ink-muted: "#8B8F95"
  outline: "#4A4D52"
  outline-variant: "#33363A"
  on-accent: "#FFFFFF"
  error: "#F4212E"
  success: "#00FFA1"
  warning: "#FFD60A"
  chain-ethereum: "#627EEA"
  chain-base: "#0052FF"
  chain-arbitrum: "#28A0F0"
  chain-optimism: "#FF0420"
  chain-polygon: "#8247E5"
  chain-bnb: "#F3BA2F"
  chain-avalanche: "#E84142"
typography:
  display:
    fontFamily: "Satoshi-Black, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  landing-display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Satoshi-Bold, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  headline:
    fontFamily: "Satoshi-Bold, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0"
  body:
    fontFamily: "Satoshi-Regular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  body-small:
    fontFamily: "Satoshi-Regular, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Satoshi-Medium, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.5px"
  button:
    fontFamily: "Satoshi-Medium, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.5px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
  "3xl": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deeper}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  input:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px"
  chip-network:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: Depthly

## 1. Overview

**Creative North Star: "The Wireframe Instrument"**

Depthly looks like a precision measuring tool for onchain capital, not a crypto app. The chrome is strictly monochrome — pure black surfaces, grayscale containers, hairline outlines — so the *data* becomes the structure and the structure becomes the decoration. There is exactly one live signal in the system: neon pink (`#FF007A`, the Uniswap signature). It breaks the silence on primary actions, active states, focus, and brand glow, and nowhere else. Restraint everywhere is what gives that one accent its weight.

The system speaks to people who already understand concentrated liquidity, tick ranges, and accumulated fees. It does not soften, round off, or over-explain. Density is permitted because the audience is fluent; clutter is not, because money is on the line and legibility is the whole job. The aesthetic explicitly rejects the two category reflexes: the purple-blue gradient, glassmorphic, glowing-3D-coin **crypto/web3 look**, and the hero-metric, identical-card-grid, navy-and-gold **SaaS dashboard template**. If a screen could be mistaken for either, it has drifted off-brand.

Depth is conveyed by tonal layering and contrast, not by drop shadows — the one exception being the iOS brand halo, where pink lives *on* the shadow channel as an intentional glow.

**Key Characteristics:**
- Pure-black canvas with grayscale chrome; color is data, not decoration.
- A single neon-pink accent, rationed deliberately.
- Sharp, instrument-grade components: tight radii, hairline borders, restrained motion.
- High contrast tuned for color-blind-safe data (never color alone).
- Identity is committed and shipping — preserve it; don't reintroduce category clichés.

## 2. Colors

A monochrome instrument panel pierced by one neon signal, with saturated per-chain colors reserved strictly for data identity.

### Primary
- **Neon Pink** (`#FF007A`, `oklch(64.4% 0.259 4.3)`): The Uniswap-signature brand accent. Active nav state, focus rings, brand glow — the bright identity pink. This is the *only* chromatic voice in the chrome. Does **not** carry white text (white-on-`#FF007A` is 3.8:1 — fails AA).
- **Deep Pink** (`#CC0062`, `oklch(54.5% 0.219 3.7)`): Primary button fills and any pink surface bearing white text. White-on-Deep-Pink is 5.5:1 (AA). This — not Neon Pink — is the CTA fill.
- **Deeper Pink** (`#A4014D`): Button hover/pressed. White text 7.8:1.

### Secondary
- **Soft Pink** (`#FF80BE`): Lighter pink for secondary chips and subtle accent states. Used sparingly; not a second brand color.

### Neutral
- **Void Black** (`#000000`): The base surface. The canvas everything sits on; the silence the accent breaks.
- **Container Graphite** (`#16181C`): Raised containers — cards, inputs, menus — one step off the void.
- **Variant Slate** (`#202327`): Second-level containers and chip backgrounds.
- **Chrome Ink** (`#E7E9EA`): Primary text and high-contrast wireframe lines.
- **Muted Ink** (`#8B8F95`): Secondary text and labels. Bump toward Chrome Ink for body copy on dark — never below 4.5:1.
- **Outline** (`#4A4D52`) / **Outline Variant** (`#33363A`): Hairline borders, bumped for wireframe contrast. Dividers and component strokes.

### Status (saturated for accessibility — always paired with icon/label)
- **Error Red** (`#F4212E`) · **Neon Mint Success** (`#00FFA1`, in-range) · **Neon Yellow Warning** (`#FFD60A`).

### Chain Identity (data, not chrome — may appear anywhere a chain needs to be recognized)
- Ethereum `#627EEA` · Base `#0052FF` · Arbitrum `#28A0F0` · Optimism `#FF0420` · Polygon `#8247E5` · BNB `#F3BA2F` · Avalanche `#E84142`. Each keeps its canonical brand color across light and dark.

### Named Rules
**The One Signal Rule.** Pink appears only as a brand accent — primary action, active state, focus, glow. Anything tinted pink that is not one of those pulls the design out of the wireframe. Chrome stays grayscale.

**The Two-Pink Rule.** The bright Neon Pink (`#FF007A`) is identity-only — glow, focus, active state. Any pink that sits *under white text* (buttons, badges) uses Deep Pink (`#CC0062`) so it clears AA. Never put white on `#FF007A`. Same hue, two jobs.

**The Color-Is-Data Rule.** Saturated color in the chrome means something machine-readable: a chain, a status, an action. Never decorative.

## 3. Typography

**Display / Body Font:** Satoshi (with `ui-sans-serif, system-ui` fallback) — the app's brand typeface, a geometric grotesque carried across weights (Regular / Medium / Bold / Black).
**Landing Display:** native `ui-sans-serif` system stack on a fluid `clamp()` scale (the landing currently ships system-sans pending Satoshi web embedding; keep the tight tracking and weight contrast).
**Mono Font:** Menlo — reserved for raw addresses, hashes, and numeric readouts where monospaced alignment aids scanning.

**Character:** One family doing the work through weight and size contrast, not a display+body pair. Geometric and exact — it reads as instrumentation, not editorial. Tight tracking on large display sizes; neutral tracking on body.

### Hierarchy
- **Display** (Satoshi Black 700, 32px mobile / `clamp(2.5rem,6vw,5.5rem)` landing, lh 1.05–1.2, ls -0.025em on landing): Hero headlines, screen titles.
- **Title** (Satoshi Bold 700, 22px, lh 1.4): Section and screen headers.
- **Headline** (Satoshi Bold 700, 18px, lh 1.4): Card and group headers.
- **Body** (Satoshi Regular 400, 16px, lh 1.6): Default reading text. Cap measure at 65–75ch; landing uses ~36rem.
- **Body Small** (Satoshi Regular 400, 13px, lh 1.5): Secondary detail, notes, captions.
- **Label** (Satoshi Medium 500, 14px, ls 0.5px): Buttons, chips, metadata.

### Named Rules
**The Light-On-Dark Rule.** Light type on black reads lighter than its weight; give display and body extra line-height breathing room (already baked into the 1.05–1.6 scale). Never set long body copy in Muted Ink.

**The Tracking Floor Rule.** Display letter-spacing never tighter than -0.04em. Landing display sits at -0.025em; don't crush it further.

## 4. Elevation

Flat by default. Depth comes from tonal layering — Void Black → Container Graphite (`#16181C`) → Variant Slate (`#202327`) — and from hairline outlines, not from drop shadows. A 2014-style dark shadow under a card is forbidden; if a surface needs to lift, raise its tone or add an outline.

### Shadow Vocabulary (the deliberate exception)
- **Brand Halo** (pink on the `shadow` channel, `#FF007A`): The iOS brand glow only. A soft pink halo under accent elements, used as identity, never as generic elevation.
- **Nav Veil** (`backdrop-filter: blur(14px) saturate(140%)` over `rgb(0 0 0 / 0.75)`): The fixed nav is the one sanctioned glass surface — purposeful, with an opaque `var(--bg)` fallback where backdrop-filter is unsupported.

### Named Rules
**The Tonal-Depth Rule.** Stack tone, not shadow. Three grayscale steps carry the entire elevation system; reach for a shadow only for the pink brand halo.

## 5. Components

Components are **sharp and precise** — instrument-grade exactness over softness. Tight radii, hairline borders, restrained transitions (120–150ms).

### Buttons
- **Shape:** Pill (`9999px`) for marketing/primary CTAs; `12px` (`rounded.md`) for in-app controls.
- **Primary:** Deep Pink (`#CC0062`) fill, white text (`#FFFFFF`, 5.5:1), `14px 32px` padding, Label/Button type. (Not Neon Pink — see The Two-Pink Rule.)
- **Hover / Press:** Background deepens to `#A4014D` over `background-color 150ms ease`. Focus shows a 2px Neon Pink (`#FF007A`) outline, 3px offset (5.5:1 on black).
- **Ghost:** Transparent on Void Black, Chrome Ink text, hairline `#4A4D52` outline. For secondary actions.

### Inputs / Fields
- **Style:** Container Graphite (`#16181C`) fill, `12px` radius, hairline `#33363A` outline, Body type.
- **Focus:** Outline shifts to `#FF007A` (the accent doubles as focus indicator); no glow.
- **Placeholder:** Must clear 4.5:1 — use Muted Ink at full opacity, never a faint gray.

### Cards / Containers
- **Corner Style:** `16px` (`rounded.lg`).
- **Background:** Container Graphite (`#16181C`) on the Void Black canvas.
- **Elevation:** Flat — tonal step + optional hairline outline. No drop shadow (see Elevation).
- **Internal Padding:** `16px` default.
- **Never nest cards.**

### Chips (network / status)
- **Network:** Variant Slate (`#202327`) background or the chain's `soft` tint (e.g. `rgba(98,126,234,0.14)` for Ethereum), pill shape, Label type, chain color as a leading dot or icon — **plus a text label**, never color alone.
- **Status:** in-range Neon Mint, out-of-range/error Red, paired with an icon so state survives color blindness.

### Navigation
- **Landing:** Fixed top bar, `rgb(0 0 0 / 0.75)` with `blur(14px) saturate(140%)`, hairline bottom border, slide-down entrance (`360ms cubic-bezier(0.16,1,0.3,1)`), disabled under reduced-motion.
- **Logo:** Black rounded square with a single pink dot — the wireframe-instrument mark in miniature.

### Signature Component: The Hero Canvas
The landing hero is a fixed full-bleed WebGL scene (OGL) — a particle wireframe of the brand silhouette over the void, with a pink/cool radial glow masked at the edges. A static silhouette image is the reduced-motion and no-WebGL fallback. This canvas *is* the imagery; it carries the "wireframe instrument" idea literally. Never replace it with a flat colored panel.

## 6. Do's and Don'ts

### Do:
- **Do** keep all chrome strictly grayscale on Void Black (`#000000`); let neon pink (`#FF007A`) be the only chromatic voice.
- **Do** ration the accent — primary action, active state, focus, brand glow, and nothing else (The One Signal Rule).
- **Do** convey depth with tonal layering (`#000000` → `#16181C` → `#202327`) and hairline outlines, not drop shadows.
- **Do** pair every chain/status color with a label, icon, or shape so meaning survives color blindness.
- **Do** keep body copy at full-contrast Chrome Ink (`#E7E9EA`) and ≥4.5:1; reserve Muted Ink for secondary text only.
- **Do** ship real reduced-motion alternatives for the WebGL hero, entrance choreography, and Lenis smooth scroll.

### Don't:
- **Don't** reintroduce the **generic crypto/web3 look** — no purple-blue gradients, glassmorphism, glowing 3D coins, or "to the moon" energy.
- **Don't** put coins Depthly doesn't track in the CTA token field. It's limited to EVM / Uniswap-V3 assets and the supported chains (`tokens.ts` → ETH, USDC, USDT, BNB, MATIC, AVAX, LINK, ARB, OP, BASE) — no BTC / XRP / ADA / DOGE / SOL.
- **Don't** fall into the **SaaS dashboard template** — no hero-metric block, no identical icon-card grids, no stock fintech navy-and-gold.
- **Don't** put white text on Neon Pink (`#FF007A`) — it's 3.8:1, fails AA. White-bearing pink surfaces use Deep Pink (`#CC0062`).
- **Don't** tint chrome pink decoratively; pink that isn't an accent breaks the wireframe.
- **Don't** add drop shadows for elevation (the pink iOS brand halo is the only sanctioned shadow).
- **Don't** use glassmorphism beyond the one sanctioned nav veil.
- **Don't** set display letter-spacing tighter than -0.04em, or body text in Muted Ink.
- **Don't** nest cards, or replace the hero canvas with a flat colored panel.
