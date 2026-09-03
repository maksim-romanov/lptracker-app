import { Controller } from "@hotwired/stimulus";

const GAP = 8;
const EDGE = 8;

// Delegated from <body> rather than bound per trigger: the board is replaced wholesale by htmx
// on every refresh and invert, so anything bound to a row would have to be rebound each time.
// Two kinds of trigger, one bubble:
//   - `[data-tooltip]` says what to show. Used where the element is a picture and the thing
//     worth knowing is not written anywhere near it.
//   - `.truncate` shows its own text, but only when it is actually clipped. A label that fits
//     needs no tooltip, and offering one on every label trains people to ignore all of them.
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

  // What the label shows, not everything it contains. A pair name carries the network as
  // screen-reader-only text inside the same element, and a tooltip that repeats a truncated
  // "WETH / USDC" as "WETH / USDC on Ethereum" is answering a question nobody asked.
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
