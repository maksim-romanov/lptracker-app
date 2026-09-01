export default {
  color: {
    palette: {
      $type: "color",
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
        vibrant: { $value: "#D12697" },
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
        base: { $value: "#0F864C" },
        vibrant: { $value: "#2EDC84" },
        dark: { $value: "#0C2A1A" },
      },
      rose: {
        light: { $value: "#FFF1F2" },
        base: { $value: "#D23B54" },
        vibrant: { $value: "#FF5470" },
        dark: { $value: "#33101A" },
      },
      // A sixth family the five-hue set has no room for: status needs three levels —
      // earning, at risk, stopped — and green/rose only cover the ends. A position that
      // is still earning but near its bound is the one the user can still act on.
      amber: {
        light: { $value: "#FFF8E8" },
        base: { $value: "#966100" },
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
