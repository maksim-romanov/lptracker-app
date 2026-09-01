# Design

The visual system shared by every Depthly surface: the mobile app, its home-screen widgets, the
Telegram mini app at `/app`, and the landing. Strategy, audience and anti-references live in
[PRODUCT.md](PRODUCT.md) — read that first; this file is only how the strategy looks.

**One system, not four.** Color, spacing, radius and type roles are generated from
`packages/theme` and consumed everywhere. A surface may use less of the system than another; it
may never use something different. If a surface needs a value the system lacks, the value goes
into the token tree — not into that surface's stylesheet.

> `/app` is the surface this system was rebuilt on and is the closest thing to a reference
> implementation of the colour rules below. `apps/mobile` compiles against the same tokens and
> has been recoloured by them, but its screens have not been reviewed since — treat a mobile
> screen as unreviewed until someone has actually looked at it.

## Color

Near-black canvas, alpha neutrals, one accent. Depth comes from tonal steps, never from gray
shadows.

Six hue families, five steps each — `light` `pastel` `base` `vibrant` `dark` — with the role of
each step fixed across families, and each family owning one meaning:

| Family | Means |
| --- | --- |
| violet | identity |
| pink | live value |
| blue | chain, info |
| green | earning |
| amber | at risk |
| rose | stopped |

| Role | Dark | Light |
| --- | --- | --- |
| `surfaceDim` — the page | `#0E0C12` | `#F6F5FA` |
| `surface` — the panel on it | `#121016` | `#FFFFFF` |
| `surfaceContainer` | `#1C1922` | `#F8F7FB` |
| `surfaceVariant` — a control's fill | `#332F3D` | `#EDEBF3` |
| `onSurface` | `#FFFFFF` | `#121016` |
| `onSurfaceVariant` | 64% white | 62% black |
| `onSurfaceMuted` | 56% white | 66% black |
| `outline` — a control's boundary | 40% white | 52% black |
| `outlineVariant` — a hairline | 10% white | 7% black |
| `primary` — accent as a fill | `#8B4DFF` | `#8B4DFF` |
| `primaryText` — accent as type | `#A56BFF` | `#7A1FFF` |

**Neutrals are alpha, not grey.** Text tints with whatever surface it lands on, so a card never
needs a grey of its own. The alphas are not free: `onSurfaceMuted` is the lowest step that still
clears 4.5:1 on every surface in its theme, and light needs a heavier one than dark because it
composites against a brighter ground.

**One accent, but only as a fill.** `#8B4DFF` holds one value in both themes, which is what makes
the product read as the same thing light or dark. As *text* on the near-black ground it lands at
4.14:1, so accent-coloured type takes `primaryText`, which steps per theme.

**Two border roles, on purpose.** `outline` is the boundary that identifies a control and is held
to 3:1; `outlineVariant` is a divider between rows and is deliberately not. Using the first for
decoration makes every card shout.

**The ramps are not luminance-aligned across hues** — `violet.vibrant` is dark where
`green.vibrant` is bright. Which step a semantic role takes is decided per hue by
`packages/theme/__tests__/contrast.test.ts`, never by the step's name. That test is the gate: it
flattens every alpha against every surface and holds text to 4.5:1, control boundaries and status
marks to 3:1. Move a value and it tells you what broke.

Chain identity is its own axis, never mixed with status: ethereum `#627EEA`, base `#0052FF`,
arbitrum `#28A0F0`, optimism `#FF0420`, polygon `#8247E5`, bnb `#F3BA2F`, avalanche `#E84142`.
Protocol brand colours are the same kind of thing — asset data, not theme roles — and they ride a
mark rather than the text beside it, because a logo colour is picked for a logo, not for a
contrast ratio.

Both themes are designed, and both answer to the same gate.

**The One Voice Rule.** The accent appears on ≤10% of any screen. It belongs to CTAs, active
state, focus, and glow — nothing else. The moment a second thing is violet, the signal is gone.

**The Color-Is-Information Rule.** Every non-neutral color on screen must mean something:
emphasis (violet), status (green/amber/rose), value (pink), or identity (network, protocol).
Color for mood gets deleted.

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
`#0E0C12` → `#121016` → `#1C1922` — plus hairline outlines. This is enforced in the token tree:
the `shadow` role resolves to the accent in *both* themes, so there is no gray to reach for.

The one lift in the system is a **colored glow**: a focal element casts a shadow tinted with the
accent or a status hue. Focal glow is `shadowOpacity 0.45`, `shadowRadius 14–16`, offset `0 0`.

Tinted fills and borders step through a fixed alpha vocabulary — `14` (≈8%) and `1F` (≈12%) for
fills, `26` (≈15%) for stronger fills, `40` (≈25%) and `66` (≈40%) for borders. Reuse these exact
steps.

**The No-Dark-Shadow Rule.** A shadow on a resting surface is a colored glow or it is a bug.
The single exception is an overlay that has left the page plane — a `<dialog>`, a popover — which
takes `shadowOverlay`. On a near-black ground a hairline alone does not say "this is above
everything"; nothing that rests on the page gets it.

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
`NetworkBadge`, `TokenAmountRow` and others. `/app` has its own against Storybook
(`apps/server/src/presentation/web/views/`) — check what exists there before adding markup, and
follow `.claude/rules/storybook.md` for where a new component belongs.

The **price-range bar** is the signature element: a rail, the position's band, its bounds
anchored to the band's own ends, and a thumb labelled with the current price. It is the one thing
that says at a glance whether capital is working, and it is what a widget shows when it has room
for exactly one idea. It also carries the most redundant encoding on any surface — fill, label,
anchored numbers, and a word for the state beside it — because it is the mark most likely to be
read by colour alone.

## Do

- Keep the canvas near-black and the chrome neutral; build depth from tonal steps and outlines.
- Spend the accent like it is rare — CTA, active, focus, glow, nothing else.
- Reach for `primaryText` whenever the accent is type, and `primary` whenever it is a fill.
- Set every figure in mono and every word in sans.
- Pair status and P&L color with a sign, icon, or label.
- Put a new colour through the contrast test in the same change that introduces it.
- Reuse the alpha ramp (`14`/`1F`/`26`/`40`/`66`) for tinted fills and borders.
- Keep pressables fully pill-shaped; cards and fields on the 12–16 radius family.
- Teach in empty states: an icon, the reason, and the next action.

## Don't

- Tint anything with the accent that is not a deliberate accent.
- Build a generic crypto dashboard — a sea of identical cards, dense tables with no hierarchy.
- Drift toward corporate fintech: navy-and-white, sterile, stock-photo trust signals.
- Apply web3 maximalism — gradient soup, decorative glassmorphism, glow on everything.
- Go toy-playful: rounded mascots, pastel gradients, gamified confetti.
- Use a dark or gray drop-shadow on anything that rests on the page.
- Reach for a modal first; try an inline prompt or progressive disclosure.
- Nest a card inside a card, or use a colored left-edge stripe as an accent.
- Set prose in mono, or bring in a third typeface for flavor.
- Loosen a contrast threshold, or carve a pairing out of the gate, to keep a value you liked.

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
