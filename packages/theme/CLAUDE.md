# CLAUDE.md — packages/theme

Single source of design tokens (colors, typography, spacing, radius, network brand colors),
shared across `apps/mobile`, `apps/server`'s `/app`, and the iOS widget.

## Layout

- `tokens/` — the actual source. DTCG-style TypeScript (`$value`), edit here.
- `kit/` — reusable build engine, no Depthly specifics (open-source extraction candidate):
  Style Dictionary as alias resolver, `ts-emit.ts` serializer, plugins (`jsModules`, `cssVariablesTheme`, `iosColorsets`).
  Plugin specs receive the resolved token tree typed via `Resolved<T>` — full autocomplete.
- `theme.config.ts` — the Depthly manifest: token tree + every output file declared through kit plugins.
- `dist/` — generated (gitignored, denied). `src/index.ts` re-exports from here — never edit `dist/` by hand.

## Three generated targets

- **JS** (`dist/js/*.ts`) — mirrors the pre-migration hand-written module shape exactly, so
  `apps/mobile` needed zero changes.
- **CSS** — two files, both imported by `apps/server`'s `app.css`:
  - `dist/css/depthly.css` — plain CSS custom properties (`:root` / `@media
    (prefers-color-scheme: dark)` / `[data-theme="depthly-*"]` blocks), aliased into Tailwind's
    `@theme inline` color namespace there (runtime-reactive to the active theme).
  - `dist/css/spacing.css` — a native Tailwind v4 `@theme { --spacing-*; --radius-* }` block,
    consumed directly (no `tailwind.config.ts`/`@config` indirection).
- **iOS colorset** (written cross-package into `apps/mobile/targets/positions-widget/Assets.xcassets/`)
  — gitignored, regenerated on every `expo prebuild` by `apps/mobile/plugins/withThemeCodegen.js`
  (registered before `@bacons/apple-targets` in `app.json`). Don't add a `colors` object to the
  target's `expo-target.config.js` — that plugin would overwrite these files with hardcoded
  `display-p3` values on the next prebuild.

## Commands

```bash
bun run codegen     # regenerate all three targets
bun run test        # format/token unit tests
bun run typecheck
```
