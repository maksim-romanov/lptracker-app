/**
 * Motion tokens — durations, bezier curves, spring physics
 *
 * Bezier values are control points for `Easing.bezier(...)` from
 * `react-native-reanimated`. Spring values feed `withSpring(value, config)`.
 */

export const motion = {
  duration: {
    /** 100ms — instant feedback (taps, toggles) */
    instant: 100,
    /** 180ms — chips, badges, micro-interactions */
    fast: 180,
    /** 240ms — default for entering/exiting */
    base: 240,
    /** 360ms — sheet snap, larger transforms */
    slow: 360,
    /** 520ms — hero animations, layout shifts */
    lazy: 520,
  },

  /** Bezier control points for `Easing.bezier(...)`. iOS-aligned. */
  easing: {
    /** Default — symmetric ease */
    standard: [0.2, 0, 0, 1] as const,
    /** Entering content */
    decelerate: [0, 0, 0, 1] as const,
    /** Exiting content */
    accelerate: [0.3, 0, 1, 1] as const,
  },

  /** Spring configs for `withSpring(value, config)` from reanimated */
  spring: {
    /** Soft, for value/number changes */
    gentle: { damping: 18, stiffness: 120, mass: 1 },
    /** Quick, for sheet snaps and toggles */
    snappy: { damping: 22, stiffness: 220, mass: 1 },
    /** Playful, for celebrations / first-time success */
    bouncy: { damping: 12, stiffness: 180, mass: 1 },
  },
} as const;

export type MotionTokens = typeof motion;
