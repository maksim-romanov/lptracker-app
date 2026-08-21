# Depthly App — Design System (MASTER)

> Source of truth for the SSR web app at `apps/server` (served at `/`). **Flat, technical
> aesthetic** — Uniswap web app, not a "fintech app" pastiche, and not the landing page's
> quiet flat wireframe either (this one is data-dense, not a marketing surface).
> No component library — a small hand-written `@layer components` primitives file
> (`styles/components/primitives.css`) plus plain Tailwind v4 utilities. Colors come from
> `@depthly/theme` (`packages/theme/dist/css/depthly.css`), aliased into Tailwind's
> `@theme inline` color namespace in `app.css` — always use the resulting utilities
> (`bg-surface`, `text-on-surface`, `border-outline`, `bg-primary`, …), never raw hex.

## Product

DeFi position monitor. A wallet owner pastes addresses and watches their Uniswap V3 LP
positions across Ethereum / Base / Arbitrum. Data-dense but scannable; the job of each screen
is **"is my liquidity in range, and what's it worth?"** — answered at a glance.

## Aesthetic

Flat surfaces, hairline 1px borders (`border-outline`) instead of layered shadows — there is
no shadow token, nothing in this app casts a shadow. Radius is moderate, from `packages/theme`'s
shared `radius` scale, not a bespoke SSR-only value: `rounded-sm` (8px) for buttons, inputs,
chips, badges; `rounded-md` (12px) for cards, the positions list shell, and the detail dialog.
Grayscale-first UI — `surface` / `surface-container` / `surface-variant` /
`on-surface(-variant)` / `outline` carry almost everything. Pink (`primary`) is reserved for
primary actions (the add-wallet submit, "View on Uniswap") and the active/checked state of
network chips — never a card background, never a gradient. Status color (`success`/`warning`)
is for range state only. Numbers stay loud in the sense that matters for scanning: bold pair
titles, tabular figures everywhere numeric (`.nums`), never in the sense of decorative giant
display type.

## Themes

Two themes, `depthly-light` and `depthly-dark`, generated from `@depthly/theme` by
`packages/theme/kit/plugins/css-variables.ts` into `packages/theme/dist/css/depthly.css` as
plain CSS custom properties — a `:root` block (light, first-paint default), a
`@media (prefers-color-scheme: dark)` override, and explicit `[data-theme="depthly-light"]` /
`[data-theme="depthly-dark"]` blocks that `theme_controller.ts` switches between by setting
`data-theme` on `<html>` (View Transition swap, persisted to `localStorage`). Regenerate with
`cd packages/theme && bun run codegen` after changing a color in `packages/theme/tokens/`.

`apps/server/src/presentation/web/styles/app.css` aliases every one of those custom properties
into Tailwind's color namespace via `@theme inline`, which is what makes `bg-surface`,
`text-on-surface-variant`, `border-outline`, `bg-primary`, `text-on-primary`, `bg-success`,
`text-success`, `bg-warning`, `text-warning`, `bg-error`, `text-error` (and their `-on-*`
counterparts, and opacity modifiers like `text-on-surface-variant/60`) into ordinary,
theme-reactive Tailwind utilities.

