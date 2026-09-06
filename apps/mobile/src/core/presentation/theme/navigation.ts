import { fontFamily } from "@depthly/theme";
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
    regular: { fontFamily: fontFamily.sans, fontWeight: "400" },
    medium: { fontFamily: fontFamily.sansMedium, fontWeight: "500" },
    bold: { fontFamily: fontFamily.sansSemiBold, fontWeight: "600" },
    heavy: { fontFamily: fontFamily.sansBold, fontWeight: "700" },
  },
});
