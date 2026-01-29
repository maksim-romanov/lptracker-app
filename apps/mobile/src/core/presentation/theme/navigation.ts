import { fontFamily } from "@matrapp/theme";
import type { Theme } from "@react-navigation/native";

import type { AppTheme } from "./unistyles";

export const createNavigationTheme = (theme: AppTheme, isDark: boolean): Theme => ({
  dark: isDark,
  colors: {
    primary: theme.primary,
    background: theme.surface,
    card: theme.surface,
    text: theme.onSurface,
    border: theme.outline,
    notification: theme.error,
  },
  fonts: {
    regular: { fontFamily: fontFamily.regular, fontWeight: "400" },
    medium: { fontFamily: fontFamily.medium, fontWeight: "500" },
    bold: { fontFamily: fontFamily.bold, fontWeight: "700" },
    heavy: { fontFamily: fontFamily.bold, fontWeight: "700" },
  },
});
