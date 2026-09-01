import { tokenAlias } from "../../kit/alias";
import paletteTokens from "./palette";

const palette = tokenAlias(paletteTokens);

// A status is a fill role and a type role, never one value doing both. `success` fills a band
// or a dot and follows its hue to the purest point it has; `successText` is the same status set
// as words on a page surface and has to be dark enough to read there. Collapsing the two is
// what turned amber into olive — yellow is light, and only one of the two jobs tolerates that.
// A container's text is the family's loud step in both themes, not its darkest one. Near-black
// text on a pale tint is legible and says nothing — the badge loses the hue that was the reason
// for tinting it in the first place. Prose on a tinted panel is the exception and takes the
// ordinary text role, because a paragraph is not a badge.
// Neutrals are alpha, not grey: text tints with whatever surface it lands on, so a card
// never needs a grey of its own. The alphas are not free — `onSurfaceMuted` is the lowest
// step that still clears 4.5:1 on every surface in its theme, and light needs a heavier
// one than dark because it composites against a brighter ground. contrast.test.ts owns
// those thresholds; move an alpha and it tells you.
const whiteAlpha = {
  variant: "#FFFFFFA3", // 64%
  muted: "#FFFFFF8F", // 56%
  outline: "#FFFFFF66", // 40%
  outlineVariant: "#FFFFFF1A", // 10%
  hover: "#FFFFFF0F", // 6%
  grid: "#FFFFFF0B", // 4.5%
};

const inkAlpha = {
  variant: "#1210169E", // 62%
  muted: "#121016A8", // 66%
  outline: "#12101685", // 52%
  outlineVariant: "#12101612", // 7%
  hover: "#1210160A", // 4%
  grid: "#1210160D", // 5%
};

