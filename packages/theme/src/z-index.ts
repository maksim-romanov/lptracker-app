/**
 * Z-index scale — single source of truth for stacking order.
 *
 * Layers are spaced by powers/orders so we have headroom to insert
 * new layers without renumbering.
 */

export const zIndex = {
  /** Default content */
  base: 0,
  /** Pressable elevated above siblings */
  raised: 10,
  /** Sticky headers/footers within a scroll */
  sticky: 50,
  /** Native nav header / tab bar overlap */
  header: 100,
  /** Form sheets / bottom sheets */
  sheet: 500,
  /** Full-screen modals */
  modal: 1000,
  /** Toasts / snackbars (above everything) */
  toast: 2000,
} as const;

export type ZIndexTokens = typeof zIndex;
