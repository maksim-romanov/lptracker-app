export const THEME_STORAGE_KEY = "depthly:theme";
export const LIGHT = "depthly-light";
export const DARK = "depthly-dark";

export type TTheme = typeof LIGHT | typeof DARK;

// Synchronous on purpose — theme-init.ts runs render-blocking to avoid a flash of the wrong
// theme, so it can't await the async storage adapter the collection stores use.
const read = (): string | null => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storeTheme = (theme: TTheme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // private mode / storage disabled — the in-memory swap still applies.
  }
};

export const resolveTheme = (): TTheme => {
  const saved = read();
  if (saved === LIGHT || saved === DARK) return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
};

export const currentTheme = (): TTheme => {
  const applied = document.documentElement.dataset.theme;
  if (applied === LIGHT || applied === DARK) return applied;
  return resolveTheme();
};

export const applyTheme = (theme: TTheme): void => {
  document.documentElement.dataset.theme = theme;
};

export const prefersReducedMotion = (): boolean => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