export default {
  color: {
    depthly: {
      $type: "color",
      dark: {
        // The accent holds one value in both themes. It is a fill role only: as text on a
        // near-black ground it lands at 4.14:1, so accent-coloured type takes `primaryText`,
        // which steps per theme.
        primary: palette("color.palette.violet.accent"),
        onPrimary: palette("color.palette.white"),
        primaryText: palette("color.palette.violet.base"),
        primaryWash: { $value: "#8B4DFF1A" },
        primaryContainer: palette("color.palette.violet.dark"),
        onPrimaryContainer: palette("color.palette.violet.base"),
        secondary: palette("color.palette.pink.base"),
        onSecondary: palette("color.palette.neutral.900"),
        secondaryContainer: palette("color.palette.pink.dark"),
        onSecondaryContainer: palette("color.palette.pink.base"),
        // dim is the page the app card sits on; surface is the card itself. The ramp runs
        // in opposite directions per theme, so each mode has one of the pair coincide with
        // an adjacent role — as in M3's own baseline. They are not aliases of it.
        surface: { $value: "#121016" },
        surfaceDim: { $value: "#0E0C12" },
        surfaceBright: { $value: "#1C1922" },
        surfaceContainer: { $value: "#1C1922" },
        surfaceVariant: { $value: "#332F3D" },
        surfaceHover: { $value: whiteAlpha.hover },
        onSurface: palette("color.palette.white"),
        onSurfaceVariant: { $value: whiteAlpha.variant },
        onSurfaceMuted: { $value: whiteAlpha.muted },
        outline: { $value: whiteAlpha.outline },
        outlineVariant: { $value: whiteAlpha.outlineVariant },
        grid: { $value: whiteAlpha.grid },
        error: palette("color.palette.rose.vibrant"),
        onError: palette("color.palette.rose.dark"),
        errorContainer: palette("color.palette.rose.dark"),
        onErrorContainer: palette("color.palette.rose.vibrant"),
        errorText: palette("color.palette.rose.vibrant"),
        success: palette("color.palette.green.vibrant"),
        onSuccess: palette("color.palette.green.dark"),
        successContainer: palette("color.palette.green.dark"),
        onSuccessContainer: palette("color.palette.green.vibrant"),
        successText: palette("color.palette.green.vibrant"),
        warning: palette("color.palette.amber.vibrant"),
        onWarning: palette("color.palette.amber.dark"),
        warningContainer: palette("color.palette.amber.dark"),
        onWarningContainer: palette("color.palette.amber.vibrant"),
        warningText: palette("color.palette.amber.vibrant"),
        info: palette("color.palette.blue.base"),
        onInfo: palette("color.palette.blue.dark"),
        infoContainer: palette("color.palette.blue.dark"),
        onInfoContainer: palette("color.palette.blue.base"),
        infoText: palette("color.palette.blue.base"),
        inverseSurface: palette("color.palette.neutral.100"),
        inverseOnSurface: palette("color.palette.neutral.900"),
        inversePrimary: palette("color.palette.violet.vibrant"),
        scrim: palette("color.palette.black"),
        // Resting surfaces stay flat; the one lift in the system is a colored glow, so the
        // shadow role resolves to the accent and there is no grey to reach for.
        shadow: palette("color.palette.violet.accent"),
        // The single exception, and only for overlays that leave the page plane —
        // <dialog>, popovers. A card never gets this.
        shadowOverlay: { $value: "#00000066" },
      },
      light: {
        primary: palette("color.palette.violet.accent"),
        onPrimary: palette("color.palette.white"),
        primaryText: palette("color.palette.violet.vibrant"),
        primaryWash: { $value: "#8B4DFF1A" },
        primaryContainer: palette("color.palette.violet.light"),
        onPrimaryContainer: palette("color.palette.violet.vibrant"),
        secondary: palette("color.palette.pink.vibrant"),
        onSecondary: palette("color.palette.white"),
        secondaryContainer: palette("color.palette.pink.light"),
        onSecondaryContainer: palette("color.palette.pink.vibrant"),
        surface: palette("color.palette.white"),
        surfaceDim: { $value: "#F6F5FA" },
        surfaceBright: palette("color.palette.white"),
        surfaceContainer: { $value: "#F8F7FB" },
        surfaceVariant: { $value: "#EDEBF3" },
        surfaceHover: { $value: inkAlpha.hover },
        onSurface: palette("color.palette.neutral.900"),
        onSurfaceVariant: { $value: inkAlpha.variant },
        onSurfaceMuted: { $value: inkAlpha.muted },
        outline: { $value: inkAlpha.outline },
        outlineVariant: { $value: inkAlpha.outlineVariant },
        grid: { $value: inkAlpha.grid },
        error: palette("color.palette.rose.solid"),
        onError: palette("color.palette.rose.dark"),
        errorContainer: palette("color.palette.rose.light"),
        onErrorContainer: palette("color.palette.rose.base"),
        errorText: palette("color.palette.rose.base"),
        success: palette("color.palette.green.solid"),
        onSuccess: palette("color.palette.green.dark"),
        successContainer: palette("color.palette.green.light"),
        onSuccessContainer: palette("color.palette.green.base"),
        successText: palette("color.palette.green.base"),
        warning: palette("color.palette.amber.solid"),
        onWarning: palette("color.palette.amber.dark"),
        warningContainer: palette("color.palette.amber.light"),
        onWarningContainer: palette("color.palette.amber.base"),
        warningText: palette("color.palette.amber.base"),
        info: palette("color.palette.blue.vibrant"),
        onInfo: palette("color.palette.white"),
        infoContainer: palette("color.palette.blue.light"),
        onInfoContainer: palette("color.palette.blue.vibrant"),
        infoText: palette("color.palette.blue.vibrant"),
        inverseSurface: palette("color.palette.neutral.900"),
        inverseOnSurface: palette("color.palette.neutral.100"),
        inversePrimary: palette("color.palette.violet.base"),
        scrim: palette("color.palette.black"),
        shadow: palette("color.palette.violet.accent"),
        shadowOverlay: { $value: "#12101626" },
      },
    },
  },
};
