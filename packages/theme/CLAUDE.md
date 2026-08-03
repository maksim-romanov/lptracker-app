# CLAUDE.md — packages/theme

Single source of design tokens (colors, typography, spacing, radius, network brand colors),
shared across `apps/mobile`, `apps/server`'s `/app`, and the iOS widget.

## Layout

- `tokens/` — the actual source. DTCG-style TypeScript (`$value`), edit here.
- `style-dictionary.config.ts` + `style-dictionary/*.ts` — custom formats, one per output shape.
  `style-dictionary/helpers.ts`'s `getGroup`/`getValue` are shared by all of them.
- `dist/` — generated (gitignored, denied). `src/index.ts` re-exports from here — never edit `dist/` by hand.

## Three generated targets

- **JS** (`dist/js/*.ts`) — mirrors the pre-migration hand-written module shape exactly, so
  `apps/mobile` needed zero changes.
- **CSS** (`dist/css/depthly.css`) — self-contained DaisyUI `@plugin "daisyui/theme"` blocks,
  imported by `apps/server`'s `app.css`. Colors only — radius/depth/border/noise are still
  SSR-local constants inside `format-daisyui-css.ts`, not sourced from here yet.
- **iOS colorset** (written cross-package into `apps/mobile/targets/positions-widget/Assets.xcassets/`)
  — the one generated target that stays **committed to git**, since Xcode needs it physically
  present and there's no prebuild hook that runs codegen automatically yet. Regenerate with
  `bun run codegen` and commit the diff whenever a color token changes.

## Commands

```bash
bun run codegen     # regenerate all three targets
bun run test        # format/token unit tests
bun run typecheck
```
