export default {
  color: {
    palette: {
      $type: "color",
      // `solid` is the light theme's filled mark — a band, a dot, a chip. `base` is the same
      // status as *type*. They are different values because one colour cannot be both: a fill
      // wants the hue at its purest, and type on white wants it dark enough to read.
      // Yellow is where ignoring that split shows first and worst. It is intrinsically light,
      // so forcing one amber to satisfy both turns it olive; Radix documents the same thing
      // from the other side, singling out Sky, Mint, Lime, Yellow and Amber as the scales
      // whose solid step takes dark foreground text rather than white.
      // `solid` steps are therefore NOT matched on lightness — green sits at L*60, rose at 54,
      // amber at 60 — because a designed set follows each hue to its own purest point. `base`
      // steps are matched, because type has to hold one weight down a column.
      // Five steps per hue, with the role of each step fixed across every family:
      // `light` tints a page, `pastel` fills, `base` reads on light grounds, `vibrant`
      // reads on dark ones, `dark` backs a tinted container. The ramps are NOT aligned
      // on luminance across hues — violetVibrant is dark where greenVibrant is bright —
      // so which step a semantic role takes is decided per hue by the contrast test,
      // never by the step's name.
      violet: {
        light: { $value: "#F6F1FF" },
        pastel: { $value: "#DCC9FF" },
        base: { $value: "#A56BFF" },
        vibrant: { $value: "#7A1FFF" },
        dark: { $value: "#1B0F33" },
        // The one value that holds across both themes: as a fill under white text it
        // clears AA in either mode, which is what makes a solid accent read as the same
        // product light or dark. It is never used as text — see `primaryText`.
        accent: { $value: "#8B4DFF" },
      },
      pink: {
        light: { $value: "#FFF1FB" },
        base: { $value: "#FF74D4" },
        vibrant: { $value: "#CF1490" },
        dark: { $value: "#33102A" },
      },
      blue: {
        light: { $value: "#EFF4FF" },
        base: { $value: "#5B8CFF" },
        vibrant: { $value: "#1F5CFF" },
        dark: { $value: "#0E1738" },
      },
      green: {
        light: { $value: "#ECFBF2" },
        base: { $value: "#088147" },
        solid: { $value: "#2F9F69" },
        vibrant: { $value: "#2EDC84" },
        dark: { $value: "#0C2A1A" },
      },
      rose: {
        light: { $value: "#FFF1F2" },
        base: { $value: "#D81B3A" },
        solid: { $value: "#E5484D" },
        vibrant: { $value: "#FF5470" },
        dark: { $value: "#33101A" },
      },
      // A sixth family the five-hue set has no room for: status needs three levels —
      // earning, at risk, stopped — and green/rose only cover the ends. A position that is
      // still earning but near its bound is the one the user can still act on.
      // `base` leans orange rather than gold. Yellow is intrinsically light, so darkening it
      // far enough to be a visible mark on white turns it olive; pushing the hue toward orange
      // buys the same luminance while still reading as a warning, and stays clear of rose.
      amber: {
        light: { $value: "#FFF8E8" },
        base: { $value: "#B05800" },
        solid: { $value: "#D27306" },
        vibrant: { $value: "#FFC53D" },
        dark: { $value: "#33240A" },
      },
      neutral: {
        "100": { $value: "#EEECF4" },
        "900": { $value: "#121016" },
      },
      white: { $value: "#FFFFFF" },
      black: { $value: "#000000" },
    },
  },
};
