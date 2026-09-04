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
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    // Verified live on dpr:2: Chromium paints clip-path on ::view-transition-new(root) against
    // the snapshot's device-pixel size, though getComputedStyle still reports our CSS-px value
    // — the circle renders near half our coordinates. Safari has no such mismatch, so this stays
    // scoped to Chromium rather than applied unconditionally.
    const chromiumClipPathBug = window.devicePixelRatio > 1 && /Chrome|Chromium|Edg\//.test(navigator.userAgent);
    const scale = chromiumClipPathBug ? window.devicePixelRatio : 1;

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
