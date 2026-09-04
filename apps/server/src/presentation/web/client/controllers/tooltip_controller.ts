import { Controller } from "@hotwired/stimulus";

const GAP = 8;
const EDGE = 8;

// Delegated from <body> rather than bound per trigger: the board is replaced wholesale by htmx
// on every refresh and invert, so anything bound to a row would have to be rebound each time.
// Two kinds of trigger: `[data-tooltip]` supplies explicit text (e.g. a picture with no nearby
// label); `.truncate` shows its own text, but only when actually clipped.
export default class TooltipController extends Controller<HTMLElement> {
  static targets = ["bubble"];

  declare readonly bubbleTarget: HTMLElement;

  private trigger: HTMLElement | null = null;

  show(event: Event): void {
    const target = event.target as HTMLElement | null;
    const trigger = target?.closest<HTMLElement>("[data-tooltip], .truncate");
    if (!trigger) {
      this.hide();
      return;
    }
    if (trigger === this.trigger) return;

    const text = trigger.dataset.tooltip ?? (this.isClipped(trigger) ? this.visibleText(trigger) : undefined);
    if (!text) {
      this.hide();
      return;
    }

    this.trigger = trigger;
    this.bubbleTarget.textContent = text;
    this.bubbleTarget.showPopover();
    this.place(trigger);
  }

  hide(): void {
    if (!this.trigger) return;
    this.trigger = null;
    this.bubbleTarget.hidePopover();
  }

  // WCAG 1.4.13 asks for a tooltip a pointer user can get rid of without moving the pointer.
  dismiss(event: KeyboardEvent): void {
    if (event.key === "Escape") this.hide();
  }

  // A rounding slack of one pixel: sub-pixel text metrics make scrollWidth exceed clientWidth by
  // a fraction on labels that are not actually clipped.
  private isClipped(element: HTMLElement): boolean {
    return element.scrollWidth - element.clientWidth > 1;
  }

  // Strips `.sr-only` content — a pair name carries the network as screen-reader-only text in
  // the same element, which the tooltip shouldn't repeat.
  private visibleText(element: HTMLElement): string {
    if (!element.querySelector(".sr-only")) return element.textContent?.trim() ?? "";
    const visible = element.cloneNode(true) as HTMLElement;
    for (const hidden of visible.querySelectorAll(".sr-only")) hidden.remove();
    return visible.textContent?.trim() ?? "";
  }

  private place(trigger: HTMLElement): void {
    const anchor = trigger.getBoundingClientRect();
    const bubble = this.bubbleTarget.getBoundingClientRect();

    const above = anchor.top - bubble.height - GAP;
    const top = above >= EDGE ? above : anchor.bottom + GAP;
    const left = Math.min(Math.max(anchor.left + anchor.width / 2 - bubble.width / 2, EDGE), window.innerWidth - bubble.width - EDGE);

    this.bubbleTarget.style.setProperty("--tooltip-x", `${Math.round(left)}px`);
    this.bubbleTarget.style.setProperty("--tooltip-y", `${Math.round(top)}px`);
  }
}
