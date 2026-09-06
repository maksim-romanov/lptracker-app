# Product

## Register

product

## Surfaces

This is a Turborepo monorepo with several design surfaces. PRODUCT.md anchors the **mobile app** (`apps/mobile`) as the default register, but the strategic direction below carries across surfaces:

- **`apps/mobile`** — the product (React Native / Expo), plus a home-screen widget on iOS and Android. The default register.
- **`apps/server` `/app`** — the monitor inside Telegram (Hono SSR + HTMX). Built and shipping. Product register.
- **`apps/landing`** — the brand surface (Eleventy + WebGL particle hero). Pre-launch waitlist. Design IS the product there.
- **Apple Watch** _(planned)_ — wrist-glance complications for followed positions. An extension of the widget's ambient-presence thesis.
- **Blog** _(planned)_ — long-form content. Brand register when it lands.

All three built surfaces share one system: colors, spacing, radius and type roles come from
`packages/theme`. A surface may set less than the full system, never something different.

The widget / Watch / Telegram surfaces are constrained spaces — design for them as glanceable, single-purpose readouts, not shrunk-down dashboards.

When a task targets a non-default surface, override the register for that task; the brand personality and anti-references stay shared.

## Users

DeFi liquidity providers and crypto-native power users — people who already run multiple wallets across multiple chains and protocols. Their context: checking on capital that's actively at work. They want to know, at a glance and on the move, how their LP positions are performing — accumulated fees, position value, and onchain holdings — across every network in one place, without stitching together block explorers and protocol UIs.

Lead with the LP/power-user value, but keep copy and flows legible to a broader onchain-holder audience who don't live in tick math.

## Product Purpose

Depthly is an onchain portfolio monitor: track every LP position, accumulated fees, and holding across every chain. Accurate data is table stakes — Revert Finance, Krystal, and others already do that. Depthly's reason to exist is **where and how that data reaches you**:

- **Native, mobile-first.** Not a web dashboard ported to a phone — a real native app, fast and at-hand, with **home-screen widgets** for the positions you care about most. The glanceable, ambient read is the product.
- **Everywhere you already are.** A **Telegram mini-app** ships today; **Apple Watch** is next, and more surfaces over time. The monitor follows the user across platforms instead of making them come to a tab.
- **Open source.** Anyone can plug in their own protocol, fix a bug, or self-host. Coverage and trust compound from the community, not from a closed roadmap.

Success is a user trusting Depthly as their first, ambient check — on the lock screen, the wrist, or a Telegram message — without opening a single explorer or protocol UI.

## Differentiators

What sets Depthly apart from existing LP/portfolio trackers (Revert Finance, Krystal, Zapper):

1. **Ambient native presence** — home-screen widgets today, Apple Watch next. The value is a zero-friction glance, not another dashboard to visit.
2. **Multi-surface reach** — one monitor across mobile, a Telegram mini-app, and the watch next, meeting users where they already are.
3. **Open source** — community-extensible protocol integrations and self-hosting; correctness and coverage are auditable and contributable, not a black box.

## Brand Personality

Sleek, premium, minimal. The voice is an expert instrument, not a salesperson — calm, precise, and confident, assuming the user is competent. Restraint is the signature: neutral chrome stays quiet so live data and the single violet accent carry all the meaning. Premium feel comes from what's omitted and how exact the numbers read, never from decoration. Emotional goal: quiet confidence and control over capital that's in motion.

## Anti-references

_(Inferred from the theme's own intent and the "sleek, premium, minimal" direction — confirm or adjust.)_

- **Generic crypto dashboards** (Zapper / CoinGecko sea-of-identical-cards): cluttered tables, every-token-everywhere, no hierarchy.
- **Corporate fintech**: navy-and-white bank UI, sterile and safe, stock-photo trust signals.
- **Web3 maximalist**: gradient soup, decorative glassmorphism, floating 3D coins, glow on everything.
- **Toy / playful consumer**: rounded mascots, pastel gradients, gamified confetti (Robinhood-lite).
- Per the theme contract: anything tinted with the accent that isn't a deliberate accent — violet belongs to CTAs, active state, focus, and brand glow only; everywhere else pulls the design off the wireframe.

## Design Principles

1. **Instrument, not toy.** Every element is an affordance for reading or acting on capital. If it doesn't help the user understand or move money, it doesn't ship.
2. **Silence, then signal.** Chrome is neutral and quiet on purpose. The accent and the live numbers are the only things allowed to speak loudly — and only when they mean something.
3. **The data is the hero.** Positions, fees, and P&L are the content. Layout and chrome recede so the figures lead; never let decoration compete with a number.
4. **Restraint is the luxury.** Premium comes from omission and precision, not ornament. When in doubt, remove.
5. **Never mislead.** Onchain numbers must be exact and unambiguous. P&L and status are never signalled by color alone — pair red/green with icon, label, or sign so the meaning survives color blindness and a glance.

## Accessibility & Inclusion

- **WCAG AA** contrast across both dark (default) and light themes — body ≥4.5:1, large text ≥3:1. The bumped wireframe outlines exist to hold this on near-black surfaces.
- **Reduced motion**: every animation needs a `prefers-reduced-motion` alternative (crossfade or instant). Motion is intentional, never load-bearing for comprehension.
- **Color-blind safe**: P&L, success/error/warning, and chain identity must not rely on hue alone — reinforce with sign, icon, label, or position. Network brand colors are an aid to identification, not the sole signal.
