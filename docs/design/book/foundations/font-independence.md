# Font independence

The typeface is DM Sans ([0055](../../../decisions/0055-ghost-design-language.md)), and it may still change. Nothing in a layout may depend on the metrics of one face. Swapping the face is a token change plus a check, never a layout change.

| Rule | Why it keeps a swap cheap |
|---|---|
| Roles carry size, line height and weight; the face is one token | `font.family.*` is the only place a face is named. Components never name a face. |
| Per-face tuning lives in tokens | `font.size-adjust` (scale a face so its x-height matches the role), `font.line-height-adjust`, `font.letter-spacing.*`, `font.weight.map`. A new face sets these; roles stay unchanged. |
| No width depends on glyph widths | Containers size by content, grid and flex, not by a measured string. No fixed widths for text. Avoid the `ch` unit for layout; use rem, em or columns. |
| No truncation as a layout tool | Rows stack or wrap at large text sizes; the layout works with a face that is 15 percent wider or narrower. |
| Numbers need tabular digits | Any candidate face must provide tabular figures. If it does not, the `font.family.numeric` token points to a different face. Numbers are the only text with this hard requirement. |
| Fallback with matched metrics | Web emits a fallback face with size-adjust and metric overrides so the swap does not shift layout. Native uses the system font until the bundled face loads. |
| Scripts | Latin and Simplified Chinese at launch. Chinese always uses the platform face; the role sizes still apply. A candidate is checked for Latin Extended and Cyrillic gaps before use. |
| Licence | Bundled faces must be open licence (OFL or similar). Self-hosted, subsetted, never a runtime CDN. |

## Checklist when the face changes

| Step | Check |
|---|---|
| 1 | Set the family, weights and the adjust tokens. Do not edit components. |
| 2 | Tabular figures present and aligned in every role that carries numbers. |
| 3 | Snapshot every screen at the largest text size (AX5, scale 2.0, 200 percent) and at the default: no clipping, no stacked row left side by side. |
| 4 | Font bytes on the critical path stay within the budget; fallback shift measured below the layout shift budget. |
| 5 | Contrast test passes for every Ink and Fill or surface pair in both themes (weight can change legibility). |
| 6 | Hero number fits in its box with the longest realistic value (for example 7 digits and a currency mark). |

> *Decided.* DM Sans ([0055](../../../decisions/0055-ghost-design-language.md)). The checklist above applies to any later swap.
