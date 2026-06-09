/**
 * Depthly theme.
 *
 * Surfaces are strictly neutral black/grayscale — geared for the wireframe
 * distortion aesthetic where chrome is high-contrast monochrome and only the
 * brand accent breaks the silence.
 *
 * Neon pink (#FF007A, Uniswap signature) appears ONLY as the brand accent:
 * primary CTAs, active nav state, focus rings, brand glow. Anything tinted
 * pink that isn't an accent pulls the design away from the wireframe.
 *
 * Status colors (error/success/warning) stay saturated for accessibility.
 * Network brand colors live in `networks.ts` — data, not chrome — and may
 * appear anywhere a chain needs to be identifiable.
 */

import type { ColorTokens } from "../colors";

export const depthlyDark: ColorTokens = {
  // Brand — neon pink (Uniswap signature on pure black)
  primary: "#FF007A",
  onPrimary: "#FFFFFF",
  primaryContainer: "#33001A",
  onPrimaryContainer: "#FFD6E8",

  // Secondary — lighter pink for chips/states
  secondary: "#FF80BE",
  onSecondary: "#0A0A0B",
  secondaryContainer: "#330014",
  onSecondaryContainer: "#FFD6E8",

  // Surfaces — strictly neutral grayscale
  surface: "#000000",
  onSurface: "#E7E9EA",
  surfaceContainer: "#16181C",
  surfaceVariant: "#202327",
  onSurfaceVariant: "#8B8F95",

  // Outlines — bumped for wireframe contrast
  outline: "#4A4D52",
  outlineVariant: "#33363A",

  // Error
  error: "#F4212E",
  onError: "#FFFFFF",
  errorContainer: "#3A0A0E",
  onErrorContainer: "#FFD6D9",

  // Success — peak neon mint
  success: "#00FFA1",
  onSuccess: "#001F0F",

  // Warning — warm neon yellow
  warning: "#FFD60A",
  onWarning: "#1A1500",

  // Inverse
  inverseSurface: "#E7E9EA",
  inverseOnSurface: "#0F1419",
  inversePrimary: "#CC0062",

  // Scrim & Shadow — pink glow lives on shadow for the iOS halo
  scrim: "#000000",
  shadow: "#FF007A",
};

export const depthlyLight: ColorTokens = {
  // Brand — deeper pink for contrast on white
  primary: "#CC0062",
  onPrimary: "#FFFFFF",
  primaryContainer: "#FFD6E8",
  onPrimaryContainer: "#660031",

  // Secondary
  secondary: "#FF007A",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#FFEBF3",
  onSecondaryContainer: "#660031",

  // Surfaces
  surface: "#FFFFFF",
  onSurface: "#0F1419",
  surfaceContainer: "#F7F9F9",
  surfaceVariant: "#EFF3F4",
  onSurfaceVariant: "#536471",

  // Outlines — brighter for wireframe contrast on white
  outline: "#B5BEC4",
  outlineVariant: "#DFE4E7",

  // Error
  error: "#F4212E",
  onError: "#FFFFFF",
  errorContainer: "#FFE0E3",
  onErrorContainer: "#5F0010",

  // Success — saturated emerald, punchy on white
  success: "#10B981",
  onSuccess: "#FFFFFF",

  // Warning — clean gold amber
  warning: "#F59E0B",
  onWarning: "#1A1500",

  // Inverse
  inverseSurface: "#0F1419",
  inverseOnSurface: "#E7E9EA",
  inversePrimary: "#FF007A",

  // Scrim & Shadow
  scrim: "#000000",
  shadow: "#FF007A",
};
