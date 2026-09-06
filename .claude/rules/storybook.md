---
paths:
  - "apps/server/src/presentation/web/**"
  - "apps/server/.storybook/**"
---

# Storybook (`apps/server` `/app` web UI)

`src/presentation/web/views/` splits into `components/` (cross-domain, reusable) and one folder
per domain (`positions/`, …) for page-level composition — the **Storybook `title` mirrors the
file's logical path**, no separate grouping scheme to keep in sync:

- **Every component gets its own folder: `ComponentName/ComponentName.tsx` +
  `ComponentName/ComponentName.stories.tsx`.** This is Storybook's own documented layout
  (`docs/writing-stories`), not a local invention — it keeps a directory listing showing component
  names, not an interleaved wall of `.tsx`/`.stories.tsx` files. No `index.ts` barrel re-export —
  this repo keeps imports explicit everywhere, so consumers import the doubled path directly:
  `import { Tag } from "../components/Tag/Tag"`. The wrapper folder is a physical colocation
  container only — it does **not** add a segment to the Storybook `title` (`Tag/Tag.tsx` is still
  `title: "Tag"`, not `"Tag/Tag"`).
- **`components/`** — small, stateless, view-model-free building blocks and their domain-agnostic
  specializations (see below), grouped by family, `title` = logical name relative to `components/`.
  No fixed business/domain copy lives here — that always belongs in a `<domain>/` folder instead.
  - A primitive with no fragment-specific children is just its own folder at the root of
    `components/` — `Tag/Tag.tsx` / `Button/Button.tsx` → `title: "Tag"` / `"Button"`.
  - `Icon/Icon.tsx` (mask-image + `src/static/icons/*.svg`) and `NetworkLogo/NetworkLogo.tsx`
    (inline multi-color JSX SVGs) are two different "icon by name" mechanisms on purpose, not
    duplication to unify — `mask-image` only works for monochrome/currentColor icons; network
    brand marks need their own fixed hex colors, which a `background-color: currentColor` mask
    can't reproduce.
  - A primitive that has one or more *domain-agnostic* specializations gets a family folder one
    level up, holding a component-folder per specialization — `components/Banner/{Banner/Banner.tsx,
    ErrorBanner/ErrorBanner.tsx}` → `"Banner"` / `"Banner/ErrorBanner"`; `components/Modal/{Modal/
    Modal.tsx, Sidebar/Sidebar.tsx}` → `"Modal"` / `"Modal/Sidebar"`. The test for
    "domain-agnostic": does it hardcode fixed domain copy, or does it just preset a style/variant
    while still taking dynamic content from the caller?
    - **Fails the test → the specialization moves to `<domain>/`, not `components/`.** Fixed
      business copy is domain content wearing the primitive's markup, not a primitive variant —
      e.g. `Placeholder` + zero props + hardcoded copy. The domain is whichever subject the copy
      is actually about, not which route happens to render it: `NoWallets` ("Connect a wallet…")
      is `wallets/NoWallets/NoWallets.tsx`, `NoPositions` ("No positions…") is
      `positions/NoPositions/NoPositions.tsx` — both get rendered by the same `/positions` route,
      but that doesn't make them the same domain. If that leaves the primitive with no sibling
      specializations, it goes back to being just its own component folder —
      `components/Placeholder/Placeholder.tsx`.
    - **Passes the test → stays in `components/<Primitive>/`.** `ErrorBanner` still takes a
      `message` prop from the caller (it's consumed by both `positions.routes.tsx` and the
      fully-generic `routes/validation.tsx`, neither owns it) — it presets `variant="error"`,
      it doesn't hardcode content. `Sidebar` still takes arbitrary `children` and is reused across
      domains (`positions/PositionDetail`, `wallets/WalletConnect`) — it presets `bodyClass`, not
      content. Both are genuine reusable variants, not domain content in disguise.
  - Form controls (inputs, checkboxes, …) live in `components/form/`, one category folder holding
    a component-folder per control — not one folder per control directly under `components/`
    (they don't have domain-agnostic specializations the way `Banner`/`Modal` do) —
    `components/form/TextInput/TextInput.tsx` → `title: "Form/TextInput"`.
- **`<domain>/`** (e.g. `positions/`) — composed, view-model-driven page sections the user sees as
  one thing, grouped by the domain/feature they belong to, not by "fragments vs primitives" layer —
  mirrors how `apps/server` itself is organized (`src/features/uniswap-v3`, `token-prices`, …).
  `title` = `"<Domain>/<Name>"` (`positions/PositionCard/PositionCard.tsx` →
  `"Positions/PositionCard"`). These consume `components/` instead of repeating their markup.
  Don't create a domain folder before it has real content to put in it.
  - A block reused across files *within* one domain but tied to that domain's data shape (not
    generic enough for `components/`) lives in that domain folder too — e.g. `PositionRange`
    (the price-range bar, keyed on `ICardVM["priceRange"]`) is
    `positions/PositionRange/PositionRange.tsx`, not `components/`, because it's meaningless
    outside a position view-model.
  - A generic chrome primitive that hosts different domains' content (`Modal`/`Sidebar` wraps
    both a `positions/PositionDetail` and a `wallets/WalletConnect`) stays domain-agnostic in
    `components/` and takes the content as `children` — the composition happens where they're
    actually used (`Layout.tsx`: `<Sidebar><WalletConnect /></Sidebar>`), not inside a fused
    `WalletSidebar`-style component. Keeps the chrome reusable for whatever gets composed into it
    next, instead of one new component per chrome+content pairing.
  - `positions/__stories__/mocks.ts` is the one exception to "everything gets its own folder" —
    it's a shared fixture file consumed by multiple components' stories, not a component itself,
    so it stays a flat file directly under the domain folder.

