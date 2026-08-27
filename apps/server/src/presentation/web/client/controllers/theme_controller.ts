import { Controller } from "@hotwired/stimulus";

import { applyTheme, currentTheme, DARK, LIGHT, prefersReducedMotion, storeTheme, type TTheme } from "../lib/theme";

// data-theme is already settled pre-paint by theme-init.ts; this controller owns
// only the toggle and keeps the button's aria-pressed in sync with it.
export default class ThemeController extends Controller {
  static targets = ["toggle"];

  declare readonly toggleTarget: HTMLButtonElement;
  declare readonly hasToggleTarget: boolean;

  connect(): void {
    this.sync(currentTheme());
  }

  toggle(): void {
    const next: TTheme = currentTheme() === DARK ? LIGHT : DARK;
    storeTheme(next);

    const run = () => {
      applyTheme(next);
      this.sync(next);
    };

    if (document.startViewTransition && !prefersReducedMotion()) {
      document.startViewTransition(run);
    } else {
      run();
    }
  }

  private sync(theme: TTheme): void {
    if (this.hasToggleTarget) this.toggleTarget.setAttribute("aria-pressed", String(theme === DARK));
  }
}
