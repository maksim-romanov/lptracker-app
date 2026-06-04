/**
 * Twitter/X monochrome theme.
 *
 * Surfaces are strictly neutral (true black/whites and gray scale).
 * Violet appears ONLY as the brand accent: primary CTAs, active nav state,
 * focus rings, and brand glow. Anything tinted violet that isn't an accent
 * pulls the design away from the X reference.
 *
 * Network-specific brand colors live in `networks.ts` — those are data, not
 * UI tokens, so they may appear anywhere a network needs to be identifiable.
 */

import type { ColorTokens } from "../colors";

export const neonDark: ColorTokens = {
  // Brand — neon violet (Linear-style — saturated, premium on pure black)
  primary: "#7B61FF",
  onPrimary: "#FFFFFF",
  primaryContainer: "#1B1340",
  onPrimaryContainer: "#D7CFFF",

  // Secondary — softer lavender for chips/states
  secondary: "#9D8BFF",
  onSecondary: "#0A0A0B",
  secondaryContainer: "#1A1535",
  onSecondaryContainer: "#E2DBFF",

  // Surfaces — strictly neutral grayscale (Twitter/X dark)
  surface: "#000000",
  onSurface: "#E7E9EA",
  surfaceContainer: "#16181C",
  surfaceVariant: "#202327",
  onSurfaceVariant: "#8B8F95",

  // Outlines — bright enough to define structure, still neutral
  outline: "#3E4144",
  outlineVariant: "#2A2D31",

  // Error
  error: "#F4212E",
  onError: "#FFFFFF",
  errorContainer: "#3A0A0E",
  onErrorContainer: "#FFD6D9",

  // Success — peak neon mint, max saturation
  success: "#00FFA1",
  onSuccess: "#001F0F",

  // Warning — warm Apple-style neon yellow (less green undertone, reads as gold on black)
  warning: "#FFD60A",
  onWarning: "#1A1500",

  // Inverse — switches to light tokens
  inverseSurface: "#E7E9EA",
  inverseOnSurface: "#0F1419",
  inversePrimary: "#5E4DCC",

  // Scrim & Shadow — brand glow lives on shadow so iOS can opt into violet halo
  scrim: "#000000",
  shadow: "#7B61FF",
};

export const neonLight: ColorTokens = {
  // Brand — deeper violet for contrast on white
  primary: "#5E4DCC",
  onPrimary: "#FFFFFF",
  primaryContainer: "#E8E3FF",
  onPrimaryContainer: "#1F1052",

  // Secondary
  secondary: "#7B61FF",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#EFEBFF",
  onSecondaryContainer: "#251461",

  // Surfaces — Twitter/X light
  surface: "#FFFFFF",
  onSurface: "#0F1419",
  surfaceContainer: "#F7F9F9",
  surfaceVariant: "#EFF3F4",
  onSurfaceVariant: "#536471",

  // Outlines
  outline: "#CFD9DE",
  outlineVariant: "#EFF3F4",

  // Error
  error: "#F4212E",
  onError: "#FFFFFF",
  errorContainer: "#FFE0E3",
  onErrorContainer: "#5F0010",

  // Success — saturated emerald, punchy on white (Tailwind emerald-500 family)
  success: "#10B981",
  onSuccess: "#FFFFFF",

  // Warning — clean gold amber, reads vibrant on white (avoids olive cast)
  warning: "#F59E0B",
  onWarning: "#1A1500",

  // Inverse
  inverseSurface: "#0F1419",
  inverseOnSurface: "#E7E9EA",
  inversePrimary: "#7B61FF",

  // Scrim & Shadow
  scrim: "#000000",
  shadow: "#7B61FF",
};