Before writing new markup with `class="rounded-sm border border-outline …"` (or any other
Tailwind chunk repeated as-is), check `views/components/` first — extend an existing one or add a
new one there. Don't let the same class string exist in two `.tsx` files.

Prefer explicit named components over a `reason`/`variant`-string prop with an internal
switch/ternary when the branches render genuinely different content (see `wallets/NoWallets` /
`positions/NoPositions`, each its own component folder + story, instead of one `Empty({ reason })`).
A `Record<Key, ...>` lookup (see `STATUS` in `PositionCard`/`PositionDetail`) is still fine when
the branches are just different *values* of the same shape, not different component trees.

## Story files

- One `ComponentName.stories.tsx` colocated in the same `ComponentName/` folder as
  `ComponentName.tsx` (see the folder-per-component rule above).
- `render()` must return `String(<Component ... />)` (or a plain string), never the bare JSX
  element. `@storybook/html-vite`'s `renderToCanvas` only accepts `typeof x === "string"` or
  `x instanceof Node` — a hono/jsx call is neither (it's a `JSXNode`), so it renders as a Storybook
  error, not the component, even though `tsc`/`storybook build` both stay silent about it (an
  untyped `Meta` lets a wrong `render` return type slip past `tsc`, and `storybook build` only
  bundles the story, it never executes `render()` in a browser to catch this). Always sanity-check
  a new story pattern against `storybook dev`, not just `typecheck`/`build`.
- `.storybook/preview.ts`'s `withThemeSurface` decorator branches on `typeof story() === "string"`
  (`innerHTML =`) vs a `Node` (`.append()`) for the same reason — `Element.append(aString)` inserts
  a *text* node, it does not parse HTML, so a decorator that unconditionally does `.append(story())`
  silently breaks every string-returning story. Keep that branch if you touch the decorator.
- `positions/__stories__/mocks.ts` holds shared `ICardVM` fixtures — reuse across `.stories.tsx`
  files in that folder (and its domain siblings) rather than inlining new fixture objects per file.
- **Don't re-demonstrate a primitive's own states from inside a domain-fragment story.** A
  fragment story's job is to cover *composition/data* variance (empty state, long address, no
  fees) — not to re-prove that `Tag` renders an icon+label, that's `components/Tag/Tag.stories.tsx`'s
  job.
- One story per meaningfully distinct case (empty / edge / typical), not one per prop combination.
