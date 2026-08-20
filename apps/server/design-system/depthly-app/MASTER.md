# Depthly App — Design System (MASTER)

> Source of truth for the SSR app at `/app` (`apps/server`). **App-native fintech**
> aesthetic — Uniswap / Revolut, not the landing page.
> daisyUI v5 is the **single source of truth**: semantic classes (`btn`, `card`,
> `badge`, `alert`, `input`, `checkbox`, `loading`) + theme tokens only. No raw hex,
> no ad-hoc Tailwind colors in markup. Missing token → add it to the theme here.

## Product

DeFi position monitor. A wallet owner pastes addresses and watches their Uniswap V3
LP positions across Ethereum / Base / Arbitrum. Data-dense but scannable; the job of
each screen is **"is my liquidity in range, and what's it worth?"** — answered at a glance.

## Aesthetic — shared colors, SSR-local structure

**Colors now come from `@depthly/theme`** (shared with mobile — see the Themes section
below), not a branched-away palette. What still makes `/app` read as app-native fintech
(Uniswap/Revolut) rather than the landing's quiet flat wireframe is **structure**, not
color: cranked radius, depth/shadows, and pill controls — all still SSR-local, not from
`@depthly/theme`. Four levers:

1. **Radius — cranked.** Cards `--radius-box: 1.5rem`; buttons & inputs pill
   (`--radius-field: 2rem`); controls `--radius-selector: 0.75rem`.
2. **Depth — on.** daisyUI `--depth: 1` + soft layered shadows (`--shadow-card`,
   `--shadow-card-hover`, `--shadow-pop`). Canvas = `base-100`, cards = `base-200`
   (one step up) lifted by shadow. Not a flat canvas.
3. **Accent — pink with presence.** Pink is the brand (Uniswap). Primary CTAs are
   solid pink pills; a featured card carries a subtle pink gradient
   (`--gradient-feature` / `.surface-feature`). Not one quiet touch on monochrome.
4. **Numbers — loud.** Bold display headings + large **tabular** figures for monetary
   values (`.stat-value`, `.stat-value--hero`), `+`/`−` deltas in success/error
   (`.delta--up` / `.delta--down`).

## Themes (daisyUI custom themes)

Two themes in `src/presentation/web/styles/app.css`. Colors come from `@depthly/theme`
(shared with mobile — see `packages/theme/CLAUDE.md`) via `@import "@depthly/theme/css/depthly.css";`.
Regenerate with `bun run codegen` (root) after changing a color in `packages/theme/tokens/`.
`depthly-light` is `--default`, `depthly-dark` is `--prefersdark`. A header toggle persists the choice.

Radius (`selector 0.75 / field 2 / box 1.5 rem`), `--depth: 1`, `--border: 1px`, `--noise: 0`,
and shadow/gradient tokens are still **SSR-local** (hand-written in `app.css`'s generated block
and the `@layer base` shadow rules below) — not yet unified with mobile. A future re-skin phase
will migrate these too; until then don't assume `/app`'s radius/depth matches mobile.

## Typography

System stack only (CSP `style-src 'self'` blocks external web-fonts — no Google Fonts).
- **Headings:** bold/extrabold, tight tracking (`.display`, `.stat-value--hero`).
- **Monetary values:** `font-variant-numeric: tabular-nums`, large + bold so they read
  as the primary content. System mono for raw hashes/addresses.
- Scale: 12 / 14 / 16 / 18 / 24 / 32 / 36+. Body min 16px on mobile. Line-height 1.5 prose.

## Components (daisyUI mapping)

| UI element | daisyUI | app treatment |
|---|---|---|
| Primary button | `btn btn-primary` | solid pink **pill** |
| Icon button (invert) | `btn btn-ghost btn-sm btn-square` | — |
| Address input | `input input-bordered` | **pill**, inset (base-100 on base-200 card) |
| Chain checkboxes | `checkbox checkbox-sm` | rounded |
| Wallet chip | `badge`-like pill | base-100, ghost remove btn |
| Card / panel | `card` shell *(keep `.position-card` class)* | radius `box`, `--shadow-card`, hover lift |
| Featured card | + `.surface-feature` | subtle pink gradient |
| Status | `badge badge-success` / `badge badge-error` | in / out of range |
| Stat value | `.stat-value` / `.stat-value--hero` | bold tabular figures |
| +/- delta | `.delta--up` / `.delta--down` | green / red, signed |
| Loader | `loading loading-spinner` | — |
| Empty / error | `alert` / `.board-empty` | — |
| Detail modal | `modal` / `modal-box` | radius `box`, `--shadow-pop`, scrim |

### Signature: position range bar
A horizontal min↔max track (`base-300`) with a current-price marker. In-range → marker
+ filled segment in `success`; out-of-range → marker in `error`, track muted. Min / now /
max labelled below in tabular figures. Replaces the run-on `Range: … – … (now …)`
sentence. Phase 1 also renders `fees` (currently dropped by the card) and value/APR stats.

## Icons

Inline SVG only (Lucide geometry), Hono JSX in `views/Icons.tsx`. Stroke 1.5,
`currentColor`. **No emoji/glyphs.** `aria-label` on every icon-only button; `≥44px` hit area.

## Animation

- CSS-first: transitions for hover/focus/state (150–300ms, ease-out), card hover lift.
- `@starting-style` for elements entering the DOM.
- HTMX swaps: View Transitions (`htmx.config.globalViewTransitions = true`).
- GSAP Flip ONLY for the card→detail modal hero morph. Nowhere else.
- `prefers-reduced-motion`: disable transforms/animations.

## Avoid

- Flat / quiet / monochrome canvas (that's the landing) · emoji icons · raw hex / ad-hoc
  Tailwind colors in markup · AI purple-pink gradients (accent is brand pink) ·
  center-everything layouts · color-only status · gray-on-gray low contrast.

## Exit checklist (every phase)

- [ ] No emoji icons (inline SVG) · [ ] cursor-pointer + visible focus on all clickables
- [ ] hover/state transitions 150–300ms · [ ] contrast ≥4.5:1 both themes
- [ ] tabular numerals on all data · [ ] prefers-reduced-motion respected
- [ ] responsive 375 / 768 / 1024 / 1440 · [ ] all `hx-*` / `data-*` hooks intact
