# Design token authoring (`packages/theme/tokens/`)

Two color layers, following Material 3's `ref`/`sys` split and the DTCG format:

- `color/palette.ts` — **ref layer**: raw values only, no semantics. A color earns a palette entry only when a semantic token references it (brand ramps like `neonPink` may stay whole). Don't park speculative ramps here — the unused Material-2014 ramps were deleted on purpose; git remembers them.
- `color/depthly.ts` — **semantic layer** (M3 role names). Any value that exists in the palette MUST be a DTCG alias, never a repeated hex — the brand color is defined in exactly one place. Author aliases via `tokenAlias` from `kit/alias.ts` (compile-time path check + autocomplete), not raw `"{...}"` strings. One-off values (containers, surface tints) stay literal; don't invent awkward ramp slots just to alias them.
- Typography roles alias `{typography.fontFamily.*}` the same way — references are the norm, not the exception.
- iOS colorsets are emitted with `"color-space": "srgb"`. Token hexes are authored as sRGB; asset-catalog components are interpreted in the declared space, so declaring `display-p3` without converting the components renders oversaturated on P3 screens. Don't switch back without a real gamut conversion.

Official sources:

- DTCG format spec, aliases/references: <https://www.designtokens.org/TR/drafts/format/>
- Material 3 token layers (`md.ref.palette` → `md.sys.color`): <https://m3.material.io/foundations/design-tokens/overview>, <https://github.com/material-components/material-web/blob/main/docs/theming/README.md>
- Style Dictionary tokens & references: <https://styledictionary.com/info/tokens/>
- Apple asset catalog named colors (color-space semantics): <https://developer.apple.com/library/archive/documentation/Xcode/Reference/xcode_ref-Asset_Catalog_Format/Named_Color.html>
