---
paths:
  - "packages/theme/**"
  - "apps/mobile/src/core/presentation/theme/**"
  - "apps/server/src/presentation/web/styles/**"
  - "apps/mobile/targets/positions-widget/**"
---

# Shared design tokens

`packages/theme` is the single color source for mobile, `/app` (SSR), and the iOS widget —
generated via Style Dictionary into three targets (see `packages/theme/CLAUDE.md`). Edit
`packages/theme/tokens/`, then `bun run codegen` from the root — never hand-edit `dist/js/*.ts`,
`dist/css/depthly.css`, or the widget's `.colorset/Contents.json` files directly.

**Radius, depth, shadows, and typography are NOT yet unified between mobile and `/app`.**
`/app`'s DaisyUI `--radius-*`/`--depth`/`--border`/`--noise` are SSR-local constants inside
`packages/theme/style-dictionary/format-daisyui-css.ts`, deliberately not sourced from
`packages/theme` yet — see `apps/server/design-system/depthly-app/MASTER.md`. Don't assume
`/app`'s current rounded/shadowed look matches mobile, and don't backport those SSR-only values
into `packages/theme` without a design decision first (a future re-skin phase is expected to
migrate these too).
