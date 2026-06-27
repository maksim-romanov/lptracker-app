import { Controller } from "@hotwired/stimulus";

const STORAGE_KEY = "depthly:theme";
const LIGHT = "depthly-light";
const DARK = "depthly-dark";
type Theme = typeof LIGHT | typeof DARK;

// Sets an explicit data-theme on <html> so daisyUI's theme is deterministic
// (not left to the prefers-color-scheme media query), swapped via View Transition.
export default class ThemeController extends Controller {
  static targets = ["toggle"];

  declare readonly toggleTarget: HTMLButtonElement;
  declare readonly hasToggleTarget: boolean;

  connect(): void {
    this.apply(this.resolve());
  }

  toggle(): void {
    const next: Theme = this.current() === DARK ? LIGHT : DARK;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode / storage disabled — fall back to in-memory swap.
    }
    const run = () => this.apply(next);
    if (document.startViewTransition && !this.reducedMotion()) {
      document.startViewTransition(run);
    } else {
      run();
    }
  }

  private resolve(): Theme {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      saved = null;
    }
    if (saved === LIGHT || saved === DARK) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? DARK : LIGHT;
  }

  private current(): Theme {
    const set = document.documentElement.dataset.theme;
    return set === DARK ? DARK : set === LIGHT ? LIGHT : this.resolve();
  }

  private apply(theme: Theme): void {
    document.documentElement.dataset.theme = theme;
    if (this.hasToggleTarget) this.toggleTarget.setAttribute("aria-pressed", String(theme === DARK));
  }

  private reducedMotion(): boolean {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }
}
