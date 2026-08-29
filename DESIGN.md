# Design

The visual system shared by every Depthly surface: the mobile app, its home-screen widgets, the
Telegram mini app at `/app`, and the landing. Strategy, audience and anti-references live in
[PRODUCT.md](PRODUCT.md) — read that first; this file is only how the strategy looks.

**One system, not four.** Color, spacing, radius and type roles are generated from
`packages/theme` and consumed everywhere. A surface may use less of the system than another; it
may never use something different. If a surface needs a value the system lacks, the value goes
into the token tree — not into that surface's stylesheet.

> `/app` is mid-redesign and deliberately unfinished: hairline borders, no radius, no elevation.
> This document describes where it is going, not where it is. Mobile is the reference
> implementation today.

## Color

Pure black canvas, monochrome chrome, one neon signal. Depth comes from tonal steps, never from
gray shadows.

| Role | Dark | Light |
| --- | --- | --- |
| `surface` | `#000000` | `#FFFFFF` |
| `surfaceContainer` | `#16181C` | `#F7F9F9` |
| `surfaceVariant` | `#202327` | `#EFF3F4` |
| `onSurface` | `#E7E9EA` | `#0F1419` |
| `onSurfaceVariant` | `#8B8F95` | `#536471` |
| `outline` | `#4A4D52` | `#B5BEC4` |
| `outlineVariant` | `#33363A` | `#DFE4E7` |
| `primary` | `#FF007A` | `#CC0062` |

Status: `success #00FFA1`, `warning #FFD60A`, `error #F4212E`, `info #00D4FF`.

Chain identity is its own axis, never mixed with status: ethereum `#627EEA`, base `#0052FF`,
arbitrum `#28A0F0`, optimism `#FF0420`, polygon `#8247E5`, bnb `#F3BA2F`, avalanche `#E84142`.

Dark is the default and the one that is designed. Light exists in the token tree and is
under-specified — treat a light-mode screen as unreviewed until someone has actually looked at it.

**The One Voice Rule.** Signature Pink appears on ≤10% of any screen. It belongs to CTAs, active
state, focus, and glow — nothing else. The moment a second thing is pink, the signal is gone.

**The Color-Is-Information Rule.** Every non-neutral color on screen must mean something:
emphasis (pink), status (mint/amber/red), or identity (network). Color for mood gets deleted.

## Typography

Two families, split by what the text **is**. Words are set in IBM Plex Sans; figures, addresses
and hashes in IBM Plex Mono. The product is a dial and the numbers are what people look at, so
the numeral is treated as the display face rather than as an afterthought under one.

| Role | Family | Size / line / tracking | Weight |
| --- | --- | --- | --- |
| `display` | mono | 34 / 40 / −0.6 | 500 |
| `figure` | mono | 15 / 21 / −0.2 | 400 |
| `figureSmall` | mono | 13 / 19 / −0.2 | 400 |
| `title` | sans | 22 / 28 / −0.3 | 600 |
| `headline` | sans | 17 / 23 / −0.1 | 600 |
| `body` | sans | 15 / 21 / 0 | 400 |
| `bodySmall` | sans | 13 / 19 / 0 | 400 |
| `label` | sans | 12 / 16 / +0.5 | 500 |
| `caption` | sans | 11 / 14 / 0 | 400 |
| `button` | sans | 16 / 20 / +0.5 | 500 |
| `input` | sans | 16 / 20 / 0 | 500 |

**The Mono-Is-For-Truth Rule.** Mono carries what comes off the chain — amounts, prices, ticks,
fees, addresses. It never carries prose or a label for techy flavor; that is costume. The payoff
is mechanical: a column of monospaced figures holds its width between refreshes, so a value
changing does not shift the row around it.

**The Two-Families-Is-The-Limit Rule.** The split is functional, not decorative. Within a family
hierarchy is built from weight and size, never from a third face brought in for flavor.

**The Never-Color-Alone Rule.** P&L, status and chain identity pair color with a sign, arrow,
icon, or label. Meaning must survive color blindness and a half-second glance.

## Space and shape

Spacing steps: `2 4 8 12 16 20 24 32 40 48 64 80 96`.
Radius steps: `4 8 12 16 20 24 32`, plus `full` (9999).

