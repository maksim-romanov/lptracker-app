import { Controller } from "@hotwired/stimulus";

import { applyTheme, currentTheme, DARK, LIGHT, prefersReducedMotion, revealCircleFor, storeTheme, type TTheme } from "../lib/theme";

// data-theme is already settled pre-paint by theme-init.ts; this controller owns
// only the toggle and keeps the button's aria-pressed in sync with it.
export default class ThemeController extends Controller {
  static targets = ["toggle"];

  declare readonly toggleTarget: HTMLButtonElement;
  declare readonly hasToggleTarget: boolean;

  connect(): void {
    this.sync(currentTheme());
  }

  toggle(event: MouseEvent): void {
    const next: TTheme = currentTheme() === DARK ? LIGHT : DARK;
    storeTheme(next);

    const run = () => {
      applyTheme(next);
      this.sync(next);
    };

    if (!document.startViewTransition || prefersReducedMotion()) {
      run();
      return;
    }

    // Telegram-style reveal, from the button pressed out to the farthest corner. ready rejects
    // (no wipe, theme still switches via run() above) if the browser skips the transition.
    const { clientX: x, clientY: y } = event;
    const { endRadius, scale } = revealCircleFor(x, y, window.innerWidth, window.innerHeight, window.devicePixelRatio, navigator.userAgent);

    document.startViewTransition(run).ready.then(
      () =>
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x * scale}px ${y * scale}px)`, `circle(${endRadius * scale}px at ${x * scale}px ${y * scale}px)`],
          },
          { duration: 500, easing: "ease-out", pseudoElement: "::view-transition-new(root)" },
        ),
      () => {},
    );
  }

  private sync(theme: TTheme): void {
    if (this.hasToggleTarget) this.toggleTarget.setAttribute("aria-pressed", String(theme === DARK));
  }
}
