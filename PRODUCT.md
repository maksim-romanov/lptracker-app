# Product

## Register

brand

> Depthly spans two surfaces: the marketing **landing page** (`apps/landing` — design IS the product) and the **mobile app** (`apps/mobile` — design SERVES the workflow). The default register is **brand**, since near-term design work centers on the landing page. Override to `product` per task when working inside the mobile app (`/impeccable <command> --register product`, or just say so).

## Users

DeFi power users who run concentrated-liquidity positions across multiple chains. They already understand LPs, tick ranges, impermanent loss, and accumulated fees — they don't need the concepts explained, they need them tracked accurately and surfaced fast. Context of use: checking exposure between other tasks (mobile, often one-handed), or on a wallet they're actively managing. Money is on the line, so trust in the numbers is the whole game.

- **Landing visitors:** crypto-native, skeptical of hype, evaluating whether this tool is credible enough to trust with their portfolio. Pre-launch, the job is to convince them to join the waitlist.
- **App users:** returning to monitor positions, fees, and holdings across chains in one place; following a single position via a home-screen widget.

## Product Purpose

DeFi portfolio monitoring — track LP positions, accumulated fees, and on-chain holdings across multiple networks in one place. Data flows Blockchain → Subgraphs + tokens-data → API → app. Currently pre-launch (Tally waitlist, "in development").

Success looks like: a visitor trusts the brand enough to join the waitlist; an app user opens Depthly and knows their cross-chain exposure in seconds without cross-referencing block explorers or wallet UIs.

## Brand Personality

**Technical & precise. Bold & high-contrast.** Voice: confident, exact, no filler — speaks to people who already know the domain. The visual identity is committed and shipping: neon pink (`#FF007A`, the Uniswap signature) breaking pure-black, grayscale chrome — a "wireframe distortion" aesthetic where the structure of the data is the decoration. Restraint everywhere so the one accent means something.

Three words: **precise, high-contrast, expert.**

Emotional goal: the credibility of an instrument, not the friendliness of a consumer app. Visitors should feel "these people know exactly what they're doing."

## Anti-references

*(Derived from committed design choices — the wireframe-on-black identity is itself a deliberate rejection of category clichés.)*

- **Generic crypto / web3.** No purple-blue gradients, glowing 3D coins, glassmorphism, or "to the moon" energy. The deliberate choice of monochrome wireframe chrome over crypto-purple is the brand's whole point.
- **SaaS dashboard template.** No hero-metric template (big number + small label + gradient accent), no identical icon-card grids, no stock fintech navy-and-gold.
- *(If a third comes up in conversation — likely bubbly consumer fintech à la Robinhood/Revolut, or Bloomberg-density clutter — add it here.)*

## Design Principles

1. **Wireframe truth.** The aesthetic mirrors the accuracy of the data. Structure, contrast, and precision carry the design; ornament that doesn't reflect real on-chain detail doesn't belong.
2. **Signal over noise.** Money is on the line. Every element earns its place; density is allowed, clutter is not. Restraint is what makes the numbers legible.
3. **The accent means something.** Neon pink is reserved for brand moments and primary action — never decorative tinting. Discipline everywhere else is what gives the one accent its weight.
4. **Expert confidence, no hand-holding.** Built for people who already understand DeFi. Don't over-explain, don't soften; respect the user's fluency.
5. **Distinctive over safe.** In a category flooded with crypto-purple and SaaS templates, the wireframe POV is the differentiator. Average is invisible — commit to the strangeness.

## Accessibility & Inclusion

Target: **WCAG 2.2 AA, with extra care.** Beyond AA contrast (≥4.5:1 body, ≥3:1 large), specifically:

- **Color-blind-safe data.** Chains and status (in-range / out-of-range / error) must never be distinguishable by color alone — pair with label, icon, shape, or position. This matters more here than usual because the palette leans on saturated chain colors and status neon.
- **Strong reduced-motion.** The landing's WebGL hero, entrance choreography, and Lenis smooth scroll all need real `prefers-reduced-motion` alternatives (static fallback image already exists for the hero; keep that discipline).
- Keyboard navigation, visible focus rings (the pink accent already serves as focus outline), and skip links on the landing.
