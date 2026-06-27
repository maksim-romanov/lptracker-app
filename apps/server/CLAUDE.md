# CLAUDE.md — apps/server

See [docs/architecture.md](docs/architecture.md) for feature modules, child-container DI, and Q128 fee math.

## Rules specific to this app

- **Use cases return `Result<T, DomainError>` (neverthrow).** Throwing in business logic is a bug — routes do `result.match(...)` and let `error-mapper.ts` translate to HTTP.
- **One error class per feature.** Never reuse another feature's error type. Cross-feature failures go through the gateway use case in `src/app/`.
- **External providers are wrapped** in opossum circuit breakers + `rate-limiter-flexible` + Redis cache before the call site. New providers must follow `shared/providers/BaseExternalProvider`.
- **Route schemas live in `presentation/`** as Valibot — they are the source of truth for OpenAPI (`bun run codegen` regenerates `openapi/`). The hand-written `docs/api.md` is gone on purpose; consume `openapi/openapi.json` directly.
- **Hono/JSX components use arrow form** (`const Foo = ({ ... }: Props) => (...)`) — Biome's `useArrowFunction` rule governs JSX files and overrides the global `const Foo = function` convention.

Build [ЧТО СТРОИМ — напр. "a dashboard page with a list of project cards;
clicking a card opens a detail modal"] for apps/server.

Stack (already set up): Bun + Hono (SSR) + HTMX + Stimulus + Tailwind v4 + daisyUI v5.

## Workflow — follow in order
1. Design system FIRST. If `apps/server/design-system/<project>/MASTER.md` exists,
   read it and follow it exactly — do NOT regenerate. If it doesn't exist, use the
   UI UX Pro Max skill to generate one for "[тип продукта + настроение, напр.
   'SaaS dashboard, quiet premium, minimal']", persist it
   (`--design-system --persist -o apps/server -p "<Name>"`), then build from it.
2. Components: use the daisyUI skill for markup/API. UI UX Pro Max only for
   design direction + the accessibility/anti-pattern checklist.
3. Implement SSR templates + HTMX endpoints in Hono, Stimulus controllers for behavior.
4. Plan first: show me the file tree and the design-system summary BEFORE writing code.

## Design constraints
- IMPORTANT: daisyUI is the single source of truth. Use semantic classes
  (btn, card, modal…) and theme tokens (primary, base-100, accent…).
  NEVER hardcode Tailwind colors (bg-zinc-900) or raw hex. Missing token → add to theme.
- All color/spacing/typography come from the design system / daisyUI theme.

## Animation — layered, keep each light
- CSS-first by default: Tailwind transitions for hover/focus/state,
  `@starting-style` for elements entering the DOM. No JS for these.
- HTMX swaps & boosted nav: View Transitions
  (ensure `htmx.config.globalViewTransitions = true`). Don't hand-roll swap animations.
- GSAP Flip ONLY for the card→modal hero morph. Do NOT import GSAP anywhere else.
- Stimulus toggles classes, or wraps non-HTMX DOM changes in
  `document.startViewTransition()`. No Alpine.
- ALWAYS respect `prefers-reduced-motion`. Durations 200–300ms.

## Do NOT (REDO if you catch yourself doing any of these)
- emojis as icons → use SVG (Lucide / Heroicons)
- hardcoded colors / arbitrary hex outside the theme
- GSAP for anything except the hero modal
- missing hover/focus states; missing cursor-pointer on clickables
- center-everything layouts; generic AI purple/pink gradients
- client-side rendering or heavy JS where SSR + HTMX is enough

## Verify before done — verifiable checks ONLY, no aesthetic self-review loop
- typecheck + build pass, no console errors
- responsive at 375 / 768 / 1024 / 1440
- keyboard nav works, focus states visible
- Lighthouse accessibility ≥ 95
- prefers-reduced-motion disables animations

Output: Hono routes/templates, daisyUI markup, Stimulus controllers, CSS.
