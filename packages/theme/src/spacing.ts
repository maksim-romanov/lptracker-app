/**
 * Spacing scale following 4px base unit
 * Used for margins, paddings, gaps
 */

export const spacing = {
  /** 0px */
  none: 0,

  /** 2px - Micro spacing */
  xxs: 2,

  /** 4px - Minimal spacing */
  xs: 4,

  /** 8px - Tight spacing */
  sm: 8,

  /** 12px - Compact spacing */
  md: 12,

  /** 16px - Default spacing */
  lg: 16,

  /** 20px - Comfortable spacing */
  xl: 20,

  /** 24px - Relaxed spacing */
  "2xl": 24,

  /** 32px - Loose spacing */
  "3xl": 32,

  /** 40px - Section spacing */
  "4xl": 40,

  /** 48px - Large section spacing */
  "5xl": 48,

  /** 64px - Hero spacing */
  "6xl": 64,

  /** 80px - Extra large spacing */
  "7xl": 80,

  /** 96px - Maximum spacing */
  "8xl": 96,
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];

/**
 * Border radius scale
 */
export const radius = {
  /** 0px - Sharp corners */
  none: 0,

  /** 4px - Subtle rounding */
  xs: 4,

  /** 8px - Light rounding */
  sm: 8,

  /** 12px - Default rounding */
  md: 12,

  /** 16px - Medium rounding */
  lg: 16,

  /** 20px - Large rounding */
  xl: 20,

  /** 24px - Extra large rounding */
  "2xl": 24,

  /** 32px - Pill-like rounding */
  "3xl": 32,

  /** 9999px - Full circle */
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
export type RadiusValue = (typeof radius)[RadiusKey];
