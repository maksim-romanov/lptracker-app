import { applyTheme, resolveTheme } from "./lib/theme";

// Render-blocking entry (no `defer`) — see Layout.tsx. Everything else boots
// from application.ts; this exists only to settle data-theme before first paint.
applyTheme(resolveTheme());