Anything you press is a pill (`full`). Cards and fields sit on the 12–16 family. Nothing invents a
value between steps.

## Elevation

**Flat by doctrine.** Resting surfaces cast no shadow. Depth is tonal layering —
`#000000` → `#16181C` → `#202327` — plus hairline outlines. This is enforced in the token tree:
the `shadow` role resolves to Signature Pink in *both* themes, so there is no gray to reach for.

The one lift in the system is a **colored glow**: a focal element casts a shadow tinted with the
accent or a status hue. Focal glow is `shadowOpacity 0.45`, `shadowRadius 14–16`, offset `0 0`.

Tinted fills and borders step through a fixed alpha vocabulary — `14` (≈8%) and `1F` (≈12%) for
fills, `26` (≈15%) for stronger fills, `40` (≈25%) and `66` (≈40%) for borders. Reuse these exact
steps.

**The No-Dark-Shadow Rule.** A shadow here is a colored glow or it is a bug.

**The Glow-Means-Now Rule.** Glow marks the single focal moment on a surface — an empty-state
prompt, an alert, the position that needs attention. Glow on everything is web3 maximalism; glow
on one thing is signal.

## Motion

Not in the token tree yet, and the two platforms do not agree. Until it is:

- Every animation needs a reduced-motion alternative — crossfade or instant. Motion never carries
  meaning on its own.
- Prefer one orchestrated moment over scattered micro-effects.
- Transition named properties, never `all`. Use `ease-out` for anything the user triggered, so it
  responds instantly and settles slowly.

## Components

The feel is refined and restrained: pill geometry for anything pressable, hairline outlines for
structure, nothing raising its voice until the accent does.

Mobile ships the fuller library (`apps/mobile/src/core/presentation/components/`): `Button`,
`Card`, `Tag`, `ListItem`, `StatRow`, `EmptyState`, `GlowBanner`, `SegmentedControl`, `Skeleton`,
`NetworkBadge`, `TokenAmountRow` and others. `/app` is rebuilding its own against Storybook
(`apps/server/src/presentation/web/views/`) — check what exists there before adding markup, and
follow `.claude/rules/storybook.md` for where a new component belongs.

The **price-range bar** is the signature element: a rail, the position's band, and a thumb at the
current price. It is the one thing that says at a glance whether capital is working, and it is
what a widget shows when it has room for exactly one idea.

## Do

- Keep the canvas pure black and the chrome monochrome; build depth from tonal steps and outlines.
- Spend Signature Pink like it is rare — CTA, active, focus, glow, nothing else.
- Set every figure in mono and every word in sans.
- Pair status and P&L color with a sign, icon, or label.
- Reuse the alpha ramp (`14`/`1F`/`26`/`40`/`66`) for tinted fills and borders.
- Keep pressables fully pill-shaped; cards and fields on the 12–16 radius family.
- Teach in empty states: an icon, the reason, and the next action.

## Don't

- Tint anything pink that is not a deliberate accent.
- Build a generic crypto dashboard — a sea of identical cards, dense tables with no hierarchy.
- Drift toward corporate fintech: navy-and-white, sterile, stock-photo trust signals.
- Apply web3 maximalism — gradient soup, decorative glassmorphism, glow on everything.
- Go toy-playful: rounded mascots, pastel gradients, gamified confetti.
- Use a dark or gray drop-shadow anywhere.
- Reach for a modal first; try an inline prompt or progressive disclosure.
- Nest a card inside a card, or use a colored left-edge stripe as an accent.
- Set prose in mono, or bring in a third typeface for flavor.

## Where the values live

| What | Source |
| --- | --- |
| Color, spacing, radius, type roles | `packages/theme/tokens/` |
| Font files, faces, subsets, metrics | `packages/theme/fonts/manifest.ts` |
| Token authoring rules | `.claude/rules/design-tokens.md` |
| How surfaces consume the tokens | `.claude/rules/theming.md` |
| Where a web component belongs | `.claude/rules/storybook.md` |

Nothing above is edited by hand in a surface. Change the token tree, run `bun run codegen` from
the repo root, and every surface follows.
