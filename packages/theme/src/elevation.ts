/**
 * Elevation tokens — `boxShadow` strings (RN 0.76+ supports the CSS syntax).
 *
 * Use directly: `style={{ boxShadow: theme.elevation.raised }}`.
 * For glow effects keyed off a theme color, use `makeGlow` with a hex+alpha.
 */

export const elevation = {
  /** No shadow — flat */
  rest: "none",

  /** Cards at rest in a list */
  raised: "0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",

  /** Floating elements (FAB, popovers, dragged items) */
  floating: "0 6px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)",

  /** Modals, sheets */
  modal: "0 24px 48px rgba(0, 0, 0, 0.18)",
} as const;

export type ElevationTokens = typeof elevation;

/**
 * Build a colored glow shadow.
 *
 * @example
 *   makeGlow(theme.primary)        // soft brand glow
 *   makeGlow(theme.success, 0.4)   // strong success ring
 */
export const makeGlow = (color: string, opacity = 0.25, size = 24): string => {
  const hex = color.replace("#", "");
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return `0 0 ${size}px rgba(${r}, ${g}, ${b}, ${opacity})`;
};