Radius and border width are **not** sourced from tokens — they're plain Tailwind config
(`borderRadius` from `packages/theme`'s shared `radius` scale) and the default `border` utility
(1px). No `--depth`/`--noise`/pill-radius SSR-local constants exist anymore.

## Typography

System stack only (CSP `style-src 'self'` blocks external web-fonts — no Google Fonts).
- **Headings:** semibold/bold, tight tracking (`.pair`, `.display`).
- **Monetary values:** `font-variant-numeric: tabular-nums` (`.nums`), always right-aligned in
  a row/column context. System mono for raw hashes/addresses.
- Scale: 12 / 14 / 16 / 18 / 20 / 24+. Body min 16px on mobile. Line-height 1.5 prose.

## Components

| UI element | class | notes |
|---|---|---|
| Primary button | `btn btn-primary` | flat, `rounded-sm`, solid pink fill |
| Secondary/icon button | `btn btn-ghost` (+ `btn-square` for icon-only) | bordered, transparent fill |
| Card / panel shell | `card` | `rounded-md`, `border-outline`, `surface-container` fill |
| Address input | `input` | bordered, `rounded-sm`, leading icon slot |
| Checkbox | `checkbox` | plain, `accent-color: var(--color-primary)` |
| Chain / wallet chip | `chip` | pill, bordered |
| Status / fee-tier tag | `badge` (+ `badge-success` / `badge-error` / `badge-ghost`) | bordered, tinted fill |
| Error banner | `alert alert-error` | bordered, tinted fill |
| Loading indicator | `spinner` | bordered spin, no daisyUI `loading` classes anywhere |
| Position detail | `dialog` / `dialog-box` / `dialog-backdrop` | native `<dialog>`; full-screen `max-width:640px` |

### Signature: price range bar

A horizontal min↔max track (`bg-on-surface/8`) with a current-price marker (`.thumb`) and filled
segment (`.band`), positioned via CSS custom properties (`--band-left`/`--band-width`/`--thumb`)
set by `range_controller.ts` (CSP blocks inline `style=` attributes in markup, so a Stimulus
controller sets them via `element.style.setProperty` at runtime — that's not restricted by
`style-src 'self'`). In-range → `success` fill; out-of-range → `warning` fill. **Renders in both
the positions row and the detail view** — it used to be detail-only.

## Layout

**Positions list** is a flat bordered list (`board.css`'s `.board`), one row per position
(`.position-card` — name kept for the `hx-target="closest .position-card"` invert swap, even
though it's a row now, not a square card). Each row: token icon stack + pair + fee tier on the
left, status badge + invert button on the right of the header line, the range bar full-width
below, then a metrics line (range / current / principal) that lays out horizontally from `sm:`
up and stacks on narrower phones.

**Position detail** opens in the shared `<dialog id="position-modal">` (`modal_controller.ts`,
unchanged): centered `dialog-box` panel on `≥640px`, full-screen below that. Same content as
before — range bar, principal, unclaimed fees, pool/NFT links, invert toggle.

## Icons

Inline SVG only (Lucide geometry), Hono JSX in `views/Icons.tsx`. Stroke 1.5, `currentColor`.
No emoji/glyphs. `aria-label` on every icon-only button; ≥44px hit area.

## Animation

- CSS-first: transitions for hover/focus/state (150–300ms, ease-out).
- `@starting-style` for elements entering the DOM (wallet chips).
- HTMX swaps use the View Transitions API (`htmx.config.globalViewTransitions = true`, set in
  `client/application.ts`) — no animation library. `styles/components/view-transitions.css`
  disables the default cross-fade keyframes under `prefers-reduced-motion: reduce`.
- No GSAP, no hero-element morphing. If a future phase wants that back, it needs its own design
  decision — it was speced once (2026-06-26) and never shipped.

## Avoid

- Card shadows / soft depth (flat only) · pill-everything radius (moderate `rounded-sm`/`-md`
  only) · emoji icons · raw hex or ad-hoc Tailwind colors in markup (alias through `@theme
  inline` instead) · gradients · center-everything layouts · color-only status (always pair with
  a text label) · gray-on-gray low contrast.

## Exit checklist (every phase)

- [ ] No emoji icons (inline SVG) · [ ] cursor-pointer + visible focus on all clickables
- [ ] hover/state transitions 150–300ms · [ ] contrast ≥4.5:1 both themes
- [ ] tabular numerals on all data · [ ] `prefers-reduced-motion` respected
- [ ] responsive 375 / 768 / 1024 / 1440 · [ ] all `hx-*` / `data-*` hooks intact
